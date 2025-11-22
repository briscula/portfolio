# Portfolio Monorepo - Claude Guide

This is a **Turborepo monorepo** containing a Next.js frontend and NestJS backend for portfolio management, with shared Prisma database schema and TypeScript configurations.

## 🏗️ Monorepo Structure

```
portfolio/
├── apps/
│   ├── web/              # Next.js 15 frontend (App Router)
│   └── api/              # NestJS backend API
├── packages/
│   ├── database/         # Shared Prisma schema & client
│   ├── shared/           # Shared utilities and types
│   ├── typescript-config/# Shared TypeScript configs
│   └── eslint-config/    # Shared ESLint configs
├── .env.example          # Environment variable template
├── package.json          # Root workspace config
├── pnpm-workspace.yaml   # pnpm workspace definition
└── turbo.json           # Turborepo pipeline config
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and other secrets

# 3. Generate Prisma client
pnpm db:generate

# 4. Run database migrations
pnpm db:migrate

# 5. (Optional) Seed database
pnpm --filter @repo/database db:seed

# 6. Start development servers
pnpm dev
```

## 📦 Common Commands

### Development
```bash
# Start all apps in development mode
pnpm dev

# Start specific app only
pnpm --filter @repo/web dev      # Frontend only
pnpm --filter @repo/api dev      # Backend only
```

### Building
```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm --filter @repo/web build
pnpm --filter @repo/api build
```

### Database (Prisma)
```bash
# Generate Prisma client (after schema changes)
pnpm db:generate

# Create and apply migration
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm --filter @repo/database db:seed
```

### Testing & Quality
```bash
# Run all tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

### Clean
```bash
# Clean all build artifacts and node_modules
pnpm clean
```

## 🔧 Package References

### Workspace Packages

All internal packages use `workspace:*` protocol:

```json
{
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/shared": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*"
  }
}
```

### Importing from Shared Packages

**Backend (NestJS)**:
```typescript
import { PrismaClient, Prisma, User, Portfolio } from '@repo/database';
```

**Frontend (Next.js)**:
```typescript
import type { Portfolio, Transaction } from '@repo/database';
```

## 🗄️ Database Management

### Single Source of Truth
- **Schema location**: `packages/database/prisma/schema.prisma`
- **Migrations**: `packages/database/prisma/migrations/`

### Important Notes
- ⚠️ Never create Prisma schema files in apps - use the shared package
- ⚠️ Always run `pnpm db:generate` after schema changes
- ⚠️ All apps import from `@repo/database`, never from `@prisma/client`

### Transaction Model Fields
The Transaction model uses **amount-based naming** (not cost-based):
- `amount` - The base transaction amount (quantity × price). Positive for BUY/DIVIDEND, negative for SELL
- `totalAmount` - The total transaction amount including fees and taxes (amount + commission + tax)
- `tax` - Tax paid for the transaction
- `taxPercentage` - Tax percentage applied
- `commission` - Commission/fees paid
- `reference` - Optional transaction reference ID

This naming convention is more semantically accurate across all transaction types (BUY, SELL, DIVIDEND, TAX, etc.).

### Running Prisma Commands

Use the `--filter` flag to target the database package:

```bash
# Generate client
pnpm --filter @repo/database db:generate

# Create migration
pnpm --filter @repo/database db:migrate

# Deploy migrations (production)
pnpm --filter @repo/database prisma migrate deploy

# Open Prisma Studio
pnpm --filter @repo/database db:studio
```

Or use root-level shortcuts:
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## 🌍 Environment Variables

### Structure
- **Root** `.env` - Shared variables (DATABASE_URL, Auth0 config)
- **Backend** `apps/api/.env` - Backend-specific overrides (optional)
- **Frontend** `apps/web/.env.local` - Frontend-specific variables

### Required Variables

See `.env.example` for the complete list. Key variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Auth0
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_AUDIENCE="https://your-api-identifier.com"

# Application
NODE_ENV="development"
PORT=3000
LOG_LEVEL="debug"
```

### Loading Order

The backend (`apps/api/src/main.ts`) loads `.env` files in this order:
1. `apps/api/.env`
2. `apps/.env`
3. Root `.env`
4. `packages/database/.env`

## 🏛️ Architecture Overview

### Backend API (NestJS)
- **Location**: `apps/api/`
- **Port**: 3000 (development)
- **Key Features**:
  - Multi-provider authentication (Auth0 + Email/Password)
  - Stock investment tracking
  - Transaction management (BUY, SELL, DIVIDEND, TAX, CASH_DEPOSIT, CASH_WITHDRAWAL)
  - Dividend analytics and reporting
  - Swagger documentation at `/api`

### Frontend Web (Next.js)
- **Location**: `apps/web/`
- **Port**: 3001 (development)
- **Framework**: Next.js 15 with App Router
- **Key Features**:
  - Portfolio dashboard
  - Transaction management UI
  - Dividend analytics visualizations
  - Auth0 authentication
  - Mock Service Worker (MSW) for development
  - i18n support (en, es)
