'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Button, IconButton } from './ui';
import { PortfolioWithMetrics, formatCurrency, formatPercentage } from '../lib/portfolio-metrics';
import { cn } from '../lib/utils';
import { EllipsisVerticalIcon, EyeIcon, PencilIcon } from './ui/icons';
import { useDropdownManager } from '../hooks/useDropdownManager';

interface OptimizedPortfolioRowProps {
  portfolio: PortfolioWithMetrics;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
  index: number;
  style?: React.CSSProperties;
  // Optional selection props
  isSelected?: boolean;
  onSelectionChange?: (portfolioId: string, selected: boolean) => void;
  showSelection?: boolean;
  // Optional column visibility
  visibleColumns?: {
    name: boolean;
    currency: boolean;
    value: boolean;
    gain: boolean;
    yield: boolean;
    positions: boolean;
    updated: boolean;
  };
}

/**
 * Optimized portfolio row component with React.memo for performance
 * Prevents unnecessary re-renders when parent components update
 * Supports optional selection and column visibility features
 */
export const OptimizedPortfolioRow = memo<OptimizedPortfolioRowProps>(({
  portfolio,
  onEdit,
  onViewDividends,
  index,
  style,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
  visibleColumns = {
    name: true,
    currency: true,
    value: true,
    gain: true,
    yield: true,
    positions: true,
    updated: true
  }
}) => {
  const { showActions, setShowActions, dropdownRef, handleToggleActions, handleDropdownKeyDown } = useDropdownManager();
  
  // Memoize formatted values to prevent recalculation on every render
  const formattedValues = React.useMemo(() => {
    const gainFormatted = formatPercentage(portfolio.metrics.unrealizedGainPercent);
    const totalValue = formatCurrency(portfolio.metrics.totalValue, portfolio.currencyCode);
    const unrealizedGain = formatCurrency(portfolio.metrics.unrealizedGain, portfolio.currencyCode);
    const dividendYield = `${portfolio.metrics.dividendYield.toFixed(1)}%`;
    const lastUpdated = portfolio.metrics.lastUpdated.toLocaleDateString();
    
    return {
      gainFormatted,
      totalValue,
      unrealizedGain,
      dividendYield,
      lastUpdated
    };
  }, [
    portfolio.metrics.unrealizedGainPercent,
    portfolio.metrics.totalValue,
    portfolio.metrics.unrealizedGain,
    portfolio.metrics.dividendYield,
    portfolio.metrics.lastUpdated,
    portfolio.currencyCode
  ]);

  // Memoize event handlers to prevent child re-renders
  const handleEdit = React.useCallback(() => {
    onEdit(portfolio);
  }, [onEdit, portfolio]);

  const handleViewDividends = React.useCallback(() => {
    onViewDividends(portfolio.id);
  }, [onViewDividends, portfolio.id]);

  const handleSelectionChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      onSelectionChange(portfolio.id, event.target.checked);
    }
  }, [onSelectionChange, portfolio.id]);

  // Memoize dropdown menu handlers
  const handleViewDividendsClick = React.useCallback(() => {
    handleViewDividends();
    setShowActions(false);
  }, [handleViewDividends, setShowActions]);

  const handleEditClick = React.useCallback(() => {
    handleEdit();
    setShowActions(false);
  }, [handleEdit, setShowActions]);

  return (
    <tr
      className={cn(
        'hover:bg-gray-50 transition-colors',
        isSelected && 'bg-blue-50 hover:bg-blue-100'
      )}
      style={style}
      role="row"
      aria-rowindex={index + 1}
      aria-selected={isSelected}
    >
      {/* Selection Checkbox */}
      {showSelection && (
        <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select ${portfolio.name}`}
          />
        </td>
      )}

      {/* Portfolio Name - Clickable */}
      {visibleColumns.name && (
      <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
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
      )}

      {/* Currency */}
      {visibleColumns.currency && (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" role="gridcell">
        {portfolio.currencyCode}
      </td>
      )}

      {/* Total Value */}
      {visibleColumns.value && (
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" role="gridcell">
        {formattedValues.totalValue}
      </td>
      )}

      {/* Unrealized Gain/Loss - Hidden on small screens */}
      {visibleColumns.gain && (
      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm" role="gridcell">
        <div className="flex flex-col">
          <span className={cn(
            'font-medium',
            formattedValues.gainFormatted.color === 'green' ? 'text-green-600' :
            formattedValues.gainFormatted.color === 'red' ? 'text-red-600' : 'text-gray-600'
          )}>
            {formattedValues.unrealizedGain}
          </span>
          <span className={cn(
            'text-xs',
            formattedValues.gainFormatted.color === 'green' ? 'text-green-600' :
            formattedValues.gainFormatted.color === 'red' ? 'text-red-600' : 'text-gray-600'
          )}>
            {formattedValues.gainFormatted.text}
          </span>
        </div>
      </td>
      )}

      {/* Dividend Yield - Hidden on mobile and tablet */}
      {visibleColumns.yield && (
      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900" role="gridcell">
        {formattedValues.dividendYield}
      </td>
      )}

      {/* Positions Count - Hidden on mobile and tablet */}
      {visibleColumns.positions && (
      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900" role="gridcell">
        {portfolio.metrics.positionCount}
      </td>
      )}

      {/* Last Updated - Hidden on mobile and tablet */}
      {visibleColumns.updated && (
      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="gridcell">
        {formattedValues.lastUpdated}
      </td>
      )}

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" role="gridcell">
        <div className="relative">
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDividends}
              leftIcon={<EyeIcon className="h-4 w-4" />}
              className="touch-manipulation min-h-[36px]"
            >
              Dividends
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
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
              onClick={handleViewDividends}
              leftIcon={<EyeIcon className="h-4 w-4" />}
              className="touch-manipulation min-h-[40px] px-2"
            >
              <span className="sr-only">View Dividends</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
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
                    onClick={handleViewDividendsClick}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none touch-manipulation min-h-[44px]"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <EyeIcon className="h-5 w-5 mr-3" />
                    View Dividends
                  </button>
                  <button
                    onClick={handleEditClick}
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
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if portfolio data, handlers, selection state, or visibility actually changed
  return (
    prevProps.portfolio.id === nextProps.portfolio.id &&
    prevProps.portfolio.name === nextProps.portfolio.name &&
    prevProps.portfolio.description === nextProps.portfolio.description &&
    prevProps.portfolio.currencyCode === nextProps.portfolio.currencyCode &&
    prevProps.portfolio.metrics.totalValue === nextProps.portfolio.metrics.totalValue &&
    prevProps.portfolio.metrics.unrealizedGain === nextProps.portfolio.metrics.unrealizedGain &&
    prevProps.portfolio.metrics.unrealizedGainPercent === nextProps.portfolio.metrics.unrealizedGainPercent &&
    prevProps.portfolio.metrics.dividendYield === nextProps.portfolio.metrics.dividendYield &&
    prevProps.portfolio.metrics.positionCount === nextProps.portfolio.metrics.positionCount &&
    prevProps.portfolio.metrics.lastUpdated.getTime() === nextProps.portfolio.metrics.lastUpdated.getTime() &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onViewDividends === nextProps.onViewDividends &&
    prevProps.index === nextProps.index &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onSelectionChange === nextProps.onSelectionChange &&
    prevProps.showSelection === nextProps.showSelection &&
    prevProps.visibleColumns?.name === nextProps.visibleColumns?.name &&
    prevProps.visibleColumns?.currency === nextProps.visibleColumns?.currency &&
    prevProps.visibleColumns?.value === nextProps.visibleColumns?.value &&
    prevProps.visibleColumns?.gain === nextProps.visibleColumns?.gain &&
    prevProps.visibleColumns?.yield === nextProps.visibleColumns?.yield &&
    prevProps.visibleColumns?.positions === nextProps.visibleColumns?.positions &&
    prevProps.visibleColumns?.updated === nextProps.visibleColumns?.updated
  );
});

OptimizedPortfolioRow.displayName = 'OptimizedPortfolioRow';

export default OptimizedPortfolioRow;
