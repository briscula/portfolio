"use client";

import React, { useMemo, memo } from "react";
import { EmptyState } from "./ui";
import { Pagination } from "./ui/Pagination";
import { VirtualScrollTable, VirtualScrollItem } from "./ui/VirtualScrollTable";
import { OptimizedPortfolioRow } from "./OptimizedPortfolioRow";
import { PortfolioWithMetrics } from "../lib/portfolio-metrics";
import { usePagination } from "../hooks/usePagination";
import { useDebouncedSort } from "../hooks/useDebouncedSort";
import { cn } from "../lib/utils";
import { ChevronUpIcon, ChevronDownIcon } from "./ui/icons";

export type SortField =
  | "name"
  | "currency"
  | "value"
  | "gain"
  | "yield"
  | "positions"
  | "updated";
export type SortDirection = "asc" | "desc";

export interface EnhancedPortfolioTableProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onSort?: (field: SortField, direction: SortDirection) => void;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  enablePagination?: boolean;
  enableVirtualScrolling?: boolean;
  initialPageSize?: number;
  virtualScrollHeight?: number;
  className?: string;
}

interface SortableHeaderProps {
  field: SortField;
  currentField?: SortField;
  currentDirection?: SortDirection;
  pendingField?: SortField;
  pendingDirection?: SortDirection;
  isDebouncing?: boolean;
  onSort: (field: SortField, direction: SortDirection) => void;
  children: React.ReactNode;
  className?: string;
}

const SortableHeader = memo<SortableHeaderProps>(
  ({
    field,
    currentField,
    currentDirection,
    pendingField,
    pendingDirection,
    isDebouncing,
    onSort,
    children,
    className,
  }) => {
    const isActive = currentField === field;
    const isPending = pendingField === field;
    const displayDirection = isPending ? pendingDirection : currentDirection;

    const nextDirection: SortDirection =
      isActive && displayDirection === "desc" ? "asc" : "desc";

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSort(field, nextDirection);
      }
    };

    // Create accessible sort description
    const getSortDescription = () => {
      if (!isActive && !isPending) {
        return `Sort by ${children}`;
      }
      const direction = displayDirection === "asc" ? "ascending" : "descending";
      const status = isPending ? "pending sort" : "sorted";
      return `${status} by ${children} in ${direction} order. Click to sort in ${nextDirection === "asc" ? "ascending" : "descending"} order.`;
    };

    return (
      <button
        onClick={() => onSort(field, nextDirection)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm transition-colors touch-manipulation min-h-[44px] py-2",
          (isActive || isPending) && "text-blue-600",
          isPending && isDebouncing && "opacity-75",
          className,
        )}
        aria-label={getSortDescription()}
        aria-pressed={isActive}
        aria-describedby={
          isPending && isDebouncing ? `${field}-sort-status` : undefined
        }
        tabIndex={0}
        role="button"
      >
        <span>{children}</span>
        <div className="flex flex-col" aria-hidden="true">
          <ChevronUpIcon
            className={cn(
              "h-3 w-3 transition-colors",
              (isActive || isPending) && displayDirection === "asc"
                ? "text-blue-600"
                : "text-gray-400",
            )}
          />
          <ChevronDownIcon
            className={cn(
              "h-3 w-3 -mt-1 transition-colors",
              (isActive || isPending) && displayDirection === "desc"
                ? "text-blue-600"
                : "text-gray-400",
            )}
          />
        </div>
        {isPending && isDebouncing && (
          <>
            <div
              className="ml-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              aria-hidden="true"
            />
            <span
              id={`${field}-sort-status`}
              className="sr-only"
              aria-live="polite"
            >
              Sorting by {children}...
            </span>
          </>
        )}
      </button>
    );
  },
);

SortableHeader.displayName = "SortableHeader";

