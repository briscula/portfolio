# Deployment Guide

Instructions for deploying the Portfolio Monorepo to Vercel.

## Overview

This monorepo deploys **two separate apps** to Vercel:

- **Backend API** (`apps/api`) → Separate Vercel project
- **Frontend Web** (`apps/web`) → Separate Vercel project

Both apps deploy from the same monorepo repository but build independently.

## Prerequisites

- Vercel account
- Vercel CLI installed: `npm install -g vercel`
- GitHub repository connected to Vercel
- Environment variables documented

## Backend Deployment (apps/api)

### Vercel Project Configuration

#### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project (or create new one)
3. Go to **Settings** → **General** → **Build & Development Settings**

Configure the following:

| Setting              | Value                                                           |
| -------------------- | --------------------------------------------------------------- |
| **Framework Preset** | Other                                                           |
| **Root Directory**   | `apps/api`                                                      |
| **Build Command**    | `cd ../.. && pnpm install && pnpm run build --filter=@repo/api` |
| **Output Directory** | `dist`                                                          |
| **Install Command**  | `cd ../.. && pnpm install`                                      |

#### Via vercel.json (Alternative)

Create `apps/api/vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "cd ../.. && pnpm install && pnpm run build --filter=@repo/api",
  "installCommand": "cd ../.. && pnpm install",
  "framework": null,
  "outputDirectory": "dist",
  "devCommand": "pnpm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### Environment Variables

Add these environment variables in **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-jwt-secret
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-auth0-audience

# Node Environment
NODE_ENV=production

# CORS Origins
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

# Financial Modeling Prep API Key
FMP_API_KEY=your_fmp_api_key
```

**⚠️ Important**:

- Mark sensitive variables as "Sensitive" in Vercel
- Use different values for Production, Preview, and Development environments

### Build Command Explanation

The build command does the following:

1. `cd ../..` - Navigate to monorepo root
2. `pnpm install` - Install all dependencies (including workspace packages)
3. `pnpm run build --filter=@repo/api` - Build only the backend app
4. Turbo will automatically build dependencies (`@repo/database`, etc.)

### Deployment

#### Manual Deployment

```bash
cd apps/api
vercel --prod
```

#### Automatic Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure Git integration:
   - **Production Branch**: `main`
   - **Ignored Build Step**: Configure to only build when `apps/api/**` or `packages/**` changes

Create `apps/api/.vercelignore`:

```
# Ignore changes outside of API and packages
apps/web/**
docs/**
*.md
!apps/api/**
!packages/**
```

## Frontend Deployment (apps/web)

### Vercel Project Configuration

#### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project (or create new one)
3. Go to **Settings** → **General** → **Build & Development Settings**

Configure the following:

| Setting              | Value                                                           |
| -------------------- | --------------------------------------------------------------- |
| **Framework Preset** | Next.js                                                         |
| **Root Directory**   | `apps/web`                                                      |
| **Build Command**    | `cd ../.. && pnpm install && pnpm run build --filter=@repo/web` |
| **Output Directory** | `.next`                                                         |
| **Install Command**  | `cd ../.. && pnpm install`                                      |

#### Via vercel.json (Alternative)

Create `apps/web/vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "cd ../.. && pnpm install && pnpm run build --filter=@repo/web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Environment Variables

Add these environment variables in **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app

# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=https://your-frontend-domain.vercel.app
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-auth0-audience

# Feature Flags
NEXT_PUBLIC_ENABLE_MSW=false
```

**Note**: All `NEXT_PUBLIC_*` variables are exposed to the browser.

### Deployment

#### Manual Deployment

```bash
cd apps/web
vercel --prod
```

#### Automatic Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure Git integration:
   - **Production Branch**: `main`
   - **Ignored Build Step**: Configure to only build when `apps/web/**` or `packages/**` changes

Create `apps/web/.vercelignore`:

```
# Ignore changes outside of web and packages
apps/api/**
docs/**
*.md
!apps/web/**
!packages/**
```

## Database Migrations on Deployment

### Option 1: Automatic Migrations (Not Recommended)

Add to backend build command:

```bash
cd ../.. && pnpm install && pnpm --filter @repo/database db:migrate deploy && pnpm run build --filter=@repo/api
```

**⚠️ Warning**: This runs migrations on every deploy, which can cause issues.

### Option 2: Manual Migrations (Recommended)

