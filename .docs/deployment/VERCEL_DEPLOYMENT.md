# Vercel Deployment Guide - Separate Frontend & Backend

## Architecture

```
Vercel Project 1: portfolio-api
  └── apps/api/          (NestJS backend)
      └── Serverless functions

Vercel Project 2: portfolio-web
  └── apps/web/          (Next.js frontend)
      └── Edge network + CDN
```

## Setup Instructions

### 1. Deploy Backend API

#### A. Create Vercel Project for Backend

**Via Vercel Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. **Project Name**: `portfolio-api` (or your choice)
4. **Framework Preset**: Other
5. **Root Directory**: `apps/api`
6. **Build Command**: Leave default (will use vercel.json)
7. **Install Command**: Leave default (will use vercel.json)
8. Click **Deploy**

#### B. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier.com

# CORS - Frontend URL (will be updated after frontend deployment)
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

**Important:** Set these for **Production**, **Preview**, and **Development** environments.

#### C. Verify Backend Deployment

Once deployed, test your API:
```bash
curl https://portfolio-api.vercel.app/api/health
```

Your backend URL will be something like: `https://portfolio-api.vercel.app`

---

### 2. Deploy Frontend Web

#### A. Create Vercel Project for Frontend

**Via Vercel Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import the **same** GitHub repository
3. **Project Name**: `portfolio-web` (or your choice)
4. **Framework Preset**: Next.js
5. **Root Directory**: `apps/web`
6. **Build Command**: Leave default or `pnpm build`
7. **Install Command**: Leave default or `pnpm install`
8. Click **Deploy**

#### B. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# API URL - Your backend from step 1
NEXT_PUBLIC_API_URL=https://portfolio-api.vercel.app

# Auth0
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://your-api-identifier.com

# Other frontend env vars
NEXT_PUBLIC_APP_NAME=Portfolio Manager
```

#### C. Update Backend CORS

Now that you have your frontend URL, go back to **Backend Project** → Settings → Environment Variables:

Update `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://portfolio-web.vercel.app,http://localhost:3001
```

Redeploy backend for CORS to take effect.

---

### 3. Configure Turborepo Remote Caching

This makes deployments 10-50x faster!

```bash
# In your local repo
pnpm dlx turbo login
pnpm dlx turbo link
```

Select your Vercel team when prompted.

**For Both Projects in Vercel:**
1. Go to Settings → General
2. Scroll to "Build & Development Settings"
3. Turborepo Remote Caching should be **automatically enabled**

---

### 4. Configure Deployment Triggers

#### Backend (`portfolio-api`)

**Settings → Git:**
- **Production Branch**: `main`
- **Ignored Build Step**: Custom
  ```bash
  # Only deploy if backend changed
  git diff HEAD^ HEAD --quiet apps/api packages/database packages/shared
  ```

This prevents frontend-only changes from redeploying the backend.

#### Frontend (`portfolio-web`)

**Settings → Git:**
- **Production Branch**: `main`
- **Ignored Build Step**: Custom
  ```bash
  # Only deploy if frontend changed
  git diff HEAD^ HEAD --quiet apps/web packages/shared
  ```

This prevents backend-only changes from redeploying the frontend.

---

### 5. Optimize Build Commands

#### Backend: Update `apps/api/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "cd ../.. && pnpm install && pnpm turbo build --filter=@repo/api...",
  "installCommand": "cd ../.. && pnpm install",
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]
    }
  ]
}
```

**Explanation:**
- `--filter=@repo/api...` - Build only API and its dependencies
- Turborepo will cache and skip unchanged packages

#### Frontend: Update `apps/web/vercel.json` (create if doesn't exist)

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@repo/web...",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs"
}
```

---

### 6. Custom Domains (Optional)

#### Backend
- **Vercel Dashboard** → `portfolio-api` → Settings → Domains
- Add: `api.yourdomain.com`

