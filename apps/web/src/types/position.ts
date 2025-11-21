/**
 * Centralized position-related type definitions
 *
 * Note: Position is a computed/aggregate type (not a Prisma model)
 * Backend calculates positions from Transaction data
 */

import type { Stock } from '@repo/database';

/**
 * Position entity representing a stock holding in a portfolio
 * Computed from transactions on the backend
 */
export interface Position {
  userId: number;
  portfolioId: number;
  portfolioName: string;
  stockSymbol: string;
  companyName: string;
  sector: string | null;
  currentQuantity: number;
  totalAmount: number; // Total cost of the position
  totalCost?: number; // Legacy field for backward compatibility
  totalDividends: number;
  dividendCount: number;
  lastTransactionDate: string;
  portfolioPercentage: number;
  // Calculated fields (computed on frontend)
  averagePrice?: number;
  currentPrice?: number;
  totalValue?: number;
  unrealizedGain?: number;
  unrealizedGainPercent?: number;
  dividendYield?: number;
}

/**
 * Pagination metadata for API responses
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  // Legacy fields for backward compatibility
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
}

/**
 * Paginated positions API response
 */
export interface PositionsResponse {
  data: Position[];
  pagination: PaginationInfo;
}

/**
 * Re-export Stock type from Prisma for convenience
 */
export type { Stock };
