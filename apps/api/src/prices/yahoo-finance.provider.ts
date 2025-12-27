import { Injectable, Logger } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';
import {
  PriceProvider,
  Quote,
  FxRate,
  SymbolRequest,
} from './price-provider.interface';

// Yahoo Finance exchange suffixes
// See: https://help.yahoo.com/kb/SLN2310.html
const EXCHANGE_SUFFIXES: Record<string, string> = {
  XLON: '.L', // London Stock Exchange
  XAMS: '.AS', // Euronext Amsterdam
  XPAR: '.PA', // Euronext Paris
  XETR: '.DE', // Deutsche Börse XETRA
  XMAD: '.MC', // Bolsa de Madrid
  XMIL: '.MI', // Borsa Italiana (Milan)
  XHKG: '.HK', // Hong Kong Stock Exchange
  XTSE: '.TO', // Toronto Stock Exchange
  XASX: '.AX', // Australian Securities Exchange
  // US exchanges don't need suffixes
  XNYS: '', // NYSE
  XNAS: '', // NASDAQ
};

@Injectable()
export class YahooFinanceProvider implements PriceProvider {
  private readonly logger = new Logger(YahooFinanceProvider.name);
  private readonly yahoo = new YahooFinance();

  async getQuotes(symbolRequests: SymbolRequest[]): Promise<Quote[]> {
    if (symbolRequests.length === 0) {
      return [];
    }

    // Build Yahoo symbols with exchange suffixes and track original symbols
    const symbolMap = new Map<string, string>(); // yahooSymbol -> originalSymbol
    const yahooSymbols: string[] = [];

    for (const req of symbolRequests) {
      const suffix = EXCHANGE_SUFFIXES[req.exchangeCode] ?? '';
      let symbol = req.symbol;

      // Hong Kong stocks need to be padded to 4 digits (e.g., 1 -> 0001, 257 -> 0257)
      if (req.exchangeCode === 'XHKG' && /^\d+$/.test(symbol)) {
        symbol = symbol.padStart(4, '0');
      }

      const yahooSymbol = `${symbol}${suffix}`;
      symbolMap.set(yahooSymbol, req.symbol);
      yahooSymbols.push(yahooSymbol);
    }

    this.logger.log(`Fetching quotes for symbols: ${yahooSymbols.join(', ')}`);

    try {
      // TODO: Improve typing when library's types are better understood
      const results = (await this.yahoo.quote(yahooSymbols)) as any[];
      const quotes: Quote[] = results.map((result) => {
        // Map back to original symbol (without suffix)
        const originalSymbol = symbolMap.get(result.symbol) || result.symbol;

        // Normalize GBp (British pence) to GBP
        let currency = result.currency || 'USD';
        let price = result.regularMarketPrice;
        if (currency === 'GBp') {
          currency = 'GBP';
          price = price / 100; // Convert pence to pounds
        }

        // Get dividend yield (Yahoo returns as decimal, e.g., 0.0412 for 4.12%)
        const dividendYield =
          result.dividendYield ?? result.trailingAnnualDividendYield;

        return {
          symbol: originalSymbol,
          price,
          currency,
          companyName: result.longName || result.shortName,
          dividendYield,
        };
      });
      return quotes.filter((q) => q.price != null); // Filter out any quotes that failed to fetch a price
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
      const result = (await this.yahoo.quote(symbol)) as any;
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
