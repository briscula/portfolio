import React from "react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  /**
   * The title/label for the metric
   */
  title: string;

  /**
   * The main value to display
   */
  value: string | number;

  /**
   * Optional change indicator
   */
  change?: {
    value: number;
    type: "increase" | "decrease";
    period?: string; // e.g., "vs last month"
  };

  /**
   * Icon component to display
   */
  icon?: React.ComponentType<{ className?: string }>;

  /**
   * Icon background color
   */
  iconColor?: "blue" | "green" | "purple" | "yellow" | "red" | "gray";

  /**
   * Additional className for the card
   */
  className?: string;

  /**
   * Whether the card should be clickable
   */
  onClick?: () => void;
}

/**
 * MetricCard component for displaying key portfolio metrics
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Portfolio Value"
 *   value="$24,500.00"
 *   change={{ value: 5.2, type: 'increase', period: 'vs last month' }}
 *   icon={DollarSignIcon}
 *   iconColor="green"
 * />
 * ```
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "blue",
  className,
  onClick,
}) => {
  const iconColorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    gray: "bg-gray-500",
  };

  const changeColorClasses = {
    increase: "text-green-600",
    decrease: "text-red-600",
  };

  const changeIconClasses = {
    increase: "↗",
    decrease: "↘",
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow duration-200",
        className,
      )}
      clickable={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-center">
        {/* Icon */}
        {Icon && (
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                iconColorClasses[iconColor],
              )}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1", Icon ? "ml-4" : "")}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {/* Title */}
              <dl>
                <dt className="text-sm font-medium text-gray-600 truncate">
                  {title}
                </dt>

                {/* Value */}
                <dd className="text-2xl font-semibold text-gray-900 mt-1">
                  {value}
                </dd>
              </dl>
            </div>

            {/* Change indicator */}
            {change && (
              <div className="flex-shrink-0 ml-4">
                <div
                  className={cn(
                    "flex items-center text-sm font-medium",
                    changeColorClasses[change.type],
                  )}
                >
                  <span className="mr-1">{changeIconClasses[change.type]}</span>
                  <span>{Math.abs(change.value).toFixed(2)}%</span>
                </div>
                {change.period && (
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {change.period}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

/**
 * MetricCardsGrid component for responsive grid layout
 */
export interface MetricCardsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};
