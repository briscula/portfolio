import React from 'react';
import { Button, type ButtonProps } from './Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon or emoji to display
   */
  icon?: React.ReactNode;

  /**
   * Title of the empty state
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Action button text
   */
  actionLabel?: string;

  /**
   * Action button click handler
   */
  onAction?: () => void;

  /**
   * Button variant
   */
  actionVariant?: ButtonProps['variant'];

  /**
   * Custom action component (overrides actionLabel/onAction)
   */
  action?: React.ReactNode;
}

/**
 * Shared EmptyState component for consistent empty states across the application
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="📊"
 *   title="No portfolios found"
 *   description="Create your first portfolio to start tracking your investments"
 *   actionLabel="Create Portfolio"
 *   onAction={handleCreate}
 * />
 * ```
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon = '📊',
      title,
      description,
      actionLabel,
      onAction,
      actionVariant = 'primary',
      action,
      ...props
    },
    ref
  ) => {
    const defaultIcon = typeof icon === 'string' ? (
      <span className="text-3xl" aria-hidden="true">{icon}</span>
    ) : icon;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={title}
        {...props}
      >
        {/* Icon */}
        {defaultIcon && (
          <div
            className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
            aria-hidden="true"
          >
            {defaultIcon}
          </div>
        )}

        {/* Title */}
        <h3
          className="text-lg font-medium text-gray-900 mb-2"
          id="empty-state-heading"
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className="text-gray-600 mb-6 max-w-sm mx-auto"
            aria-describedby="empty-state-heading"
          >
            {description}
          </p>
        )}

        {/* Action */}
        {action ? (
          action
        ) : actionLabel && onAction ? (
          <Button
            onClick={onAction}
            variant={actionVariant}
            aria-describedby="empty-state-heading"
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
