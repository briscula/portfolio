import { useState, useEffect, useCallback } from 'react';
import type { Transaction, TransactionType } from '@/types';
import { ActivityItem } from '../components/ui/ActivityList';
import { useOfflineAwareApi } from './useOfflineState';
import { getUserFriendlyErrorMessage } from '../lib/error-messages';

/**
 * Response structure for paginated transactions from /transactions endpoint
 */
interface PaginatedTransactionsDto {
  data: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Convert API transaction to ActivityItem format for ActivityList component
 */
function transactionToActivityItem(transaction: Transaction): ActivityItem {
  const getActivityType = (type: TransactionType): ActivityItem['type'] => {
    switch (type) {
      case 'DIVIDEND':
        return 'dividend_received';
      case 'BUY':
        return 'stock_added';
      case 'SELL':
        return 'stock_removed';
      default:
        return 'stock_added'; // fallback for TAX, SPLIT, etc.
    }
  };

  const getTitle = (transaction: Transaction): string => {
    const symbol = transaction.listing?.tickerSymbol || transaction.stockSymbol || 'Unknown';
    switch (transaction.type) {
      case 'DIVIDEND':
        return `${symbol} Dividend Received`;
      case 'BUY':
        return `Bought ${symbol}`;
      case 'SELL':
        return `Sold ${symbol}`;
      case 'TAX':
        return `Tax on ${symbol}`;
      case 'SPLIT':
        return `${symbol} Stock Split`;
      default:
        return `${symbol} Transaction`;
    }
  };

  const getAmount = (transaction: Transaction): string => {
    switch (transaction.type) {
      case 'DIVIDEND':
        return `$${Math.abs(transaction.amount).toFixed(2)}`;
      case 'BUY':
        return `${transaction.quantity} shares • $${Math.abs(transaction.amount).toFixed(2)}`;
      case 'SELL':
        return `${transaction.quantity} shares • $${Math.abs(transaction.amount).toFixed(2)}`;
      case 'TAX':
        // Use amount field for tax amount if tax field is 0
        const taxAmount = transaction.tax !== 0 ? transaction.tax : transaction.amount;
        return `$${Math.abs(taxAmount).toFixed(2)}`;
      default:
        return `${transaction.quantity} shares`;
    }
  };

  const getDescription = (transaction: Transaction): string => {
    const symbol = transaction.listing?.tickerSymbol || transaction.stockSymbol || 'Unknown';
    // Use notes if available and not empty, otherwise fall back to stock symbol
    if (transaction.notes && transaction.notes.trim() !== '') {
      return transaction.notes;
    }
    return symbol;
  };

  return {
    id: transaction.id.toString(),
    type: getActivityType(transaction.type),
    title: getTitle(transaction),
    description: getDescription(transaction),
    amount: getAmount(transaction),
    date: new Date(transaction.createdAt),
    status: 'completed'
  };
}

/**
 * Make authenticated API request to fetch transactions
 */
async function fetchRecentTransactions(
  limit: number = 10,
  offset: number = 0,
  portfolioId?: string,
  type?: TransactionType
): Promise<PaginatedTransactionsDto> {
  try {
    // Get access token from Auth0
    const tokenResponse = await fetch('/api/auth/token');
    if (!tokenResponse.ok) {
      if (tokenResponse.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to get access token');
    }
    const { accessToken } = await tokenResponse.json();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Build URL with parameters
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const url = new URL(portfolioId 
      ? `${API_BASE_URL}/portfolios/${portfolioId}/transactions` 
      : `${API_BASE_URL}/transactions`
    );
    
    // Add query parameters
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    url.searchParams.append('sort', 'createdAt:desc'); // Sort by newest first
    
    // portfolioId is now in the path, no need to add as a query parameter
    // if (portfolioId) {
    //   url.searchParams.append('portfolioId', portfolioId);
    // }
    
    if (type) {
      url.searchParams.append('type', type);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
}

/**
 * Hook to fetch and manage recent transactions across all portfolios
 * 
 * @param limit - Number of transactions to fetch (default: 10, max: 100)
 * @param autoRefresh - Whether to automatically refresh data (default: false)
 * @param refreshInterval - Refresh interval in milliseconds (default: 30000 = 30 seconds)
 * @param portfolioId - Optional portfolio ID to filter transactions
 * @param type - Optional transaction type to filter by
 * 
 * @returns Object containing activities, loading state, error, and refresh function
 */
export function useRecentTransactions(
  limit: number = 10,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000,
  portfolioId?: string,
  type?: TransactionType
) {
  const { executeWithOfflineSupport, networkStatus } = useOfflineAwareApi();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await executeWithOfflineSupport(
        () => fetchRecentTransactions(limit, 0, portfolioId, type),
        'Fetch recent transactions',
        { queueWhenOffline: false } // Don't queue transaction fetches
      );
      
      const transactionData = response.data || [];

      setTransactions(transactionData);

      // Convert transactions to activity items
      const activityItems: ActivityItem[] = transactionData.map(transactionToActivityItem);

      // Sort by date (newest first) - should already be sorted by API but ensure it
      activityItems.sort((a: ActivityItem, b: ActivityItem) => {
        return b.date.getTime() - a.date.getTime();
      });

      setActivities(activityItems);
      setLastFetch(new Date());
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      const userFriendlyError = getUserFriendlyErrorMessage(err);
      setError(userFriendlyError);
      setTransactions([]);
      setActivities([]);
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [limit, portfolioId, type, executeWithOfflineSupport]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    transactions,
    activities,
    loading,
    error,
    lastFetch,
    retryCount,
    networkStatus,
    refresh,
  };
}