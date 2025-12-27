# Portfolio Table Components Guide

**Last Updated:** 2025-10-22
**Status:** Current as of codebase cleanup session

---

## Overview

The portfolio tracking application has **4 main table components** for displaying portfolio data. This guide explains when to use each component and their relationships.

---

## Component Hierarchy

```
ResponsivePortfolioTable (Adaptive Wrapper)
    ├── PortfolioTable (Desktop/Tablet)
    │   └── PortfolioRow
    │       └── useDropdownManager
    ├── EnhancedPortfolioTable (Desktop with Features)
    │   ├── OptimizedPortfolioRow
    │   │   └── useDropdownManager
    │   ├── Pagination
    │   └── VirtualScrollTable
    └── PortfolioTableMobile (Mobile Card View)
        └── PortfolioCard
```

---

## Components

### 1. **PortfolioTable** (Base Table)

**File:** `src/components/PortfolioTable.tsx`

**Purpose:** Simple, lightweight table for desktop and tablet views.

**Features:**

- ✅ Sortable columns
- ✅ Mobile dropdown menu
- ✅ Desktop action buttons
- ✅ Responsive column hiding
- ✅ Empty state
- ✅ Uses `useDropdownManager` hook

**When to Use:**

- Simple portfolio lists without pagination
- When you need basic sorting functionality
- Smaller datasets (< 50 portfolios)

**Props:**

```typescript
interface PortfolioTableProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onSort: (field: SortField, direction: SortDirection) => void;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
}
```

**Example Usage:**

```tsx
<PortfolioTable
  portfolios={portfolios}
  loading={loading}
  onSort={handleSort}
  onEdit={handleEdit}
  onViewDividends={handleViewDividends}
  sortField="value"
  sortDirection="desc"
/>
```

---

### 2. **EnhancedPortfolioTable** (Feature-Rich)

**File:** `src/components/EnhancedPortfolioTable.tsx`

**Purpose:** Advanced table with pagination, virtual scrolling, and performance optimizations.

**Features:**

- ✅ All PortfolioTable features
- ✅ **Pagination** (optional)
- ✅ **Virtual scrolling** (optional)
- ✅ Debounced sorting
- ✅ Skeleton loading states
- ✅ Uses `OptimizedPortfolioRow` (React.memo)
- ✅ Performance optimized for large datasets

**When to Use:**

- Large datasets (50+ portfolios)
- When you need pagination
- When you need virtual scrolling for performance
- Production dashboards with many portfolios

**Props:**

```typescript
interface EnhancedPortfolioTableProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onSort?: (field: SortField, direction: SortDirection) => void;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  enablePagination?: boolean; // Default: false
  enableVirtualScrolling?: boolean; // Default: false
  initialPageSize?: number; // Default: 25
  virtualScrollHeight?: number; // Default: 600
  className?: string;
}
```

**Example Usage:**

```tsx
<EnhancedPortfolioTable
  portfolios={portfolios}
  loading={loading}
  onEdit={handleEdit}
  onViewDividends={handleViewDividends}
  enablePagination={true}
  initialPageSize={25}
  sortField="value"
  sortDirection="desc"
/>
```

---

### 3. **PortfolioTableMobile** (Mobile Card View)

**File:** `src/components/PortfolioTableMobile.tsx`

**Purpose:** Mobile-optimized card layout for small screens.

**Features:**

- ✅ Card-based layout
- ✅ Touch-optimized (44px minimum targets)
- ✅ Compact information display
- ✅ Action buttons in each card
- ✅ Empty state

**When to Use:**

- Mobile devices (< 768px)
- Touch interfaces
- **Usually used via `ResponsivePortfolioTable`**

**Props:**

```typescript
interface PortfolioTableMobileProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends: (portfolioId: string) => void;
}
```

**Example Usage:**

```tsx
<PortfolioTableMobile
  portfolios={portfolios}
  loading={loading}
  onEdit={handleEdit}
  onViewDividends={handleViewDividends}
/>
```

---

### 4. **ResponsivePortfolioTable** (Adaptive Wrapper)

**File:** `src/components/ResponsivePortfolioTable.tsx`

**Purpose:** Automatic responsive switching between desktop and mobile views.

**Features:**

- ✅ Automatically detects screen size
- ✅ Uses `useResponsive()` hook
- ✅ Switches between:
  - **Desktop (≥1024px):** `EnhancedPortfolioTable`
  - **Tablet (768-1023px):** `PortfolioTable`
  - **Mobile (<768px):** `PortfolioTableMobile`
