"use client";

import React from "react";
import Link from "next/link";
import { Button, IconButton, EmptyState } from "./ui";
import {
  PortfolioWithMetrics,
  formatCurrency,
  formatPercentage,
} from "../lib/portfolio-metrics";
import { cn } from "../lib/utils";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
} from "./ui/icons";
import { useDropdownManager } from "../hooks/useDropdownManager";

export type SortField =
  | "name"
  | "currency"
  | "value"
  | "gain"
  | "yield"
  | "positions"
  | "updated";
export type SortDirection = "asc" | "desc";

export interface PortfolioTableProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onSort: (field: SortField, direction: SortDirection) => void;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

interface SortableHeaderProps {
  field: SortField;
  currentField?: SortField;
  currentDirection?: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
  children: React.ReactNode;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  currentField,
  currentDirection,
  onSort,
  children,
  className,
}) => {
  const isActive = currentField === field;
  const nextDirection: SortDirection =
    isActive && currentDirection === "desc" ? "asc" : "desc";

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSort(field, nextDirection);
    }
  };

  // Create accessible sort description
  const getSortDescription = () => {
    if (!isActive) {
      return `Sort by ${children}`;
    }
    const direction = currentDirection === "asc" ? "ascending" : "descending";
    return `Sorted by ${children} in ${direction} order. Click to sort in ${nextDirection === "asc" ? "ascending" : "descending"} order.`;
  };

  return (
    <button
      onClick={() => onSort(field, nextDirection)}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm transition-colors touch-manipulation min-h-[44px] py-2",
        isActive && "text-blue-600",
        className,
      )}
      aria-label={getSortDescription()}
      tabIndex={0}
    >
      <span>{children}</span>
      <div className="flex flex-col" aria-hidden="true">
        <ChevronUpIcon
          className={cn(
            "h-3 w-3 transition-colors",
            isActive && currentDirection === "asc"
              ? "text-blue-600"
              : "text-gray-400",
          )}
        />
        <ChevronDownIcon
          className={cn(
            "h-3 w-3 -mt-1 transition-colors",
            isActive && currentDirection === "desc"
              ? "text-blue-600"
              : "text-gray-400",
          )}
        />
      </div>
    </button>
  );
};

interface PortfolioRowProps {
  portfolio: PortfolioWithMetrics;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
}

