/**
 * Centralized transaction-related type definitions
 */

/**
 * Transaction types supported by the API
 */
export type TransactionType = "DIVIDEND" | "BUY" | "SELL" | "TAX" | "SPLIT";

export interface TransactionPayload {
  // Listing information (required)
  isin: string;
  exchangeCode: string;
  tickerSymbol: string;
  companyName: string;
  currencyCode: string;
  exchangeCountry?: string;

  // Transaction details
  quantity: number;
  price: number;
  commission?: number;
  amount: number;
  totalAmount: number;
  tax?: number;
  taxPercentage?: number;
  date?: string;
  notes?: string;
  type: "BUY" | "SELL" | "DIVIDEND" | "TAX" | "SPLIT";
}

/**
 * Transaction entity from the API
 */
export interface Transaction {
  id: number;
  portfolioId: string;
  stockSymbol: string; // Deprecated - use listing.tickerSymbol instead
  type: TransactionType;
  quantity: number;
  reference: string;
  amount: number;
  totalAmount: number;
  tax: number;
  taxPercentage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  portfolio?: {
    id: string;
    name: string;
    currencyCode: string;
    currency?: {
      code: string;
      name: string;
      symbol: string;
    };
  };
  listing?: {
    tickerSymbol: string;
    companyName: string;
    isin?: string;
    exchangeCode?: string;
  };
}
