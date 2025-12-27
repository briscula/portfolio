import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceProvider, SymbolRequest } from './price-provider.interface';

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

    // 1. Check memory cache first (fastest)
    const cached = this.fxCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.FX_CACHE_TTL) {
      return cached.rate;
    }

    // 2. Check database for persisted rate
    const dbRate = await this.prisma.fxRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: from,
          toCurrency: to,
        },
      },
    });

    if (dbRate) {
      this.logger.log(`Using persisted FX rate for ${cacheKey}: ${dbRate.rate}`);
      this.fxCache.set(cacheKey, { rate: dbRate.rate, timestamp: Date.now() });
      return dbRate.rate;
    }

    // 3. Fall back to API if not in database
    this.logger.log(`Fetching FX rate from API for ${cacheKey}`);
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
          some: {}, // Only consider listings that have at least one transaction
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
    type ListingInfo = (typeof uniqueListings)[number];
    const listingMap = new Map<string, ListingInfo>();
    const symbolRequests: SymbolRequest[] = [];

    uniqueListings.forEach((listing) => {
      if (listing.tickerSymbol) {
        listingMap.set(`${listing.isin}_${listing.exchangeCode}`, listing);
        symbolRequests.push({
          symbol: listing.tickerSymbol,
          exchangeCode: listing.exchangeCode,
        });
      }
    });

    // 2. Get the last update time for each listing (now stored directly on listing)
    const lastUpdateMap = new Map<string, Date>(); // Key: isin_exchangeCode, Value: priceLastUpdated
    uniqueListings.forEach((l) => {
      if (l.priceLastUpdated) {
        lastUpdateMap.set(`${l.isin}_${l.exchangeCode}`, l.priceLastUpdated);
      }
    });

    // 3. Sort listings by last update time (oldest first)
    uniqueListings.sort((a, b) => {
      const aTime =
        lastUpdateMap.get(`${a.isin}_${a.exchangeCode}`)?.getTime() || 0;
      const bTime =
        lastUpdateMap.get(`${b.isin}_${b.exchangeCode}`)?.getTime() || 0;
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
      // The price provider expects symbol requests with exchange codes
      const quotes = await this.priceProvider.getQuotes(symbolRequests);

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

        const matchedListing = uniqueListings.find(
          (l) => l.tickerSymbol === quote.symbol,
        );

        if (!matchedListing) {
          this.logger.warn(
            `Could not find a matching listing for quote symbol: ${quote.symbol}. Skipping update.`,
          );
          continue;
        }

        // Normalize currency codes (Yahoo Finance returns 'GBp' for British pence)
        let currency = quote.currency;
        let price = quote.price;
        if (currency === 'GBp') {
          currency = 'GBP';
          price = price / 100; // Convert pence to pounds
        }

        // Skip currencies that are not supported in our system
        const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'HKD'];
        if (!SUPPORTED_CURRENCIES.includes(currency)) {
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
            currentPrice: price,
            priceSource: 'yahoo_finance',
            priceLastUpdated: new Date(),
          },
        });
        this.logger.log(
          `Successfully updated price for ${matchedListing.tickerSymbol} (${matchedListing.isin}_${matchedListing.exchangeCode}): ${price} ${currency}`,
        );
      }

      this.logger.log(
        `Finished stock price synchronization job. Updated ${quotes.length} listings.`,
      );
    } catch (error) {
      this.logger.error(
        'An error occurred during the price synchronization job',
        error,
      );
    }
  }
}
