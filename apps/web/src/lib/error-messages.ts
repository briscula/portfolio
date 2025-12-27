/**
 * Error message configuration and utilities
 * Provides user-friendly error messages for different error scenarios
 */

/**
 * Error categories for different types of errors
 */
export enum ErrorCategory {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * User-friendly error message configuration
 */
export interface ErrorMessageConfig {
  title: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  actionable: boolean;
  retryable: boolean;
  suggestions?: string[];
  technicalDetails?: string;
}

/**
 * Default error messages for common scenarios
 */
const DEFAULT_ERROR_MESSAGES: Record<string, ErrorMessageConfig> = {
  // Network errors
  network_error: {
    title: "Connection Problem",
    message:
      "Unable to connect to our servers. Please check your internet connection and try again.",
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    actionable: true,
    retryable: true,
    suggestions: [
      "Check your internet connection",
      "Try refreshing the page",
      "Wait a moment and try again",
    ],
  },

  offline: {
    title: "You're Offline",
    message:
      "It looks like you're not connected to the internet. Some features may not work until you reconnect.",
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    actionable: true,
    retryable: true,
    suggestions: [
      "Check your internet connection",
      "Try connecting to a different network",
      "Your changes will be saved when you reconnect",
    ],
  },

  timeout: {
    title: "Request Timed Out",
    message:
      "The request took too long to complete. This might be due to a slow connection or server issues.",
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    actionable: true,
    retryable: true,
    suggestions: [
      "Try again in a few moments",
      "Check your internet connection speed",
      "Contact support if this continues",
    ],
  },

  // Authentication errors
  auth_required: {
    title: "Sign In Required",
    message: "You need to sign in to access this feature.",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    actionable: true,
    retryable: false,
    suggestions: [
      "Click the sign in button",
      "Check if you were automatically signed out",
    ],
  },

  auth_expired: {
    title: "Session Expired",
    message:
      "Your session has expired for security reasons. Please sign in again.",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    actionable: true,
    retryable: false,
    suggestions: ["Sign in again to continue", "Your data has been saved"],
  },

  // Authorization errors
  access_denied: {
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    actionable: false,
    retryable: false,
    suggestions: [
      "Contact your administrator for access",
      "Make sure you're signed in to the correct account",
    ],
  },

  // Server errors
  server_error: {
    title: "Server Error",
    message:
      "Something went wrong on our end. We've been notified and are working to fix it.",
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.HIGH,
    actionable: true,
    retryable: true,
    suggestions: [
      "Try again in a few minutes",
      "Contact support if this continues",
      "Check our status page for updates",
    ],
  },

  service_unavailable: {
    title: "Service Temporarily Unavailable",
    message:
      "Our service is temporarily unavailable due to maintenance or high traffic.",
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.HIGH,
    actionable: true,
    retryable: true,
    suggestions: [
      "Try again in a few minutes",
      "Check our status page for updates",
      "Follow us on social media for updates",
    ],
  },

  // Validation errors
  validation_error: {
    title: "Invalid Data",
    message: "Please check your input and try again.",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    actionable: true,
    retryable: true,
    suggestions: [
      "Check all required fields are filled",
      "Make sure data is in the correct format",
      "Review any highlighted errors",
    ],
  },

  // Portfolio-specific errors
  portfolio_not_found: {
    title: "Portfolio Not Found",
    message:
      "The portfolio you're looking for doesn't exist or has been deleted.",
    category: ErrorCategory.CLIENT,
    severity: ErrorSeverity.MEDIUM,
    actionable: true,
    retryable: false,
    suggestions: [
      "Check the portfolio name or ID",
      "Return to the portfolios list",
      "Contact support if you think this is an error",
    ],
  },

  portfolio_load_failed: {
    title: "Failed to Load Portfolio",
    message:
      "We couldn't load your portfolio data. This might be a temporary issue.",
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.MEDIUM,
    actionable: true,
    retryable: true,
    suggestions: [
      "Try refreshing the page",
      "Check your internet connection",
      "Contact support if this continues",
    ],
  },

  // Transaction errors
  transaction_failed: {
    title: "Transaction Failed",
    message: "We couldn't process your transaction. Please try again.",
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.HIGH,
    actionable: true,
    retryable: true,
    suggestions: [
      "Try the transaction again",
      "Check all transaction details",
      "Contact support if this continues",
    ],
  },

  // Generic fallback
  unknown_error: {
    title: "Something Went Wrong",
    message:
      "An unexpected error occurred. Please try again or contact support if the problem persists.",
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    actionable: true,
    retryable: true,
    suggestions: [
      "Try refreshing the page",
      "Try again in a few minutes",
      "Contact support with details of what you were doing",
    ],
  },
};

/**
 * Parse error and determine appropriate user-friendly message
 */
export function parseError(error: unknown): ErrorMessageConfig {
  if (!error) {
    return DEFAULT_ERROR_MESSAGES.unknown_error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Network-related errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("failed to fetch")
  ) {
    return DEFAULT_ERROR_MESSAGES.network_error;
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return DEFAULT_ERROR_MESSAGES.timeout;
  }

  // Authentication errors
  if (
    lowerMessage.includes("authentication required") ||
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("401")
  ) {
    return DEFAULT_ERROR_MESSAGES.auth_required;
  }

  if (
    lowerMessage.includes("session expired") ||
    lowerMessage.includes("token expired")
  ) {
    return DEFAULT_ERROR_MESSAGES.auth_expired;
  }

  // Authorization errors
  if (
    lowerMessage.includes("access denied") ||
    lowerMessage.includes("forbidden") ||
    lowerMessage.includes("403")
  ) {
    return DEFAULT_ERROR_MESSAGES.access_denied;
  }

  // Server errors
  if (
    lowerMessage.includes("500") ||
    lowerMessage.includes("internal server error") ||
    lowerMessage.includes("server error")
  ) {
    return DEFAULT_ERROR_MESSAGES.server_error;
  }

  if (
    lowerMessage.includes("503") ||
    lowerMessage.includes("service unavailable") ||
    lowerMessage.includes("temporarily unavailable")
  ) {
    return DEFAULT_ERROR_MESSAGES.service_unavailable;
  }

  // Portfolio-specific errors
  if (
    lowerMessage.includes("portfolio") &&
    lowerMessage.includes("not found")
  ) {
    return DEFAULT_ERROR_MESSAGES.portfolio_not_found;
  }

  if (
    lowerMessage.includes("portfolio") &&
    (lowerMessage.includes("load") || lowerMessage.includes("fetch"))
  ) {
    return DEFAULT_ERROR_MESSAGES.portfolio_load_failed;
  }

  // Transaction errors
  if (lowerMessage.includes("transaction") && lowerMessage.includes("failed")) {
    return DEFAULT_ERROR_MESSAGES.transaction_failed;
  }

  // Validation errors
  if (
    lowerMessage.includes("validation") ||
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("400")
  ) {
    return {
      ...DEFAULT_ERROR_MESSAGES.validation_error,
      technicalDetails: errorMessage,
    };
  }

  // Offline state
  if (
    lowerMessage.includes("offline") ||
    lowerMessage.includes("no internet") ||
    lowerMessage.includes("connection lost")
  ) {
    return DEFAULT_ERROR_MESSAGES.offline;
  }

  // Default fallback with technical details
  return {
    ...DEFAULT_ERROR_MESSAGES.unknown_error,
    technicalDetails: errorMessage,
  };
}

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const config = parseError(error);
  return config.message;
}

/**
 * Get error title for display
 */
export function getErrorTitle(error: unknown): string {
  const config = parseError(error);
  return config.title;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const config = parseError(error);
  return config.retryable;
}

/**
 * Check if an error is actionable by the user
 */
export function isActionableError(error: unknown): boolean {
  const config = parseError(error);
  return config.actionable;
}

/**
 * Get suggestions for resolving an error
 */
export function getErrorSuggestions(error: unknown): string[] {
  const config = parseError(error);
  return config.suggestions || [];
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  const config = parseError(error);
  return config.severity;
}

/**
 * Format error for logging/reporting
 */
export function formatErrorForLogging(
  error: unknown,
  context?: Record<string, unknown>,
): {
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: string;
} {
  const config = parseError(error);
  const errorObj = error instanceof Error ? error : new Error(String(error));

  return {
    message: errorObj.message,
    stack: errorObj.stack,
    category: config.category,
    severity: config.severity,
    context,
    timestamp: new Date().toISOString(),
  };
}
