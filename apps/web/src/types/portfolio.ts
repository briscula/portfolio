/**
 * Centralized portfolio-related type definitions
 */

/**
 * Portfolio entity from the API
 */
export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
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
 * Shape of the summary data returned from the API's /portfolios/:id/summary endpoint
 */
export interface ApiPortfolioSummary {
  totalValueUSD: number;
  totalAmountUSD: number;
  positionCount: number;
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
