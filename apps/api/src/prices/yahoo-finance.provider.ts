import { Injectable, Logger } from '@nestjs/common';
import yahooFinance from 'yahoo-finance2';
import { PriceProvider, Quote, FxRate } from './price-provider.interface';

@Injectable()
export class YahooFinanceProvider implements PriceProvider {
  private readonly logger = new Logger(YahooFinanceProvider.name);

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (symbols.length === 0) {
      return [];
    }
    this.logger.log(`Fetching quotes for symbols: ${symbols.join(', ')}`);

    try {
      const results = await yahooFinance.quote(symbols);
      const quotes: Quote[] = results.map(result => ({
        symbol: result.symbol,
        price: result.regularMarketPrice,
        currency: result.currency,
      }));
      return quotes;
    } catch (error) {
      this.logger.error('Failed to fetch quotes from Yahoo Finance', error);
      // Return empty array or throw a custom error
      return [];
    }
  }

  async getFxRate(from: string, to: string): Promise<FxRate> {
    this.logger.log(`Fetching FX rate from ${from} to ${to}`);
    const symbol = `${from}${to}=X`; // e.g., 'EURUSD=X'

    try {
      const result = await yahooFinance.quote(symbol);
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
      throw error; // Re-throw the error to be handled by the caller
    }
  }
}
