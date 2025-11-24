# Portfolio Monorepo - Complete Documentation Index

**Central documentation hub for all AI agents and developers.**

This is a **Turborepo monorepo** with a Next.js frontend and NestJS backend for portfolio management.

---

## 🚀 Quick Start (New Developers & AI Agents)

**Start here in this order:**

1. **Project Overview** → This file (you're reading it!)
2. **Setup** → [`.docs/setup/SETUP.md`](.docs/setup/SETUP.md)
3. **Development Guidelines** → See sections below
4. **Architecture** → See "Core Concepts" section

---

## 📁 Monorepo Structure

```
portfolio/
├── apps/
│   ├── web/              # Next.js 15 frontend (port 3001)
│   │   └── docs/         # Frontend-specific architecture docs
│   └── api/              # NestJS backend (port 3000)
├── packages/
│   ├── database/         # Shared Prisma schema & client
│   ├── shared/           # Shared utilities and types
│   ├── typescript-config/# Shared TypeScript configs
│   └── eslint-config/    # Shared ESLint configs
├── .docs/                # AI-generated documentation (this directory)
├── .claude/              # Claude Code specific settings
├── .gemini/              # Gemini Code Assist settings
└── AGENTS.md             # Instructions for all AI agents
```

---

## 🎯 Core Concepts

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Auth0 authentication
- Mock Service Worker (MSW) for dev
- i18n (en, es)

**Backend:**
- NestJS (Node.js framework)
- Prisma ORM
- PostgreSQL (Neon)
- Auth0 + Email/Password auth
- Swagger documentation

**Infrastructure:**
- Turborepo (monorepo orchestration)
- pnpm (package manager)
- Vercel (deployment)

### Architecture Decisions

**Why Turborepo?**
- Incremental builds with caching
- Parallel task execution
- Remote caching for 10-50x faster deployments

**Why pnpm?**
- Efficient disk space usage
- Fast installs
- Better monorepo support

**Why Shared Prisma Package?**
- Single source of truth for database schema
- Type safety across frontend and backend
- No schema duplication

---

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
# Build all apps and packages (only rebuilds what changed)
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
pnpm test           # Run all tests
pnpm typecheck      # Type checking
pnpm lint           # Linting
pnpm format         # Format code
```

---

## 🗄️ Database Schema

### Location & Management
- **Schema**: `packages/database/prisma/schema.prisma`
- **Migrations**: `packages/database/prisma/migrations/`
- **Import**: Always use `@repo/database`, never `@prisma/client`

### Transaction Model (IMPORTANT)
The Transaction model uses **amount-based naming**:
- `amount` - Base transaction amount (quantity × price). Positive for BUY/DIVIDEND, negative for SELL
- `totalAmount` - Total including fees/taxes (amount + commission + tax)
- `tax`, `taxPercentage`, `commission`, `reference`

**Why "amount" not "cost"?**
- More semantically accurate across all transaction types
- Works for BUY, SELL, DIVIDEND, TAX, CASH_DEPOSIT, CASH_WITHDRAWAL
- Sign indicates direction (positive = money out, negative = money in)

### Key Models
```
User (UUID-based)
├── Portfolio (1:N)
│   └── Transaction (1:N)
│       └── Stock
└── UserAuthAccount (1:N) - Multi-provider auth
```

### Running Prisma Commands
```bash
# Always target the database package
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:migrate

# Or use root shortcuts
pnpm db:generate
pnpm db:migrate
```

---

## 🔐 Authentication

### Backend (NestJS)
- **Auth0 OAuth**: JWT validation via JWKS (primary)
- **Email/Password**: Local JWT signing (planned)
- **Guard**: `UnifiedAuthGuard` in `apps/api/src/auth/`
- **User Object**: `{ userId, email, provider, providerSub, scopes }`

### Frontend (Next.js)
- **Dual auth system**:
  1. Auth0 SDK (`@auth0/nextjs-auth0`) - User sessions
  2. AuthContext - API access tokens
- **Routes**: `/api/auth/[...auth0]/`
- **Hooks**: `useUser()` and `useAuth()`

### Database Schema
- `User` - Core user data (UUID)
- `UserAuthAccount` - Provider-specific auth (supports multiple per user)
- `AuthProvider` enum - `AUTH0` | `EMAIL_PASSWORD`

---

## 🏗️ Application Architecture

### Backend API (apps/api/)
- **Framework**: NestJS
- **Port**: 3000
- **Features**:
  - Stock investment tracking
  - Transaction management (BUY, SELL, DIVIDEND, etc.)
  - Dividend analytics
  - Swagger docs at `/api`
- **Key Modules**:
  - `AuthModule`, `UsersModule`, `PortfoliosModule`
  - `TransactionsModule`, `PositionsModule`, `DividendAnalyticsModule`

### Frontend Web (apps/web/)
- **Framework**: Next.js 15 (App Router)
- **Port**: 3001
- **Features**:
  - Portfolio dashboard
  - Transaction management UI
  - Dividend analytics visualizations
  - MSW for API mocking in dev
  - i18n support (en, es)
- **Detailed Docs**: `apps/web/docs/` (architecture, features, reports)

---

## 🌍 Environment Variables

### Structure
- **Root `.env`**: Shared variables (DATABASE_URL, Auth0)
- **Backend `apps/api/.env`**: Backend-specific (optional)
- **Frontend `apps/web/.env.local`**: Frontend-specific

### Required Variables
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

See `.env.example` for complete list.

---

## 🚀 Turborepo & Performance

### Features Enabled
- ✅ Task pipeline with dependencies
- ✅ Local caching (`.turbo/`)
- ✅ Parallel execution
- ✅ Smart inputs (db:generate only runs when schema changes)
- ✅ Environment variable awareness

### Enable Remote Caching (10-50x faster deployments!)
```bash
pnpm dlx turbo login
pnpm dlx turbo link
```

**See**: [`.docs/setup/TURBOREPO_GUIDE.md`](setup/TURBOREPO_GUIDE.md) for complete optimization guide.

---

## 📦 Deployment

### Recommended: Separate Frontend & Backend

Deploy as **two separate Vercel projects**:
- **Benefits**: Independent scaling, faster deployments, better resource usage
- **Guide**: [`.docs/deployment/VERCEL_DEPLOYMENT.md`](deployment/VERCEL_DEPLOYMENT.md)

### Database Package & Vercel
The `@repo/database` package uses bare imports (`.prisma/client`) that work in both:
- **Development**: Via pnpm symlinks
- **Vercel**: Via `scripts/copy-workspace-deps.js` (physically copies dependencies)

---

## 🔧 Package Management

### Workspace Packages
All internal packages use `workspace:*`:
```json
{
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/shared": "workspace:*"
  }
}
```

### Importing
**Backend (NestJS)**:
```typescript
import { PrismaClient, Prisma, User, Portfolio } from '@repo/database';
```

**Frontend (Next.js)**:
```typescript
import type { Portfolio, Transaction } from '@repo/database';
```

### Adding Packages
```bash
# Install in specific app
pnpm --filter @repo/web add package-name

