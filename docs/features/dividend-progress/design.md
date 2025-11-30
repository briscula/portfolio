# Design Document

## Overview

The Dividend Progress View component will provide users with comprehensive insights into their dividend performance through interactive visualizations and key metrics. Building on the existing DividendChart component, this new component will offer enhanced functionality including time period filtering, detailed metrics, trend analysis, and responsive design.

The component will integrate seamlessly with the current Next.js 15 + Auth0 architecture, following established patterns for client-side components and maintaining consistency with the existing Tailwind CSS styling approach.

## Architecture

### Component Structure
```
DividendProgressView/
├── DividendProgressView.tsx     # Main container component
├── components/
│   ├── ProgressChart.tsx        # Enhanced chart with multiple view modes
│   ├── MetricsPanel.tsx         # Key performance indicators
│   ├── TimeFilter.tsx           # Period selection controls
│   └── TrendIndicator.tsx       # Growth/decline indicators
├── hooks/
│   ├── useDividendData.tsx      # Data fetching and processing
│   └── useTimeFilter.tsx        # Time period state management
├── types/
│   └── dividend.ts              # TypeScript interfaces
└── utils/
    ├── calculations.ts          # Dividend calculations and trends
    └── formatters.ts            # Data formatting utilities
```

### Data Flow
1. **DividendProgressView** acts as the main container
2. **useDividendData** hook manages data fetching and processing
3. **useTimeFilter** hook manages time period state
4. Child components receive processed data via props
5. User interactions update filters, triggering data recalculation

## Components and Interfaces

### DividendProgressView (Main Component)
```typescript
interface DividendProgressViewProps {
  userId?: string;
  className?: string;
  defaultPeriod?: TimePeriod;
}
```

**Responsibilities:**
- Coordinate child components
- Manage overall state
- Handle loading and error states
- Provide responsive layout structure

### ProgressChart Component
```typescript
interface ProgressChartProps {
  data: DividendDataPoint[];
  period: TimePeriod;
  chartType: 'line' | 'bar' | 'area';
  onDataPointHover: (point: DividendDataPoint | null) => void;
}
```

**Features:**
- Multiple chart types (line, bar, area)
- Interactive tooltips with detailed information
- Smooth animations and transitions
- Responsive design with mobile optimization
- Accessibility support with ARIA labels

### MetricsPanel Component
```typescript
interface MetricsPanelProps {
  metrics: DividendMetrics;
  period: TimePeriod;
  isLoading: boolean;
}

interface DividendMetrics {
  totalIncome: number;
  paymentCount: number;
  averagePayment: number;
  growthRate: number;
  yearOverYearChange?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}
```

**Features:**
- Key performance indicators with visual emphasis
- Trend indicators with color coding
- Comparison metrics (YoY, period-over-period)
- Loading states with skeleton UI

### TimeFilter Component
```typescript
interface TimeFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  availablePeriods: TimePeriod[];
}

type TimePeriod = 'month' | 'quarter' | 'year' | 'all';
```

**Features:**
- Tab-style period selection
- Keyboard navigation support
- Visual indication of active period
- Disabled states for unavailable periods

## Data Models

### Core Data Types
```typescript
interface DividendDataPoint {
  date: string;
  amount: number;
  symbol?: string;
  company?: string;
  paymentType: 'regular' | 'special' | 'interim';
}

interface ProcessedDividendData {
  dataPoints: DividendDataPoint[];
  metrics: DividendMetrics;
  trends: TrendData;
  periodSummary: PeriodSummary;
}

interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  confidence: 'high' | 'medium' | 'low';
}

interface PeriodSummary {
  period: TimePeriod;
  startDate: string;
  endDate: string;
  totalPayments: number;
  totalAmount: number;
}
```

### Chart Configuration
```typescript
interface ChartConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    trend: {
      positive: string;
      negative: string;
      neutral: string;
    };
  };
  responsive: {
    mobile: ChartDimensions;
    tablet: ChartDimensions;
    desktop: ChartDimensions;
  };
}
```

## Error Handling

### Error States
1. **No Data Available**: Display empty state with helpful message
2. **Network Errors**: Show retry mechanism with error details
3. **Invalid Date Ranges**: Graceful fallback to default period
4. **Chart Rendering Errors**: Fallback to table view

### Error Boundaries
- Implement React Error Boundary around chart components
- Provide fallback UI for critical failures
- Log errors for debugging while maintaining user experience

### Loading States
- Skeleton UI for metrics panel
- Chart loading animation
- Progressive data loading for large datasets

## Testing Strategy

### Unit Tests
- **Data Processing**: Test dividend calculations and trend analysis
- **Utility Functions**: Test formatters and date handling
- **Component Logic**: Test state management and user interactions

### Integration Tests
- **Chart Rendering**: Test chart displays correctly with various data sets
- **Filter Interactions**: Test time period changes update data correctly
- **Responsive Behavior**: Test component adapts to different screen sizes

### Accessibility Tests
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Screen Reader Support**: Test ARIA labels and descriptions
- **Color Contrast**: Verify chart colors meet WCAG standards
- **Reduced Motion**: Test respect for user motion preferences

### Performance Tests
- **Large Dataset Handling**: Test with extensive dividend history
- **Chart Rendering Performance**: Measure rendering times
- **Memory Usage**: Monitor for memory leaks in chart updates

## Implementation Approach

### Phase 1: Core Structure
- Set up component architecture and basic layout
- Implement data models and TypeScript interfaces
- Create basic chart with existing @nivo/bar library

### Phase 2: Enhanced Visualization
- Add multiple chart types (line, area)
- Implement interactive tooltips and hover states
- Add smooth transitions and animations

### Phase 3: Metrics and Filtering
- Build metrics panel with KPIs
- Implement time period filtering
- Add trend analysis and calculations

### Phase 4: Polish and Optimization
- Responsive design refinements
- Accessibility improvements
- Performance optimizations
- Error handling enhancements

### Integration Points
- Extend existing DividendChart patterns
- Reuse Auth0 authentication context
- Follow established Tailwind CSS conventions
- Maintain consistency with current navigation and layout