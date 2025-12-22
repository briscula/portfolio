import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getApiEnv } from '@repo/env';
import axios from 'axios';
import { z } from 'zod';

// Zod schema for the FMP quote response
const FmpQuoteSchema = z.array(
  z.object({
    symbol: z.string(),
    price: z.number(),
  })
);

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
    // T009: Fetch all unique listings
    const listings = await this.prisma.listing.findMany({
      distinct: ['isin', 'exchangeCode', 'tickerSymbol'],
      where: {
        tickerSymbol: {
            not: null,
        }
      }
    });

    if (listings.length === 0) {
      this.logger.log('No listings found to update prices for.');
      return;
    }

    const symbols = listings.map((l) => l.tickerSymbol).join(',');
    this.logger.log(`Found ${listings.length} unique tickers to update.`);

    try {
      // T010: Make batch API call to FMP
      const apiKey = getApiEnv().FMP_API_KEY;
      const url = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${apiKey}`;
      const response = await axios.get(url);

      // T011: Validate the API response
      const validatedQuotes = FmpQuoteSchema.parse(response.data);
      this.logger.log(`Received ${validatedQuotes.length} valid quotes from FMP.`);

      // T012: Loop and update/create into the database
      for (const quote of validatedQuotes) {
        const listing = listings.find((l) => l.tickerSymbol === quote.symbol);
        if (listing) {
          const existingPrice = await this.prisma.stockPrice.findUnique({
            where: {
              listingIsin_listingExchangeCode_currencyCode: {
                listingIsin: listing.isin,
                listingExchangeCode: listing.exchangeCode,
                currencyCode: listing.currencyCode,
              },
            },
          });

          if (existingPrice) {
            await this.prisma.stockPrice.update({
              where: {
                id: existingPrice.id,
              },
              data: {
                price: quote.price,
              },
            });
          } else {
            await this.prisma.stockPrice.create({
              data: {
                listingIsin: listing.isin,
                listingExchangeCode: listing.exchangeCode,
                price: quote.price,
                currencyCode: listing.currencyCode,
              },
            });
          }
        }
      }
    } catch (error) {
      // T013: Error handling
      if (error instanceof z.ZodError) {
        this.logger.error('FMP API response validation failed', error.issues);
      } else if (axios.isAxiosError(error)) {
        this.logger.error('Failed to fetch prices from FMP API', error.response?.data);
      } else {
        this.logger.error('An unexpected error occurred during price update', error);
      }
    }
  }
}

