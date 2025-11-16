/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Whether to add random jitter to delays */
  jitter: boolean;
  /** Function to determine if an error should trigger a retry */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** Callback called before each retry attempt */
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitter: true,
  shouldRetry: (error: Error, attempt: number) => {
    // Don't retry authentication errors
    if (error.message.includes('Authentication required') || 
        error.message.includes('Access denied')) {
      return false;
    }
    
    // Don't retry client errors (4xx) except for 429 (rate limiting)
    if (error.message.includes('400') || 
        error.message.includes('404') || 
        error.message.includes('403')) {
      return false;
    }
    
    // Retry network errors and server errors (5xx)
    return attempt < 3;
  },
};

/**
 * Calculate delay for next retry attempt with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const exponentialDelay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  const delay = Math.min(exponentialDelay, options.maxDelay);
  
  if (options.jitter) {
    // Add random jitter (±25% of the delay)
    const jitterRange = delay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    return Math.max(0, delay + jitter);
  }
  
  return delay;
}

/**
 * Sleep for specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects with the last error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error = new Error('No error occurred'); // Initialize with default
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry this error
      if (!config.shouldRetry || !config.shouldRetry(lastError, attempt)) {
        throw lastError;
      }
      
      // Don't delay after the last attempt
      if (attempt === config.maxAttempts) {
        break;
      }
      
      // Call retry callback if provided
      if (config.onRetry) {
        config.onRetry(lastError, attempt);
      }
      
      // Calculate and wait for delay
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
    }
  }
  
  // All retry attempts failed
  throw lastError;
}

/**
 * Create a retry wrapper for API functions
 */
export function createRetryWrapper(options: Partial<RetryOptions> = {}) {
  return function retryWrapper<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>
  ) {
    return async (...args: T): Promise<R> => {
      return withRetry(() => fn(...args), options);
    };
  };
}

/**
 * Specific retry configurations for different types of operations
 */
export const retryConfigs = {
  /** Configuration for API data fetching */
  apiCall: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitter: true,
  } as Partial<RetryOptions>,
  
  /** Configuration for critical operations */
  critical: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 8000,
    backoffMultiplier: 1.5,
    jitter: true,
  } as Partial<RetryOptions>,
  
  /** Configuration for background operations */
  background: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  } as Partial<RetryOptions>,
};

/**
 * Hook for managing retry state in React components
 */
export function useRetryState() {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [lastError, setLastError] = React.useState<Error | null>(null);
  
  const retry = React.useCallback(async <T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> => {
    setIsRetrying(true);
    setLastError(null);
    
    try {
      const result = await withRetry(fn, {
        ...options,
        onRetry: (error, attempt) => {
          setRetryCount(attempt);
          options.onRetry?.(error, attempt);
        },
      });
      
      setRetryCount(0);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      throw err;
    } finally {
      setIsRetrying(false);
    }
  }, []);
  
  const reset = React.useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
  }, []);
  
  return {
    isRetrying,
    retryCount,
    lastError,
    retry,
    reset,
  };
}

// Import React for the hook
import React from 'react';