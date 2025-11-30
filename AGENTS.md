# Agent Context and Guidelines

This document provides essential context and guidelines for AI agents (Claude, Gemini, etc.) working with this monorepo.

> **📚 Documentation Location**: All project documentation is located in the [`docs/`](./docs/) directory. Any newly created documentation should be placed there.

## Quick Reference

### Project Structure

This is a **Turborepo monorepo** with pnpm workspaces:

```
portfolio/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router)
│   └── api/          # NestJS backend API
├── packages/
│   ├── database/     # Prisma schema and client
│   ├── env/          # Zod-validated environment variables
│   ├── shared/       # Shared utilities
│   └── typescript-config/  # Shared TypeScript configs
└── docs/             # 📚 All documentation goes here
```

### Essential Documentation

The main entry point for all project documentation is the [**Documentation Index**](./docs/README.md).

From there, you can find detailed information on:
- **Setup & Deployment**: Get the project running locally or in production.
- **Architecture**: Understand the structure of the `web` and `api` apps.
- **Components & Features**: Deep-dive into specific parts of the applications.
- **Product Requirements**: Read the PRD for the API.
- **And more...**

## Development Commands

```bash
# Install dependencies
pnpm install

# Development (all apps)
pnpm dev

# Development (specific app)
pnpm --filter @repo/web dev
pnpm --filter @repo/api dev

# Build (all apps)
pnpm build

# Build (specific app)
pnpm --filter @repo/web build
pnpm --filter @repo/api build

# Database
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:studio

# Testing
pnpm test
pnpm typecheck
pnpm lint
```

## Technology Stack

### Frontend (`apps/web`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Auth0 (`@auth0/nextjs-auth0`)
- **State**: React Query (`@tanstack/react-query`)
- **i18n**: Custom middleware-based routing (en, es)
- **Testing**: Jest + React Testing Library
- **Mocking**: MSW (Mock Service Worker)

### Backend (`apps/api`)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth0 JWT validation
- **Validation**: Zod (via `nestjs-zod`)
- **API Docs**: Swagger/OpenAPI

### Shared Packages
- **`@repo/database`**: Prisma schema and generated client
- **`@repo/env`**: Zod-validated environment variables
- **`@repo/shared`**: Shared utilities and types
- **`@repo/typescript-config`**: Shared TypeScript configurations

## Critical Guidelines

### 1. Environment Variables

**Use the `@repo/env` package** for type-safe environment variables:

```typescript
// ✅ Correct (type-safe, validated)
import { webEnv } from '@repo/env';
const apiUrl = webEnv.NEXT_PUBLIC_API_URL;

// ❌ Avoid (unsafe)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

See [packages/env/README.md](./packages/env/README.md) for details.

### 2. Validation

**Use Zod schemas** for all validation:
- API DTOs: `apps/api/src/common/schemas/`
- Environment variables: `packages/env/src/`

### 3. Database

**Always use Prisma** for database access:
```typescript
import { prisma } from '@repo/database';
```

**Never run migrations without confirmation**. Migrations affect production data.

### 4. Documentation

**All new documentation must go in `docs/`**:
- Architecture docs → `docs/architecture/`
- Feature specs → `docs/features/`
- Guides → `docs/` (root level)

**Update this file (AGENTS.md)** when adding new important documentation.

### 5. Deployment

- **Frontend**: Vercel (from `apps/web`)
- **Backend**: Vercel (from `apps/api`)
- **Database**: External PostgreSQL

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for deployment instructions.

## Common Patterns

### Frontend Patterns

**Dual Authentication System**:
1. Auth0 session (user authentication)
2. AuthContext (API access tokens)

```typescript
// For user info
import { useUser } from '@auth0/nextjs-auth0/client';

// For API calls
import { useAuth } from '@/contexts/AuthContext';
const { accessToken } = useAuth();
```

**API Clients**:
- Server Components: `import { getPortfolios } from '@/lib/api'`
- Client Components: `import { useApiClient } from '@/lib/apiClient'`

**Internationalization**:
- All routes are locale-prefixed: `/en/dashboard`, `/es/portfolio`
- Use `useTranslation()` hook for translations

### Backend Patterns

**Module Structure**:
- AuthModule - Multi-provider authentication (Auth0 + Email/Password)
- UsersModule - User management
- PortfoliosModule - Portfolio CRUD
- TransactionsModule - Transaction management (BUY, SELL, DIVIDEND, TAX, SPLIT)
- PositionsModule - Portfolio position tracking
- DividendAnalyticsModule - Dividend analysis and reporting

**Validation with Zod**:
```typescript
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
// DTOs are Zod schemas wrapped with createZodDto()
```

**Authentication**:
```typescript
@UseGuards(UnifiedAuthGuard)  // Currently validates Auth0 tokens only
@ApiBearerAuth('JWT-auth')
```

**Database Models**:
- User IDs are UUIDs (not integers)
- `UserPosition` is a materialized view for optimized position queries
- Transaction types: BUY, SELL, DIVIDEND, TAX, SPLIT

**API Documentation**:
- Swagger UI available at `/api` endpoint
- Bearer auth configured for JWT tokens

## App-Specific Guidelines

### Frontend (`apps/web`)

**Dual Authentication System**:
1. Auth0 (`@auth0/nextjs-auth0`) - User authentication & session
2. AuthContext (`src/contexts/AuthContext.tsx`) - API access tokens

**API Clients**:
- Server Components: `import { getPortfolios } from '@/lib/api'`
- Client Components: `import { useApiClient } from '@/lib/apiClient'`

**Internationalization**:
- All routes are locale-prefixed: `/en/dashboard`, `/es/portfolio`
- Use `useTranslation()` hook for translations
- Middleware: `src/middleware.ts`

**Mock Service Worker**:
- Enable: `NEXT_PUBLIC_ENABLE_MSW=true` or `npm run dev:mock`
- Handlers: `src/mocks/handlers.ts`

### Backend (`apps/api`)

**Development Commands**:
```bash
pnpm --filter @repo/api start:dev  # Watch mode
pnpm --filter @repo/database db:migrate dev  # Create migration
pnpm --filter @repo/database db:studio  # Prisma Studio UI
```

**Testing Protected Endpoints**:
- Use Swagger UI at `/api`
- Or curl with Bearer token

**CORS Configuration**:
- Configured in `src/main.ts`
- Allows localhost ports and production domains
- Credentials enabled

## Critical Rules

### ❌ Never Do This
- Commit `.env` files with secrets
- Run database migrations without confirmation
- Use `process.env` directly (use `@repo/env` instead)
- Create documentation outside `docs/` folder
- Modify Prisma schema without migrations

### ✅ Always Do This
- Use Zod for validation
- Use `@repo/env` for environment variables
- Test builds after major changes
- Document architectural decisions in `docs/`
- Ask for confirmation before destructive operations

## Getting Help

1. **Check `docs/` first** for existing documentation
2. **Review migration history**: [docs/archive/MONOREPO_MIGRATION_GUIDE.md](./docs/archive/MONOREPO_MIGRATION_GUIDE.md)

## Recent Improvements

- ✅ Integrated Zod validation for API (replacing class-validator)
- ✅ Created `@repo/env` package for type-safe environment variables
- ✅ Configured Vercel deployment for frontend
- ✅ Organized documentation into `docs/` folder

---

**Last Updated**: 2025-11-29

**Note to Agents**: This file serves as the primary context document. Always refer to `docs/` for detailed documentation. When creating new documentation, place it in the appropriate `docs/` subdirectory and update this file's reference section.
