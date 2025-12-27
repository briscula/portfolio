import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../lib/apiClient";
import { PortfolioService } from "@/services/portfolioService";
import type {
  Portfolio,
  Position,
  PaginationInfo,
  PositionsResponse,
  PortfolioSummary,
  TransactionPayload,
} from "@/types";

// Re-export types for backward compatibility
export type {
  Portfolio,
  Position,
  PaginationInfo,
  PositionsResponse,
  PortfolioSummary,
};

/**
 * Hook to fetch portfolios with React Query
 */
export function usePortfolios() {
  const {
    apiClient,
    isLoading: authLoading,
    isAuthenticated,
    error: authError,
  } = useApiClient();
  const portfolioService = useMemo(
    () => new PortfolioService(apiClient),
    [apiClient],
  );

  const {
    data: portfolios = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return portfolioService.getPortfolios();
    },
    enabled: !authLoading && isAuthenticated && !authError,
    staleTime: 5 * 60 * 1000,
  });

  return {
    portfolios,
    loading: isLoading || authLoading,
    error: error ? (error as Error).message : authError,
    refetch,
  };
}

/**
 * Hook to fetch a single portfolio by ID with React Query
 */
export function usePortfolio(portfolioId: string) {
  const {
    apiClient,
    isLoading: authLoading,
    isAuthenticated,
    error: authError,
  } = useApiClient();
  const portfolioService = useMemo(
    () => new PortfolioService(apiClient),
    [apiClient],
  );

  const {
    data: portfolio = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio", portfolioId],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      return portfolioService.getPortfolio(portfolioId);
    },
    enabled: !authLoading && isAuthenticated && !authError && !!portfolioId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    portfolio,
    loading: isLoading || authLoading,
    error: error ? (error as Error).message : authError,
    refetch,
  };
}

/**
 * Hook to fetch portfolio positions with pagination using React Query
 */
export function usePositions(
  portfolioId?: string,
  page: number = 1,
  pageSize: number = 50,
) {
  const {
    apiClient,
    isLoading: authLoading,
    isAuthenticated,
    error: authError,
  } = useApiClient();
  const portfolioService = useMemo(
    () => new PortfolioService(apiClient),
    [apiClient],
  );
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["positions", portfolioId, page, pageSize],
    queryFn: async () => {
      if (!isAuthenticated || !portfolioId) {
        throw new Error("Authentication required");
      }
      return portfolioService.getPositions(portfolioId, page, pageSize);
    },
    enabled: !authLoading && isAuthenticated && !authError && !!portfolioId,
    staleTime: 2 * 60 * 1000,
  });

  const fetchPage = useCallback(
    (pageNum: number) => {
      queryClient.invalidateQueries({
        queryKey: ["positions", portfolioId, pageNum, pageSize],
      });
    },
    [queryClient, portfolioId, pageSize],
  );

  return {
    positions: data?.data || [],
    pagination: data?.pagination || null,
    loading: isLoading || authLoading,
    error: error ? (error as Error).message : authError,
    refetch,
    fetchPage,
  };
}

/**
 * Hook to calculate portfolio summary from positions
 */
export function usePortfolioSummary(positions: Position[]): PortfolioSummary {
  const portfolioService = useMemo(() => new PortfolioService({} as any), []);
  return useMemo(() => {
    return portfolioService.calculatePortfolioSummary(positions);
  }, [positions, portfolioService]);
}

/**
 * Hook to add a new transaction (which creates/updates positions)
 */
export function useAddTransaction() {
  const { apiClient, isAuthenticated } = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portfolioService = useMemo(
    () => new PortfolioService(apiClient),
    [apiClient],
  );

  const addTransaction = useCallback(
    async (portfolioId: string, transactionData: TransactionPayload) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await portfolioService.createTransaction(
          portfolioId,
          transactionData,
        );
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add transaction";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [portfolioService, isAuthenticated],
  );

  return {
    addTransaction,
    loading,
    error,
  };
}
