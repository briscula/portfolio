import React from 'react';
import { cn } from '@/lib/utils';

export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * List variant
   */
  variant?: 'default' | 'bordered' | 'divided';
  
  /**
   * List spacing
   */
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * List container with proper spacing and styling
 * 
 * @example
 * ```tsx
 * <List variant="divided">
 *   <ListItem primary="Apple Inc." secondary="AAPL" />
 *   <ListItem primary="Microsoft Corp." secondary="MSFT" />
 * </List>
 * ```
 */
export const List = React.forwardRef<HTMLDivElement, ListProps>(
  ({ 
    className,
    variant = 'default',
    spacing = 'md',
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'divide-y divide-gray-200';
    
    const variantClasses = {
      default: '',
      bordered: 'border border-gray-200 rounded-lg',
      divided: 'bg-white shadow-sm rounded-lg border border-gray-200',
    };
    
    const spacingClasses = {
      sm: '[&>*]:py-2',
      md: '[&>*]:py-3',
      lg: '[&>*]:py-4',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

List.displayName = 'List';

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Primary text content
   */
  primary: string;
  
  /**
   * Secondary text content
   */
  secondary?: string;
  
  /**
   * Status indicator
   */
  status?: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error';
  
  /**
   * Left icon or element
   */
  leftElement?: React.ReactNode;
  
  /**
   * Right actions or content
   */
  rightElement?: React.ReactNode;
  
  /**
   * Whether the item is clickable
   */
  clickable?: boolean;
  
  /**
   * Whether the item is selected
   */
  selected?: boolean;
}

/**
 * List item component with primary/secondary text and actions
 * 
 * @example
 * ```tsx
 * <ListItem
 *   primary="Apple Inc."
 *   secondary="Technology • $150.25"
 *   status="active"
 *   leftElement={<CompanyIcon />}
 *   rightElement={<Button variant="ghost" size="sm">View</Button>}
 *   clickable
 * />
 * ```
 */
export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ 
    className,
    primary,
    secondary,
    status,
    leftElement,
    rightElement,
    clickable = false,
    selected = false,
    ...props 
  }, ref) => {
    const baseClasses = [
      'flex items-center justify-between px-4 py-3',
      'transition-colors duration-200',
    ].join(' ');
    
    const interactiveClasses = clickable 
      ? 'hover:bg-gray-50 cursor-pointer' 
      : '';
    
    const selectedClasses = selected 
      ? 'bg-blue-50 border-l-4 border-l-blue-600' 
      : '';
    
    const statusIndicators = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          interactiveClasses,
          selectedClasses,
          className
        )}
        {...props}
      >
        <div className="flex items-center min-w-0 flex-1">
          {leftElement && (
            <div className="flex-shrink-0 mr-3">
              {leftElement}
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {primary}
              </p>
              
              {status && (
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  statusIndicators[status]
                )}>
                  <span className="w-1.5 h-1.5 bg-current rounded-full mr-1" />
                  {status}
                </span>
              )}
            </div>
            
            {secondary && (
              <p className="text-sm text-gray-600 truncate mt-0.5">
                {secondary}
              </p>
            )}
          </div>
        </div>
        
        {rightElement && (
          <div className="flex-shrink-0 ml-3">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

ListItem.displayName = 'ListItem';

/**
 * Empty list state component
 */
export interface EmptyListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Empty state title
   */
  title?: string;
  
  /**
   * Empty state description
   */
  description?: string;
  
  /**
   * Icon or illustration
   */
  icon?: React.ReactNode;
  
  /**
   * Action button or element
   */
  action?: React.ReactNode;
}

export const EmptyList = React.forwardRef<HTMLDivElement, EmptyListProps>(
  ({ 
    className,
    title = 'No items found',
    description,
    icon,
    action,
    ...props 
  }, ref) => {
    const defaultIcon = (
      <svg
        className="h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    );
    
    return (
      <div
        ref={ref}
        className={cn(
          'text-center py-12 px-4',
          className
        )}
        {...props}
      >
        <div className="flex justify-center mb-4">
          {icon || defaultIcon}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            {description}
          </p>
        )}
        
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    );
  }
);

EmptyList.displayName = 'EmptyList';