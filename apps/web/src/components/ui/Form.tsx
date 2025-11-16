import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Field label
   */
  label?: string;
  
  /**
   * Field description or help text
   */
  description?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Unique identifier for the field
   */
  htmlFor?: string;
}

/**
 * Form field wrapper with label and error handling
 * 
 * @example
 * ```tsx
 * <FormField label="Email" required error={errors.email}>
 *   <Input type="email" />
 * </FormField>
 * ```
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    className,
    label,
    description,
    error,
    required = false,
    htmlFor,
    children,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label
            htmlFor={htmlFor}
            className={cn(
              'block text-sm font-medium leading-6',
              error ? 'text-red-900' : 'text-gray-900'
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        {description && !error && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}
        
        <div className="relative">
          {children}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <svg
              className="h-4 w-4 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

/**
 * Form container with consistent spacing
 */
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * Spacing between form fields
   */
  spacing?: 'sm' | 'md' | 'lg';
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, spacing = 'md', children, ...props }, ref) => {
    const spacingClasses = {
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    };
    
    return (
      <form
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

/**
 * Form section with optional title and description
 */
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Section title
   */
  title?: string;
  
  /**
   * Section description
   */
  description?: string;
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }
);

FormSection.displayName = 'FormSection';

/**
 * Form actions container (typically for buttons)
 */
export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alignment of actions
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Whether to add top border separator
   */
  separator?: boolean;
}

export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, align = 'right', separator = false, children, ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };
    
    const separatorClasses = separator 
      ? 'border-t border-gray-200 pt-6 mt-6' 
      : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          alignClasses[align],
          separatorClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = 'FormActions';