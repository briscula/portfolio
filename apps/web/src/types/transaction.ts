/**
 * Centralized transaction-related type definitions
 */

/**
 * Transaction types supported by the API
 */
export type TransactionType = 'DIVIDEND' | 'BUY' | 'SELL' | 'TAX' | 'SPLIT';

/**
 * Transaction entity from the API
 */
export interface Transaction {
  id: number;
  portfolioId: string;
  stockSymbol: string;
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
    currencyCode: string;
    currency?: {
      code: string;
      name: string;
      symbol: string;
    };
  };
}
