import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input variant
   */
  variant?: 'default' | 'search';
  
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Error state
   */
  error?: boolean;
  
  /**
   * Left icon or element
   */
  leftElement?: React.ReactNode;
  
  /**
   * Right icon or element
   */
  rightElement?: React.ReactNode;
}

/**
 * Flexible Input component with consistent styling and focus states
 * 
 * @example
 * ```tsx
 * <Input 
 *   variant="search" 
 *   placeholder="Search stocks..." 
 *   leftElement={<MagnifyingGlassIcon />}
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    error = false,
    leftElement,
    rightElement,
    ...props 
  }, ref) => {
    const baseClasses = [
      'block w-full rounded-md border-0 py-1.5',
      'text-gray-900 shadow-sm ring-1 ring-inset',
      'placeholder:text-gray-400',
      'focus:ring-2 focus:ring-inset',
      'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
      'transition-colors duration-200',
    ].join(' ');
    
    const variantClasses = {
      default: error 
        ? 'ring-red-300 focus:ring-red-600' 
        : 'ring-gray-300 focus:ring-blue-600',
      search: error 
        ? 'ring-red-300 focus:ring-red-600' 
        : 'ring-gray-300 focus:ring-blue-600',
    };
    
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-3.5 py-2 text-base',
    };
    
    const paddingAdjustments = {
      left: leftElement ? {
        sm: 'pl-8',
        md: 'pl-10',
        lg: 'pl-12',
      } : {},
      right: rightElement ? {
        sm: 'pr-8',
        md: 'pr-10', 
        lg: 'pr-12',
      } : {},
    };
    
    if (leftElement || rightElement) {
      return (
        <div className="relative">
          {leftElement && (
            <div className={cn(
              'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none',
              'text-gray-400',
              size === 'sm' && 'pl-2.5',
              size === 'lg' && 'pl-3.5'
            )}>
              {leftElement}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[size],
              leftElement ? paddingAdjustments.left[size] : '',
              rightElement ? paddingAdjustments.right[size] : '',
              className
            )}
            {...props}
          />
          
          {rightElement && (
            <div className={cn(
              'absolute inset-y-0 right-0 flex items-center pr-3',
              'text-gray-400',
              size === 'sm' && 'pr-2.5',
              size === 'lg' && 'pr-3.5'
            )}>
              {rightElement}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <input
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

/**
 * Search Input component with magnifying glass icon
 */
export interface SearchInputProps extends Omit<InputProps, 'variant' | 'leftElement'> {
  /**
   * Custom search icon
   */
  searchIcon?: React.ReactNode;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ searchIcon, ...props }, ref) => {
    const defaultSearchIcon = (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );
    
    return (
      <Input
        ref={ref}
        variant="search"
        leftElement={searchIcon || defaultSearchIcon}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';