- ✅ Unified API for all views
- ✅ State management for sorting

**When to Use:**

- **RECOMMENDED for most use cases**
- When you need full responsive support
- When you want automatic view switching
- Production pages that need to work on all devices

**Props:**

```typescript
interface ResponsivePortfolioTableProps {
  portfolios: PortfolioWithMetrics[];
  loading: boolean;
  onEdit: (portfolio: PortfolioWithMetrics) => void;
  onViewDividends?: (portfolioId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  initialSortField?: SortField;
  initialSortDirection?: SortDirection;
  enablePagination?: boolean;
  enableVirtualScrolling?: boolean;
  initialPageSize?: number;
}
```

**Example Usage:**

```tsx
<ResponsivePortfolioTable
  portfolios={portfolios}
  loading={loading}
  onEdit={handleEdit}
  onViewDividends={handleViewDividends}
  enablePagination={true}
  initialSortField="value"
  initialSortDirection="desc"
/>
```

---

## Decision Tree

**Which component should I use?**

```
START
  │
  ├─ Need responsive (mobile + desktop)?
  │  └─ YES → Use ResponsivePortfolioTable ✅ (RECOMMENDED)
  │
  ├─ Large dataset (50+ items)?
  │  └─ YES → Use EnhancedPortfolioTable
  │      ├─ enablePagination={true}
  │      └─ OR enableVirtualScrolling={true}
  │
  ├─ Mobile only?
  │  └─ YES → Use PortfolioTableMobile
  │
  └─ Simple desktop table?
     └─ YES → Use PortfolioTable
```

---

## Supporting Components

### **OptimizedPortfolioRow**

**File:** `src/components/OptimizedPortfolioRow.tsx`

- Used by `EnhancedPortfolioTable`
- Optimized with `React.memo`
- Supports selection and column visibility
- Custom comparison function prevents unnecessary re-renders

### **PortfolioRow** (Internal)

**File:** Inside `PortfolioTable.tsx`

- Used by `PortfolioTable`
- Simpler than OptimizedPortfolioRow
- Uses `useDropdownManager` hook

---

## Common Patterns

### 1. **Simple Dashboard**

```tsx
<ResponsivePortfolioTable
  portfolios={portfolios}
  loading={loading}
  onEdit={handleEdit}
  onViewDividends={handleViewDividends}
/>
```

### 2. **Paginated Portfolio List**

```tsx
<ResponsivePortfolioTable
  portfolios={portfolios}
  loading={loading}
  onEdit={handleEdit}
  onViewDividends={handleViewDividends}
  enablePagination={true}
  initialPageSize={25}
/>
```

### 3. **High-Performance Large Dataset**

```tsx
<EnhancedPortfolioTable
  portfolios={portfolios}
  loading={loading}
  onEdit={handleEdit}
  onViewDividends={handleViewDividends}
  enableVirtualScrolling={true}
  virtualScrollHeight={800}
/>
```

---

## Related Hooks

- **`useDropdownManager`** - Dropdown state and keyboard navigation
- **`usePagination`** - Pagination logic
- **`useDebouncedSort`** - Debounced sorting for performance
- **`useResponsive`** - Breakpoint detection

---

## Migration Notes

**If you're using an old component:**

- **`SelectablePortfolioRow`** → Removed (consolidated into `OptimizedPortfolioRow`)
- **`AdvancedPortfolioTable`** → Removed (use `EnhancedPortfolioTable`)
- **Demo components** → Removed from production

---

## Performance Tips

1. **For < 50 portfolios:** Use `PortfolioTable` or `ResponsivePortfolioTable`
2. **For 50-200 portfolios:** Use `EnhancedPortfolioTable` with `enablePagination={true}`
3. **For 200+ portfolios:** Use `EnhancedPortfolioTable` with `enableVirtualScrolling={true}`
4. **Always use `ResponsivePortfolioTable`** for production pages that need mobile support

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│           ResponsivePortfolioTable                  │
│         (Recommended Entry Point)                   │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
    Desktop    Tablet    Mobile
   (≥1024px) (768-1023) (<768px)
        │         │         │
        │         │         │
   Enhanced   Portfolio  TableMobile
    Table      Table      (Cards)
        │         │
        │         │
   Optimized  PortfolioRow
     Row    (w/ dropdown)
```

---

## See Also

- [System Architecture](../architecture/system-architecture.md)
- [Accessibility Features](../features/accessibility/)
- [Pagination Implementation](../features/pagination/)
