# Backend API - Claude Guide

This is the **NestJS backend API** for portfolio management with multi-provider authentication (Auth0 + Email/Password). It handles stock investments, transactions, and dividend analytics using Prisma ORM with PostgreSQL.

**Note**: This is part of a Turborepo monorepo. For monorepo-wide commands, see the root `.claude/CLAUDE.md`.

## Project Overview

A NestJS-based portfolio management API with:
- Multi-provider authentication (Auth0 + Email/Password)
- Stock investment tracking
- Transaction management (BUY, SELL, DIVIDEND, TAX, SPLIT)
- Dividend analytics and reporting
- Prisma ORM with PostgreSQL

## Development Commands

### Setup & Installation
```bash
# From repository root
pnpm install                    # Install all monorepo dependencies
```

### Running the Application
```bash
# From repository root (recommended)
pnpm --filter @repo/api dev     # Start backend in watch mode

# Or from apps/api directory
pnpm dev                        # Start in watch mode (development)
pnpm start                      # Start normally
pnpm start:prod                 # Production mode
```

### Database Management

**⚠️ Important**: Database commands should be run from the **root** or target the `@repo/database` package.

```bash
# From repository root (recommended)
pnpm db:generate                # Generate Prisma client after schema changes
pnpm db:migrate                 # Create and apply new migration
pnpm db:studio                  # Open Prisma Studio UI
pnpm --filter @repo/database db:seed  # Seed database with initial data

# Production migrations
pnpm --filter @repo/database prisma migrate deploy
```

**Schema location**: `packages/database/prisma/schema.prisma` (NOT in apps/api!)

### Testing
```bash
# From apps/api directory
pnpm test                       # Run unit tests
pnpm test:watch                 # Run tests in watch mode
pnpm test:cov                   # Run tests with coverage
pnpm test:e2e                   # Run end-to-end tests
pnpm test:debug                 # Debug tests

# From repository root
pnpm --filter @repo/api test
```

### Code Quality
```bash
# From apps/api directory
pnpm lint                       # Run ESLint with auto-fix
pnpm format                     # Format code with Prettier

# From repository root
pnpm --filter @repo/api lint
```

### Build
```bash
# From repository root
pnpm build                      # Build all apps and packages
pnpm --filter @repo/api build   # Build backend only

# From apps/api directory
pnpm build                      # Build for production
```

## Architecture

### Module Structure

The application follows NestJS modular architecture with these core modules:

- **AuthModule** (`src/auth/`) - Multi-provider authentication (Auth0 + Email/Password)
- **UsersModule** (`src/users/`) - User management
- **PortfoliosModule** (`src/portfolios/`) - Portfolio CRUD operations
- **TransactionsModule** (`src/transactions/`) - Transaction management (BUY, SELL, DIVIDEND, TAX, SPLIT)
- **PositionsModule** (`src/positions/`) - Portfolio position tracking
- **DividendAnalyticsModule** (`src/dividend-analytics/`) - Dividend analysis and reporting
- **PrismaModule** (`src/prisma/`) - Database service provider

### Authentication Architecture

This API implements a **dual authentication system**:

1. **Auth0 OAuth** - Validates JWTs using Auth0's JWKS (JSON Web Key Set)
2. **Email/Password** - Traditional authentication with local JWT signing

**Current Guard**: `UnifiedAuthGuard` validates Auth0 tokens only
- Located in `src/auth/unified-auth.guard.ts`
- **Note**: Despite the name, currently only validates Auth0 tokens (see src/auth/unified-auth.guard.ts:24-31)
- User object populated with `userId`, `email`, `provider`, `providerSub`, `scopes`

**Database Schema**:
- `User` table - Core user data
- `UserAuthAccount` table - Provider-specific authentication data (supports linking multiple auth providers per user)
- `AuthProvider` enum - `AUTH0` or `EMAIL_PASSWORD`

### Database Models

Key Prisma models and their relationships:

```
User (UUID)
├── Portfolio (1:N)
│   └── Transaction (1:N)
│       └── Stock
└── UserAuthAccount (1:N) - Multi-provider auth support

UserPosition (Materialized View)
- Aggregates position data per user/portfolio/stock
```

**Important Notes**:
- User IDs are UUIDs (not integers)
- Portfolios have unique constraint on `[userId, name]`
- Transactions have composite unique key `[portfolioId, stockSymbol, createdAt, quantity, reference]`
- `UserPosition` is a database view for optimized position queries

### Transaction Types

