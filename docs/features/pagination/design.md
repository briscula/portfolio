# Pagination Design Patterns

## Introduction

This document outlines the design patterns and implementation strategies for pagination and performance optimization in the portfolio table.

## Design Principles

### 1. Progressive Enhancement Strategy

#### Automatic Feature Detection
- **Small datasets (< 50 items)**: Display all items without pagination
- **Medium datasets (50-100 items)**: Enable pagination with 25 items per page
- **Large datasets (> 100 items)**: Offer virtual scrolling as default option
- **Dynamic switching**: Automatically adjust strategy based on data size changes

#### Performance-First Approach
```typescript
// Automatic strategy selection
const getDisplayStrategy = (itemCount: number) => {
  if (itemCount < 50) return 'standard';
  if (itemCount < 100) return 'pagination';
  return 'virtual-scroll';
};
```

### 2. Pagination Component Design

#### Core Pagination Features
- **Page Navigation**: Previous/Next buttons with proper disabled states
- **Page Numbers**: Direct page selection with ellipsis for large page counts
- **Page Size Control**: Dropdown selector for items per page (10, 25, 50, 100)
- **Item Count Display**: Clear indication of current view ("Showing X to Y of Z results")

#### Visual Design Patterns
```tsx
// Pagination component structure
<div className="pagination-container">
  <div className="pagination-info">
    Showing {startItem} to {endItem} of {totalItems} results
  </div>
  <div className="pagination-controls">
    <button disabled={!hasPrevious}>Previous</button>
    <div className="page-numbers">
      {renderPageNumbers()}
    </div>
    <button disabled={!hasNext}>Next</button>
  </div>
  <div className="page-size-selector">
    <select value={pageSize} onChange={handlePageSizeChange}>
      <option value={10}>10 per page</option>
      <option value={25}>25 per page</option>
      <option value={50}>50 per page</option>
      <option value={100}>100 per page</option>
    </select>
  </div>
</div>
```

### 3. Virtual Scrolling Design

#### Performance Optimization
- **Viewport Rendering**: Only render visible items plus small buffer (overscan)
- **Position Tracking**: Maintain scroll position and item heights
- **Smooth Scrolling**: 60fps performance regardless of dataset size
- **Memory Efficiency**: Constant memory usage regardless of total items

#### Implementation Pattern
```tsx
// Virtual scrolling container
<div 
  className="virtual-scroll-container"
  style={{ height: containerHeight }}
  onScroll={handleScroll}
>
  <div style={{ height: totalHeight, position: 'relative' }}>
    {visibleItems.map((item, index) => (
      <div
        key={item.id}
        style={{
          position: 'absolute',
          top: index * itemHeight,
          height: itemHeight
        }}
      >
        {renderItem(item)}
      </div>
    ))}
  </div>
</div>
```

### 4. Debounced Operations Design

#### Sorting Optimization
- **Debounce Delay**: 300ms delay to prevent excessive API calls
- **Visual Feedback**: Show pending sort state during debounce period
- **Immediate Application**: Option to apply sort immediately for better UX
- **State Management**: Track pending operations and cleanup timeouts

#### Implementation Pattern
```tsx
// Debounced sort hook
const useDebouncedSort = (data, delay = 300) => {
  const [sortConfig, setSortConfig] = useState(null);
  const [isPending, setIsPending] = useState(false);
  
  const debouncedSort = useCallback(
    debounce((field, direction) => {
      setIsPending(true);
      // Apply sort logic
      setIsPending(false);
    }, delay),
    [delay]
  );
  
  return { sortConfig, debouncedSort, isPending };
};
```

### 5. React Performance Optimization

#### Memoization Strategy
- **Component Memoization**: React.memo for expensive components
- **Value Memoization**: useMemo for calculated values
- **Callback Memoization**: useCallback for event handlers
- **Custom Comparison**: Shallow comparison for complex objects

