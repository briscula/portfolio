import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceProvider } from './price-provider.interface';

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

    // 1. Get all unique stock symbols from user portfolios
    const allStocks = await this.prisma.stock.findMany({
      select: { symbol: true },
      distinct: ['symbol'],
    });
    const uniqueSymbols = allStocks.map(s => s.symbol);

    // 2. Get the last update time for each symbol
    const lastUpdates = await this.prisma.stockPrice.findMany({
      where: { stockSymbol: { in: uniqueSymbols } },
      select: { stockSymbol: true, lastUpdated: true },
    });
    const lastUpdateMap = new Map<string, Date>();
    lastUpdates.forEach(u => lastUpdateMap.set(u.stockSymbol, u.lastUpdated));

    // 3. Sort symbols by last update time (oldest first)
    uniqueSymbols.sort((a, b) => {
      const aTime = lastUpdateMap.get(a)?.getTime() || 0;
      const bTime = lastUpdateMap.get(b)?.getTime() || 0;
      return aTime - bTime;
    });

    this.logger.log(
      `Found ${uniqueSymbols.length} unique symbols to update. Prioritizing oldest updates first.`,
    );

    if (uniqueSymbols.length === 0) {
      this.logger.log('No symbols to update. Exiting job.');
      return;
    }

    try {
      const quotes = await this.priceProvider.getQuotes(uniqueSymbols);

      if (quotes.length === 0) {
        this.logger.warn('Price provider returned no quotes. Ending sync job.');
        return;
      }

      for (const quote of quotes) {
        await this.prisma.stockPrice.upsert({
          where: {
            stockSymbol_currencyCode: {
              stockSymbol: quote.symbol,
              currencyCode: quote.currency,
            },
          },
          update: { price: quote.price, source: 'yahoo_finance', lastUpdated: new Date() },
          create: {
            stockSymbol: quote.symbol,
            price: quote.price,
            currencyCode: quote.currency,
            source: 'yahoo_finance',
          },
        });
        this.logger.log(`Successfully updated price for ${quote.symbol}: ${quote.price} ${quote.currency}`);
      }

      this.logger.log(`Finished stock price synchronization job. Updated ${quotes.length} symbols.`);
    } catch (error) {
      this.logger.error('An error occurred during the price synchronization job', error);
    }
  }
}

