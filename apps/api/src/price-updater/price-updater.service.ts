import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

@Injectable()
export class PriceUpdaterService {
  private readonly logger = new Logger(PriceUpdaterService.name);

  constructor(private prisma: PrismaService) {}

  // This method can be called manually or by an external scheduler
  async runPriceUpdate() {
    this.logger.log('Starting daily stock price update job...');
    await this.updatePrices();
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
}

