# Dashboard Redesign Implementation Plan

- [x] 1. Create portfolio metrics calculation utilities
  - Implement functions to calculate portfolio total value, unrealized gain/loss, and dividend yield
  - Create currency conversion utilities for multi-currency portfolio summaries
  - Add portfolio metrics aggregation functions for dashboard summary cards
  - Write unit tests for all calculation functions
  - _Requirements: 1.2, 2.1, 2.3, 5.2_

- [x] 2. Build PortfolioTable component
  - Create responsive table component with sortable columns
  - Implement portfolio row component with action buttons (View Dividends, Edit)
  - Make portfolio names clickable links to navigate to portfolio details
  - Add table loading states with skeleton rows
  - Create empty state component for when no portfolios exist
  - _Requirements: 1.1, 1.3, 1.4, 3.1, 3.2, 3.3_

- [x] 3. Implement table sorting and interaction logic
  - Add column sorting functionality (name, value, performance, yield)
  - Create sort state management with visual indicators
  - Implement portfolio name click navigation to `/portfolio/{id}`
  - Add keyboard navigation support for accessibility
  - _Requirements: 1.4, 3.2, 3.3_

- [x] 4. Create dashboard summary cards section
  - Build summary metric cards for total value, gain/loss, and overall yield
  - Implement multi-currency aggregation with USD conversion
  - Add loading states for summary calculations
  - Create responsive layout for summary cards
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Add portfolio management functionality
  - Reuse existing "Add Portfolio" modal from /portfolio page
  - Implement "Edit Portfolio" modal with pre-filled data
  - Add form submission handling with API integration and table refresh
  - Include success/error feedback after operations
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Implement responsive design for mobile devices
  - Create mobile-optimized table layout (stacked cards or horizontal scroll)
  - Adapt summary cards for mobile screens
  - Implement touch-friendly action buttons
  - Test and optimize for tablet and mobile viewports
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Create useRecentTransactions hook
  - Build hook to fetch latest transactions from /transactions endpoint
  - Convert TransactionEntity to ActivityItem format for existing ActivityList component
  - Add loading states and error handling
  - Implement automatic refresh capabilities
  - _Requirements: 7.1, 7.2_

- [x] 8. Integrate real-time portfolio data
  - Connect table to portfolio and positions APIs
  - Implement data fetching with loading states for portfolio table
  - Add automatic data refresh capabilities for portfolio metrics
  - Handle API errors with user-friendly messages
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 9. Add table pagination and performance optimization
  - Implement pagination for large portfolio lists
  - Add virtual scrolling for better performance
  - Optimize re-rendering with React.memo and useMemo
  - Add debounced sorting to prevent excessive API calls
  - _Requirements: 4.4_

- [x] 10. Update dashboard page integration
  - Replace current dashboard content with new portfolio table and summary cards
  - Keep existing "Recent Activity" section below the portfolio table
  - Remove DividendProgressView component from dashboard
  - Remove portfolio selector from header (no longer needed with table navigation)
  - Update navigation and routing for table actions
  - Ensure proper authentication and error handling
  - _Requirements: 1.1, 2.1, 5.1, 7.1_

- [x] 11. Add comprehensive error handling
  - Implement error boundaries for component failures
  - Add retry mechanisms for failed API calls
  - Create user-friendly error messages for all failure scenarios
  - Add offline state handling and recovery
  - _Requirements: 2.4, 6.4_

- [x] 12. Implement accessibility features
  - Add proper ARIA labels and roles for table elements
  - Ensure keyboard navigation works for all interactive elements
  - Add screen reader support for dynamic content updates
  - Test with accessibility tools and screen readers
  - _Requirements: 1.4, 3.1, 4.1_

## Future Enhancements (Optional)

- [x] 13. Advanced table features
  - Add search/filter functionality for portfolio names
  - Implement bulk actions (select multiple portfolios)
  - Add export functionality (CSV, PDF)
  - Create customizable column visibility settings
