import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant affecting padding and styling
   */
  variant?: 'default' | 'compact' | 'spacious';
  
  /**
   * Shadow intensity
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  
  /**
   * Whether the card should have hover effects
   */
  hoverable?: boolean;
  
  /**
   * Whether the card should be clickable (adds cursor pointer)
   */
  clickable?: boolean;
  
  /**
   * Custom border styling
   */
  border?: boolean;
  
  /**
   * Background color variant
   */
  background?: 'white' | 'gray' | 'transparent';
}

/**
 * Flexible Card component with multiple variants and styling options
 * 
 * @example
 * ```tsx
 * <Card variant="default" hoverable>
 *   <CardHeader>
 *     <CardTitle>Portfolio Overview</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Content goes here
 *   </CardContent>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    shadow = 'sm', 
    hoverable = false,
    clickable = false,
    border = true,
    background = 'white',
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'rounded-lg transition-all duration-200';
    
    const variantClasses = {
      default: 'p-6',
      compact: 'p-4',
      spacious: 'p-8',
    };
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };
    
    const backgroundClasses = {
      white: 'bg-white',
      gray: 'bg-gray-50',
      transparent: 'bg-transparent',
    };
    
    const hoverClasses = hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : '';
    const clickableClasses = clickable ? 'cursor-pointer' : '';
    const borderClasses = border ? 'border border-gray-200' : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          shadowClasses[shadow],
          backgroundClasses[background],
          borderClasses,
          hoverClasses,
          clickableClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header component for consistent header styling
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to add bottom border separator
   */
  separator?: boolean;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, separator = false, children, ...props }, ref) => {
    const separatorClasses = separator ? 'border-b border-gray-200 pb-4 mb-4' : '';
    
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', separatorClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Title component with consistent typography
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * HTML heading level
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = 3, children, ...props }, ref) => {
    const headingClasses = cn(
      'text-lg font-semibold leading-none tracking-tight text-gray-900',
      className
    );
    
    switch (level) {
      case 1:
        return <h1 ref={ref} className={headingClasses} {...props}>{children}</h1>;
      case 2:
        return <h2 ref={ref} className={headingClasses} {...props}>{children}</h2>;
      case 3:
        return <h3 ref={ref} className={headingClasses} {...props}>{children}</h3>;
      case 4:
        return <h4 ref={ref} className={headingClasses} {...props}>{children}</h4>;
      case 5:
        return <h5 ref={ref} className={headingClasses} {...props}>{children}</h5>;
      case 6:
        return <h6 ref={ref} className={headingClasses} {...props}>{children}</h6>;
      default:
        return <h3 ref={ref} className={headingClasses} {...props}>{children}</h3>;
    }
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * Card Description component for subtitle text
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

/**
 * Card Content component for main content area
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

CardContent.displayName = 'CardContent';

/**
 * Card Footer component for action areas
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to add top border separator
   */
  separator?: boolean;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, separator = false, children, ...props }, ref) => {
    const separatorClasses = separator ? 'border-t border-gray-200 pt-4 mt-4' : '';
    
    return (
      <div
        ref={ref}
        className={cn('flex items-center', separatorClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';