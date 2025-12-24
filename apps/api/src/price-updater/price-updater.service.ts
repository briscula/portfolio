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
        const quote = await yahooFinance.quote(listing.tickerSymbol) as { regularMarketPrice?: number } | undefined;

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

        await this.prisma.listing.update({
          where: {
            isin_exchangeCode: {
              isin: listing.isin,
              exchangeCode: listing.exchangeCode,
            },
          },
          data: {
            currentPrice: price,
            priceLastUpdated: new Date(),
            priceSource: 'yahoo_finance',
          },
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

