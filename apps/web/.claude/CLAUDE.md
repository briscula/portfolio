# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation First

**⚠️ IMPORTANT**: Before implementing features or making architectural changes, **always check the `docs/` directory first**:

- **`docs/README.md`** - Start here for complete documentation navigation
- **`docs/architecture/`** - System architecture, tech stack, project structure
- **`docs/features/`** - Feature requirements, design patterns, implementation status
- **`docs/reports/`** - Performance optimization and technical analysis

The `docs/` directory contains comprehensive architecture documentation and feature specifications. Use it as the authoritative source for understanding the system.

## Quick Reference

### Development Commands

```bash
# Standard development (port 3001)
npm run dev

# Development with MSW API mocking
npm run dev:mock

# Testing
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage

# Build & Deploy
npm run build
npm start
npm run lint
```

### Environment Variables

Required in `.env.local`:
```
AUTH0_SECRET=            # Session encryption key (openssl rand -hex 32)
AUTH0_BASE_URL=          # App URL (http://localhost:3001 for dev)
AUTH0_ISSUER_BASE_URL=   # Auth0 tenant URL
AUTH0_CLIENT_ID=         # Auth0 client ID
AUTH0_CLIENT_SECRET=     # Auth0 client secret
NEXT_PUBLIC_API_BASE_URL=      # Backend API (optional, defaults to localhost:3000)
NEXT_PUBLIC_ENABLE_MSW=        # Enable MSW mocking (set to 'true')
```

## Critical Architectural Patterns

### Dual Authentication System

The app uses **two separate authentication layers**:

1. **Auth0** (`@auth0/nextjs-auth0`) - User authentication & session
   - Routes: `/api/auth/[...auth0]/`
   - Provides `UserProvider` and `useUser()` hook

2. **AuthContext** (`src/contexts/AuthContext.tsx`) - API access tokens
   - Fetches tokens from `/api/auth/token`
   - Provides `useAuth()` hook with `accessToken`
   - Auto-refreshes expired tokens

**Pattern**: Components use `useAuth()` to get `accessToken` for API calls, which is separate from Auth0's user session.

### Dual API Client System

Choose the correct client based on component type:

**Server Components / API Routes:**
```typescript
import { getPortfolios } from '@/lib/api';  // Uses Auth0's getAccessToken()
```

**Client Components:**
```typescript
import { useApiClient } from '@/lib/apiClient';  // Uses AuthContext's accessToken
const { apiClient } = useApiClient();
```

See `docs/architecture/system-architecture.md` for detailed API architecture.

### Mock Service Worker (MSW)

API mocking for development without backend:

- **Enable**: `NEXT_PUBLIC_ENABLE_MSW=true` or `npm run dev:mock`
- **Handlers**: `src/mocks/handlers.ts` - All endpoint mocks
- **Data**: `src/mocks/data/` - Mock datasets
- **Auto-initialization**: Starts in `RootLayoutClient` when enabled

### Internationalization (i18n)

Middleware-based routing (NOT i18next):

- **Locales**: `en` (default), `es`
- **URL pattern**: All routes prefixed → `/en/dashboard`, `/es/portfolio`
- **Middleware**: `src/middleware.ts` handles locale routing
- **Translations**: `src/lib/translations/`
- **Hook**: `useTranslation()` from `src/lib/hooks/useTranslation.ts`

**Note**: Root `/` redirects to `/en/`. Always use locale-prefixed routes.

## Path Aliases

TypeScript and Jest use `@/*` → `src/*`

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
```

## Testing

- **Framework**: Jest + React Testing Library
- **Location**: Co-located `__tests__/` directories
- **Config**: `jest.config.js` + `jest.setup.js`
- **Coverage**: Collected from `src/**/*.{js,jsx,ts,tsx}`

## Git Workflow

- **Main branch**: `main`
- **Feature branches**: `feat/*` prefix
- **Current branch**: `feat/mock-server`

## Important Notes

- **Port**: Dev server runs on `3001` (Auth0 URLs must match)
- **Hydration**: Uses `suppressHydrationWarning` for client/server differences
- **Default Locale**: Always `en` (no browser detection) to prevent hydration issues
- **ESLint**: Errors ignored during builds (`ignoreDuringBuilds: true`)
- **Server Components**: Default - only use `'use client'` when necessary
