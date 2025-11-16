/**
 * Centralized type exports
 *
 * Import types from this barrel file:
 * import { Portfolio, Position, Transaction } from '@/types';
 */

// Portfolio types
export type {
  Portfolio,
  PortfolioMetrics,
  PortfolioWithMetrics,
  PortfolioSummary,
  DashboardSummary,
} from './portfolio';

// Position types
export type {
  Position,
  PaginationInfo,
  PositionsResponse,
} from './position';

// Transaction types
export type {
  Transaction,
  TransactionType,
} from './transaction';

// Dividend types
export type {
  DividendDataPoint,
  TimePeriod,
  TrendData,
  DividendMetrics,
  PeriodSummary,
  ProcessedDividendData,
  ChartDimensions,
  ChartConfig,
  DividendProgressViewProps,
  ProgressChartProps,
  MetricsPanelProps,
  TimeFilterProps,
  TrendIndicatorProps,
} from './dividend';

// Export type guards and constants from dividend types
export {
  isDividendDataPoint,
  isTimePeriod,
  isDividendMetrics,
  DEFAULT_CHART_CONFIG,
} from './dividend';
