# Setup Guide

Complete setup instructions for the Portfolio Monorepo.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **pnpm** 8 or higher
- **PostgreSQL** database (or your configured database)
- **Git**

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Verify installation:

```bash
pnpm --version
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd portfolio
```

### 2. Install Dependencies

Install all dependencies for the monorepo and all packages:

```bash
pnpm install
```

This will:
- Install root dependencies
- Install dependencies for `apps/web`
- Install dependencies for `apps/api`
- Install dependencies for all `packages/*`
- Link workspace dependencies automatically

### 3. Set Up Environment Variables

#### Backend Environment Variables

```bash
# Copy example file
cp apps/api/.env.example apps/api/.env

# Edit the file with your actual values
nano apps/api/.env  # or use your preferred editor
```

Required environment variables for backend:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"

# JWT / Authentication
JWT_SECRET="your-secret-key"
AUTH0_DOMAIN="your-auth0-domain"
AUTH0_AUDIENCE="your-auth0-audience"

# Other configuration
NODE_ENV="development"
PORT=4000
```

#### Frontend Environment Variables

```bash
# Copy example file
cp apps/web/.env.example apps/web/.env.local

# Edit the file with your actual values
nano apps/web/.env.local
```

Required environment variables for frontend:
```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Auth0 Configuration
AUTH0_SECRET="your-auth0-secret"
AUTH0_BASE_URL="http://localhost:3001"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"

# Feature Flags
NEXT_PUBLIC_ENABLE_MSW=false
```

### 4. Set Up Database

#### Generate Prisma Client

```bash
pnpm --filter @repo/database db:generate
```

#### Run Database Migrations

**⚠️ Important**: Review migrations before running in production!

```bash
# For development
pnpm --filter @repo/database db:migrate

# This will:
# 1. Apply all pending migrations
# 2. Generate Prisma Client
# 3. Update your database schema
```

#### (Optional) Seed Database

```bash
pnpm --filter @repo/database db:seed
```

#### (Optional) Open Prisma Studio

Explore your database with Prisma Studio:

```bash
pnpm db:studio
```

This will open Prisma Studio at http://localhost:5555

## Development

### Running Both Apps

Start both frontend and backend in development mode:

```bash
pnpm dev
```

This will start:
- **Backend**: http://localhost:4000 (or your configured port)
- **Frontend**: http://localhost:3001

### Running Individual Apps

#### Backend Only

```bash
pnpm --filter @repo/api dev
```

#### Frontend Only

```bash
pnpm --filter @repo/web dev
```

### Building for Production

#### Build All Apps

```bash
pnpm build
```

#### Build Individual Apps

```bash
# Backend
pnpm --filter @repo/api build

# Frontend
pnpm --filter @repo/web build
```

## Common Development Tasks

### Adding a New Dependency

#### To Frontend

```bash
pnpm --filter @repo/web add <package-name>

# For dev dependencies
pnpm --filter @repo/web add -D <package-name>
```

#### To Backend

```bash
pnpm --filter @repo/api add <package-name>

# For dev dependencies
pnpm --filter @repo/api add -D <package-name>
```

#### To Shared Package

```bash
pnpm --filter @repo/shared add <package-name>
```

#### To Workspace Root (Rare)

```bash
pnpm add -w <package-name>
```

### Working with Prisma

#### Update Schema

1. Edit `packages/database/prisma/schema.prisma`
2. Create a migration:
   ```bash
   pnpm --filter @repo/database db:migrate
   ```
3. The migration will automatically:
   - Update the database
   - Regenerate Prisma Client
   - Make types available to both apps

#### Reset Database (Development Only)

**⚠️ This will delete all data!**

```bash
cd packages/database
pnpm prisma migrate reset
```

### Type Checking

```bash
# Check all apps
pnpm typecheck

# Check specific app
pnpm --filter @repo/api typecheck
pnpm --filter @repo/web typecheck
```

### Linting

```bash
# Lint all apps
pnpm lint

# Lint specific app
pnpm --filter @repo/api lint
pnpm --filter @repo/web lint
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter @repo/api test
pnpm --filter @repo/web test

# Watch mode
pnpm --filter @repo/api test:watch
pnpm --filter @repo/web test:watch

