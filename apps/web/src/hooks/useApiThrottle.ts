import { useRef, useCallback } from 'react';

interface ThrottleOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Hook to throttle API calls and prevent excessive requests
 */
export function useApiThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: ThrottleOptions = {}
): T {
  const { delay = 1000, leading = true, trailing = true } = options;
  
  const lastCallTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime.current;

    lastArgsRef.current = args;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If enough time has passed, call immediately (leading edge)
    if (timeSinceLastCall >= delay) {
      if (leading) {
        lastCallTime.current = now;
        return callback(...args);
      }
    }

    // Set up trailing edge call if enabled
    if (trailing) {
      const remainingTime = delay - timeSinceLastCall;
      timeoutRef.current = setTimeout(() => {
        lastCallTime.current = Date.now();
        if (lastArgsRef.current) {
          callback(...lastArgsRef.current);
        }
        timeoutRef.current = null;
      }, remainingTime > 0 ? remainingTime : delay);
    }
  }, [callback, delay, leading, trailing]) as T;

  return throttledCallback;
}

/**
 * Hook to debounce API calls
 */
export function useApiDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      timeoutRef.current = null;
    }, delay);
  }, [callback, delay]) as T;

  return debouncedCallback;
}

/**
 * Hook to prevent duplicate API calls with the same parameters
 */
export function useApiDeduplication<T extends (...args: unknown[]) => Promise<unknown>>(
  callback: T
): T {
  const pendingRequests = useRef<Map<string, Promise<unknown>>>(new Map());

  const deduplicatedCallback = useCallback(async (...args: Parameters<T>) => {
    // Create a key based on the arguments
    const key = JSON.stringify(args);
    
    // If there's already a pending request with the same parameters, return it
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key);
    }

    // Create new request
    const promise = callback(...args);
    pendingRequests.current.set(key, promise);

    // Clean up when request completes
    promise.finally(() => {
      pendingRequests.current.delete(key);
    });

    return promise;
  }, [callback]) as T;

  return deduplicatedCallback;
}