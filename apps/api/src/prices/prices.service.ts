import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceProvider, Quote, FxRate } from './price-provider.interface';

interface CachedFxRate {
  rate: number;
  timestamp: number;
}

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);
  private readonly fxCache: Map<string, CachedFxRate> = new Map();
  private readonly FX_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    @Inject('PriceProvider') private readonly priceProvider: PriceProvider,
  ) {}

  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) {
      return 1;
    }

    const cacheKey = `${from}_${to}`;
    const cached = this.fxCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.FX_CACHE_TTL) {
      this.logger.log(`Using cached FX rate for ${cacheKey}`);
      return cached.rate;
    }

    this.logger.log(`Fetching new FX rate for ${cacheKey}`);
    const fxRate = await this.priceProvider.getFxRate(from, to);
    this.fxCache.set(cacheKey, { rate: fxRate.rate, timestamp: Date.now() });
    
    return fxRate.rate;
  }

  async syncAllStockPrices(): Promise<void> {
    this.logger.log('Starting full stock price synchronization job.');

    // 1. Get all unique listings that transactions are linked to
    // We need to fetch listings that exist in transactions to update their prices
    const uniqueListings = await this.prisma.listing.findMany({
      distinct: ['isin', 'exchangeCode'], // Ensure unique listings
      where: {
        transactions: {
          some: {
            // Only consider listings that have at least one transaction
            portfolio: {
              NOT: { userId: null }, // Ensure it's linked to a user's portfolio
            },
          },
        },
      },
      select: {
        isin: true,
        exchangeCode: true,
        tickerSymbol: true,
        currencyCode: true,
        companyName: true,
        priceLastUpdated: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create a map from isin_exchangeCode to the listing object
    // Note: This assumes tickerSymbols are unique across exchanges which might not always be true.
    // A more robust solution would be to create a map of cleanedSymbol -> originalListing[]
    // For now, let's use isin_exchangeCode as a unique identifier for mapping.
    type ListingInfo = typeof uniqueListings[number];
    const listingMap = new Map<string, ListingInfo>();
    const listingsToFetch: string[] = []; // tickerSymbols for priceProvider

    uniqueListings.forEach(listing => {
        // Here we can clean the tickerSymbol if necessary, but the cleaning logic should be in PriceProvider now.
        // Or, we expect tickerSymbol to be clean from the database.
        // Let's assume tickerSymbol is already clean from DB or will be cleaned by priceProvider.
        if (listing.tickerSymbol) {
            listingMap.set(`${listing.isin}_${listing.exchangeCode}`, listing); // Map by unique composite key
            listingsToFetch.push(listing.tickerSymbol);
        }
    });

    // 2. Get the last update time for each listing (now stored directly on listing)
    const lastUpdateMap = new Map<string, Date>(); // Key: isin_exchangeCode, Value: priceLastUpdated
    uniqueListings.forEach(l => {
      if (l.priceLastUpdated) {
        lastUpdateMap.set(`${l.isin}_${l.exchangeCode}`, l.priceLastUpdated);
      }
    });


    // 3. Sort listings by last update time (oldest first)
    uniqueListings.sort((a, b) => {
        const aTime = lastUpdateMap.get(`${a.isin}_${a.exchangeCode}`)?.getTime() || 0;
        const bTime = lastUpdateMap.get(`${b.isin}_${b.exchangeCode}`)?.getTime() || 0;
        return aTime - bTime;
    });

    this.logger.log(
      `Found ${uniqueListings.length} unique listings to update. Prioritizing oldest updates first.`,
    );

    if (uniqueListings.length === 0) {
      this.logger.log('No listings to update. Exiting job.');
      return;
    }

    try {
      // The price provider expects symbols, so we pass the tickerSymbols
      const quotes = await this.priceProvider.getQuotes(listingsToFetch);

      if (quotes.length === 0) {
        this.logger.warn('Price provider returned no quotes. Ending sync job.');
        return;
      }

      for (const quote of quotes) {
        // Find the original listing object that corresponds to the returned quote symbol
        // This requires finding the listing from `uniqueListings` that matches `quote.symbol`.
        // This is a weak point if tickerSymbols are not unique across exchanges or if PriceProvider cleans symbols.
        // For robustness, we need a way to map the quote.symbol back to its original (isin, exchangeCode)
        // For now, we assume quote.symbol is the clean tickerSymbol and find a matching listing.

        const matchedListing = uniqueListings.find(l => l.tickerSymbol === quote.symbol);

        if (!matchedListing) {
            this.logger.warn(`Could not find a matching listing for quote symbol: ${quote.symbol}. Skipping update.`);
            continue;
        }

        // Skip currencies that are not supported in our system (e.g., not USD or EUR)
        const SUPPORTED_CURRENCIES = ['USD', 'EUR'];
        if (!SUPPORTED_CURRENCIES.includes(quote.currency)) {
          this.logger.warn(
            `Skipping price update for ${matchedListing.tickerSymbol} (${matchedListing.isin}_${matchedListing.exchangeCode}) because currency '${quote.currency}' is not supported.`,
          );
          continue;
        }

        // Update price directly on the listing
        await this.prisma.listing.update({
          where: {
            isin_exchangeCode: {
              isin: matchedListing.isin,
              exchangeCode: matchedListing.exchangeCode,
            },
          },
          data: {
            currentPrice: quote.price,
            priceSource: 'yahoo_finance',
            priceLastUpdated: new Date(),
          },
        });
        this.logger.log(`Successfully updated price for ${matchedListing.tickerSymbol} (${matchedListing.isin}_${matchedListing.exchangeCode}): ${quote.price} ${quote.currency}`);
      }

      this.logger.log(`Finished stock price synchronization job. Updated ${quotes.length} listings.`);
    } catch (error) {
      this.logger.error('An error occurred during the price synchronization job', error);
    }
  }
}

