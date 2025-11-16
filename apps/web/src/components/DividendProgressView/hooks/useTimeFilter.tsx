'use client';

import { useState, useCallback } from 'react';
import { TimePeriod } from '../types/dividend';

export interface UseTimeFilterReturn {
  selectedPeriod: TimePeriod;
  setSelectedPeriod: (period: TimePeriod) => void;
  availablePeriods: TimePeriod[];
  isPeriodAvailable: (period: TimePeriod) => boolean;
}

export interface UseTimeFilterOptions {
  defaultPeriod?: TimePeriod;
  availablePeriods?: TimePeriod[];
  onPeriodChange?: (period: TimePeriod) => void;
}

/**
 * Custom hook for managing time period filter state
 * Provides period selection, validation, and change handling
 */
export const useTimeFilter = (options: UseTimeFilterOptions = {}): UseTimeFilterReturn => {
  const {
    defaultPeriod = 'year',
    availablePeriods = ['month', 'quarter', 'year', 'all'],
    onPeriodChange,
  } = options;

  const [selectedPeriod, setSelectedPeriodState] = useState<TimePeriod>(defaultPeriod);

  const setSelectedPeriod = useCallback(
    (period: TimePeriod) => {
      if (availablePeriods.includes(period)) {
        setSelectedPeriodState(period);
        onPeriodChange?.(period);
      }
    },
    [availablePeriods, onPeriodChange]
  );

  const isPeriodAvailable = useCallback(
    (period: TimePeriod): boolean => {
      return availablePeriods.includes(period);
    },
    [availablePeriods]
  );

  return {
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    isPeriodAvailable,
  };
};
