import React from "react";
import { MetricCard, MetricCardsGrid } from "./MetricCard";
import { DollarSignIcon, PercentIcon, TrendingUpIcon } from "./icons";
import { DashboardSummary, formatCurrency } from "@/lib/portfolio-metrics";

export interface SummaryCardsProps {
  summary: DashboardSummary;
  loading: boolean;
  error?: string | null;
  className?: string;
  onRetry?: () => void;
  lastRefresh?: Date;
}

/**
 * SummaryCards component displays dashboard summary metrics
 * including total value, gain/loss, and overall yield across all portfolios
 */
export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  loading,
  error,
  className,
  onRetry,
}) => {
  // Loading state
  if (loading) {
    return (
      <div
        className={className}
        role="region"
        aria-label="Portfolio summary metrics loading"
      >
        <MetricCardsGrid>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-6"
              role="status"
              aria-label={`Loading metric card ${i}`}
            >
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 bg-gray-200 rounded-lg"
                    aria-hidden="true"
                  ></div>
                  <div className="ml-4 flex-1">
                    <div
                      className="h-4 bg-gray-200 rounded w-1/2 mb-2"
                      aria-hidden="true"
                    ></div>
                    <div
                      className="h-8 bg-gray-200 rounded w-3/4"
                      aria-hidden="true"
                    ></div>
                  </div>
                </div>
              </div>
              <span className="sr-only">Loading portfolio metric...</span>
            </div>
          ))}
        </MetricCardsGrid>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={className}
        role="region"
        aria-label="Portfolio summary error"
      >
        <div
          className="bg-red-50 border border-red-200 rounded-md p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium" id="summary-error-title">
                Error loading portfolio summary
              </p>
              <p
                className="text-red-600 text-sm mt-1"
                aria-describedby="summary-error-title"
              >
                {error}
              </p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-4 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation min-h-[44px]"
                aria-describedby="summary-error-title"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Format values for display
  const totalValueFormatted = formatCurrency(summary.totalValue, "USD");
  const totalGainFormatted = formatCurrency(Math.abs(summary.totalGain), "USD");

  return (
    <div
      className={className}
      role="region"
      aria-label="Portfolio summary metrics"
    >
      <MetricCardsGrid>
        {/* Total Portfolio Value */}
        <MetricCard
          title="Total Portfolio Value"
          value={totalValueFormatted}
          change={
            summary.totalGainPercent !== 0
              ? {
                  value: Math.abs(summary.totalGainPercent),
                  type: summary.totalGainPercent >= 0 ? "increase" : "decrease",
                  period: "total return",
                }
              : undefined
          }
          icon={DollarSignIcon}
          iconColor="green"
          aria-label={`Total portfolio value: ${totalValueFormatted}${summary.totalGainPercent !== 0 ? `, ${Math.abs(summary.totalGainPercent).toFixed(1)}% ${summary.totalGainPercent >= 0 ? "increase" : "decrease"} total return` : ""}`}
        />

        {/* Total Unrealized Gain/Loss */}
        <MetricCard
          title="Unrealized Gain/Loss"
          value={`${summary.totalGain >= 0 ? "+" : "-"}${totalGainFormatted}`}
          change={
            summary.totalGainPercent !== 0
              ? {
                  value: Math.abs(summary.totalGainPercent),
                  type: summary.totalGain >= 0 ? "increase" : "decrease",
                  period: "total return",
                }
              : undefined
          }
          icon={TrendingUpIcon}
          iconColor={summary.totalGain >= 0 ? "green" : "red"}
          aria-label={`Unrealized ${summary.totalGain >= 0 ? "gain" : "loss"}: ${summary.totalGain >= 0 ? "+" : "-"}${totalGainFormatted}${summary.totalGainPercent !== 0 ? `, ${Math.abs(summary.totalGainPercent).toFixed(1)}% ${summary.totalGain >= 0 ? "increase" : "decrease"} total return` : ""}`}
        />

        {/* Overall Dividend Yield */}
        <MetricCard
          title="Overall Dividend Yield"
          value={`${summary.overallDividendYield.toFixed(1)}%`}
          change={
            summary.portfolioCount > 1
              ? {
                  value: summary.portfolioCount,
                  type: "increase",
                  period: `across ${summary.portfolioCount} portfolios`,
                }
              : undefined
          }
          icon={PercentIcon}
          iconColor="blue"
          aria-label={`Overall dividend yield: ${summary.overallDividendYield.toFixed(1)}%${summary.portfolioCount > 1 ? ` across ${summary.portfolioCount} portfolios` : ""}`}
        />
      </MetricCardsGrid>
    </div>
  );
};

/**
 * SummaryCardsSection component with header and responsive layout
 */
export interface SummaryCardsSectionProps extends SummaryCardsProps {
  title?: string;
  showPortfolioCount?: boolean;
  onRefresh?: () => void;
}

export const SummaryCardsSection: React.FC<SummaryCardsSectionProps> = ({
  title = "Portfolio Overview",
  showPortfolioCount = true,
  summary,
  loading,
  error,
  className,
  onRetry,
  onRefresh,
  lastRefresh,
}) => {
  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {showPortfolioCount && !loading && !error && (
            <p className="text-sm text-gray-600 mt-1">
              {summary.portfolioCount === 0
                ? "No portfolios found"
                : summary.portfolioCount === 1
                  ? "1 portfolio"
                  : `${summary.portfolioCount} portfolios`}
            </p>
          )}
          {lastRefresh && !loading && !error && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        {onRefresh && !loading && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <SummaryCards
        summary={summary}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    </div>
  );
};
