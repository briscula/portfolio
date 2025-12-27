"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortfolioTable, { SortField, SortDirection } from "./PortfolioTable";
import { EnhancedPortfolioTable } from "./EnhancedPortfolioTable";
import PortfolioTableMobile from "./PortfolioTableMobile";
import { PortfolioWithMetrics } from "../lib/portfolio-metrics";
import { useResponsive } from "../hooks/useResponsive";

export interface ResponsivePortfolioTableProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends?: (portfolioId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  initialSortField?: SortField;
  initialSortDirection?: SortDirection;
  enablePagination?: boolean;
  enableVirtualScrolling?: boolean;
  initialPageSize?: number;
}

export const ResponsivePortfolioTable: React.FC<
  ResponsivePortfolioTableProps
> = ({
  portfolios,
  loading,
  onEdit,
  onViewDividends: externalOnViewDividends,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSort: externalOnSort,
  initialSortField = "value",
  initialSortDirection = "desc",
  enablePagination = true,
  enableVirtualScrolling = false,
  initialPageSize = 25,
}) => {
  const router = useRouter();
  const { isMobile } = useResponsive(); // Get more granular responsive info

  // Use external sort state if provided, otherwise use internal state
  const [internalSortField, setInternalSortField] =
    useState<SortField>(initialSortField);
  const [internalSortDirection, setInternalSortDirection] =
    useState<SortDirection>(initialSortDirection);

  const sortField = externalSortField ?? internalSortField;
  const sortDirection = externalSortDirection ?? internalSortDirection;

  const [sortedPortfolios, setSortedPortfolios] =
    useState<PortfolioWithMetrics[]>(portfolios);

  // Sort portfolios when sort criteria or portfolios change
  useEffect(() => {
    const sorted = [...portfolios].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

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
          aValue = a.metrics.unrealizedGainPercent;
          bValue = b.metrics.unrealizedGainPercent;
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
          aValue = a.metrics.lastUpdated.getTime();
          bValue = b.metrics.lastUpdated.getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setSortedPortfolios(sorted);
  }, [portfolios, sortField, sortDirection]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    if (externalOnSort) {
      externalOnSort(field, direction);
    } else {
      setInternalSortField(field);
      setInternalSortDirection(direction);
    }
  };

  const handleViewDividends = (portfolioId: string) => {
    if (externalOnViewDividends) {
      externalOnViewDividends(portfolioId);
    } else {
      router.push(`/en/dividends/${portfolioId}`);
    }
  };

  // Show mobile card layout on mobile screens
  if (isMobile) {
    return (
      <PortfolioTableMobile
        portfolios={sortedPortfolios}
        loading={loading}
        onEdit={onEdit}
        onViewDividends={handleViewDividends}
      />
    );
  }

  // Show desktop table on tablet and larger screens
  // Use enhanced table with pagination and performance optimizations for large datasets
  if (portfolios.length > 50 || enableVirtualScrolling) {
    return (
      <EnhancedPortfolioTable
        portfolios={portfolios}
        loading={loading}
        onSort={externalOnSort || handleSort}
        onEdit={onEdit}
        onViewDividends={handleViewDividends}
        sortField={externalSortField || sortField}
        sortDirection={externalSortDirection || sortDirection}
        enablePagination={enablePagination}
        enableVirtualScrolling={enableVirtualScrolling}
        initialPageSize={initialPageSize}
      />
    );
  }

  // Use regular table for smaller datasets
  return (
    <PortfolioTable
      portfolios={sortedPortfolios}
      loading={loading}
      onSort={handleSort}
      onEdit={onEdit}
      onViewDividends={handleViewDividends}
      sortField={sortField}
      sortDirection={sortDirection}
    />
  );
};

export default ResponsivePortfolioTable;
