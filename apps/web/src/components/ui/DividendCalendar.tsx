import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { cn } from '@/lib/utils';

export interface DividendEvent {
  id: string;
  symbol: string;
  companyName: string;
  dividendAmount: number;
  exDividendDate: Date;
  paymentDate: Date;
  shares?: number;
  estimatedPayout?: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
}

export interface DividendCalendarProps {
  /**
   * List of upcoming dividend events
   */
  dividends: DividendEvent[];
  
  /**
   * Title for the dividend calendar section
   */
  title?: string;
  
  /**
   * Maximum number of dividends to show
   */
  maxItems?: number;
  
  /**
   * Whether to show the "View All" link
   */
  showViewAll?: boolean;
  
  /**
   * Callback for "View All" click
   */
  onViewAll?: () => void;
  
  /**
   * Additional className
   */
  className?: string;
}

/**
 * DividendCalendar component for displaying upcoming dividend events
 * 
 * @example
 * ```tsx
 * <DividendCalendar
 *   title="Upcoming Dividends"
 *   dividends={upcomingDividends}
 *   maxItems={5}
 *   showViewAll
 *   onViewAll={() => navigate('/dividends')}
 * />
 * ```
 */
export const DividendCalendar: React.FC<DividendCalendarProps> = ({
  dividends,
  title = 'Upcoming Dividends',
  maxItems,
  showViewAll = false,
  onViewAll,
  className,
}) => {
  const displayedDividends = maxItems 
    ? dividends.slice(0, maxItems)
    : dividends;

  if (dividends.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyDividendState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showViewAll && dividends.length > (maxItems || 0) && (
            <button
              onClick={onViewAll}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              View all
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedDividends.map((dividend) => (
            <DividendEventCard key={dividend.id} dividend={dividend} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Individual dividend event card component
 */
interface DividendEventCardProps {
  dividend: DividendEvent;
}

const DividendEventCard: React.FC<DividendEventCardProps> = ({ dividend }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Tomorrow';
    } else if (diffInDays < 7) {
      return `In ${diffInDays} days`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getFrequencyColor = (frequency: DividendEvent['frequency']) => {
    switch (frequency) {
      case 'monthly':
        return 'bg-green-100 text-green-800';
      case 'quarterly':
        return 'bg-blue-100 text-blue-800';
      case 'semi-annual':
        return 'bg-purple-100 text-purple-800';
      case 'annual':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = dividend.exDividendDate > new Date();
  const isPastDue = dividend.paymentDate < new Date();

  return (
    <div className={cn(
      'border border-gray-200 rounded-lg p-4 transition-all duration-200',
      'hover:border-gray-300 hover:shadow-sm',
      isPastDue && 'opacity-60'
    )}>
      <div className="flex items-start justify-between">
        {/* Company and dividend info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {dividend.symbol}
            </h4>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              getFrequencyColor(dividend.frequency)
            )}>
              {dividend.frequency}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-2">
            {dividend.companyName}
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>
              Ex-Date: {formatDate(dividend.exDividendDate)}
            </span>
            <span>
              Pay Date: {formatDate(dividend.paymentDate)}
            </span>
          </div>
        </div>
        
        {/* Amount and payout info */}
        <div className="flex-shrink-0 text-right ml-4">
          <div className="text-lg font-semibold text-gray-900">
            ${dividend.dividendAmount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            per share
          </div>
          
          {dividend.shares && dividend.estimatedPayout && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-sm font-medium text-green-600">
                ${dividend.estimatedPayout.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {dividend.shares} shares
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Empty state component for when no upcoming dividends exist
 */
const EmptyDividendState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📅</span>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        No upcoming dividends
      </h3>
      <p className="text-sm text-gray-600">
        Add dividend-paying stocks to your portfolio to see upcoming payments.
      </p>
    </div>
  );
};