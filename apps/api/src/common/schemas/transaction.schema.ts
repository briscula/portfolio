import { z } from 'zod';
import { $Enums } from '@repo/database';

/**
 * Schema for transaction type enum
 */
export const TransactionTypeSchema = z.nativeEnum($Enums.TransactionType);

/**
 * Schema for creating a new transaction
 */
export const CreateTransactionSchema = z.object({
  isin: z.string().max(12, 'ISIN must be 12 characters or less'),
  exchangeCode: z
    .string()
    .max(10, 'Exchange code must be 10 characters or less'),
  exchangeCountry: z.string().max(50).optional(),
  tickerSymbol: z
    .string()
    .max(10, 'Ticker symbol must be 10 characters or less'),
  companyName: z.string().max(255, 'Company name too long'),
  currencyCode: z.string().length(3).toUpperCase(),
  quantity: z.number(),
  price: z.number().nonnegative('Price cannot be negative'),
  commission: z
    .number()
    .nonnegative('Commission cannot be negative')
    .default(0),
  reference: z.string().max(255).optional(),
  amount: z.number(),
  totalAmount: z.number(),
  tax: z.number().nonnegative('Tax cannot be negative').default(0),
  taxPercentage: z
    .number()
    .nonnegative('Tax percentage cannot be negative')
    .default(0),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
  type: TransactionTypeSchema,
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;

/**
 * Schema for querying transactions
 */
export const QueryTransactionsSchema = z.object({
  type: TransactionTypeSchema.optional(),
  symbol: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().nonnegative().default(0),
  sort: z.string().optional(),
});

export type QueryTransactionsDto = z.infer<typeof QueryTransactionsSchema>;

/**
 * Schema for transaction entity (from database)
 */
export const TransactionSchema = z.object({
  id: z.number().int(),
  portfolioId: z.string(),
  listingIsin: z.string().max(12),
  listingExchangeCode: z.string().max(10),
  type: TransactionTypeSchema,
  quantity: z.number(),
  price: z.number(),
  commission: z.number(),
  currencyCode: z.string(),
  notes: z.string(),
  amount: z.number(),
  totalAmount: z.number(),
  tax: z.number(),
  taxPercentage: z.number(),
  reference: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
