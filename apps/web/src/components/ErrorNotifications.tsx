"use client";

import React, { useState, useEffect } from "react";
import { ErrorEntry } from "../hooks/useErrorHandler";
import { useGlobalErrorHandler } from "./ErrorHandlerProvider";
import { ErrorSeverity } from "../lib/error-messages";
import { ErrorIcon, WarningIcon, InfoIcon, CloseIcon } from "./ui/icons";

/**
 * Individual error notification component
 */
interface ErrorNotificationProps {
  error: ErrorEntry;
  onDismiss: (errorId: string) => void;
  onRetry?: (errorId: string) => void;
  className?: string;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  onRetry,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle dismiss with animation
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(error.id), 300);
  };

  // Get appropriate styling based on severity
  const getSeverityStyles = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-500",
          title: "text-red-800",
          message: "text-red-700",
          button: "text-red-700 hover:text-red-800",
        };
      case ErrorSeverity.HIGH:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-500",
          title: "text-red-800",
          message: "text-red-700",
          button: "text-red-700 hover:text-red-800",
        };
      case ErrorSeverity.MEDIUM:
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: "text-yellow-500",
          title: "text-yellow-800",
          message: "text-yellow-700",
          button: "text-yellow-700 hover:text-yellow-800",
        };
      case ErrorSeverity.LOW:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "text-blue-500",
          title: "text-blue-800",
          message: "text-blue-700",
          button: "text-blue-700 hover:text-blue-800",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "text-gray-500",
          title: "text-gray-800",
          message: "text-gray-700",
          button: "text-gray-700 hover:text-gray-800",
        };
    }
  };

  const styles = getSeverityStyles();

  // Get appropriate icon
  const getIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return <ErrorIcon className={`h-5 w-5 ${styles.icon}`} />;
      case ErrorSeverity.MEDIUM:
        return <WarningIcon className={`h-5 w-5 ${styles.icon}`} />;
      case ErrorSeverity.LOW:
        return <InfoIcon className={`h-5 w-5 ${styles.icon}`} />;
      default:
        return <ErrorIcon className={`h-5 w-5 ${styles.icon}`} />;
    }
  };

  // Animation classes
  const animationClasses = `
    transform transition-all duration-300 ease-in-out
    ${isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
  `;

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full
        ${animationClasses} ${className}
      `}
    >
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.title}`}>
            {error.error.message}
          </p>
          {error.context && (
            <p className={`mt-1 text-xs ${styles.message}`}>
              {(error.context as { description?: string }).description ||
                "Additional context available"}
            </p>
          )}
          {error.retryCount > 0 && (
            <p className={`mt-1 text-xs ${styles.message}`}>
              Retry attempt {error.retryCount}/{error.maxRetries}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          {onRetry && error.retryCount < error.maxRetries && (
            <button
              onClick={() => onRetry(error.id)}
              className={`text-xs font-medium ${styles.button} mr-2 hover:underline`}
            >
              Retry
            </button>
          )}
          <button
            onClick={handleDismiss}
            className={`${styles.button} hover:bg-opacity-20 rounded-md p-1`}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Container for error notifications with positioning and stacking
 */
export interface ErrorNotificationsProps {
  /** Maximum number of notifications to show at once */
  maxVisible?: number;
  /** Position of the notification container */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Whether to show retry buttons */
  showRetry?: boolean;
  /** Custom retry handler */
  onRetry?: (errorId: string) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

export const ErrorNotifications: React.FC<ErrorNotificationsProps> = ({
  maxVisible = 5,
  position = "top-right",
  showRetry = true,
  onRetry,
  className = "",
}) => {
  const { errors, dismissError } = useGlobalErrorHandler();
  const [retryingErrors, setRetryingErrors] = useState<Set<string>>(new Set());

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      default: // top-right
        return "top-4 right-4";
    }
  };

  // Handle retry with loading state
  const handleRetry = async (errorId: string) => {
    if (!onRetry) return;

    setRetryingErrors((prev) => new Set(prev).add(errorId));

    try {
      await onRetry(errorId);
      // Error will be dismissed automatically if retry succeeds
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      // Keep the error visible for user to try again
    } finally {
      setRetryingErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(errorId);
        return newSet;
      });
    }
  };

  // Show only the most recent errors up to maxVisible
  const visibleErrors = errors
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxVisible);

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        fixed ${getPositionClasses()} z-50 pointer-events-none
        ${className}
      `}
    >
      <div className="flex flex-col space-y-2 pointer-events-auto">
        {visibleErrors.map((error) => (
          <ErrorNotification
            key={error.id}
            error={error}
            onDismiss={dismissError}
            onRetry={showRetry ? handleRetry : undefined}
            className={retryingErrors.has(error.id) ? "opacity-50" : ""}
          />
        ))}

        {errors.length > maxVisible && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-600">
              +{errors.length - maxVisible} more errors
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Error notification badge for showing error count
 */
export interface ErrorBadgeProps {
  /** Whether to show the badge */
  show?: boolean;
  /** Custom click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const ErrorBadge: React.FC<ErrorBadgeProps> = ({
  show = true,
  onClick,
  className = "",
}) => {
  const { errorCount, hasCriticalErrors } = useGlobalErrorHandler();

  if (!show || errorCount === 0) {
    return null;
  }

  const badgeColor = hasCriticalErrors
    ? "bg-red-500 text-white"
    : "bg-yellow-500 text-white";

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-4 left-4 z-40 ${badgeColor} rounded-full p-2 shadow-lg
        hover:scale-110 transition-transform duration-200
        ${className}
      `}
      title={`${errorCount} error${errorCount === 1 ? "" : "s"}`}
    >
      <ErrorIcon className="h-5 w-5" />
      {errorCount > 1 && (
        <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {errorCount > 9 ? "9+" : errorCount}
        </span>
      )}
    </button>
  );
};
