/**
 * Centralized transaction-related type definitions
 *
 * Base types imported from shared Prisma schema (@repo/database)
 * Extended types for frontend-specific use cases
 */

import type { Transaction as PrismaTransaction, $Enums, Portfolio, Currency } from '@repo/database';

/**
 * Transaction types supported by the API (from Prisma enum)
 */
export type TransactionType = $Enums.TransactionType;

/**
 * Transaction entity from the API (extends Prisma Transaction)
 * Dates are ISO strings from API responses
 */
export interface Transaction extends Omit<PrismaTransaction, 'createdAt' | 'updatedAt'> {
  createdAt: string;  // ISO string from API
  updatedAt: string;  // ISO string from API
  portfolio?: {
    currencyCode: string;
    currency?: Currency;
  };
}
