import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@repo/database';
import YahooFinance from 'yahoo-finance2';

type DividendFrequency = $Enums.DividendFrequency;

const yahooFinance = new YahooFinance();

@Injectable()
export class PriceUpdaterService {
  private readonly logger = new Logger(PriceUpdaterService.name);

  constructor(private prisma: PrismaService) {}

  // This method can be called manually or by an external scheduler
  async runPriceUpdate() {
    this.logger.log('Starting daily stock price update job...');
    await this.updatePrices();
    await this.updateDividendInfo();
    this.logger.log('Finished daily stock price update job.');
  }

  private async updatePrices() {
    const listings = await this.prisma.listing.findMany({
      distinct: ['isin', 'exchangeCode', 'tickerSymbol'],
    });

    if (listings.length === 0) {
      this.logger.log('No listings found to update prices for.');
      return;
    }

    this.logger.log(`Found ${listings.length} unique tickers to update.`);

    let successCount = 0;
    let errorCount = 0;

    // Fetch quotes individually to handle errors per symbol
    for (const listing of listings) {
      try {
        const quote = await yahooFinance.quote(listing.tickerSymbol) as {
          regularMarketPrice?: number;
          shortName?: string;
          longName?: string;
          symbol?: string;
          dividendYield?: number; // Decimal (e.g., 0.0412 for 4.12%)
          trailingAnnualDividendYield?: number; // Alternative field
        } | undefined;

        if (!quote) {
          this.logger.warn(`Symbol not found: ${listing.tickerSymbol}`);
          errorCount++;
          continue;
        }

        const price = quote.regularMarketPrice;
        if (price === undefined || price === null) {
          this.logger.warn(`No price for ${listing.tickerSymbol}`);
          errorCount++;
          continue;
        }

        // Build update data - always update price
        const updateData: {
          currentPrice: number;
          priceLastUpdated: Date;
          priceSource: string;
          companyName?: string;
          tickerSymbol?: string;
          dividendYield?: number;
        } = {
          currentPrice: price,
          priceLastUpdated: new Date(),
          priceSource: 'yahoo_finance',
        };

        // Update companyName if available from Yahoo Finance
        const companyName = quote.longName || quote.shortName;
        if (companyName) {
          updateData.companyName = companyName;
        }

        // Update tickerSymbol if available (fixes bad ticker symbols like "1")
        if (quote.symbol) {
          updateData.tickerSymbol = quote.symbol;
        }

        // Update dividend yield (Yahoo returns as decimal, convert to percentage)
        const dividendYield = quote.dividendYield ?? quote.trailingAnnualDividendYield;
        if (dividendYield !== undefined && dividendYield !== null) {
          // Yahoo returns as decimal (0.0412), convert to percentage (4.12)
          updateData.dividendYield = dividendYield * 100;
        }

        await this.prisma.listing.update({
          where: {
            isin_exchangeCode: {
              isin: listing.isin,
              exchangeCode: listing.exchangeCode,
            },
          },
          data: updateData,
        });
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to fetch ${listing.tickerSymbol}`, error);
        errorCount++;
      }
    }

    this.logger.log(`Price update complete: ${successCount} succeeded, ${errorCount} failed.`);
  }

  /**
   * Update dividend info for all listings
   * Fetches upcoming dividend data from Yahoo Finance and infers frequency from history
   */
  private async updateDividendInfo() {
    this.logger.log('Starting dividend info update...');

    const listings = await this.prisma.listing.findMany({
      distinct: ['isin', 'exchangeCode', 'tickerSymbol'],
    });

    let successCount = 0;
    let errorCount = 0;

    for (const listing of listings) {
      try {
        // Fetch calendar events from Yahoo Finance for upcoming dividends
        let nextExDate: Date | null = null;
        let nextAmount: number | null = null;

        try {
          const summary = await yahooFinance.quoteSummary(listing.tickerSymbol, {
            modules: ['calendarEvents', 'summaryDetail'],
          }) as {
            calendarEvents?: {
              exDividendDate?: Date;
              dividendDate?: Date;
            };
            summaryDetail?: {
              dividendRate?: number;
              exDividendDate?: Date;
            };
          } | undefined;

          if (summary?.calendarEvents?.exDividendDate) {
            nextExDate = new Date(summary.calendarEvents.exDividendDate);
          } else if (summary?.summaryDetail?.exDividendDate) {
            nextExDate = new Date(summary.summaryDetail.exDividendDate);
          }

          if (summary?.summaryDetail?.dividendRate) {
            // dividendRate is annual, divide by frequency to get per-payment amount
            nextAmount = summary.summaryDetail.dividendRate;
          }
        } catch {
          // Yahoo Finance may not have calendar data for all stocks
          this.logger.debug(`No calendar data for ${listing.tickerSymbol}`);
        }

        // Get historical dividends for this listing to infer frequency
        const historicalDividends = await this.prisma.transaction.findMany({
          where: {
            listingIsin: listing.isin,
            listingExchangeCode: listing.exchangeCode,
            type: 'DIVIDEND',
          },
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 dividends should be enough to infer pattern
        });

        // Infer frequency and calculate average amount
        const frequency = this.inferFrequency(historicalDividends);
        const avgAmount = this.calculateAvgAmount(historicalDividends);
        const lastPaymentDate = historicalDividends.length > 0
          ? historicalDividends[0].createdAt
          : null;

        // Estimate next payment date if we have frequency but no external data
        let nextPaymentDate: Date | null = null;
        if (nextExDate) {
          // Payment is typically 2-4 weeks after ex-date
          nextPaymentDate = new Date(nextExDate);
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 14);
        } else if (lastPaymentDate && frequency && frequency !== 'IRREGULAR') {
          nextPaymentDate = this.estimateNextPaymentDate(lastPaymentDate, frequency);
        }

        // Upsert DividendInfo record
        await this.prisma.dividendInfo.upsert({
          where: {
            listingIsin_listingExchangeCode: {
              listingIsin: listing.isin,
              listingExchangeCode: listing.exchangeCode,
            },
          },
          create: {
            listingIsin: listing.isin,
            listingExchangeCode: listing.exchangeCode,
            frequency,
            avgAmount,
            lastPaymentDate,
            nextExDate,
            nextPaymentDate,
            nextAmount,
          },
          update: {
            frequency,
            avgAmount,
            lastPaymentDate,
            nextExDate,
            nextPaymentDate,
            nextAmount,
          },
        });

        successCount++;
      } catch (error) {
        this.logger.error(`Failed to update dividend info for ${listing.tickerSymbol}`, error);
        errorCount++;
      }
    }

    this.logger.log(`Dividend info update complete: ${successCount} succeeded, ${errorCount} failed.`);
  }

  /**
   * Infer dividend frequency from historical payments
   */
  private inferFrequency(dividends: { createdAt: Date }[]): DividendFrequency | null {
    if (dividends.length < 2) {
      return dividends.length === 1 ? 'IRREGULAR' : null;
    }

    // Calculate intervals between payments (in days)
    const sortedDividends = [...dividends].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const intervals: number[] = [];
    for (let i = 1; i < sortedDividends.length; i++) {
      const daysDiff = Math.round(
        (sortedDividends[i].createdAt.getTime() - sortedDividends[i - 1].createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      intervals.push(daysDiff);
    }

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

    if (avgInterval < 45) return 'MONTHLY';        // ~30 days
    if (avgInterval < 120) return 'QUARTERLY';     // ~90 days
    if (avgInterval < 240) return 'SEMI_ANNUAL';   // ~180 days
    if (avgInterval < 400) return 'ANNUAL';        // ~365 days
    return 'IRREGULAR';
  }

  /**
   * Calculate average dividend amount per share from history
   */
  private calculateAvgAmount(dividends: { amount: number; quantity: number }[]): number | null {
    if (dividends.length === 0) return null;

    // Calculate per-share amounts
    const perShareAmounts = dividends
      .filter(d => d.quantity > 0)
      .map(d => Math.abs(d.amount) / d.quantity);

    if (perShareAmounts.length === 0) return null;

    return perShareAmounts.reduce((sum, a) => sum + a, 0) / perShareAmounts.length;
  }

  /**
   * Estimate next payment date based on frequency and last payment
   */
  private estimateNextPaymentDate(lastPayment: Date, frequency: DividendFrequency): Date {
    const next = new Date(lastPayment);

    switch (frequency) {
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'SEMI_ANNUAL':
        next.setMonth(next.getMonth() + 6);
        break;
      case 'ANNUAL':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        // For irregular, estimate 3 months
        next.setMonth(next.getMonth() + 3);
    }

    // If estimated date is in the past, keep adding intervals until it's in the future
    const now = new Date();
    while (next < now) {
      switch (frequency) {
        case 'MONTHLY':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'QUARTERLY':
          next.setMonth(next.getMonth() + 3);
          break;
        case 'SEMI_ANNUAL':
          next.setMonth(next.getMonth() + 6);
          break;
        case 'ANNUAL':
          next.setFullYear(next.getFullYear() + 1);
          break;
        default:
          next.setMonth(next.getMonth() + 3);
      }
    }

    return next;
  }
}

