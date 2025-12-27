"use client";

import React from "react";

import {
  parseError,
  isRetryableError,
  isActionableError,
  getErrorSuggestions,
  ErrorSeverity,
  getErrorSeverity,
} from "@/lib/error-messages";
import { ErrorIcon, WarningIcon, InfoIcon, RefreshIcon } from "./icons";

export interface ErrorDisplayProps {
  /** The error to display */
  error: unknown;
  /** Optional title override */
  title?: string;
  /** Optional message override */
  message?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Whether to show technical details in development */
  showTechnicalDetails?: boolean;
  /** Retry callback function */
  onRetry?: () => void;
  /** Dismiss callback function */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Display variant */
  variant?: "inline" | "card" | "banner";
}

/**
 * Enhanced error display component with user-friendly messages and actions
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  message,
  showRetry = true,
  showSuggestions = true,
  showTechnicalDetails = process.env.NODE_ENV === "development",
  onRetry,
  onDismiss,
  className = "",
  size = "medium",
  variant = "card",
}) => {
  const errorConfig = parseError(error);
  const severity = getErrorSeverity(error);
  const isRetryable = isRetryableError(error);
  const isActionable = isActionableError(error);
  const suggestions = getErrorSuggestions(error);

  // Get appropriate colors based on severity
  const getColorClasses = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-500",
          title: "text-red-800",
          message: "text-red-700",
          button: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300",
        };
      case ErrorSeverity.HIGH:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-500",
          title: "text-red-800",
          message: "text-red-700",
          button: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300",
        };
      case ErrorSeverity.MEDIUM:
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: "text-yellow-500",
          title: "text-yellow-800",
          message: "text-yellow-700",
          button:
            "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300",
        };
      case ErrorSeverity.LOW:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "text-blue-500",
          title: "text-blue-800",
          message: "text-blue-700",
          button: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "text-gray-500",
          title: "text-gray-800",
          message: "text-gray-700",
          button: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300",
        };
    }
  };

  const colors = getColorClasses();

  // Get appropriate icon based on severity
  const getIcon = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return <ErrorIcon className={`h-5 w-5 ${colors.icon}`} />;
      case ErrorSeverity.MEDIUM:
        return <WarningIcon className={`h-5 w-5 ${colors.icon}`} />;
      case ErrorSeverity.LOW:
        return <InfoIcon className={`h-5 w-5 ${colors.icon}`} />;
      default:
        return <ErrorIcon className={`h-5 w-5 ${colors.icon}`} />;
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "p-3",
          icon: "h-4 w-4",
          title: "text-sm font-medium",
          message: "text-sm",
          button: "px-2 py-1 text-xs",
        };
      case "large":
        return {
          container: "p-6",
          icon: "h-6 w-6",
          title: "text-lg font-semibold",
          message: "text-base",
          button: "px-4 py-2 text-sm",
        };
      default: // medium
        return {
          container: "p-4",
          icon: "h-5 w-5",
          title: "text-base font-medium",
          message: "text-sm",
          button: "px-3 py-2 text-sm",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case "inline":
        return `${colors.bg} ${colors.border} border-l-4 ${sizeClasses.container}`;
      case "banner":
        return `${colors.bg} ${colors.border} border-t border-b ${sizeClasses.container}`;
      default: // card
        return `${colors.bg} ${colors.border} border rounded-md ${sizeClasses.container}`;
    }
  };

  const displayTitle = title || errorConfig.title;
  const displayMessage = message || errorConfig.message;

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          {/* Title */}
          <h3 className={`${sizeClasses.title} ${colors.title}`}>
            {displayTitle}
          </h3>

          {/* Message */}
          <div className={`mt-2 ${sizeClasses.message} ${colors.message}`}>
            <p>{displayMessage}</p>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`mt-3 ${sizeClasses.message} ${colors.message}`}>
              <p className="font-medium mb-1">Try these solutions:</p>
              <ul className="list-disc list-inside space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical details (development only) */}
          {showTechnicalDetails && errorConfig.technicalDetails && (
            <details className="mt-3">
              <summary
                className={`${sizeClasses.message} ${colors.message} cursor-pointer hover:underline`}
              >
                Technical Details
              </summary>
              <div
                className={`mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap break-words`}
              >
                {errorConfig.technicalDetails}
              </div>
            </details>
          )}

          {/* Actions */}
          {(isActionable || onDismiss) && (
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              {showRetry && isRetryable && onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center ${sizeClasses.button} font-medium ${colors.button} border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                >
                  <RefreshIcon className="h-4 w-4 mr-1" />
                  Try Again
                </button>
              )}

              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`inline-flex items-center ${sizeClasses.button} font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Compact error display for inline use
 */
export const InlineError: React.FC<
  Omit<ErrorDisplayProps, "variant" | "size">
> = (props) => <ErrorDisplay {...props} variant="inline" size="small" />;

/**
 * Banner error display for page-level errors
 */
export const ErrorBanner: React.FC<Omit<ErrorDisplayProps, "variant">> = (
  props,
) => <ErrorDisplay {...props} variant="banner" />;

/**
 * Card error display for component-level errors
 */
export const ErrorCard: React.FC<Omit<ErrorDisplayProps, "variant">> = (
  props,
) => <ErrorDisplay {...props} variant="card" />;