const PortfolioRow: React.FC<PortfolioRowProps> = ({
  portfolio,
  onEdit,
  onViewDividends,
}) => {
  const {
    showActions,
    setShowActions,
    dropdownRef,
    handleToggleActions,
    handleDropdownKeyDown,
  } = useDropdownManager();
  const gainFormatted = formatPercentage(
    portfolio.metrics.unrealizedGainPercent,
  );

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Portfolio Name - Clickable */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          href={`/en/portfolio/${portfolio.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {portfolio.name}
        </Link>
        {portfolio.description && (
          <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
            {portfolio.description}
          </p>
        )}
      </td>

      {/* Currency */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {portfolio.currencyCode}
      </td>

      {/* Total Value */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {formatCurrency(portfolio.metrics.totalValue, portfolio.currencyCode)}
      </td>

      {/* Unrealized Gain/Loss - Hidden on small screens */}
      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex flex-col">
          <span
            className={cn(
              "font-medium",
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
          </span>
          <span
            className={cn(
              "text-xs",
              gainFormatted.color === "green"
                ? "text-green-600"
                : gainFormatted.color === "red"
                  ? "text-red-600"
                  : "text-gray-600",
            )}
          >
            {gainFormatted.text}
          </span>
        </div>
      </td>

      {/* Dividend Yield - Hidden on mobile and tablet */}
      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {portfolio.metrics.dividendYield.toFixed(1)}%
      </td>

      {/* Positions Count - Hidden on mobile and tablet */}
      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {portfolio.metrics.positionCount}
      </td>

      {/* Last Updated - Hidden on mobile and tablet */}
      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {portfolio.metrics.lastUpdated.toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDividends(portfolio.id)}
              leftIcon={<EyeIcon className="h-4 w-4" />}
              className="touch-manipulation min-h-[36px]"
            >
              Dividends
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(portfolio)}
              leftIcon={<PencilIcon className="h-4 w-4" />}
              className="touch-manipulation min-h-[36px]"
            >
              Edit
            </Button>
          </div>

          {/* Tablet Actions - Compact buttons */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDividends(portfolio.id)}
              leftIcon={<EyeIcon className="h-4 w-4" />}
              className="touch-manipulation min-h-[40px] px-2"
            >
              <span className="sr-only">View Dividends</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(portfolio)}
              leftIcon={<PencilIcon className="h-4 w-4" />}
              className="touch-manipulation min-h-[40px] px-2"
            >
              <span className="sr-only">Edit Portfolio</span>
            </Button>
          </div>

          {/* Mobile Actions - Dropdown */}
          <div className="md:hidden">
            <IconButton
              variant="ghost"
              size="md"
              icon={<EllipsisVerticalIcon className="h-5 w-5" />}
              aria-label={`Portfolio actions for ${portfolio.name}`}
              aria-expanded={showActions}
              aria-haspopup="menu"
              onClick={handleToggleActions}
              className="touch-manipulation min-h-[44px] min-w-[44px]"
            />

            {showActions && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                role="menu"
                aria-label={`Actions for ${portfolio.name}`}
                onKeyDown={handleDropdownKeyDown}
              >
                <div className="py-2">
                  <button
                    onClick={() => {
                      onViewDividends(portfolio.id);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none touch-manipulation min-h-[44px]"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <EyeIcon className="h-5 w-5 mr-3" />
                    View Dividends
                  </button>
                  <button
                    onClick={() => {
                      onEdit(portfolio);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none touch-manipulation min-h-[44px]"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <PencilIcon className="h-5 w-5 mr-3" />
                    Edit Portfolio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-24"></div>
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
);

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  portfolios,
  loading,
  onSort,
  onEdit,
  onViewDividends,
  sortField,
  sortDirection,
}) => {
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

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table
          className="min-w-full divide-y divide-gray-200"
          role="grid"
          aria-label={`Portfolio table with ${portfolios.length} portfolios. Use arrow keys to navigate and Enter to activate sort buttons.`}
          aria-rowcount={portfolios.length + 1}
          aria-colcount={8}
        >
          <thead className="bg-gray-50" role="rowgroup">
            <tr role="row">
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                role="columnheader"
                scope="col"
                aria-sort={
                  sortField === "name"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <SortableHeader
                  field="name"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                >
                  Portfolio
                </SortableHeader>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                role="columnheader"
                scope="col"
                aria-sort={
                  sortField === "currency"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <SortableHeader
                  field="currency"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                >
                  Currency
                </SortableHeader>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                role="columnheader"
                scope="col"
                aria-sort={
                  sortField === "value"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <SortableHeader
                  field="value"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                >
                  Total Value
                </SortableHeader>
              </th>
              <th
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                role="columnheader"
                scope="col"
                aria-sort={
                  sortField === "gain"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <SortableHeader
                  field="gain"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                >
                  Gain/Loss
                </SortableHeader>
              </th>
              <th
                className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                role="columnheader"
                scope="col"
                aria-sort={
                  sortField === "yield"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <SortableHeader
                  field="yield"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                >
                  Dividend Yield
                </SortableHeader>
              </th>
              <th
                className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                role="columnheader"
                scope="col"
                aria-sort={
                  sortField === "positions"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <SortableHeader
                  field="positions"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                >
                  Positions
                </SortableHeader>
              </th>
              <th
                className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                role="columnheader"
                scope="col"
                aria-sort={
                  sortField === "updated"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <SortableHeader
                  field="updated"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
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
          <tbody className="bg-white divide-y divide-gray-200" role="rowgroup">
            {loading
              ? // Show skeleton rows while loading
                Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              : // Show actual portfolio data
                portfolios.map((portfolio) => (
                  <PortfolioRow
                    key={portfolio.id}
                    portfolio={portfolio}
                    onEdit={onEdit}
                    onViewDividends={onViewDividends}
                  />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
