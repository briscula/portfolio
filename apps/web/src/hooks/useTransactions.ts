import { useState, useEffect, useMemo } from "react";
import { useApiClient } from "../lib/apiClient";
import { TransactionService } from "@/services/transactionService";
import type { Transaction } from "@/types";
import type { ActivityItem } from "@/components/ui/ActivityList";

/**
 * Hook to fetch and manage portfolio transactions
 */
export function useTransactions(portfolioId?: string) {
  const {
    apiClient,
    isLoading: authLoading,
    isAuthenticated,
    error: authError,
  } = useApiClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transactionService = useMemo(
    () => new TransactionService(apiClient),
    [apiClient],
  );

  useEffect(() => {
    if (!isAuthenticated || authError) {
      setTransactions([]);
      setActivities([]);
      if (authError) {
        setError(authError);
      }
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch recent transactions using service
        const data = await transactionService.getRecentTransactions(10);

        setTransactions(data);

        // Sort transactions by date (newest first)
        const sortedTransactions = transactionService.sortByDate(data, "desc");

        // Convert sorted transactions to activity items
        const activityItems =
          transactionService.transactionsToActivityItems(sortedTransactions);

        setActivities(activityItems);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions",
        );
        setTransactions([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchTransactions();
    }
  }, [transactionService, isAuthenticated, authLoading, authError]);

  return {
    transactions,
    activities,
    loading: loading || authLoading,
    error,
  };
}