- **Documentation**: See `apps/web/docs/` for architecture, features, and reports

## 🏛️ Architecture Decisions

### Why Turborepo?
- Incremental builds with caching
- Parallel task execution
- Shared pipeline configuration

### Why pnpm?
- Efficient disk space usage
- Fast installs
- Better monorepo support than npm/yarn

### Why Shared Prisma Package?
- Single source of truth for database schema
- Type safety across frontend and backend
- No schema duplication
- Easier to maintain and migrate

### Package Organization
- `apps/*` - Deployable applications (web, api)
- `packages/*` - Shared libraries and configurations

## 🚨 Common Issues

### Prisma Client Not Found
```bash
# Solution: Generate the client
pnpm db:generate
```

### Type Errors from @repo/database
```bash
# Solution: Ensure Prisma client is generated
pnpm db:generate
# Then rebuild
pnpm build
```

### Changes Not Picked Up
```bash
# Solution: Clear Turbo cache
rm -rf .turbo
pnpm build
```

### Port Conflicts
- Frontend runs on port 3001 by default
- Backend runs on port 3000/4000 (check apps/api/.env)

## 🔄 Git Workflow

### Branch Protection
- Pushes to `main` require specific branch naming
- Feature branches: Use `claude/*` prefix for Claude Code work
- Example: `claude/feature-name-sessionid`

### Commits
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature"

# Push to feature branch
git push origin claude/feature-name
```

## 🚀 Turborepo & Performance

### Turborepo Features Enabled
- ✅ Task pipeline with dependencies (`^build` = build dependencies first)
- ✅ Local caching (outputs cached in `.turbo/`)
- ✅ Parallel execution across packages
- ✅ Smart inputs for db:generate (only regenerates when schema changes)
- ✅ Environment variable awareness for builds

### Enable Remote Caching (Recommended)
For 10-50x faster deployments:
```bash
pnpm dlx turbo login
pnpm dlx turbo link
```

See `TURBOREPO_GUIDE.md` for complete optimization guide.

## 📦 Deployment

### Recommended: Separate Frontend & Backend
Deploy as two separate Vercel projects for:
- Independent scaling
- Faster deployments (only deploy what changed)
- Better resource usage
- Isolated failures

See `VERCEL_DEPLOYMENT.md` for complete deployment guide.

### Database Package Fix for Vercel
The `@repo/database` package uses bare imports (`.prisma/client`) that work correctly in both:
- **Development**: Via pnpm symlinks
- **Vercel**: Via `scripts/copy-workspace-deps.js` script that physically copies dependencies

## 📖 Additional Resources

See `.docs/` directory for comprehensive guides:

### Setup & Getting Started
- **Setup Guide**: `.docs/setup/SETUP.md` - Initial project setup
- **Turborepo Guide**: `.docs/setup/TURBOREPO_GUIDE.md` - Performance optimization

### Deployment
- **Vercel Deployment**: `.docs/deployment/VERCEL_DEPLOYMENT.md` - Recommended approach
- **Legacy Deployment**: `.docs/deployment/DEPLOYMENT.md` - Original deployment docs

### Archive
- **Migration History**: `.docs/archive/` - Monorepo migration documentation

## 💡 Development Tips

### Fast Feedback Loop
```bash
# Terminal 1: Frontend
pnpm --filter @repo/web dev

# Terminal 2: Backend
pnpm --filter @repo/api dev

# Terminal 3: Watch tests
pnpm --filter @repo/web test:watch
```

### Debugging
- Backend logs controlled by `LOG_LEVEL` env var
- Frontend: Use React DevTools and browser console
- Database: Use Prisma Studio (`pnpm db:studio`)

### Adding New Packages

**Internal Package**:
1. Create in `packages/your-package/`
2. Add `package.json` with `"name": "@repo/your-package"`
3. Reference with `"@repo/your-package": "workspace:*"` in apps

**External Package**:
```bash
# Install in specific app
pnpm --filter @repo/web add package-name

# Install in root (affects all)
pnpm add -w package-name
```

## 🔐 Authentication

### Backend Auth Strategy
- **Auth0 OAuth**: JWT validation using Auth0's JWKS (primary)
- **Email/Password**: Local JWT signing (planned)
- **Guard**: `UnifiedAuthGuard` in `apps/api/src/auth/`
- **User Object**: Contains `userId`, `email`, `provider`, `providerSub`, `scopes`

### Database Schema
- `User` table - Core user data (UUID-based)
- `UserAuthAccount` table - Provider-specific auth data (supports multiple providers per user)
- `AuthProvider` enum - `AUTH0` | `EMAIL_PASSWORD`

## ✅ Pre-commit Checklist

Before committing:
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Environment variables not committed
- [ ] No debugging code left in

---

**Latest Updates:**
- Transaction model uses `amount`/`totalAmount` (not `cost`/`netCost`)
- Database package fixed for Vercel deployment
- Turborepo optimizations enabled
- See `TURBOREPO_GUIDE.md` and `VERCEL_DEPLOYMENT.md` for deployment best practices
