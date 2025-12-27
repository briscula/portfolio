export interface SymbolRequest {
  symbol: string;
  exchangeCode: string;
}

export interface Quote {
  symbol: string;
  price: number;
  currency: string;
  // Optional fields for price updater
  companyName?: string;
  dividendYield?: number; // As decimal (0.0412 = 4.12%)
}

export interface FxRate {
  from: string;
  to: string;
  rate: number;
}

export interface PriceProvider {
  getQuotes(symbols: SymbolRequest[]): Promise<Quote[]>;
  getFxRate(from: string, to: string): Promise<FxRate>;
}
