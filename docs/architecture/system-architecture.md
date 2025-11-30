# 🏗️ Portfolio Application - Architecture Guide

This document provides a comprehensive architecture overview for engineers joining the dividend portfolio tracking application project.

## 📋 Overview

This is a **dividend portfolio tracking application** built with modern web technologies. Users can authenticate via Auth0, create multiple investment portfolios, track stock positions, record transactions, and visualize dividend income over time.

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** with App Router (React 19)
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Authentication & APIs
- **Auth0** (`@auth0/nextjs-auth0`) for authentication
- REST API integration with JWT bearer tokens
- API Base URL: `http://localhost:3000` (configurable via env)

### Data Visualization
- **@nivo/bar** and **recharts** for dividend charts

### Testing
- **Jest** with React Testing Library
- **jest-axe** for accessibility testing
- Configuration: `jest.config.js`, `jest.setup.js`

### Development Tools
- ESLint for code quality
- Next.js Turbopack for faster dev builds (port 3001)

---

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/            # Internationalized routes
│   │   │   ├── dashboard/       # Main dashboard page
│   │   │   ├── portfolio/       # Portfolio views
│   │   │   │   └── [portfolioId]/  # Individual portfolio
│   │   │   ├── dividends/       # Dividend tracking
│   │   │   ├── login/           # Login page
│   │   │   └── settings/        # User settings
│   │   ├── api/                 # API routes
│   │   │   └── auth/            # Auth0 endpoints
│   │   ├── components/          # Layout components
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Root redirect
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   ├── AppLayout.tsx        # Main app layout
│   │   ├── Header.tsx           # Top navigation
│   │   ├── Sidebar.tsx          # Side navigation
│   │   ├── PortfolioTable.tsx   # Portfolio display
│   │   └── __tests__/           # Component tests
│   │
│   ├── contexts/                # React Context providers
│   │   └── AuthContext.tsx      # Auth state management
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── usePortfolio.ts      # Portfolio data fetching
│   │   ├── useTransactions.ts   # Transaction data
│   │   ├── usePagination.ts     # Pagination logic
│   │   └── __tests__/           # Hook tests
│   │
│   ├── lib/                     # Utilities and helpers
│   │   ├── api.ts               # Server-side API functions
│   │   ├── apiClient.ts         # Client-side API class
│   │   ├── translations/        # i18n JSON files
│   │   ├── hooks/               # Translation hook
│   │   └── utils.ts             # Helper functions
│   │
│   └── middleware.ts            # Next.js middleware (locale handling)
│
├── public/                      # Static assets
├── scripts/                     # Build/utility scripts
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config files
```

---

## 🔐 Authentication Architecture

### Flow
1. **User visits the app** → Middleware checks authentication
2. **Not authenticated** → Redirects to `/api/auth/login` (Auth0 Universal Login)
3. **Auth0 callback** → Returns user to app with session
4. **Token management** → AuthContext fetches and manages access tokens

### Key Components

**AuthContext** (`src/contexts/AuthContext.tsx`):
- Wraps the entire app (via `RootLayoutClient`)
- Manages access token state
- Handles token refresh automatically
- Shows loading/error states
- Auto-redirects on authentication failure

**API Routes** (`src/app/api/auth/`):
- `[...auth0]/route.ts` - Main Auth0 handler (login, logout, callback)
- `token/route.ts` - Access token endpoint for API calls
- `direct-token/route.ts` - Alternative token endpoint

**Usage Pattern**:
```typescript
// In components
const { user, isLoading } = useUser();
const { accessToken, isAuthenticated, refreshToken } = useAuth();

// In API calls
const { apiClient, isLoading, isAuthenticated } = useApiClient();
```

---

## 🌍 Internationalization (i18n)

### Implementation
- **Supported locales**: English (`en`), Spanish (`es`)
- **Route structure**: `/[locale]/dashboard`, `/[locale]/portfolio`, etc.
- **Middleware** (`src/middleware.ts`): Automatically redirects to locale-prefixed URLs
- **Translations**: JSON files in `src/lib/translations/` (en.json, es.json)
- **Custom hook**: `useTranslation()` for accessing translations

### How It Works
1. Root page (`src/app/page.tsx`) detects browser language
2. Redirects to appropriate locale (e.g., `/es/dashboard` or `/en/dashboard`)
3. Middleware ensures all routes have a locale prefix
4. Components use `useTranslation()` to get localized strings

---

## 🔄 Data Flow & State Management

### Architecture Pattern: **Centralized API Client + Custom Hooks**

```
User Action
    ↓
