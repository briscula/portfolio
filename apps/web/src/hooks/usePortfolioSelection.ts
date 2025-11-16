import { useState, useCallback, useMemo } from 'react';
import { PortfolioWithMetrics } from '../lib/portfolio-metrics';

export interface UsePortfolioSelectionOptions {
  portfolios: PortfolioWithMetrics[];
  onSelectionChange?: (selectedIds: string[], selectedPortfolios: PortfolioWithMetrics[]) => void;
}

export interface UsePortfolioSelectionReturn {
  selectedIds: string[];
  selectedPortfolios: PortfolioWithMetrics[];
  isSelected: (portfolioId: string) => boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  selectPortfolio: (portfolioId: string) => void;
  deselectPortfolio: (portfolioId: string) => void;
  togglePortfolio: (portfolioId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
  selectMultiple: (portfolioIds: string[]) => void;
  setSelection: (portfolioIds: string[]) => void;
}

/**
 * Hook for managing portfolio selection state
 */
export function usePortfolioSelection({
  portfolios,
  onSelectionChange
}: UsePortfolioSelectionOptions): UsePortfolioSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get selected portfolios
  const selectedPortfolios = useMemo(() => {
    return portfolios.filter(portfolio => selectedIds.includes(portfolio.id));
  }, [portfolios, selectedIds]);

  // Selection state calculations
  const isAllSelected = useMemo(() => {
    return portfolios.length > 0 && selectedIds.length === portfolios.length;
  }, [portfolios.length, selectedIds.length]);

  const isPartiallySelected = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < portfolios.length;
  }, [portfolios.length, selectedIds.length]);

  // Update selection and notify parent
  const updateSelection = useCallback((newSelectedIds: string[]) => {
    setSelectedIds(newSelectedIds);
    if (onSelectionChange) {
      const newSelectedPortfolios = portfolios.filter(p => newSelectedIds.includes(p.id));
      onSelectionChange(newSelectedIds, newSelectedPortfolios);
    }
  }, [portfolios, onSelectionChange]);

  // Check if a portfolio is selected
  const isSelected = useCallback((portfolioId: string) => {
    return selectedIds.includes(portfolioId);
  }, [selectedIds]);

  // Select a single portfolio
  const selectPortfolio = useCallback((portfolioId: string) => {
    if (!selectedIds.includes(portfolioId)) {
      updateSelection([...selectedIds, portfolioId]);
    }
  }, [selectedIds, updateSelection]);

  // Deselect a single portfolio
  const deselectPortfolio = useCallback((portfolioId: string) => {
    if (selectedIds.includes(portfolioId)) {
      updateSelection(selectedIds.filter(id => id !== portfolioId));
    }
  }, [selectedIds, updateSelection]);

  // Toggle a single portfolio selection
  const togglePortfolio = useCallback((portfolioId: string) => {
    if (selectedIds.includes(portfolioId)) {
      deselectPortfolio(portfolioId);
    } else {
      selectPortfolio(portfolioId);
    }
  }, [selectedIds, selectPortfolio, deselectPortfolio]);

  // Select all portfolios
  const selectAll = useCallback(() => {
    const allIds = portfolios.map(p => p.id);
    updateSelection(allIds);
  }, [portfolios, updateSelection]);

  // Deselect all portfolios
  const deselectAll = useCallback(() => {
    updateSelection([]);
  }, [updateSelection]);

  // Toggle all portfolios selection
  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, deselectAll]);

  // Select multiple portfolios
  const selectMultiple = useCallback((portfolioIds: string[]) => {
    const validIds = portfolioIds.filter(id => 
      portfolios.some(p => p.id === id) && !selectedIds.includes(id)
    );
    if (validIds.length > 0) {
      updateSelection([...selectedIds, ...validIds]);
    }
  }, [portfolios, selectedIds, updateSelection]);

  // Set selection to specific portfolios
  const setSelection = useCallback((portfolioIds: string[]) => {
    const validIds = portfolioIds.filter(id => 
      portfolios.some(p => p.id === id)
    );
    updateSelection(validIds);
  }, [portfolios, updateSelection]);

  return {
    selectedIds,
    selectedPortfolios,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    selectPortfolio,
    deselectPortfolio,
    togglePortfolio,
    selectAll,
    deselectAll,
    toggleAll,
    selectMultiple,
    setSelection
  };
}