Defined in `TransactionType` enum:
- `BUY` - Stock purchase
- `SELL` - Stock sale
- `DIVIDEND` - Dividend payment
- `TAX` - Tax deduction
- `SPLIT` - Stock split

### Dividend Analytics

The `DividendAnalyticsModule` provides two main endpoints optimized for different use cases:

1. **Monthly Overview** (`/dividend-analytics/monthly-overview`)
   - Returns data structured for time-series charts
   - Months on x-axis, years as separate series
   - Includes all 12 months with zero values for missing data
   - See `src/dividend-analytics/README.md` for detailed response format

2. **Company Summaries** (`/dividend-analytics/company-summaries`)
   - Per-company, per-year dividend statistics
   - Calculates yield on cost (dividends / cost basis)
   - Includes average dividend per payment

### CORS Configuration

CORS is handled in `src/main.ts` with:
- Manual preflight request handler (OPTIONS)
- NestJS CORS middleware for regular requests
- Allowed origins include localhost ports (3000, 3001, 5173, 8080, 4200) and production domains
- Credentials enabled for cookie-based auth

### API Documentation

Swagger UI available at `/api` endpoint when running locally:
- Configured with Bearer auth for JWT tokens
- Tagged by feature area (portfolio, transactions, auth, etc.)
- Persistent authorization between refreshes

## Important Files & Patterns

### Database Schema
- **Schema location**: `packages/database/prisma/schema.prisma` (shared across monorepo)
- After schema changes:
  1. Run `pnpm db:generate` from root
  2. Run `pnpm db:migrate` to create migration
- ⚠️ **Never** import from `@prisma/client`, always use `@repo/database`

### DTOs & Validation
- Use `class-validator` decorators in DTOs
- Global `ValidationPipe` enabled in `src/main.ts`
- DTOs typically located in `*.dto.ts` files within each module

### Exception Handling
- Global `PrismaClientExceptionFilter` in `src/prisma-client-exception/`
- Converts Prisma errors to HTTP exceptions
- Custom error messages for constraint violations

### Authentication Guards
- Apply `@UseGuards(UnifiedAuthGuard)` to protected routes
- Access user via `@Req() request` - user object at `request.user`
- User object structure:
  ```typescript
  {
    userId: string,        // UUID
    email: string,
    provider: 'AUTH0' | 'EMAIL_PASSWORD',
    providerSub: string,
    scopes: string[]
  }
  ```

## Development Workflows

### Adding a New Endpoint

1. Define DTO in module directory (e.g., `create-portfolio.dto.ts`)
2. Add method to service (e.g., `portfolios.service.ts`)
3. Add controller endpoint with appropriate guards and Swagger decorators
4. Write unit tests for service and controller

### Database Schema Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma generate` to update Prisma client
3. Run `npx prisma migrate dev --name descriptive_name` to create migration
4. Update affected services/DTOs
5. Update seed file if needed (`prisma/seed.ts`)

### Testing Protected Endpoints

Use Swagger UI at `/api` or curl:
```bash
# Get token from Auth0 or /auth/login endpoint
curl -X GET http://localhost:3000/portfolios \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_AUDIENCE` - Auth0 API identifier
- `JWT_SECRET` - Secret for local JWT signing
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `LOG_LEVEL` - Logging verbosity (error/warn/log/debug/verbose)
- `FRONTEND_URL` - Frontend origin for CORS

## Known Issues & Considerations

### Authentication
- The `UnifiedAuthGuard` currently only validates Auth0 tokens despite the name suggesting dual auth support
- Email/password auth endpoints exist but are not actively used in guard validation
- When adding email/password support back, update the guard in `src/auth/unified-auth.guard.ts`

### Logging
- Extensive request logging enabled in `src/main.ts` for debugging
- Log levels controlled by `LOG_LEVEL` environment variable
- Production should use `warn` or `error` level

### Portfolio Positions
- Position data calculated from `UserPosition` materialized view
- When debugging position issues, check if view needs refresh
- Filter logic in positions endpoint removes stocks with zero cost (see recent commits)

### Dividend Evolution
- Graph should show all 12 months with zero values for months without dividends
- Fixed in recent commit to ensure complete time series

## Testing Strategy

- Unit tests use Jest with `ts-jest`
- Test files colocated with source (e.g., `portfolios.service.spec.ts`)
- Mock Prisma service in tests using Jest mocks
- E2E tests in `/test` directory with separate Jest config

## Deployment

Currently configured for Vercel deployment:
- `vercel.json` configures build and routes
- Build script runs Prisma generation (migrations applied separately)
- Uses Node.js 22.x runtime