Component/Hook
    ↓
useApiClient() → ApiClient (with auth token)
    ↓
Backend API (authenticated with JWT)
    ↓
Response processed by hook
    ↓
State updated in component
```

### API Layer Structure

**1. ApiClient Class** (`src/lib/apiClient.ts`):
- Singleton instance managing all API calls
- Automatic token injection
- Built-in token refresh on 401 errors
- Methods: `getPortfolios()`, `getPositions()`, `getTransactions()`, etc.

**2. useApiClient Hook**:
- Connects ApiClient to AuthContext
- Automatically updates token when auth state changes
- Returns authenticated client instance

**3. Domain-Specific Hooks** (`src/hooks/`):
- `usePortfolios()` - Fetch all portfolios
- `usePortfolio(id)` - Fetch single portfolio
- `usePositions(portfolioId)` - Fetch positions with pagination
- `useTransactions()` - Fetch recent transactions
- `useAddTransaction()` - Create new transactions

**4. Legacy API Functions** (`src/lib/api.ts`):
- Server-side functions using `getAccessToken()` from Auth0
- Contains type definitions (Transaction, TransactionType)
- All legacy API namespaces have been migrated to ApiClient

### State Management
- **No Redux/Zustand** - Using React Context + Hooks
- **AuthContext**: Global authentication state
- **Component-level state**: Using useState/useEffect
- **Server state caching**: Hooks handle loading/error/refetch logic

---

## 🎨 Component Architecture

### Layout Hierarchy
```
RootLayout (app/layout.tsx)
  └── RootLayoutClient
      └── AuthProvider (AuthContext)
          └── [locale] Layout (app/[locale]/layout.tsx)
              └── AppLayout
                  ├── Header (with user menu)
                  ├── Sidebar (with navigation)
                  └── Page Content
```

### Component Categories

**1. Layout Components**:
- `AppLayout` - Main app shell (header + sidebar + content)
- `Header` - Top bar with user menu and mobile toggle
- `Sidebar` - Navigation menu

**2. Page Components** (in `app/[locale]/`):
- `dashboard/page.tsx` - Main dashboard with portfolio list
- `portfolio/[portfolioId]/page.tsx` - Individual portfolio view
- `dividends/[id]/page.tsx` - Dividend details

**3. UI Components** (`components/ui/`):
- `Button`, `Input`, `Card` - Base components
- `ActivityList` - Recent transactions display
- `MetricCard` - Summary statistics display
- `Pagination` - Table pagination controls
- `DividendCalendar` - Calendar view for dividends
- `VirtualScrollTable` - Performance-optimized tables

**4. Feature Components** (`components/`):
- `PortfolioTable` - Main portfolio data table
- `EnhancedPortfolioTable` - Advanced table with sorting/filtering
- `AddPositionModal` - Transaction creation modal
- `DividendProgressView` - Dividend visualization

### Component Patterns

**Client vs Server Components**:
- All components with hooks/state use `'use client'` directive
- API routes are server-side by default
- Layout components are mostly client-side for interactivity

**Error Handling**:
- `ErrorBoundary` component wraps pages
- `ErrorHandlerProvider` for global error context
- `ErrorNotifications` for user-facing error messages

**Responsive Design**:
- Mobile-first Tailwind classes
- `useResponsive()` hook for JS-based responsive logic
- Sidebar collapses on mobile with overlay

---

## 🧪 Testing Strategy

### Test Files Location
- Component tests: `src/components/__tests__/`
- Hook tests: `src/hooks/__tests__/`
- Utility tests: `src/lib/__tests__/`

### Testing Libraries
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **jest-axe** - Accessibility testing
- **@testing-library/user-event** - User interaction simulation

### Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Example Tests
- `AccessibilityFeatures.test.tsx` - WCAG compliance
- `EnhancedPortfolioTable.test.tsx` - Table functionality
- `usePagination.test.ts` - Hook logic
- `portfolio-metrics.test.ts` - Calculation accuracy

---

## 🚀 Development Setup

### Environment Variables (`.env.local`)
```env
AUTH0_SECRET='your-secret-key'
AUTH0_BASE_URL='http://localhost:3001'
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
AUTH0_AUDIENCE='your-api-audience'
NEXT_PUBLIC_API_BASE_URL='http://localhost:3000'
```

### Commands
```bash
npm install           # Install dependencies
npm run dev           # Start dev server (port 3001)
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
```

### Key Configuration Files
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript settings (ES2017 target)
- `eslint.config.mjs` - Linting rules
- `postcss.config.mjs` - PostCSS/Tailwind config
- `jest.config.js` - Test configuration

---

## 🎯 Key Patterns & Conventions

### 1. **No Code Comments Policy**
- Code should be self-documenting
- Only copy existing comments when modifying code
- Use meaningful variable/function names instead

### 2. **Pagination Pattern**
```typescript
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```
- Used consistently across all list endpoints
- Hooks return `pagination` object and `fetchPage()` function

### 3. **Loading States**
- Always show loading skeletons during data fetch
- Consistent loading UI across components
- Example: Pulse animation on gray rectangles

### 4. **Error Handling**
- Try-catch in all async functions
- User-friendly error messages
- Automatic Auth0 redirect on 401 errors

### 5. **Type Safety**
- Strict TypeScript mode enabled
- Interfaces defined for all API responses
- No `any` types (use `unknown` if needed)

---

## 📊 Data Models

### Portfolio
```typescript
{
  id: string;
  userId: string;
  name: string;
  description: string | null;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}
