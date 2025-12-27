import type {
  Position,
  PortfolioMetrics,
  PortfolioWithMetrics,
  DashboardSummary,
} from "@/types";

// Re-export types for backward compatibility
export type { PortfolioMetrics, PortfolioWithMetrics, DashboardSummary };

/**
 * Currency conversion rates (mock for now - would come from API)
 */
const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  CAD: 0.74,
};

/**
 * Convert amount from one currency to USD
 */
export function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = CURRENCY_RATES[fromCurrency] || 1.0;
  return amount * rate;
}

/**
 * Calculate portfolio metrics from positions
 */
export function calculatePortfolioMetrics(
  positions: Position[],
): PortfolioMetrics {
  if (positions.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      unrealizedGain: 0,
      unrealizedGainPercent: 0,
      dividendYield: 0,
      positionCount: 0,
      lastUpdated: new Date(),
    };
  }

  // Calculate totals
  const totalCost = Math.abs(
    positions.reduce((sum, pos) => sum + Math.abs(pos.totalCost || 0), 0),
  );
  const totalDividends = positions.reduce(
    (sum, pos) => sum + (pos.totalDividends || 0),
    0,
  );
  const totalValue = positions.reduce(
    (sum, pos) => sum + (pos.marketValue || pos.totalCost || 0),
    0,
  );

  const unrealizedGain = totalValue - totalCost;
  const unrealizedGainPercent =
    totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0;

  // Calculate dividend yield (annual dividends / current value)
  const dividendYield =
    totalValue > 0 ? (totalDividends / totalValue) * 100 : 0;

  // Find most recent transaction date
  const lastUpdated = positions.reduce((latest, pos) => {
    const posDate = new Date(pos.lastTransactionDate);
    return posDate > latest ? posDate : latest;
  }, new Date(0));

  return {
    totalValue,
    totalCost,
    unrealizedGain,
    unrealizedGainPercent,
    dividendYield,
    positionCount: positions.length,
    lastUpdated,
  };
}

/**
 * Calculate dashboard summary from multiple portfolios
 */
export function calculateDashboardSummary(
  portfoliosWithMetrics: PortfolioWithMetrics[],
): DashboardSummary {
  if (portfoliosWithMetrics.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalGain: 0,
      totalGainPercent: 0,
      overallDividendYield: 0,
      portfolioCount: 0,
    };
  }

  // Convert all values to USD for aggregation
  let totalValueUSD = 0;
  let totalCostUSD = 0;
  let totalDividendsUSD = 0;

  portfoliosWithMetrics.forEach((portfolio) => {
    const valueUSD = convertToUSD(
      portfolio.metrics.totalValue,
      portfolio.currencyCode,
    );
    const costUSD = convertToUSD(
      portfolio.metrics.totalCost,
      portfolio.currencyCode,
    );
    const dividendsUSD = convertToUSD(
      (portfolio.metrics.dividendYield / 100) * portfolio.metrics.totalValue,
      portfolio.currencyCode,
    );

    totalValueUSD += valueUSD;
    totalCostUSD += costUSD;
    totalDividendsUSD += dividendsUSD;
  });

  const totalGain = totalValueUSD - totalCostUSD;
  const totalGainPercent =
    totalCostUSD > 0 ? (totalGain / totalCostUSD) * 100 : 0;
  const overallDividendYield =
    totalValueUSD > 0 ? (totalDividendsUSD / totalValueUSD) * 100 : 0;

  return {
    totalValue: totalValueUSD,
    totalCost: totalCostUSD,
    totalGain,
    totalGainPercent,
    overallDividendYield,
    portfolioCount: portfoliosWithMetrics.length,
  };
}

/**
 * Format currency amount with proper symbol
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
  };

  const symbol = symbols[currencyCode] || currencyCode;
  return `${symbol}${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format percentage with proper sign and color indication
 */
export function formatPercentage(percentage: number): {
  text: string;
  color: "green" | "red" | "gray";
} {
  const sign = percentage > 0 ? "+" : "";
  const color = percentage > 0 ? "green" : percentage < 0 ? "red" : "gray";

  return {
    text: `${sign}${percentage.toFixed(1)}%`,
    color,
  };
}

/**
 * Sort portfolios by specified field
 */
export function sortPortfolios(
  portfolios: PortfolioWithMetrics[],
  sortBy: "name" | "value" | "gain" | "yield" | "updated",
  direction: "asc" | "desc" = "desc",
): PortfolioWithMetrics[] {
  const sorted = [...portfolios].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "value":
        aValue = a.metrics.totalValue;
        bValue = b.metrics.totalValue;
        break;
      case "gain":
        aValue = a.metrics.unrealizedGainPercent;
        bValue = b.metrics.unrealizedGainPercent;
        break;
      case "yield":
        aValue = a.metrics.dividendYield;
        bValue = b.metrics.dividendYield;
        break;
      case "updated":
        aValue = a.metrics.lastUpdated.getTime();
        bValue = b.metrics.lastUpdated.getTime();
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return sorted;
}
