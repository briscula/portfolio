/**
 * Centralized portfolio-related type definitions
 *
 * Base types imported from shared Prisma schema (@repo/database)
 * Extended types for frontend-specific use cases
 */

import type { Portfolio as PrismaPortfolio, Currency } from '@repo/database';

/**
 * Portfolio entity from the API (extends Prisma Portfolio)
 * Includes currency relation for API responses
 */
export interface Portfolio extends Omit<PrismaPortfolio, 'createdAt' | 'updatedAt'> {
  createdAt: string;  // ISO string from API
  updatedAt: string;  // ISO string from API
  currency: Currency;
}

/**
 * Portfolio metrics calculated from positions
 */
export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  dividendYield: number;
  positionCount: number;
  lastUpdated: Date;
}

/**
 * Portfolio with calculated metrics
 */
export interface PortfolioWithMetrics {
  id: string;
  name: string;
  description: string;
  currencyCode: string;
  createdAt: string;
  metrics: PortfolioMetrics;
}

/**
 * Summary metrics for a single portfolio
 */
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dividendYield: number;
  monthlyDividends: number;
}

/**
 * Dashboard summary aggregated across all portfolios
 */
export interface DashboardSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  overallDividendYield: number;
  portfolioCount: number;
}