# Install in root (affects all)
pnpm add -w package-name
```

---

## 🚨 Common Issues & Solutions

### Prisma Client Not Found
```bash
pnpm db:generate
```

### Type Errors from @repo/database
```bash
pnpm db:generate
pnpm build
```

### Changes Not Picked Up (Turborepo cache)
```bash
rm -rf .turbo
pnpm build
```

### Port Conflicts
- Frontend: 3001
- Backend: 3000 (or 4000, check `apps/api/.env`)

---

## 🔄 Git Workflow

### Branches
- **Main branch**: `main`
- **Feature branches**: `feature/*` or `claude/*` (for Claude Code)

### Commits
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-branch
```

---

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
- **Backend**: Logs controlled by `LOG_LEVEL` env var
- **Frontend**: React DevTools + browser console
- **Database**: Prisma Studio (`pnpm db:studio`)

---

## ✅ Pre-commit Checklist

Before committing:
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Environment variables not committed
- [ ] No debugging code left in

---

## 📖 Complete Documentation Map

### For AI Agents
- **This file** - Complete project reference
- **`AGENTS.md`** (root) - Instructions for all AI agents
- **`.claude/CLAUDE.md`** - Claude Code specific
- **`.gemini/GEMINI.md`** - Gemini Code Assist specific

### Setup & Onboarding
- **[`setup/SETUP.md`](setup/SETUP.md)** - Initial project setup
- **[`setup/TURBOREPO_GUIDE.md`](setup/TURBOREPO_GUIDE.md)** - Performance optimization

### Deployment
- **[`deployment/VERCEL_DEPLOYMENT.md`](deployment/VERCEL_DEPLOYMENT.md)** - Recommended deployment (separate frontend/backend)
- **[`deployment/DEPLOYMENT.md`](deployment/DEPLOYMENT.md)** - Legacy deployment docs

### Frontend-Specific
- **`apps/web/docs/README.md`** - Frontend architecture navigation
- **`apps/web/docs/architecture/`** - System architecture, tech stack
- **`apps/web/docs/features/`** - Feature requirements & patterns

### Historical Reference
- **[`archive/`](archive/)** - Migration documentation from monorepo transition

---

## 🎯 Key Principles for AI Agents

When working on this codebase:

1. **Read this INDEX.md first** - It's the source of truth
2. **Database schema changes** - Always run `pnpm db:generate` after modifying schema
3. **Use workspace imports** - Import from `@repo/database`, never `@prisma/client`
4. **Transaction fields** - Use `amount`/`totalAmount`, not `cost`/`netCost`
5. **Turborepo** - Leverage caching for faster builds (`pnpm build` only rebuilds what changed)
6. **Testing** - Always run tests before committing
7. **Environment variables** - Never commit secrets
8. **Documentation** - Keep this INDEX.md and specific guides updated

---

## 📞 Getting Help

- **Documentation issues?** Check this INDEX.md and linked guides
- **Setup problems?** See `.docs/setup/SETUP.md`
- **Deployment issues?** See `.docs/deployment/VERCEL_DEPLOYMENT.md`
- **Frontend architecture?** See `apps/web/docs/`

---

**Last Updated**: 2025-11-22
**Version**: 1.0 (Unified documentation system)