#### Frontend
- **Vercel Dashboard** → `portfolio-web` → Settings → Domains
- Add: `yourdomain.com` and `www.yourdomain.com`

Then update environment variables:
- Backend `ALLOWED_ORIGINS`: Add `https://yourdomain.com`
- Frontend `NEXT_PUBLIC_API_URL`: Change to `https://api.yourdomain.com`

---

## Deployment Workflow

### Automatic Deployments (Recommended)

Every push to your repository triggers:

1. **Backend** deploys if:
   - Changes in `apps/api/`
   - Changes in `packages/database/`
   - Changes in `packages/shared/`

2. **Frontend** deploys if:
   - Changes in `apps/web/`
   - Changes in `packages/shared/`

3. **Both** deploy if:
   - Changes in `packages/shared/`
   - Changes affecting both apps

### Manual Deployments

```bash
# Deploy backend only
cd apps/api
vercel --prod

# Deploy frontend only
cd apps/web
vercel --prod
```

---

## Performance Benefits

### With Separate Deployments + Turborepo

| Scenario | Before | After |
|----------|--------|-------|
| Frontend change only | 5 min (both deploy) | 30s (frontend only) |
| Backend change only | 5 min (both deploy) | 2 min (backend only) |
| No changes (cache hit) | 5 min | 10s (FULL TURBO) |
| Shared package change | 5 min (both deploy) | 3 min (both deploy, parallel) |

**Expected improvement: 70-90% faster deployments**

---

## Monitoring

### Backend Monitoring
- **URL**: `https://portfolio-api.vercel.app`
- **Health Check**: `GET /api/health`
- **Logs**: Vercel Dashboard → `portfolio-api` → Logs

### Frontend Monitoring
- **URL**: `https://portfolio-web.vercel.app`
- **Analytics**: Vercel Dashboard → `portfolio-web` → Analytics
- **Logs**: Vercel Dashboard → `portfolio-web` → Logs

---

## Troubleshooting

### Backend Can't Find Database Package

If you see `Cannot find module '@repo/database'`:

1. Verify `apps/api/vercel.json` has the correct build command
2. Check `apps/api/scripts/copy-workspace-deps.js` exists
3. Ensure DATABASE_URL is set in Vercel environment variables
4. Check build logs for Prisma generation

### Frontend Can't Connect to Backend

1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check backend CORS allows frontend domain
3. Test backend health endpoint directly
4. Check Auth0 configuration matches

### Slow Deployments

1. Verify Turborepo remote caching is enabled:
   ```bash
   pnpm dlx turbo link
   ```
2. Check build logs for "CACHE HIT" messages
3. Ensure ignored build step is configured correctly

### Database Migrations

Run migrations manually or via CI/CD, not in Vercel:
```bash
# Locally or in GitHub Actions
pnpm db:migrate
```

Vercel deployments should **never** run migrations automatically.

---

## GitHub Actions (Optional CI/CD)

For more control, use GitHub Actions:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    if: contains(github.event.head_commit.modified, 'apps/api') || contains(github.event.head_commit.modified, 'packages/database')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_API_PROJECT_ID }}
          working-directory: apps/api

  deploy-frontend:
    if: contains(github.event.head_commit.modified, 'apps/web')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_WEB_PROJECT_ID }}
          working-directory: apps/web
```

---

## Summary

✅ **Backend**: Separate Vercel project for `apps/api`
✅ **Frontend**: Separate Vercel project for `apps/web`
✅ **Turborepo**: Remote caching for 10-50x faster builds
✅ **Independent**: Each deploys only when its code changes
✅ **Scalable**: Each scales based on its own traffic
✅ **Reliable**: Isolated deployments reduce risk

**Next Steps:**
1. Create two Vercel projects (backend + frontend)
2. Configure environment variables for each
3. Enable Turborepo remote caching
4. Push and watch automatic deployments
5. Enjoy lightning-fast deployments! ⚡