#### Optimization Patterns
```tsx
// Memoized portfolio row
const OptimizedPortfolioRow = React.memo(({ portfolio, onEdit, onDelete }) => {
  const formattedValue = useMemo(
    () => formatCurrency(portfolio.value),
    [portfolio.value, portfolio.currency]
  );
  
  const handleEdit = useCallback(
    () => onEdit(portfolio.id),
    [onEdit, portfolio.id]
  );
  
  return (
    <tr>
      <td>{portfolio.name}</td>
      <td>{formattedValue}</td>
      <td>
        <button onClick={handleEdit}>Edit</button>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  return prevProps.portfolio.id === nextProps.portfolio.id &&
         prevProps.portfolio.updatedAt === nextProps.portfolio.updatedAt;
});
```

### 6. Responsive Design Patterns

#### Mobile Optimization
- **Touch-Friendly Controls**: Minimum 44px touch targets
- **Simplified Navigation**: Streamlined pagination for mobile screens
- **Swipe Gestures**: Optional swipe navigation between pages
- **Adaptive Layout**: Different pagination styles for different screen sizes

#### Desktop Enhancement
- **Keyboard Shortcuts**: Arrow keys for navigation, Enter for selection
- **Hover States**: Clear visual feedback for interactive elements
- **Quick Navigation**: Jump to first/last page functionality
- **Bulk Actions**: Select multiple items across pages

### 7. Accessibility Design

#### Keyboard Navigation
- **Tab Order**: Logical tab sequence through pagination controls
- **Arrow Keys**: Navigate between page numbers
- **Enter/Space**: Activate page selection
- **Escape**: Cancel current operation

#### Screen Reader Support
```tsx
// Accessible pagination
<nav aria-label="Portfolio pagination">
  <button 
    aria-label="Go to previous page"
    disabled={!hasPrevious}
  >
    Previous
  </button>
  <span aria-label={`Page ${currentPage} of ${totalPages}`}>
    {currentPage} of {totalPages}
  </span>
  <button 
    aria-label="Go to next page"
    disabled={!hasNext}
  >
    Next
  </button>
</nav>
```

### 8. State Management Design

#### Pagination State
```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

#### URL State Synchronization
- **Browser History**: Pagination state reflected in URL
- **Bookmarkable**: Users can bookmark specific pages
- **Back/Forward**: Browser navigation works with pagination
- **Deep Linking**: Direct links to specific pages

### 9. Error Handling and Loading States

#### Loading Patterns
- **Skeleton Screens**: Show loading placeholders during data fetch
- **Progressive Loading**: Load data as user navigates
- **Error Boundaries**: Graceful error handling for pagination failures
- **Retry Mechanisms**: Automatic retry for failed requests

#### User Feedback
- **Loading Indicators**: Clear visual feedback during operations
- **Progress Tracking**: Show loading progress for large datasets
- **Error Messages**: Clear, actionable error messages
- **Success Feedback**: Confirmation of successful operations

### 10. Configuration and Customization

#### Flexible Configuration
```typescript
interface PaginationConfig {
  enablePagination: boolean;
  initialPageSize: number;
  pageSizeOptions: number[];
  enableVirtualScrolling: boolean;
  virtualScrollHeight: number;
  itemHeight: number;
  debounceMs: number;
}
```

#### Theme Integration
- **Consistent Styling**: Matches application design system
- **Color Scheme**: Respects light/dark mode preferences
- **Typography**: Consistent with application fonts
- **Spacing**: Follows design system spacing guidelines

## Implementation Guidelines

### Performance Considerations
1. **Measure First**: Profile performance before and after optimizations
2. **Progressive Enhancement**: Start with basic functionality, add optimizations
3. **User Experience**: Ensure optimizations don't degrade UX
4. **Testing**: Comprehensive testing across different data sizes

### Accessibility Requirements
1. **WCAG Compliance**: Meet WCAG 2.1 AA standards
2. **Keyboard Navigation**: Full keyboard support
3. **Screen Readers**: Proper ARIA labels and roles
4. **Touch Devices**: Touch-friendly controls

### Future Extensibility
1. **Plugin Architecture**: Easy to add new pagination strategies
2. **Custom Components**: Allow custom pagination components
3. **API Integration**: Flexible API integration patterns
4. **Analytics**: Built-in usage tracking and analytics
