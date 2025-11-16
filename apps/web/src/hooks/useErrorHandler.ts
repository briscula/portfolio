'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { parseError, formatErrorForLogging, ErrorSeverity } from '../lib/error-messages';

/**
 * Error entry for the error queue
 */
export interface ErrorEntry {
  id: string;
  error: Error;
  context?: Record<string, unknown>;
  timestamp: Date;
  severity: ErrorSeverity;
  dismissed: boolean;
  retryCount: number;
  maxRetries: number;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  /** Maximum number of errors to keep in memory */
  maxErrors: number;
  /** Auto-dismiss errors after this many milliseconds */
  autoDismissAfter: number;
  /** Whether to report errors to external service */
  reportErrors: boolean;
  /** Custom error reporter function */
  errorReporter?: (error: ErrorEntry) => void;
}

/**
 * Default error handler configuration
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  maxErrors: 50,
  autoDismissAfter: 10000, // 10 seconds
  reportErrors: true,
  errorReporter: undefined,
};

/**
 * Global error handler hook for managing application-wide error state
 * Provides centralized error reporting, queuing, and recovery mechanisms
 */
export function useErrorHandler(config: Partial<ErrorHandlerConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const errorIdCounter = useRef(0);
  const dismissTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Generate unique error ID
  const generateErrorId = useCallback(() => {
    return `error_${Date.now()}_${++errorIdCounter.current}`;
  }, []);

  // Report error to external service
  const reportError = useCallback(async (errorEntry: ErrorEntry) => {
    if (!finalConfig.reportErrors) return;

    try {
      setIsReporting(true);

      // Use custom reporter if provided
      if (finalConfig.errorReporter) {
        await finalConfig.errorReporter(errorEntry);
        return;
      }

      // Default error reporting (log to console in development)
      if (process.env.NODE_ENV === 'development') {
        const errorLog = formatErrorForLogging(errorEntry.error, errorEntry.context);
        console.error('Error reported:', errorLog);
      }

      // TODO: In production, send to error monitoring service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      /*
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: errorEntry.error.message,
          stack: errorEntry.error.stack,
          context: errorEntry.context,
          timestamp: errorEntry.timestamp.toISOString(),
          severity: errorEntry.severity,
        }),
      });
      */
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    } finally {
      setIsReporting(false);
    }
  }, [finalConfig.reportErrors, finalConfig.errorReporter]);

  // Auto-dismiss error after timeout
  const scheduleAutoDismiss = useCallback((errorId: string) => {
    if (finalConfig.autoDismissAfter <= 0) return;

    const timer = setTimeout(() => {
      setErrors(prev => 
        prev.map(err => 
          err.id === errorId ? { ...err, dismissed: true } : err
        )
      );
      dismissTimers.current.delete(errorId);
    }, finalConfig.autoDismissAfter);

    dismissTimers.current.set(errorId, timer);
  }, [finalConfig.autoDismissAfter]);

  // Add error to the queue
  const handleError = useCallback(async (
    error: unknown,
    context?: Record<string, unknown>,
    options: {
      maxRetries?: number;
      autoDismiss?: boolean;
      report?: boolean;
    } = {}
  ) => {
    const {
      maxRetries = 3,
      autoDismiss = true,
      report = true,
    } = options;

    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorConfig = parseError(errorObj);
    
    const errorEntry: ErrorEntry = {
      id: generateErrorId(),
      error: errorObj,
      context,
      timestamp: new Date(),
      severity: errorConfig.severity,
      dismissed: false,
      retryCount: 0,
      maxRetries,
    };

    // Add to error queue
    setErrors(prev => {
      const newErrors = [errorEntry, ...prev];
      
      // Limit the number of errors kept in memory
      if (newErrors.length > finalConfig.maxErrors) {
        const removedErrors = newErrors.slice(finalConfig.maxErrors);
        // Clear timers for removed errors
        removedErrors.forEach(err => {
          const timer = dismissTimers.current.get(err.id);
          if (timer) {
            clearTimeout(timer);
            dismissTimers.current.delete(err.id);
          }
        });
        return newErrors.slice(0, finalConfig.maxErrors);
      }
      
      return newErrors;
    });

    // Schedule auto-dismiss if enabled
    if (autoDismiss) {
      scheduleAutoDismiss(errorEntry.id);
    }

    // Report error if enabled
    if (report) {
      await reportError(errorEntry);
    }

    return errorEntry.id;
  }, [generateErrorId, finalConfig.maxErrors, scheduleAutoDismiss, reportError]);

  // Dismiss specific error
  const dismissError = useCallback((errorId: string) => {
    setErrors(prev => 
      prev.map(err => 
        err.id === errorId ? { ...err, dismissed: true } : err
      )
    );

    // Clear auto-dismiss timer
    const timer = dismissTimers.current.get(errorId);
    if (timer) {
      clearTimeout(timer);
      dismissTimers.current.delete(errorId);
    }
  }, []);

  // Dismiss all errors
  const dismissAllErrors = useCallback(() => {
    setErrors(prev => prev.map(err => ({ ...err, dismissed: true })));
    
    // Clear all timers
    dismissTimers.current.forEach(timer => clearTimeout(timer));
    dismissTimers.current.clear();
  }, []);

  // Remove dismissed errors from memory
  const clearDismissedErrors = useCallback(() => {
    setErrors(prev => prev.filter(err => !err.dismissed));
  }, []);

  // Retry failed operation
  const retryError = useCallback(async (
    errorId: string,
    retryFn: () => Promise<void>
  ) => {
    const errorEntry = errors.find(err => err.id === errorId);
    if (!errorEntry || errorEntry.retryCount >= errorEntry.maxRetries) {
      return false;
    }

    try {
      // Update retry count
      setErrors(prev => 
        prev.map(err => 
          err.id === errorId 
            ? { ...err, retryCount: err.retryCount + 1 }
            : err
        )
      );

      // Execute retry function
      await retryFn();

      // Mark as dismissed on successful retry
      dismissError(errorId);
      return true;
    } catch (retryError) {
      // Handle retry failure
      await handleError(retryError, { 
        originalErrorId: errorId,
        retryAttempt: errorEntry.retryCount + 1,
      });
      return false;
    }
  }, [errors, dismissError, handleError]);

  // Get active (non-dismissed) errors
  const activeErrors = errors.filter(err => !err.dismissed);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity) => {
    return activeErrors.filter(err => err.severity === severity);
  }, [activeErrors]);

  // Check if there are any critical errors
  const hasCriticalErrors = activeErrors.some(err => err.severity === ErrorSeverity.CRITICAL);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      dismissTimers.current.forEach(timer => clearTimeout(timer));
      dismissTimers.current.clear();
    };
  }, []);

  return {
    // Error state
    errors: activeErrors,
    allErrors: errors,
    isReporting,
    hasCriticalErrors,
    
    // Error management
    handleError,
    dismissError,
    dismissAllErrors,
    clearDismissedErrors,
    retryError,
    
    // Error queries
    getErrorsBySeverity,
    
    // Statistics
    errorCount: activeErrors.length,
    totalErrorCount: errors.length,
  };
}

/**
 * Context for sharing error handler across components
 */
export interface ErrorHandlerContextType {
  handleError: (error: unknown, context?: Record<string, unknown>) => Promise<string>;
  dismissError: (errorId: string) => void;
  errors: ErrorEntry[];
  errorCount: number;
  hasCriticalErrors: boolean;
}