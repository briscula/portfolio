'use client';

import React, { createContext, useContext } from 'react';
import { useErrorHandler, ErrorHandlerConfig, ErrorHandlerContextType } from '../hooks/useErrorHandler';

const ErrorHandlerContext = createContext<ErrorHandlerContextType | null>(null);

/**
 * Provider component for error handler context
 */
export function ErrorHandlerProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode;
  config?: Partial<ErrorHandlerConfig>;
}) {
  const errorHandler = useErrorHandler(config);

  const contextValue: ErrorHandlerContextType = {
    handleError: errorHandler.handleError,
    dismissError: errorHandler.dismissError,
    errors: errorHandler.errors,
    errorCount: errorHandler.errorCount,
    hasCriticalErrors: errorHandler.hasCriticalErrors,
  };

  return (
    <ErrorHandlerContext.Provider value={contextValue}>
      {children}
    </ErrorHandlerContext.Provider>
  );
}

/**
 * Hook to use error handler from context
 */
export function useGlobalErrorHandler() {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    throw new Error('useGlobalErrorHandler must be used within ErrorHandlerProvider');
  }
  return context;
}