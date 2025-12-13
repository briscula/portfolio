import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);
  private readonly apiUrl = 'https://www.alphavantage.co/query';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
      where: {
        stockSymbol: { in: uniqueSymbols },
      },
      select: {
        stockSymbol: true,
        lastUpdated: true,
      },
    });

    const lastUpdateMap = new Map<string, Date>();
    for (const update of lastUpdates) {
      lastUpdateMap.set(update.stockSymbol, update.lastUpdated);
    }

    // 3. Sort symbols by last update time (oldest first, never updated top priority)
    uniqueSymbols.sort((a, b) => {
      const aTime = lastUpdateMap.get(a)?.getTime() || 0;
      const bTime = lastUpdateMap.get(b)?.getTime() || 0;
      return aTime - bTime;
    });

    this.logger.log(
      `Found ${uniqueSymbols.length} unique symbols to update. Prioritizing oldest updates first.`,
    );

    const apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      this.logger.error('ALPHA_VANTAGE_API_KEY is not configured. Aborting sync job.');
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const failedSymbols: string[] = [];

    for (const [index, symbol] of uniqueSymbols.entries()) {
      // Break the loop if we hit the daily limit to avoid unnecessary waiting
      if (failureCount > 0 && uniqueSymbols.length > 25) {
        const message = `Stopping sync early due to API errors, likely rate limiting. ${
          uniqueSymbols.length - index
        } symbols were skipped.`;
        this.logger.warn(message);
        break;
      }

      try {
        const url = `${this.apiUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const response = await firstValueFrom(this.httpService.get(url));
        const quote = response.data['Global Quote'];

        if (quote && quote['05. price']) {
          const price = parseFloat(quote['05. price']);
          const currencyCode = 'USD'; // Assuming USD for now

          await this.prisma.stockPrice.upsert({
            where: { stockSymbol_currencyCode: { stockSymbol: symbol, currencyCode } },
            update: {
              price,
              source: 'alpha_vantage',
              lastUpdated: new Date(),
            },
            create: {
              stockSymbol: symbol,
              price,
              currencyCode,
              source: 'alpha_vantage',
            },
          });
          this.logger.log(`Successfully updated price for ${symbol}: ${price}`);
          successCount++;
        } else if (response.data.Information || response.data.Note) {
          const message = response.data.Information || response.data.Note;
          this.logger.warn(`Could not fetch price for ${symbol}. API response: ${message}`);
          failureCount++;
          failedSymbols.push(symbol);
        } else {
          this.logger.warn(
            `Could not fetch price for ${symbol}. Invalid response structure: ${JSON.stringify(
              response.data,
            )}`,
          );
          failureCount++;
          failedSymbols.push(symbol);
        }
      } catch (error) {
        this.logger.error(`Failed to fetch price for ${symbol}`, error);
        failureCount++;
        failedSymbols.push(symbol);
      }

      // Add a delay between API calls to respect free tier rate limits
      if (index < uniqueSymbols.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
      }
    }

    this.logger.log('Finished full stock price synchronization job.');
    this.logger.log(`Summary: ${successCount} successful updates, ${failureCount} failed updates.`);

    if (failureCount > 0) {
      this.logger.warn(
        `Failed to update prices for the following symbols: ${failedSymbols.join(
          ', ',
        )}. This may be due to reaching the Alpha Vantage API rate limit (25 requests per day for the free tier).`,
      );
    }
  }
}
