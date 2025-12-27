"use client";

import React from "react";
import Link from "next/link";
import { Button } from "./ui";
import {
  PortfolioWithMetrics,
  formatCurrency,
  formatPercentage,
} from "../lib/portfolio-metrics";
import { cn } from "../lib/utils";
import { EyeIcon, PencilIcon } from "./ui/icons";

export interface PortfolioTableMobileProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
}

interface PortfolioCardProps {
  portfolio: PortfolioWithMetrics;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  onEdit,
  onViewDividends,
}) => {
  const gainFormatted = formatPercentage(
    portfolio.metrics.unrealizedGainPercent,
  );

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] touch-manipulation"
      role="article"
      aria-labelledby={`portfolio-${portfolio.id}-name`}
      aria-describedby={`portfolio-${portfolio.id}-description`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <Link
            href={`/en/portfolio/${portfolio.id}`}
            className="text-xl font-semibold text-blue-600 hover:text-blue-800 active:text-blue-900 transition-colors block truncate touch-manipulation min-h-[44px] flex items-center"
            id={`portfolio-${portfolio.id}-name`}
            aria-label={`View details for ${portfolio.name} portfolio`}
          >
            {portfolio.name}
          </Link>
          {portfolio.description && (
            <p
              className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed"
              id={`portfolio-${portfolio.id}-description`}
            >
              {portfolio.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {portfolio.currencyCode}
          </span>
        </div>
      </div>

      {/* Primary Metrics - Larger on mobile */}
      <div
        className="grid grid-cols-1 gap-4 mb-5"
        role="group"
        aria-label="Portfolio metrics"
      >
        <div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
          role="region"
          aria-labelledby={`portfolio-card-${portfolio.id}-total-value`}
        >
          <p
            className="text-sm font-medium text-blue-700 mb-2"
            id={`portfolio-card-${portfolio.id}-total-value`}
          >
            Total Value
          </p>
          <p
            className="text-3xl font-bold text-gray-900"
            aria-describedby={`portfolio-${portfolio.id}-total-value`}
          >
            {formatCurrency(
              portfolio.metrics.totalValue,
              portfolio.currencyCode,
            )}
          </p>
        </div>
        <div
          className={cn(
            "rounded-xl p-4 border",
            gainFormatted.color === "green"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
              : gainFormatted.color === "red"
                ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
                : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-100",
          )}
          role="region"
          aria-labelledby={`portfolio-card-${portfolio.id}-gain-loss`}
        >
          <p
            className={cn(
              "text-sm font-medium mb-2",
              gainFormatted.color === "green"
                ? "text-green-700"
                : gainFormatted.color === "red"
                  ? "text-red-700"
                  : "text-gray-700",
            )}
            id={`portfolio-card-${portfolio.id}-gain-loss`}
          >
            Unrealized Gain/Loss
          </p>
          <div className="flex items-baseline space-x-2">
            <p
              className={cn(
                "text-2xl font-bold",
                gainFormatted.color === "green"
                  ? "text-green-600"
                  : gainFormatted.color === "red"
                    ? "text-red-600"
                    : "text-gray-600",
              )}
            >
              {formatCurrency(
                portfolio.metrics.unrealizedGain,
                portfolio.currencyCode,
              )}
            </p>
            <p
              className={cn(
                "text-lg font-semibold",
                gainFormatted.color === "green"
                  ? "text-green-600"
                  : gainFormatted.color === "red"
                    ? "text-red-600"
                    : "text-gray-600",
              )}
            >
              {gainFormatted.text}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-lg font-bold text-gray-900">
            {portfolio.metrics.positionCount}
          </p>
          <p className="text-xs text-gray-600 font-medium mt-1">Positions</p>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-lg font-bold text-gray-900">
            {portfolio.metrics.dividendYield.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 font-medium mt-1">Yield</p>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-sm font-bold text-gray-900">
            {portfolio.metrics.lastUpdated.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-600 font-medium mt-1">Updated</p>
        </div>
      </div>

      {/* Actions - Touch-optimized */}
      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onViewDividends(portfolio.id)}
          leftIcon={<EyeIcon className="h-5 w-5" />}
          className="touch-manipulation min-h-[52px] text-base font-medium"
        >
          View Dividends
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => onEdit(portfolio)}
          leftIcon={<PencilIcon className="h-5 w-5" />}
          className="touch-manipulation min-h-[52px] text-base font-medium"
        >
          Edit Portfolio
        </Button>
      </div>
    </article>
  );
};

const SkeletonCard: React.FC = () => (
  <div
    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse"
    role="status"
    aria-label="Loading portfolio card"
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-5">
      <div className="flex-1">
        <div
          className="h-6 bg-gray-200 rounded w-40 mb-3"
          aria-hidden="true"
        ></div>
        <div className="h-4 bg-gray-200 rounded w-32" aria-hidden="true"></div>
      </div>
      <div className="ml-4">
        <div
          className="h-8 bg-gray-200 rounded-full w-16"
          aria-hidden="true"
        ></div>
      </div>
    </div>
    <span className="sr-only">Loading portfolio information...</span>

    {/* Primary Metrics */}
    <div className="grid grid-cols-1 gap-4 mb-5">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="flex items-baseline space-x-2">
          <div className="h-7 bg-gray-200 rounded w-24"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>

    {/* Secondary Metrics */}
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="text-center bg-gray-50 rounded-lg p-3 border border-gray-100"
        >
          <div className="h-5 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
        </div>
      ))}
    </div>

    {/* Actions */}
    <div className="flex flex-col gap-3">
      <div className="h-13 bg-gray-200 rounded-lg"></div>
      <div className="h-13 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const EmptyState: React.FC<{ onAddPortfolio?: () => void }> = ({
  onAddPortfolio,
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <span className="text-3xl">📊</span>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No portfolios found
    </h3>
    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
      Create your first portfolio to start tracking your dividend investments.
    </p>
    {onAddPortfolio && (
      <Button onClick={onAddPortfolio} variant="primary">
        Create Your First Portfolio
      </Button>
    )}
  </div>
);

export const PortfolioTableMobile: React.FC<PortfolioTableMobileProps> = ({
  portfolios,
  loading,
  onEdit,
  onViewDividends,
}) => {
  // Show empty state when not loading and no portfolios
  if (!loading && portfolios.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {loading
        ? // Show skeleton cards while loading
          Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        : // Show actual portfolio cards
          portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onEdit={onEdit}
              onViewDividends={onViewDividends}
            />
          ))}
    </div>
  );
};

export default PortfolioTableMobile;
