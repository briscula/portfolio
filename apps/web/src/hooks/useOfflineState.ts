'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Network status information
 */
export interface NetworkStatus {
  /** Whether the browser is online */
  isOnline: boolean;
  /** Whether the app is currently offline */
  isOffline: boolean;
  /** Connection type (if available) */
  connectionType?: string;
  /** Effective connection type (if available) */
  effectiveType?: string;
  /** Whether the connection is slow */
  isSlowConnection: boolean;
  /** Last time the connection status changed */
  lastStatusChange: Date;
}

/**
 * Hook to detect and manage offline state
 * Provides network status information and offline recovery capabilities
 */
export function useOfflineState() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    isSlowConnection: false,
    lastStatusChange: new Date(),
  }));

  const [offlineQueue, setOfflineQueue] = useState<Array<{
    id: string;
    action: () => Promise<unknown>;
    description: string;
    timestamp: Date;
  }>>([]);

  // Update network status
  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    const connection = (navigator as unknown as { connection?: { type?: string; effectiveType?: string } }).connection || 
                      (navigator as unknown as { mozConnection?: { type?: string; effectiveType?: string } }).mozConnection || 
                      (navigator as unknown as { webkitConnection?: { type?: string; effectiveType?: string } }).webkitConnection;
    
    const newStatus: NetworkStatus = {
      isOnline,
      isOffline: !isOnline,
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType,
      isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g',
      lastStatusChange: new Date(),
    };

    setNetworkStatus(prevStatus => {
      // Only update if status actually changed
      if (prevStatus.isOnline !== newStatus.isOnline) {
        return newStatus;
      }
      return prevStatus;
    });
  }, []);

  // Set up event listeners for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      updateNetworkStatus();
    };

    const handleOffline = () => {
      updateNetworkStatus();
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (if supported)
    const connection = (navigator as unknown as { connection?: { addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void } }).connection || 
                      (navigator as unknown as { mozConnection?: { addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void } }).mozConnection || 
                      (navigator as unknown as { webkitConnection?: { addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void } }).webkitConnection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Initial status check
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection && connection.removeEventListener) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  // Process offline queue when coming back online
  useEffect(() => {
    if (networkStatus.isOnline && offlineQueue.length > 0) {
      processOfflineQueue();
    }
  }, [networkStatus.isOnline, offlineQueue.length]);

  // Add action to offline queue
  const queueOfflineAction = useCallback((
    action: () => Promise<unknown>,
    description: string
  ): string => {
    const id = `offline_action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setOfflineQueue(prev => [...prev, {
      id,
      action,
      description,
      timestamp: new Date(),
    }]);

    return id;
  }, []);

  // Remove action from offline queue
  const removeOfflineAction = useCallback((id: string) => {
    setOfflineQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  // Process all queued offline actions
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    const results = [];

    for (const queuedAction of offlineQueue) {
      try {
        const result = await queuedAction.action();
        results.push({ id: queuedAction.id, success: true, result });
        
        // Remove successful action from queue
        removeOfflineAction(queuedAction.id);
      } catch (error) {
        console.error(`Failed to execute offline action "${queuedAction.description}":`, error);
        results.push({ id: queuedAction.id, success: false, error });
        
        // Keep failed actions in queue for potential retry
        // You might want to implement a max retry count here
      }
    }

    return results;
  }, [offlineQueue, removeOfflineAction]);

  // Clear all offline actions
  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue([]);
  }, []);

  // Check if a specific API endpoint is reachable
  const checkConnectivity = useCallback(async (url?: string): Promise<boolean> => {
    const testUrl = url || '/api/auth/token'; // Use a lightweight endpoint
    
    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  // Attempt to recover from offline state
  const attemptRecovery = useCallback(async (): Promise<boolean> => {
    // First check if browser thinks we're online
    if (!navigator.onLine) {
      return false;
    }

    // Then check actual connectivity
    const isConnected = await checkConnectivity();
    if (isConnected) {
      updateNetworkStatus();
      return true;
    }

    return false;
  }, [checkConnectivity, updateNetworkStatus]);

  return {
    networkStatus,
    offlineQueue,
    queueOfflineAction,
    removeOfflineAction,
    processOfflineQueue,
    clearOfflineQueue,
    checkConnectivity,
    attemptRecovery,
  };
}

/**
 * Hook for handling offline-aware API calls
 * Automatically queues failed requests when offline and retries when online
 */
export function useOfflineAwareApi() {
  const { networkStatus, queueOfflineAction, attemptRecovery } = useOfflineState();

  const executeWithOfflineSupport = useCallback(async <T>(
    apiCall: () => Promise<T>,
    description: string,
    options: {
      /** Whether to queue the action if offline */
      queueWhenOffline?: boolean;
      /** Whether to show offline message */
      showOfflineMessage?: boolean;
    } = {}
  ): Promise<T> => {
    const { queueWhenOffline = true } = options;

    try {
      // If we're offline, either queue the action or throw an error
      if (networkStatus.isOffline) {
        if (queueWhenOffline) {
          queueOfflineAction(apiCall, description);
          throw new Error(`Action queued for when connection is restored: ${description}`);
        } else {
          throw new Error('No internet connection. Please check your network and try again.');
        }
      }

      // Try to execute the API call
      return await apiCall();
    } catch (error) {
      // If the error might be network-related, try to recover
      if (error instanceof Error && 
          (error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('Failed to fetch'))) {
        
        const recovered = await attemptRecovery();
        if (recovered) {
          // Retry the API call after recovery
          return await apiCall();
        } else if (queueWhenOffline) {
          // Queue for later if recovery failed
          queueOfflineAction(apiCall, description);
          throw new Error(`Connection lost. Action queued for when connection is restored: ${description}`);
        }
      }

      // Re-throw the original error
      throw error;
    }
  }, [networkStatus.isOffline, queueOfflineAction, attemptRecovery]);

  return {
    networkStatus,
    executeWithOfflineSupport,
    attemptRecovery,
  };
}