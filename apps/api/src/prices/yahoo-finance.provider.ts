import { Injectable, Logger } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';
import { PriceProvider, Quote, FxRate } from './price-provider.interface';

@Injectable()
export class YahooFinanceProvider implements PriceProvider {
  private readonly logger = new Logger(YahooFinanceProvider.name);
  private readonly yahoo = new YahooFinance();

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (symbols.length === 0) {
      return [];
    }
    this.logger.log(`Fetching quotes for symbols: ${symbols.join(', ')}`);

    try {
      // TODO: Improve typing when library's types are better understood
      const results = await this.yahoo.quote(symbols) as any[];
      const quotes: Quote[] = results.map(result => ({
        symbol: result.symbol,
        price: result.regularMarketPrice,
        currency: result.currency || 'USD',
      }));
      return quotes.filter(q => q.price != null); // Filter out any quotes that failed to fetch a price
    } catch (error) {
      this.logger.error('Failed to fetch quotes from Yahoo Finance', error);
      return [];
    }
  }

  async getFxRate(from: string, to: string): Promise<FxRate> {
    this.logger.log(`Fetching FX rate from ${from} to ${to}`);
    const symbol = `${from}${to}=X`;

    try {
      // TODO: Improve typing when library's types are better understood
      const result = await this.yahoo.quote(symbol) as any;
      if (result && result.regularMarketPrice) {
        return {
          from,
          to,
          rate: result.regularMarketPrice,
        };
      } else {
        throw new Error(`Could not find FX rate for ${symbol}`);
      }
    } catch (error) {
      this.logger.error(`Failed to fetch FX rate for ${symbol}`, error);
      throw error;
    }
  }
}
