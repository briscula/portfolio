# Development Patterns

Code patterns and examples for working with this monorepo. This is the reference for "how to do things" - see [AGENTS.md](../AGENTS.md) for quick rules and navigation.

---

## Authentication Patterns

### Dual Auth System

This app uses two authentication layers:

1. **Auth0 Session** - User authentication & session management
2. **AuthContext** - API access tokens for backend calls

```typescript
// For user info (name, email, profile)
import { useUser } from '@auth0/nextjs-auth0/client';
const { user, isLoading } = useUser();

// For API calls (access token)
import { useAuth } from '@/contexts/AuthContext';
const { accessToken } = useAuth();
```

### Backend Auth Guard

```typescript
@UseGuards(UnifiedAuthGuard)  // Validates Auth0 JWT tokens
@ApiBearerAuth('JWT-auth')
@Get()
async getProtectedData() { ... }
```

---

## API Client Patterns

### Server Components

```typescript
// Use the server-side API module
import { getPortfolios } from '@/lib/api';

export default async function Page() {
  const portfolios = await getPortfolios();
  return <PortfolioList data={portfolios} />;
}
```

### Client Components

```typescript
// Use the hook-based client
import { useApiClient } from '@/lib/apiClient';

export default function ClientComponent() {
  const { apiClient, isAuthenticated } = useApiClient();

  useEffect(() => {
    if (isAuthenticated) {
      apiClient.getPortfolios().then(setData);
    }
  }, [isAuthenticated]);
}
```

---

## Environment Variables

Always use the `@repo/env` package for type-safe, validated environment variables:

```typescript
// ✅ Correct (type-safe, validated at build time)
import { webEnv } from '@repo/env';
const apiUrl = webEnv.NEXT_PUBLIC_API_URL;

// ❌ Avoid (unsafe, no validation)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

See [packages/env/README.md](../packages/env/README.md) for adding new variables.

---

## Validation Patterns

### Zod Schemas (API)

DTOs use Zod schemas wrapped with `createZodDto()`:

```typescript
// apps/api/src/portfolios/dto/create-portfolio.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  currencyCode: z.string().default('USD'),
});

export class CreatePortfolioDto extends createZodDto(CreatePortfolioSchema) {}
```

### Schema Locations

- API DTOs: `apps/api/src/<module>/dto/`
- Shared schemas: `packages/shared/src/schemas/`
- Environment schemas: `packages/env/src/`

---

## Database Patterns

### Prisma Usage

```typescript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfoliosService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      include: { currency: true },
    });
  }
}
```

### Key Conventions

- User IDs are UUIDs (not integers)
- Composite keys for Listing: `(isin, exchangeCode)`
- Transaction types: `BUY`, `SELL`, `DIVIDEND`, `TAX`, `CASH_DEPOSIT`, `CASH_WITHDRAWAL`

### Migrations

```bash
# Create a new migration
pnpm --filter @repo/database db:migrate dev

# Apply migrations (production)
pnpm --filter @repo/database exec prisma migrate deploy

# Open Prisma Studio
pnpm --filter @repo/database db:studio
```

---

## Internationalization

All routes are locale-prefixed: `/en/dashboard`, `/es/portfolio`

```typescript
// Use the translation hook
import { useTranslation } from '@/hooks/useTranslation';

export default function Component() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}
```

Middleware handles locale detection: `apps/web/src/middleware.ts`

---

## Testing Patterns

### Mock Service Worker (MSW)

Enable mocking for local development:

```bash
NEXT_PUBLIC_ENABLE_MSW=true pnpm --filter @repo/web dev
```

Handlers location: `apps/web/src/mocks/handlers.ts`

### API Testing

Use Swagger UI at `/api` endpoint for testing protected endpoints interactively.

---

**Last Updated**: 2025-12-26
