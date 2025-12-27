# @repo/env

Type-safe, validated environment variables for the monorepo.

## Features

- ✅ **Runtime Validation**: Fails fast on missing/invalid environment variables
- ✅ **Type Safety**: Full TypeScript support with autocomplete
- ✅ **Documentation**: Schemas serve as documentation for required variables
- ✅ **DRY**: Shared variables defined once

## Usage

### In Next.js App (`apps/web`)

```typescript
import { webEnv } from "@repo/env";

// Fully typed and validated
console.log(webEnv.NEXT_PUBLIC_API_URL); // string
console.log(webEnv.AUTH0_SECRET); // string (min 32 chars)
console.log(webEnv.DATABASE_URL); // string (valid URL)
```

### In NestJS API (`apps/api`)

```typescript
import { apiEnv } from "@repo/env";

// Fully typed and validated
console.log(apiEnv.DATABASE_URL); // string (valid URL)
console.log(apiEnv.JWT_SECRET); // string (min 32 chars)
console.log(apiEnv.PORT); // number (default: 3000)
```

## Environment Variables

See `.env.example` files in each app for required variables.

### Shared Variables

- `NODE_ENV` - Environment (development/production/test)
- `DATABASE_URL` - PostgreSQL connection string

### Web App Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `AUTH0_*` - Auth0 configuration
- `NEXT_PUBLIC_ENABLE_MSW` - Enable API mocking (optional)

### API Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - JWT signing secret
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_AUDIENCE` - Auth0 API audience
- `FRONTEND_URL` - Frontend URL for CORS
- `LOG_LEVEL` - Logging level (optional)

## Error Handling

If any required variable is missing or invalid, the app will fail to start with a clear error message:

```
ZodError: [
  {
    "code": "invalid_string",
    "validation": "url",
    "path": ["DATABASE_URL"],
    "message": "DATABASE_URL must be a valid URL"
  }
]
```

## Development

```bash
# Build the package
pnpm --filter @repo/env build

# Watch mode
pnpm --filter @repo/env dev
```