```

### Position
```typescript
{
  portfolioId: string;
  stockSymbol: string;
  companyName: string;
  currentQuantity: number;
  totalCost: number;
  totalDividends: number;
  portfolioPercentage: number;
  // ... calculated fields
}
```

### Transaction
```typescript
{
  id: number;
  portfolioId: string;
  stockSymbol: string;
  type: 'DIVIDEND' | 'BUY' | 'SELL' | 'TAX' | 'SPLIT';
  quantity: number;
  cost: number;
  createdAt: string;
}
```

---

## 🔍 Notable Implementation Details

### 1. **Auth Token Flow**
- Tokens fetched client-side via `/api/auth/token`
- Stored in AuthContext state (not localStorage)
- Automatically refresh on 401 responses
- Session expiry shows modal overlay before redirect

### 2. **Locale Detection**
- Server-side: Uses `Accept-Language` header
- Default: English (`en`)
- Consistent across SSR/CSR to avoid hydration mismatches

### 3. **API Client Retry Logic**
- Single automatic retry on 401 error
- Attempts token refresh before retry
- Falls back to login redirect if refresh fails

### 4. **Virtual Scrolling**
- `VirtualScrollTable` component for large datasets
- Improves performance with 1000+ rows
- Only renders visible rows in viewport

### 5. **Accessibility**
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader optimizations
- Tested with jest-axe

---

## 🎓 Getting Started as a New Engineer

1. **Clone and setup**:
   ```bash
   git clone https://github.com/your-org/your-repo.git   # TODO: Update with actual repository URL
   cd your-repo
   npm install
   ```

2. **Configure Auth0** (see README.md for detailed steps)

3. **Start exploring**:
   - Dashboard page: `src/app/[locale]/dashboard/page.tsx`
   - Auth flow: `src/contexts/AuthContext.tsx`
   - API calls: `src/lib/apiClient.ts`
   - Main layout: `src/components/AppLayout.tsx`

4. **Common tasks**:
   - Adding a new page → Create in `src/app/[locale]/your-page/page.tsx`
   - New API endpoint → Add method to `ApiClient` class
   - New component → Create in `src/components/` with tests
   - Translations → Update `en.json` and `es.json`

5. **Testing your changes**:
   ```bash
   npm run lint      # Check code quality
   npm test          # Run test suite
   npm run dev       # Test in browser
   ```

---

## 📚 Additional Resources

- **Implementation Docs** in repo:
  - `ACCESSIBILITY_IMPLEMENTATION.md` - A11y features
  - `ACCESSIBILITY_TASK_SUMMARY.md` - A11y tasks completed
  - `PAGINATION_IMPLEMENTATION_SUMMARY.md` - Pagination details

- **External Docs**:
  - [Next.js 15 Documentation](https://nextjs.org/docs)
  - [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
  - [Tailwind CSS](https://tailwindcss.com/docs)

---

**Document maintained by**: Engineering Team  
**Last updated**: October 2025
