import { useState, useEffect, useCallback, useRef } from 'react';
import { SortField, SortDirection } from '../components/PortfolioTable';

export interface UseDebouncedSortOptions {
  initialSortField?: SortField;
  initialSortDirection?: SortDirection;
  debounceMs?: number;
}

export interface UseDebouncedSortReturn {
  sortField: SortField;
  sortDirection: SortDirection;
  pendingSortField?: SortField;
  pendingSortDirection?: SortDirection;
  isDebouncing: boolean;
  handleSort: (field: SortField, direction: SortDirection) => void;
  applySortImmediately: (field: SortField, direction: SortDirection) => void;
}

/**
 * Custom hook for debounced sorting to prevent excessive API calls or re-renders
 * when users rapidly change sort criteria
 */
export function useDebouncedSort({
  initialSortField = 'name',
  initialSortDirection = 'asc',
  debounceMs = 300
}: UseDebouncedSortOptions = {}): UseDebouncedSortReturn {
  // Current applied sort state
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  
  // Pending sort state (what user has selected but not yet applied)
  const [pendingSortField, setPendingSortField] = useState<SortField | undefined>();
  const [pendingSortDirection, setPendingSortDirection] = useState<SortDirection | undefined>();
  
  // Debouncing state
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply pending sort changes after debounce delay
  useEffect(() => {
    if (pendingSortField !== undefined && pendingSortDirection !== undefined) {
      setIsDebouncing(true);
      
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        setSortField(pendingSortField);
        setSortDirection(pendingSortDirection);
        setPendingSortField(undefined);
        setPendingSortDirection(undefined);
        setIsDebouncing(false);
      }, debounceMs);

      // Cleanup timeout on unmount or dependency change
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }
  }, [pendingSortField, pendingSortDirection, debounceMs]);

  // Handle sort change with debouncing
  const handleSort = useCallback((field: SortField, direction: SortDirection) => {
    setPendingSortField(field);
    setPendingSortDirection(direction);
  }, []);

  // Apply sort immediately without debouncing (useful for initial load or user-triggered refresh)
  const applySortImmediately = useCallback((field: SortField, direction: SortDirection) => {
    // Clear any pending debounced changes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setSortField(field);
    setSortDirection(direction);
    setPendingSortField(undefined);
    setPendingSortDirection(undefined);
    setIsDebouncing(false);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    sortField,
    sortDirection,
    pendingSortField,
    pendingSortDirection,
    isDebouncing,
    handleSort,
    applySortImmediately
  };
}