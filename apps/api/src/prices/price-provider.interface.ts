export interface Quote {
  symbol: string;
  price: number;
  currency: string;
}

export interface FxRate {
  from: string;
  to: string;
  rate: number;
}

export interface PriceProvider {
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getFxRate(from: string, to: string): Promise<FxRate>;
}