# Coverage
pnpm --filter @repo/api test:cov
pnpm --filter @repo/web test:coverage
```

## Working with Shared Code

### Using Shared Prisma Types

In both frontend and backend:

```typescript
import { PrismaClient, User, Transaction, Portfolio } from '@repo/database';

// Use Prisma types
const user: User = {
  id: '1',
  email: 'user@example.com',
  // ...
};
```

### Using Shared Types

```typescript
import { ApiResponse, PaginatedResponse } from '@repo/shared';

// Use shared types
const response: ApiResponse<User> = {
  data: user,
  message: 'Success',
};
```

### Using Shared Validators

```typescript
import { emailSchema, passwordSchema } from '@repo/shared';

// Validate data
const email = emailSchema.parse('user@example.com');
```

### Adding New Shared Code

1. **Add shared types** to `packages/shared/src/types/index.ts`
2. **Add shared validators** to `packages/shared/src/validators/index.ts`
3. **Add shared utilities** to `packages/shared/src/utils/index.ts`
4. Import in your apps using `@repo/shared`

## Troubleshooting

### Issue: "Cannot find module '@repo/database'"

**Solution**:
```bash
pnpm install
pnpm --filter @repo/database db:generate
```

### Issue: "Prisma Client is not generated"

**Solution**:
```bash
pnpm --filter @repo/database db:generate
```

### Issue: Type errors after pulling changes

**Solution**:
```bash
pnpm install
pnpm --filter @repo/database db:generate
pnpm typecheck
```

### Issue: Build failures

**Solution**:
```bash
pnpm clean
pnpm install
pnpm --filter @repo/database db:generate
pnpm build
```

### Issue: Port already in use

Frontend (3001) or Backend (4000) port already in use:

**Solution**:
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9
lsof -ti:4000 | xargs kill -9

# Or change port in package.json
```

### Issue: Database connection errors

**Solution**:
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `apps/api/.env`
3. Ensure database exists
4. Check database credentials

### Issue: Workspace dependency not found

**Solution**:
```bash
# Reinstall and relink
rm -rf node_modules
pnpm install
```

## IDE Setup

### VS Code

Recommended extensions:
- Prisma
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Workspace settings (`.vscode/settings.json`):
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### WebStorm / IntelliJ

1. Enable TypeScript language service
2. Set TypeScript version to workspace version
3. Enable ESLint
4. Configure Prisma plugin

## Performance Tips

### Faster Installs

pnpm is already very fast, but you can make it faster:

```bash
# Use workspace protocol
# Already configured in package.json files

# Use shamefully-hoist (if needed for compatibility)
echo "shamefully-hoist=true" >> .npmrc
```

### Faster Builds

Turborepo caches builds automatically. To clear cache:

```bash
# Clear Turborepo cache
rm -rf .turbo

# Or use turbo CLI
turbo run build --force
```

### Faster Development

```bash
# Use filters to run only what you need
pnpm --filter @repo/web dev

# Use Turbo's parallel execution (already configured)
pnpm dev  # Runs both in parallel
```

## Next Steps

After setup is complete:

1. ✅ Read the [README.md](./README.md) for project overview
2. ✅ Review [MIGRATION.md](./MIGRATION.md) for migration history
3. ✅ Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
4. ✅ Start developing!

## Quick Reference

| Task | Command |
|------|---------|
| Install all | `pnpm install` |
| Generate Prisma | `pnpm --filter @repo/database db:generate` |
| Migrate DB | `pnpm --filter @repo/database db:migrate` |
| Dev (all) | `pnpm dev` |
| Dev (backend) | `pnpm --filter @repo/api dev` |
| Dev (frontend) | `pnpm --filter @repo/web dev` |
| Build all | `pnpm build` |
| Test all | `pnpm test` |
| Lint all | `pnpm lint` |
| Type check | `pnpm typecheck` |
| Clean all | `pnpm clean` |
| DB Studio | `pnpm db:studio` |

## Getting Help

- Check [Troubleshooting](#troubleshooting) section above
- Review [Turborepo Docs](https://turbo.build/repo/docs)
- Review [Prisma Docs](https://www.prisma.io/docs)
- Check [pnpm Docs](https://pnpm.io)

---

**Happy coding!** 🚀
