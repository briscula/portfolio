import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'dividend_received' | 'stock_added' | 'stock_removed' | 'dividend_announced';
  title: string;
  description: string;
  amount?: string;
  date: Date;
  status?: 'completed' | 'pending' | 'cancelled';
}

export interface ActivityListProps {
  /**
   * List of activity items to display
   */
  activities: ActivityItem[];
  
  /**
   * Title for the activity section
   */
  title?: string;
  
  /**
   * Maximum number of activities to show
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
 * ActivityList component for displaying recent portfolio activities
 * 
 * @example
 * ```tsx
 * <ActivityList
 *   title="Recent Activity"
 *   activities={activities}
 *   maxItems={5}
 *   showViewAll
 *   onViewAll={() => navigate('/activity')}
 * />
 * ```
 */
export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  title = 'Recent Activity',
  maxItems,
  showViewAll = false,
  onViewAll,
  className,
}) => {
  const displayedActivities = maxItems 
    ? activities.slice(0, maxItems)
    : activities;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'dividend_received':
        return '💰';
      case 'stock_added':
        return '📈';
      case 'stock_removed':
        return '📉';
      case 'dividend_announced':
        return '📢';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'dividend_received':
        return 'bg-green-500';
      case 'stock_added':
        return 'bg-blue-500';
      case 'stock_removed':
        return 'bg-red-500';
      case 'dividend_announced':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyActivityState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showViewAll && activities.length > (maxItems || 0) && (
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
          {displayedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Individual activity item component
 */
interface ActivityItemProps {
  activity: ActivityItem;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'dividend_received':
        return '💰';
      case 'stock_added':
        return '📈';
      case 'stock_removed':
        return '📉';
      case 'dividend_announced':
        return '📢';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'dividend_received':
        return 'bg-green-500';
      case 'stock_added':
        return 'bg-blue-500';
      case 'stock_removed':
        return 'bg-red-500';
      case 'dividend_announced':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center min-w-0 flex-1">
        {/* Activity indicator */}
        <div className="flex-shrink-0">
          <div className={cn(
            'w-2 h-2 rounded-full',
            getActivityColor(activity.type)
          )} />
        </div>
        
        {/* Activity content */}
        <div className="ml-3 min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {activity.description}
                {activity.amount && (
                  <span className="font-medium text-gray-900 ml-1">
                    {activity.amount}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Date */}
      <div className="flex-shrink-0 ml-4">
        <span className="text-sm text-gray-500">
          {formatDate(activity.date)}
        </span>
      </div>
    </div>
  );
};

/**
 * Empty state component for when no activities exist
 */
const EmptyActivityState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📊</span>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        No recent activity
      </h3>
      <p className="text-sm text-gray-600">
        Your portfolio activity will appear here once you start making transactions.
      </p>
    </div>
  );
};