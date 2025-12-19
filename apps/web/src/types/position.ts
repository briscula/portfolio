/**
 * Centralized position-related type definitions
 */

/**
 * Position entity representing a stock holding in a portfolio
 */
export interface Position {
  userId?: number; // Optional as not always returned from API
  portfolioId?: number; // Optional as not always returned from API
  portfolioName: string;

  // Listing information (new structure)
  tickerSymbol: string; // Replaces stockSymbol
  companyName: string;
  isin?: string; // International Securities Identification Number
  exchangeCode?: string; // Exchange where the security is listed

  // Legacy field for backwards compatibility (deprecated)
  stockSymbol?: string; // @deprecated Use tickerSymbol instead

  sector: string | null;
  currentQuantity: number;
  totalCost: number; // Total cost of the position, calculated by backend
  marketValue: number; // Current market value of the position
  currentPrice: number | null; // Latest price, can be null
  unrealizedGain: number;
  unrealizedGainPercent: number;
  lastTransactionDate: string;
  portfolioPercentage: number;
  // Fields to be calculated on the frontend if needed
  averagePrice?: number;
  totalDividends?: number; // This might come from another service
  dividendCount?: number;
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
}

/**
 * Paginated positions API response
 */
export interface PositionsResponse {
  data: Position[];
  meta: PaginationInfo;
}
