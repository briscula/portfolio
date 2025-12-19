import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePortfolios } from './usePortfolio';
import { apiClient } from '../lib/apiClient';
import { PortfolioService } from '@/services/portfolioService';
import type { PortfolioWithMetrics, DashboardSummary } from '@/services/portfolioService';
import type { ApiPortfolioSummary } from '@/types';
import { useOfflineAwareApi } from './useOfflineState';
import { getUserFriendlyErrorMessage } from '../lib/error-messages';
import { useApiDeduplication } from './useApiThrottle';

/**
 * Hook to fetch all portfolios with their calculated metrics
 * Includes real-time data fetching, automatic refresh, and error handling
 */
export function usePortfoliosWithMetrics() {
  const { portfolios, loading: portfoliosLoading, error: portfoliosError, refetch: refetchPortfolios } = usePortfolios();
  const { executeWithOfflineSupport, networkStatus } = useOfflineAwareApi();
  const [portfoliosWithMetrics, setPortfoliosWithMetrics] = useState<PortfolioWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const portfolioService = useMemo(() => new PortfolioService(apiClient), []);

  // Create a deduplicated version of position fetching to prevent duplicate requests
  const fetchPositionsThrottled = useApiDeduplication(
    (portfolioId: unknown) => portfolioService.getPositions(portfolioId as string, 1, 100)
  );

  // Fetch portfolio metrics with enhanced error handling and offline support
  const fetchPortfolioMetrics = useCallback(async (showLoading = true) => {
    if (portfoliosLoading || portfoliosError) {
      setLoading(portfoliosLoading);
      setError(portfoliosError ? getUserFriendlyErrorMessage(portfoliosError) : null);
      return;
    }

    if (portfolios.length === 0) {
      setPortfoliosWithMetrics([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check if we already have fresh data (less than 5 minutes old)
    const now = new Date();
    const timeSinceLastRefresh = now.getTime() - lastRefresh.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (portfoliosWithMetrics.length > 0 && timeSinceLastRefresh < fiveMinutes && !showLoading) {
      // Data is fresh, no need to refetch
      return;
    }

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // PERFORMANCE FIX: Use existing /portfolios/:id/summary endpoint
      // This endpoint calculates metrics server-side using efficient SQL aggregation
      // Much better than fetching all positions and calculating client-side
      const portfolioPromises = portfolios.map(async (portfolio) => {
        try {
          // Call the existing summary endpoint which already calculates metrics efficiently
          const summary = (await executeWithOfflineSupport(
            () => apiClient.getPortfolioSummary(portfolio.id),
            `Fetch metrics for portfolio ${portfolio.name}`,
            { queueWhenOffline: false }
          )) as ApiPortfolioSummary;

          // Transform summary response to metrics format
          const metrics = {
            totalValue: summary.totalValueUSD || 0,
            totalCost: summary.totalAmountUSD || 0,
            unrealizedGain: (summary.totalValueUSD || 0) - (summary.totalAmountUSD || 0),
            unrealizedGainPercent: summary.totalAmountUSD > 0
              ? (((summary.totalValueUSD || 0) - (summary.totalAmountUSD || 0)) / (summary.totalAmountUSD || 0)) * 100
              : 0,
            dividendYield: 0, // TODO: Add dividend yield to summary endpoint
            positionCount: summary.positionCount || 0,
            lastUpdated: new Date(),
          };

          return {
            ...portfolio,
            metrics,
          };
        } catch (err) {
          // Check if request was aborted
          if (err instanceof Error && err.name === 'AbortError') {
            throw err;
          }

          // Return portfolio with empty metrics if fetch fails
          return {
            ...portfolio,
            metrics: {
              totalValue: 0,
              totalCost: 0,
              unrealizedGain: 0,
              unrealizedGainPercent: 0,
              dividendYield: 0,
              positionCount: 0,
              lastUpdated: new Date(),
            },
          };
        }
      });

      const results = await Promise.all(portfolioPromises);

      // Check if request was aborted before setting state
      if (!abortControllerRef.current?.signal.aborted) {
        setPortfoliosWithMetrics(results);
        setLastRefresh(new Date());
        setRetryCount(0); // Reset retry count on success
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const userFriendlyError = getUserFriendlyErrorMessage(err);
      setError(userFriendlyError);
      setRetryCount(prev => prev + 1);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [portfolios, portfoliosLoading, portfoliosError, executeWithOfflineSupport, fetchPositionsThrottled]);

  // Initial fetch when portfolios change
  useEffect(() => {
    fetchPortfolioMetrics();
  }, [fetchPortfolioMetrics]);

  // Set up automatic refresh every 5 minutes
  useEffect(() => {
    const startAutoRefresh = () => {
      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up new interval for automatic refresh every 5 minutes
      refreshIntervalRef.current = setInterval(() => {
        fetchPortfolioMetrics(false); // Don't show loading spinner for auto-refresh
      }, 5 * 60 * 1000); // 5 minutes
    };

    // Only start auto-refresh if we have portfolios and no errors
    if (portfolios.length > 0 && !portfoliosError && !error) {
      startAutoRefresh();
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [portfolios.length, portfoliosError, error, fetchPortfolioMetrics]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      // First refresh the portfolios list
      await refetchPortfolios();
      // Then fetch metrics (this will happen automatically via useEffect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh portfolio data');
    }
  }, [refetchPortfolios]);

  // Force refresh function that bypasses cache
  const forceRefresh = useCallback(async () => {
    await fetchPortfolioMetrics(true);
  }, [fetchPortfolioMetrics]);

  return {
    portfoliosWithMetrics,
    loading: loading || portfoliosLoading,
    error: error || (portfoliosError ? getUserFriendlyErrorMessage(portfoliosError) : null),
    lastRefresh,
    retryCount,
    networkStatus,
    refresh,
    forceRefresh,
  };
}

/**
 * Hook to calculate dashboard summary from all portfolios
 * Includes real-time updates and error handling
 */
export function useDashboardSummary() {
  const {
    portfoliosWithMetrics,
    loading,
    error,
    lastRefresh,
    refresh,
    forceRefresh
  } = usePortfoliosWithMetrics();

  const [summary, setSummary] = useState<DashboardSummary>({
    totalValue: 0,
    totalCost: 0,
    totalGain: 0,
    totalGainPercent: 0,
    overallDividendYield: 0,
    portfolioCount: 0,
  });

  const portfolioService = useMemo(() => new PortfolioService({} as any), []);

  // Recalculate summary when portfolios change
  useEffect(() => {
    if (!loading && !error) {
      const calculatedSummary = portfolioService.calculateDashboardSummary(portfoliosWithMetrics);
      setSummary(calculatedSummary);
    }
  }, [portfoliosWithMetrics, loading, error, portfolioService]);

  // Retry function for error recovery
  const retry = useCallback(async () => {
    try {
      await forceRefresh();
    } catch (err) {
    }
  }, [forceRefresh]);

  return {
    summary,
    loading,
    error,
    lastRefresh,
    portfoliosWithMetrics,
    refresh,
    forceRefresh,
    retry,
  };
}