import { ApiClient } from "@/lib/apiClient";
import type {
  Portfolio,
  Position,
  PaginationInfo,
  PortfolioSummary,
  TransactionPayload,
} from "@/types";

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  dividendYield: number;
  positionCount: number;
  lastUpdated: Date;
}

export interface PortfolioWithMetrics extends Portfolio {
  metrics: PortfolioMetrics;
}

export interface DashboardSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  overallDividendYield: number;
  portfolioCount: number;
}

export class PortfolioService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private apiClient: ApiClient) {}

  // Portfolio CRUD Operations
  async getPortfolios(): Promise<Portfolio[]> {
    const response = await this.apiClient.getPortfolios();

    // Handle different response formats
    if (Array.isArray(response)) {
      return response as Portfolio[];
    }

    return (response as { data?: Portfolio[] }).data || [];
  }

  async getPortfolio(portfolioId: string): Promise<Portfolio> {
    const response = await this.apiClient.getPortfolio(portfolioId);
    return response as Portfolio;
  }

  async createPortfolio(data: {
    name: string;
    description: string;
    currencyCode: string;
  }): Promise<Portfolio> {
    const response = await this.apiClient.createPortfolio(data);
    return response as Portfolio;
  }

  async updatePortfolio(
    id: string,
    data: { name: string; description: string; currencyCode: string },
  ): Promise<Portfolio> {
    const response = await this.apiClient.updatePortfolio(id, data);
    return response as Portfolio;
  }

  async deletePortfolio(id: string): Promise<void> {
    await this.apiClient.deletePortfolio(id);
  }

  // Position Operations
  async getPositions(
    portfolioId: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<{ data: Position[]; pagination?: PaginationInfo }> {
    const response = await this.apiClient.getPositions(
      portfolioId,
      page,
      pageSize,
    );

    // Check if response has pagination
    if (
      response &&
      (response as any).data &&
      Array.isArray((response as any).data)
    ) {
      return {
        data: (response as any).data,
        pagination: (response as any).pagination || undefined,
      };
    }

    // Fallback for non-paginated response
    return {
      data: Array.isArray(response) ? (response as Position[]) : [],
    };
  }

  async getPositionsWithCache(portfolioId: string): Promise<Position[]> {
    const cacheKey = `positions_${portfolioId}`;
    const cached = this.getCached<Position[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.getPositions(portfolioId, 1, 100);
    this.setCache(cacheKey, result.data);

    return result.data;
  }

  // Cache Management
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Metrics Calculation
  calculatePortfolioMetrics(positions: Position[]): PortfolioMetrics {
    const totalCost = Math.abs(
      positions.reduce((sum, pos) => sum + Math.abs(pos.totalCost || 0), 0),
    );
    const totalValue = positions.reduce(
      (sum, pos) => sum + (pos.marketValue || pos.totalCost || 0),
      0,
    );
    const totalDividends = positions.reduce(
      (sum, pos) => sum + (pos.totalDividends || 0),
      0,
    );
    const unrealizedGain = totalValue - totalCost;
    const unrealizedGainPercent =
      totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0;
    const dividendYield =
      totalValue > 0 ? (totalDividends / totalValue) * 100 : 0;

    return {
      totalValue,
      totalCost,
      unrealizedGain,
      unrealizedGainPercent,
      dividendYield,
      positionCount: positions.length,
      lastUpdated: new Date(),
    };
  }

  calculatePortfolioSummary(positions: Position[]): PortfolioSummary {
    const totalCost = Math.abs(
      positions.reduce((sum, pos) => sum + Math.abs(pos.totalCost || 0), 0),
    );
    const totalValue = positions.reduce(
      (sum, pos) => sum + (pos.marketValue || pos.totalCost || 0),
      0,
    );
    const totalDividends = positions.reduce(
      (sum, pos) => sum + (pos.totalDividends || 0),
      0,
    );
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    const dividendYield =
      totalValue > 0 ? (totalDividends / totalValue) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      dividendYield,
      monthlyDividends: totalDividends / 12, // Rough estimate
    };
  }

  calculateDashboardSummary(
    portfolios: PortfolioWithMetrics[],
  ): DashboardSummary {
    const totalValue = portfolios.reduce(
      (sum, p) => sum + p.metrics.totalValue,
      0,
    );
    const totalCost = portfolios.reduce(
      (sum, p) => sum + p.metrics.totalCost,
      0,
    );
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    // Calculate weighted average dividend yield
    const overallDividendYield =
      totalValue > 0
        ? portfolios.reduce((sum, p) => {
            const weight = p.metrics.totalValue / totalValue;
            return sum + p.metrics.dividendYield * weight;
          }, 0)
        : 0;

    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      overallDividendYield,
      portfolioCount: portfolios.length,
    };
  }

  // Portfolio with Metrics
  async getPortfolioWithMetrics(
    portfolioId: string,
  ): Promise<PortfolioWithMetrics> {
    const portfolio = await this.getPortfolio(portfolioId);
    const positions = await this.getPositionsWithCache(portfolioId);
    const metrics = this.calculatePortfolioMetrics(positions);

    return {
      ...portfolio,
      metrics,
    };
  }

  async getAllPortfoliosWithMetrics(): Promise<PortfolioWithMetrics[]> {
    const portfolios = await this.getPortfolios();

    const portfolioPromises = portfolios.map(async (portfolio) => {
      try {
        const positions = await this.getPositionsWithCache(portfolio.id);
        const metrics = this.calculatePortfolioMetrics(positions);

        return {
          ...portfolio,
          metrics,
        };
      } catch (err) {
        console.error(
          `Error fetching positions for portfolio ${portfolio.id}:`,
          err,
        );

        // Return portfolio with empty metrics if positions fetch fails
        return {
          ...portfolio,
          metrics: {
            totalValue: 0,
            totalCost: 0,
            unrealizedGain: 0,
            unrealizedGainPercent: 0,
            dividendYield: 0,
            positionCount: 0,
            lastUpdated: new Date(),
          },
        };
      }
    });

    return await Promise.all(portfolioPromises);
  }

  // Transaction Operations
  async createTransaction(
    portfolioId: string,
    transaction: TransactionPayload,
  ): Promise<unknown> {
    // Generate UUID v7 for reference if not provided
    const reference = transaction.notes || crypto.randomUUID();

    const payload = {
      // Listing information
      isin: transaction.isin,
      exchangeCode: transaction.exchangeCode,
      tickerSymbol: transaction.tickerSymbol,
      companyName: transaction.companyName,
      currencyCode: transaction.currencyCode,
      exchangeCountry: transaction.exchangeCountry,

      // Transaction details
      quantity: transaction.quantity,
      price: transaction.price,
      commission: transaction.commission || 0,
      reference: reference,
      amount: parseFloat(transaction.amount.toFixed(2)),
      totalAmount: parseFloat(transaction.totalAmount.toFixed(2)),
      tax: transaction.tax || 0,
      taxPercentage: transaction.taxPercentage || 0,
      date: transaction.date || new Date().toISOString(),
      notes: transaction.notes || "",
      type: transaction.type,
    };

    return await this.apiClient.createTransaction(portfolioId, payload);
  }
}
