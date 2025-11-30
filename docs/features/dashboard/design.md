# Dashboard Redesign Design Document

## Overview

The dashboard redesign transforms the current dashboard from a card-based layout to a professional, table-centric interface that provides comprehensive portfolio overview and management capabilities. The design emphasizes data density, quick actions, and responsive behavior across all device types.

## Architecture

### Component Structure
```
Dashboard Page
├── Summary Cards Section
│   ├── Total Portfolio Value Card
│   ├── Total Unrealized Gain/Loss Card
│   └── Overall Dividend Yield Card
├── Portfolio Table Section
│   ├── Table Header (with Add Portfolio button/link)
│   ├── Portfolio Table Component
│   │   ├── Sortable Column Headers
│   │   ├── Portfolio Rows with Actions
│   │   └── Loading/Empty States
│   └── Pagination Component
├── Recent Activity Section
│   ├── Activity List Component (reuse existing)
│   ├── Recent Transactions Hook (useRecentTransactions)
│   └── Loading/Empty States
└── Modals
    ├── Add Portfolio Modal (reuse existing from /portfolio page)
    └── Edit Portfolio Modal
```

### Data Flow
1. **Dashboard loads** → Fetch all portfolios and positions
2. **Calculate metrics** → Process portfolio values, gains, yields
3. **Fetch recent activity** → Get latest transactions from `/transactions` endpoint
4. **Render components** → Display portfolio table and recent activity
5. **User interactions** → Handle sorting, actions, modals
6. **Updates** → Refresh data after portfolio changes

## Components and Interfaces

### PortfolioTable Component
```typescript
interface PortfolioTableProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onEdit: (portfolio: Portfolio) => void;
  onPortfolioClick: (portfolioId: string) => void;
  onViewDividends: (portfolioId: string) => void;
}

interface PortfolioWithMetrics extends Portfolio {
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  dividendYield: number;
  positionCount: number;
  lastUpdated: Date;
}
```

### SummaryCards Component
```typescript
interface SummaryCardsProps {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  overallDividendYield: number;
  loading: boolean;
}
```

### Table Columns
| Column | Type | Sortable | Mobile | Click Action |
|--------|------|----------|--------|--------------|
| Portfolio Name | Link | Yes | Yes | Navigate to `/portfolio/{id}` |
| Currency | String | Yes | Yes | - |
| Total Value | Currency | Yes | Yes | - |
| Unrealized Gain/Loss | Currency + % | Yes | No | - |
| Dividend Yield | Percentage | Yes | No | - |
| Positions | Number | Yes | No | - |
| Last Updated | Date | Yes | No | - |
| Actions | Buttons | No | Yes | Dropdown menu |

## API Integration

### Recent Activity Endpoint
```
GET /transactions
```

**Parameters:**
- `limit`: Number of transactions (default: 20, max: 100)
- `offset`: Page offset (default: 0)
- `sort`: Sort order (default: "createdAt:desc")
- `portfolioId`: Filter by specific portfolios (optional)
- `type`: Filter by transaction type (DIVIDEND, BUY, SELL, TAX, SPLIT)

**Response:**
```typescript
interface PaginatedTransactionsDto {
  data: TransactionEntity[];
  total: number;
  limit: number;
  offset: number;
}
```

### Recent Activity Hook
```typescript
function useRecentTransactions(limit: number = 10) {
  // Fetch latest transactions across all portfolios
  // Convert to ActivityItem format for existing ActivityList component
  // Return { activities, loading, error }
}
```

## Data Models

### Portfolio Metrics Calculation
```typescript
interface PortfolioMetrics {
  totalValue: number;        // Sum of all position values
  totalCost: number;         // Sum of all position costs
  unrealizedGain: number;    // totalValue - totalCost
  unrealizedGainPercent: number; // (unrealizedGain / totalCost) * 100
  dividendYield: number;     // (annual dividends / totalValue) * 100
  positionCount: number;     // Number of positions in portfolio
  lastUpdated: Date;         // Most recent transaction date
}
```

### Summary Calculations
```typescript
interface DashboardSummary {
  totalValue: number;           // Sum of all portfolio values (converted to USD)
  totalCost: number;            // Sum of all portfolio costs (converted to USD)
  totalGain: number;            // totalValue - totalCost
  totalGainPercent: number;     // (totalGain / totalCost) * 100
  overallDividendYield: number; // Weighted average dividend yield
  portfolioCount: number;       // Total number of portfolios
}
```

## User Interface Design

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard                                                       │
├─────────────────────────────────────────────────────────────────┤
│ [Total Value: $45,200] [Total Gain: +$3,400] [Yield: 4.2%]    │
├─────────────────────────────────────────────────────────────────┤
│ My Portfolios                              [+ Add Portfolio]    │
├─────────────────────────────────────────────────────────────────┤
│ Name          │ Currency │ Value    │ Gain/Loss │ Yield │ Actions│
├─────────────────────────────────────────────────────────────────┤
│ Main Portfolio│ USD      │ $24,500  │ +$2,100   │ 4.1%  │ [•••]  │
│ Retirement    │ USD      │ $18,200  │ +$1,200   │ 4.5%  │ [•••]  │
│ International │ EUR      │ €2,500   │ +€100     │ 3.8%  │ [•••]  │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────┐
│ Dashboard               │
├─────────────────────────┤
│ Total: $45,200          │
│ Gain: +$3,400 (+7.8%)   │
├─────────────────────────┤
│ [+ Add Portfolio]       │
├─────────────────────────┤
│ Main Portfolio     USD  │
│ $24,500  +$2,100 (8.6%) │
│ [View] [Dividends]      │
├─────────────────────────┤
│ Retirement         USD  │
│ $18,200  +$1,200 (7.0%) │
│ [View] [Dividends]      │
└─────────────────────────┘
```

## Error Handling

### Loading States
- **Table skeleton** - Show placeholder rows while loading
- **Summary cards** - Show loading spinners in metric cards
- **Progressive loading** - Show table structure immediately, populate data as it loads

### Error States
- **API failures** - Display error messages with retry options
- **Empty state** - Show helpful message when no portfolios exist
- **Network errors** - Handle offline scenarios gracefully

### Validation
- **Form validation** - Validate portfolio creation/editing forms
- **Data validation** - Handle malformed API responses
- **Currency validation** - Ensure proper currency formatting

## Testing Strategy

### Unit Tests
- Portfolio metrics calculations
- Currency conversion functions
- Table sorting logic
- Form validation

### Integration Tests
- API data fetching and processing
- Table interactions (sorting, pagination)
- Modal workflows (create, edit)
- Responsive behavior

### User Acceptance Tests
- Portfolio table displays correctly
- Summary calculations are accurate
- Actions work as expected
- Mobile experience is usable

## Performance Considerations

### Optimization Strategies
- **Virtual scrolling** for large portfolio lists
- **Memoization** of calculated metrics
- **Lazy loading** of detailed portfolio data
- **Debounced sorting** to prevent excessive re-renders

### Caching
- **Portfolio data** cached for 5 minutes
- **Position data** cached per portfolio
- **Currency rates** cached for 1 hour
- **Summary metrics** recalculated only when data changes