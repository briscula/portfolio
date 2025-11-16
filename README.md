# Portfolio Monorepo

A Turborepo monorepo containing a full-stack portfolio application with Next.js frontend and NestJS backend.

## 📦 What's Inside

This monorepo uses [Turborepo](https://turbo.build/repo) and [pnpm](https://pnpm.io) workspaces to manage:

### Apps

- **`apps/web`** - Next.js 15 frontend with App Router
- **`apps/api`** - NestJS backend API with Prisma

### Packages

- **`packages/database`** - Shared Prisma schema and generated client
- **`packages/shared`** - Shared types, validators, and utilities
- **`packages/typescript-config`** - Shared TypeScript configurations
- **`packages/eslint-config`** - Shared ESLint configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- PostgreSQL database (or your configured database)

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @repo/database db:generate
```

### Environment Variables

1. **Backend** (`apps/api/.env`):
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit apps/api/.env with your database URL and other secrets
   ```

2. **Frontend** (`apps/web/.env.local`):
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit apps/web/.env.local with your API URL and configuration
   ```

### Development

```bash
# Run both apps in development mode
pnpm dev

# Run only the backend
pnpm --filter @repo/api dev

# Run only the frontend
pnpm --filter @repo/web dev
```

### Build

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm --filter @repo/api build
pnpm --filter @repo/web build
```

## 📝 Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all code |
| `pnpm typecheck` | Type check all TypeScript |
| `pnpm clean` | Clean all build artifacts and node_modules |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

## 🗂️ Project Structure

```
portfolio-monorepo/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.ts
│   └── api/                    # NestJS Backend
│       ├── src/
│       ├── test/
│       ├── package.json
│       └── nest-cli.json
├── packages/
│   ├── database/               # Shared Prisma
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── shared/                 # Shared code
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── validators/
│   │   │   └── utils/
│   │   └── package.json
│   ├── typescript-config/      # Shared TS configs
│   └── eslint-config/          # Shared ESLint configs
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # Workspace configuration
├── turbo.json                  # Turborepo configuration
└── .gitignore
```

## 🔧 Working with Shared Packages

### Using Prisma Types

Both apps can import Prisma types from the shared database package:

```typescript
// In both apps/api and apps/web
import { PrismaClient, User, Transaction } from '@repo/database';
```

### Using Shared Types

```typescript
import { ApiResponse, PaginatedResponse } from '@repo/shared';
```

### Using Shared Validators

```typescript
import { emailSchema, passwordSchema } from '@repo/shared';
```

## 📚 Adding Dependencies

```bash
# Add to frontend
pnpm --filter @repo/web add <package>

# Add to backend
pnpm --filter @repo/api add <package>

# Add to shared package
pnpm --filter @repo/shared add <package>

# Add to workspace root (rare)
pnpm add -w <package>
```

## 🚢 Deployment

Both apps are deployed separately to Vercel:

### Backend (apps/api)
- **Root Directory**: `apps/api`
- **Build Command**: `cd ../.. && pnpm run build --filter=@repo/api`
- **Output Directory**: `dist`

### Frontend (apps/web)
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm run build --filter=@repo/web`
- **Output Directory**: `.next`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔍 Migration History

This monorepo was created by migrating two separate repositories:

- **Backend**: [https://github.com/briscula/portfolio-api](https://github.com/briscula/portfolio-api) (commit: a8e1bb3)
- **Frontend**: [https://github.com/briscula/portfolio-front](https://github.com/briscula/portfolio-front) (commit: e02aef6)

See [MIGRATION.md](./MIGRATION.md) for complete migration details.

## 🛠️ Troubleshooting

### Prisma client not found

```bash
pnpm --filter @repo/database db:generate
```

### Type errors after pulling

```bash
pnpm install
pnpm --filter @repo/database db:generate
pnpm typecheck
```

### Build failures

```bash
pnpm clean
pnpm install
pnpm build
```

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Migration Guide](./MIGRATION.md) - Migration history and process
- [Deployment Guide](./DEPLOYMENT.md) - Deployment instructions

## 📄 License

UNLICENSED - Private project

## 👤 Author

Matteo Briscula

---

**Built with** [Turborepo](https://turbo.build/repo) • [Next.js](https://nextjs.org) • [NestJS](https://nestjs.com) • [Prisma](https://prisma.io)