1. Run migrations manually before deployment:

   ```bash
   # From local machine with access to production DB
   DATABASE_URL="your-production-db-url" pnpm --filter @repo/database db:migrate deploy
   ```

2. Then deploy normally

### Option 3: Separate Migration Workflow

Use GitHub Actions to run migrations:

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to migrate"
        required: true
        type: choice
        options:
          - production
          - preview

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: pnpm --filter @repo/database db:migrate deploy
```

## Optimizing Deployment

### Caching

Vercel automatically caches `node_modules` and build outputs. Turborepo adds additional caching.

### Build Times

Typical build times:

- **Backend**: 2-3 minutes
- **Frontend**: 3-5 minutes

To reduce build time:

1. Use Turborepo remote caching
2. Optimize dependencies
3. Use Vercel's preview deployments for testing

### Preview Deployments

Both apps support preview deployments for pull requests:

1. Create a pull request
2. Vercel automatically deploys both apps to preview URLs
3. Test before merging to production

## Domain Configuration

### Backend Domain

1. Go to Vercel Dashboard → Backend Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `api.yourapp.com`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_API_URL` in frontend environment variables

### Frontend Domain

1. Go to Vercel Dashboard → Frontend Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `app.yourapp.com` or `www.yourapp.com`)
3. Update DNS records as instructed
4. Update `AUTH0_BASE_URL` in environment variables

## Monitoring & Logs

### Viewing Logs

**Backend Logs**:

```bash
vercel logs <backend-deployment-url>
```

**Frontend Logs**:

```bash
vercel logs <frontend-deployment-url>
```

### Error Tracking

Consider integrating:

- Sentry for error tracking
- LogRocket for session replay
- Datadog for infrastructure monitoring

## Rollback

### Rolling Back a Deployment

1. Go to Vercel Dashboard → Project → **Deployments**
2. Find the previous working deployment
3. Click "..." → **Promote to Production**

Or via CLI:

```bash
vercel rollback
```

## Health Checks

### Backend Health Check

Add a health endpoint in your NestJS app:

```typescript
// apps/api/src/health/health.controller.ts
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
```

Test: `https://your-backend-domain.vercel.app/health`

### Frontend Health Check

Next.js automatically provides health checks at `/_next/health`

## Troubleshooting Deployment

### Build Fails: "Cannot find module '@repo/database'"

**Solution**: Ensure build command includes `cd ../.. && pnpm install`

### Build Fails: "Prisma Client not generated"

**Solution**: Add to build command:

```bash
cd ../.. && pnpm install && pnpm --filter @repo/database db:generate && pnpm run build --filter=@repo/api
```

### Environment Variables Not Working

**Solution**:

1. Check they're set in correct environment (Production/Preview/Development)
2. Redeploy after adding variables
3. For `NEXT_PUBLIC_*` vars, rebuild is required

### CORS Errors

**Solution**:

1. Check `ALLOWED_ORIGINS` in backend env vars
2. Ensure frontend domain is whitelisted
3. Verify Auth0 callback URLs

### Database Connection Issues

**Solution**:

1. Verify `DATABASE_URL` is correct
2. Check database accepts connections from Vercel IPs
3. Ensure SSL is properly configured

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: |
          cd apps/api && vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
          cd ../web && vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Security Checklist

Before deploying to production:

- [ ] All environment variables use production values
- [ ] Database credentials are secure
- [ ] JWT secrets are randomly generated and secure
- [ ] CORS origins are properly configured
- [ ] Auth0 callback URLs are production URLs
- [ ] SSL/TLS is enabled (automatic on Vercel)
- [ ] Rate limiting is configured
- [ ] Sensitive logs are not exposed

## Post-Deployment Verification

After deployment:

1. **Backend Checks**:
   - [ ] Health endpoint responds: `/health`
   - [ ] API endpoints work correctly
   - [ ] Database connections successful
   - [ ] Authentication works
   - [ ] No errors in logs

2. **Frontend Checks**:
   - [ ] Homepage loads
   - [ ] Authentication flow works
   - [ ] API calls succeed
   - [ ] All pages render correctly
   - [ ] No console errors

3. **Integration Checks**:
   - [ ] Frontend can communicate with backend
   - [ ] CORS is properly configured
   - [ ] Auth tokens work across services
   - [ ] Database queries return correct data

---

## Support

For deployment issues:

- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Turborepo Deployment Docs](https://turbo.build/repo/docs/handbook/deploying-with-docker)
- Check project logs in Vercel Dashboard

---

**Last Updated**: November 16, 2024
