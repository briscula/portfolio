"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { CreatePortfolioModal, EditPortfolioModal } from "./PortfolioModals";
import { ResponsivePortfolioTable } from "../ResponsivePortfolioTable";
import { SortField, SortDirection } from "../PortfolioTable";
import { PortfolioWithMetrics } from "@/lib/portfolio-metrics";
import { PlusIcon } from "./icons";

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  currencyCode: string;
  createdAt: string;
}

interface PortfolioTableSectionProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
  onRetry?: () => void;
  lastRefresh?: Date;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
  enablePagination?: boolean;
  enableVirtualScrolling?: boolean;
  initialPageSize?: number;
}

export const PortfolioTableSection: React.FC<PortfolioTableSectionProps> = ({
  portfolios,
  loading,
  error,
  onRefresh,
  onRetry,
  lastRefresh,
  sortField,
  sortDirection,
  onSort,
  enablePagination = true,
  enableVirtualScrolling = false,
  initialPageSize = 25,
}) => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null,
  );

  // Sort portfolios based on current sort field and direction
  const sortedPortfolios = useMemo(() => {
    if (!sortField || !sortDirection) return portfolios;

    return [...portfolios].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "currency":
          aValue = a.currencyCode;
          bValue = b.currencyCode;
          break;
        case "value":
          aValue = a.metrics.totalValue;
          bValue = b.metrics.totalValue;
          break;
        case "gain":
          aValue = a.metrics.unrealizedGain;
          bValue = b.metrics.unrealizedGain;
          break;
        case "yield":
          aValue = a.metrics.dividendYield;
          bValue = b.metrics.dividendYield;
          break;
        case "positions":
          aValue = a.metrics.positionCount;
          bValue = b.metrics.positionCount;
          break;
        case "updated":
          aValue = new Date(a.metrics.lastUpdated).getTime();
          bValue = new Date(b.metrics.lastUpdated).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [portfolios, sortField, sortDirection]);

  const handleEdit = (portfolio: PortfolioWithMetrics) => {
    setSelectedPortfolio({
      id: portfolio.id,
      name: portfolio.name,
      description: portfolio.description,
      currencyCode: portfolio.currencyCode,
      createdAt: portfolio.createdAt,
    });
    setShowEditModal(true);
  };

  const handleViewDividends = (portfolioId: string) => {
    router.push(`/en/dividends/${portfolioId}`);
  };

  const handleModalSuccess = () => {
    // Refresh the portfolio data
    onRefresh();
  };

  const handleAddPortfolio = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            My Portfolios
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track your investment portfolios
          </p>
          {lastRefresh && !loading && !error && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex gap-2">
          {onRefresh && !loading && (
            <Button
              onClick={onRefresh}
              variant="secondary"
              className="touch-manipulation min-h-[44px]"
            >
              Refresh
            </Button>
          )}
          <Button
            onClick={handleAddPortfolio}
            variant="primary"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            className="w-full sm:w-auto touch-manipulation min-h-[44px] text-base font-medium"
          >
            Add Portfolio
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium">
                Error loading portfolios
              </p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-4 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Table */}
      {!error && (
        <ResponsivePortfolioTable
          portfolios={sortedPortfolios}
          loading={loading}
          onEdit={handleEdit}
          onViewDividends={handleViewDividends}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          enablePagination={enablePagination}
          enableVirtualScrolling={enableVirtualScrolling}
          initialPageSize={initialPageSize}
        />
      )}

      {/* Modals */}
      <CreatePortfolioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditPortfolioModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPortfolio(null);
        }}
        onSuccess={handleModalSuccess}
        portfolio={selectedPortfolio}
      />
    </div>
  );
};