const SkeletonRow = memo(() => (
  <tr className="animate-pulse" role="row" aria-label="Loading portfolio data">
    <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
      <div
        className="h-4 bg-gray-200 rounded w-32 mb-2"
        aria-hidden="true"
      ></div>
      <div className="h-3 bg-gray-200 rounded w-24" aria-hidden="true"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-12"></div>
    </td>
    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </td>
    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-8"></div>
    </td>
    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
    </td>
  </tr>
));

SkeletonRow.displayName = "SkeletonRow";

export const EnhancedPortfolioTable: React.FC<EnhancedPortfolioTableProps> = ({
  portfolios,
  loading,
  onSort: externalOnSort,
  onEdit,
  onViewDividends,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  enablePagination = true,
  enableVirtualScrolling = false,
  initialPageSize = 25,
  virtualScrollHeight = 600,
  className,
}) => {
  // Debounced sorting
  const {
    sortField,
    sortDirection,
    pendingSortField,
    pendingSortDirection,
    isDebouncing,
    handleSort: handleDebouncedSort,
  } = useDebouncedSort({
    initialSortField: externalSortField || "name",
    initialSortDirection: externalSortDirection || "asc",
    debounceMs: 300,
  });

  // Use external sort if provided, otherwise use internal debounced sort
  const currentSortField = externalSortField || sortField;
  const currentSortDirection = externalSortDirection || sortDirection;

  // Sort portfolios
  const sortedPortfolios = useMemo(() => {
    return [...portfolios].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (currentSortField) {
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

      if (aValue < bValue) return currentSortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return currentSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [portfolios, currentSortField, currentSortDirection]);

  // Pagination
  const pagination = usePagination<PortfolioWithMetrics>({
    initialPageSize,
    totalItems: sortedPortfolios.length,
  });

  // Get data to display (paginated or all)
  const displayedPortfolios = useMemo(() => {
    if (!enablePagination || enableVirtualScrolling) {
      return sortedPortfolios;
    }
    return pagination.getPaginatedData(sortedPortfolios);
  }, [sortedPortfolios, enablePagination, enableVirtualScrolling, pagination]);

  // Handle sort
  const handleSort = (field: SortField, direction: SortDirection) => {
    if (externalOnSort) {
      externalOnSort(field, direction);
    } else {
      handleDebouncedSort(field, direction);
    }
  };

  // Memoize handlers to prevent unnecessary re-renders
  const memoizedOnEdit = React.useCallback(
    (portfolio: PortfolioWithMetrics) => {
      onEdit(portfolio);
    },
    [onEdit],
  );

  const memoizedOnViewDividends = React.useCallback(
    (portfolioId: string) => {
      onViewDividends(portfolioId);
    },
    [onViewDividends],
  );

  // Table header component
  const renderTableHeader = () => (
    <thead className="bg-gray-50" role="rowgroup">
      <tr role="row">
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
          aria-sort={
            currentSortField === "name"
              ? currentSortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <SortableHeader
            field="name"
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            pendingField={pendingSortField}
            pendingDirection={pendingSortDirection}
            isDebouncing={isDebouncing}
            onSort={handleSort}
          >
            Portfolio
          </SortableHeader>
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
          aria-sort={
            currentSortField === "currency"
              ? currentSortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <SortableHeader
            field="currency"
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            pendingField={pendingSortField}
            pendingDirection={pendingSortDirection}
            isDebouncing={isDebouncing}
            onSort={handleSort}
          >
            Currency
          </SortableHeader>
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
          aria-sort={
            currentSortField === "value"
              ? currentSortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <SortableHeader
            field="value"
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            pendingField={pendingSortField}
            pendingDirection={pendingSortDirection}
            isDebouncing={isDebouncing}
            onSort={handleSort}
          >
            Total Value
          </SortableHeader>
        </th>
        <th
          className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
          aria-sort={
            currentSortField === "gain"
              ? currentSortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <SortableHeader
            field="gain"
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            pendingField={pendingSortField}
            pendingDirection={pendingSortDirection}
            isDebouncing={isDebouncing}
            onSort={handleSort}
          >
            Gain/Loss
          </SortableHeader>
        </th>
        <th
          className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
          aria-sort={
            currentSortField === "yield"
              ? currentSortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <SortableHeader
            field="yield"
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            pendingField={pendingSortField}
            pendingDirection={pendingSortDirection}
            isDebouncing={isDebouncing}
            onSort={handleSort}
          >
            Dividend Yield
          </SortableHeader>
        </th>
        <th
          className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
          aria-sort={
            currentSortField === "positions"
              ? currentSortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <SortableHeader
            field="positions"
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            pendingField={pendingSortField}
            pendingDirection={pendingSortDirection}
            isDebouncing={isDebouncing}
            onSort={handleSort}
          >
            Positions
          </SortableHeader>
        </th>
        <th
          className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
          aria-sort={
            currentSortField === "updated"
              ? currentSortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <SortableHeader
            field="updated"
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            pendingField={pendingSortField}
            pendingDirection={pendingSortDirection}
            isDebouncing={isDebouncing}
            onSort={handleSort}
          >
            Last Updated
          </SortableHeader>
        </th>
        <th
          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
          role="columnheader"
          scope="col"
        >
          Actions
        </th>
      </tr>
    </thead>
  );

  // Show empty state when not loading and no portfolios
  if (!loading && portfolios.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No portfolios found"
        description="Create your first portfolio to start tracking your dividend investments and see them here."
      />
    );
  }

  // Virtual scrolling implementation
  if (enableVirtualScrolling && !loading) {
    const renderVirtualItem = (
      item: VirtualScrollItem,
      index: number,
      style: React.CSSProperties,
    ) => {
      const portfolio = item as unknown as PortfolioWithMetrics;
      return (
        <OptimizedPortfolioRow
          key={portfolio.id}
          portfolio={portfolio}
          onEdit={memoizedOnEdit}
          onViewDividends={memoizedOnViewDividends}
          index={index}
          style={style}
        />
      );
    };

    return (
      <div
        className={cn(
          "bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden",
          className,
        )}
      >
        <VirtualScrollTable
          items={
            sortedPortfolios as (PortfolioWithMetrics & {
              [key: string]: unknown;
            })[]
          }
          itemHeight={73} // Approximate height of a portfolio row
          containerHeight={virtualScrollHeight}
          renderItem={renderVirtualItem}
          renderHeader={renderTableHeader}
          loading={loading}
          loadingComponent={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
          emptyComponent={
            <EmptyState
              icon="📊"
              title="No portfolios found"
              description="Create your first portfolio to start tracking your dividend investments and see them here."
            />
          }
        />
      </div>
    );
  }

  // Regular table implementation
  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table
            className="min-w-full divide-y divide-gray-200"
            role="grid"
            aria-label={`Portfolio table with ${portfolios.length} portfolios. Use arrow keys to navigate and Enter to activate sort buttons.`}
            aria-rowcount={portfolios.length + 1}
            aria-colcount={8}
          >
            {renderTableHeader()}
            <tbody
              className="bg-white divide-y divide-gray-200"
              role="rowgroup"
            >
              {loading
                ? // Show skeleton rows while loading
                  Array.from({ length: Math.min(5, initialPageSize) }).map(
                    (_, index) => <SkeletonRow key={index} />,
                  )
                : // Show actual portfolio data
                  displayedPortfolios.map((item, index) => {
                    const portfolio = item as PortfolioWithMetrics;
                    return (
                      <OptimizedPortfolioRow
                        key={portfolio.id}
                        portfolio={portfolio}
                        onEdit={memoizedOnEdit}
                        onViewDividends={memoizedOnViewDividends}
                        index={index}
                      />
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && !loading && portfolios.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.pageSize}
          onPageChange={pagination.goToPage}
          onPageSizeChange={pagination.setPageSize}
          showPageSizeSelector={true}
          showItemCount={true}
        />
      )}
    </div>
  );
};

export default EnhancedPortfolioTable;
