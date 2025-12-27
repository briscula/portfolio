# Agent Guidelines

Essential context for AI agents working with this monorepo.

---

## Critical Rules

### ❌ Never Do This

- Commit `.env` files with secrets
- Run database migrations without user confirmation
- Use `process.env` directly (use `@repo/env` instead)
- Create documentation outside `docs/` folder
- Modify Prisma schema without creating migrations

### ✅ Always Do This

- Use Zod for all validation
- Use `@repo/env` for environment variables
- Test builds after major changes (`pnpm build`)
- Document architectural decisions in `docs/`
- Ask for confirmation before destructive operations

---

## Project Structure

```
portfolio/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router)
│   └── api/          # NestJS backend API
├── packages/
│   ├── database/     # Prisma schema and client
│   ├── env/          # Type-safe environment variables
│   ├── shared/       # Shared utilities
│   └── typescript-config/
└── docs/             # All documentation
```

---

## Documentation Index

| Document                                   | Description                |
| ------------------------------------------ | -------------------------- |
| [docs/README.md](./docs/README.md)         | Full documentation index   |
| [docs/PATTERNS.md](./docs/PATTERNS.md)     | Code patterns and examples |
| [docs/SETUP.md](./docs/SETUP.md)           | Development setup          |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide           |
| [docs/architecture/](./docs/architecture/) | System architecture        |

---

## Quick Commands

```bash
# Development
pnpm dev                              # All apps
pnpm --filter @repo/web dev           # Frontend only
pnpm --filter @repo/api dev           # Backend only

# Build & Test
pnpm build                            # Build all
pnpm typecheck                        # Type checking
pnpm lint                             # Linting

# Database
pnpm --filter @repo/database db:migrate dev    # Create migration
pnpm --filter @repo/database db:studio         # Prisma Studio
```

---

## Technology Overview

| Layer          | Stack                                          |
| -------------- | ---------------------------------------------- |
| **Frontend**   | Next.js 15, TypeScript, Tailwind CSS v4, Auth0 |
| **Backend**    | NestJS, TypeScript, Prisma, PostgreSQL         |
| **Validation** | Zod (both frontend and backend)                |
| **Deployment** | Vercel (frontend + backend)                    |

---

## Key Conventions

### Environment Variables

Use `@repo/env` package - never use `process.env` directly.
→ See [docs/PATTERNS.md#environment-variables](./docs/PATTERNS.md#environment-variables)

### Authentication

Dual system: Auth0 session + AuthContext for API tokens.
→ See [docs/PATTERNS.md#authentication-patterns](./docs/PATTERNS.md#authentication-patterns)

### Validation

Zod schemas for all DTOs and validation.
→ See [docs/PATTERNS.md#validation-patterns](./docs/PATTERNS.md#validation-patterns)

### Database

Prisma ORM with PostgreSQL. User IDs are UUIDs.
→ See [docs/PATTERNS.md#database-patterns](./docs/PATTERNS.md#database-patterns)

### API Documentation

Swagger UI available at `/api` endpoint.

---

## Backend Modules

| Module                  | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| AuthModule              | Multi-provider auth (Auth0 + Email/Password) |
| UsersModule             | User management                              |
| PortfoliosModule        | Portfolio CRUD                               |
| TransactionsModule      | BUY, SELL, DIVIDEND, TAX transactions        |
| PositionsModule         | Portfolio position tracking                  |
| DividendAnalyticsModule | Dividend analysis and reporting              |
| PriceUpdaterModule      | Stock price updates from Yahoo Finance       |

---

## Internationalization

Routes are locale-prefixed: `/en/dashboard`, `/es/portfolio`
→ See [docs/PATTERNS.md#internationalization](./docs/PATTERNS.md#internationalization)

---

**Last Updated**: 2025-12-26
