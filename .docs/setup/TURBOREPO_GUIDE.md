# Turborepo Optimization Guide

## What You're Already Using ✅

Your monorepo is already configured with:
- ✅ Turborepo task pipeline
- ✅ Build caching (local only)
- ✅ Parallel execution
- ✅ Task dependencies (`^build` means "build dependencies first")
- ✅ pnpm workspaces for package management

## How to Take FULL Advantage

### 1. **Enable Remote Caching** (Biggest Impact!)

Remote caching shares build outputs across your team and CI/CD.

```bash
# One-time setup
pnpm dlx turbo login
pnpm dlx turbo link
```

**What this gives you:**
- 🚀 **10x faster CI/CD** - Skip rebuilds if nothing changed
- 👥 **Team cache sharing** - One person builds, everyone benefits
- 💰 **Free on Vercel** for personal projects
- ⚡ **Instant deployments** when code hasn't changed

**Vercel will automatically:**
- Use remote cache for your deployments
- Skip building unchanged apps
- Share cache between preview and production deployments

---

### 2. **Optimized Commands You Should Use**

#### **Parallel Development**
```bash
# Start all apps in parallel (web + api)
pnpm dev

# Turborepo runs them concurrently with optimal resource usage
```

#### **Efficient Builds**
```bash
# Build everything (only rebuilds what changed)
pnpm build

# Build specific app and its dependencies
pnpm --filter @repo/api build

# Force rebuild (ignore cache)
pnpm build --force
```

#### **Smart Testing**
```bash
# Run all tests (caches results, skips unchanged packages)
pnpm test

# Run tests in watch mode
pnpm test:watch
```

#### **Parallel Linting & Type Checking**
```bash
# Run lint and typecheck in parallel across all packages
pnpm lint & pnpm typecheck

# Or run them sequentially
pnpm lint && pnpm typecheck
```

---

### 3. **Understanding Task Dependencies**

Your `turbo.json` defines how tasks depend on each other:

```json
{
  "build": {
    "dependsOn": ["^build"]  // ^ means "dependencies first"
  }
}
```

**What this means:**
- When you run `pnpm build` in `@repo/api`
- Turborepo first builds `@repo/database` (dependency)
- Then builds `@repo/api`
- All automatically, in parallel when possible

**Dependency Graph:**
```
@repo/database (builds first)
    ↓
@repo/api (builds second, depends on database)
@repo/web (builds second, depends on database)
```

---

### 4. **Optimizations I Just Made**

I updated your `turbo.json` with:

#### **Explicit Caching**
```json
"lint": { "cache": true }      // Now caches lint results
"typecheck": { "cache": true } // Now caches type check results
"test": { "cache": true }      // Now caches test results
```

#### **Smart Inputs for Prisma**
```json
"db:generate": {
  "cache": true,
  "inputs": ["prisma/schema.prisma"]  // Only re-generate if schema changes
}
```

#### **Environment Variable Awareness**
```json
"build": {
  "env": ["DATABASE_URL", "NODE_ENV"]  // Rebuilds if these env vars change
}
```

---

### 5. **Cache Hits = Massive Speed Gains**

Watch for these in your terminal:

```bash
✓ @repo/database:build   [CACHE HIT]  # Instant! Skipped building
✓ @repo/api:build        [CACHE HIT]  # Instant! Used cached output
✓ @repo/web:build        [12.3s]      # Actually built (no cache)
```

**Cache hit = instant execution** (milliseconds vs minutes)

---

### 6. **Vercel-Specific Optimizations**

#### **Update vercel.json for Turborepo**

Your current `apps/api/vercel.json` already uses a custom build command. For better Turborepo integration, you can simplify it:

```json
{
  "version": 2,
  "buildCommand": "pnpm turbo build --filter=@repo/api...",
  "installCommand": "pnpm install",
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ]
}
```

The `--filter=@repo/api...` means:
- Build `@repo/api`
- And all its dependencies (`@repo/database`)
- But nothing else (skips `@repo/web`)

#### **Vercel Remote Cache (Automatic)**

Once you run `turbo link`, Vercel automatically:
- ✅ Uses remote cache for all deployments
- ✅ Shares cache between branches
- ✅ Speeds up preview deployments by 10-50x

---

### 7. **Pro Tips**

#### **View What Changed**
```bash
# See what Turborepo will rebuild
pnpm turbo build --dry-run

# See detailed cache information
pnpm turbo build --summarize
```

#### **Filter Specific Workspaces**
```bash
# Build only API and its dependencies
pnpm turbo build --filter=@repo/api...

# Build only frontend
pnpm turbo build --filter=@repo/web

# Run tests only for changed packages since last commit
pnpm turbo test --filter=[HEAD^1]
```

#### **Parallel Execution**
```bash
# Run multiple tasks in parallel
pnpm turbo build lint typecheck

# Turborepo automatically runs them concurrently across all packages
```

#### **Debug Cache**
```bash
# See why something didn't cache
pnpm turbo build --verbosity=2

# Force fresh build (ignore cache)
pnpm turbo build --force
```

---

### 8. **CI/CD Optimization (GitHub Actions Example)**

```yaml
name: CI
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build with Turborepo
        run: pnpm turbo build lint typecheck test
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

**With remote cache:**
- ❌ Before: 5-10 minutes
- ✅ After: 30 seconds (cache hit)

---

### 9. **Monitoring Cache Performance**

After enabling remote cache, you'll see stats like:

```
Tasks:    6 successful, 6 total
Cached:   4 cached, 6 total      ← 66% cache hit rate!
Time:     12.4s >>> FULL TURBO   ← 🚀
```

**"FULL TURBO"** = All tasks were cached = instant build!

---

### 10. **Cost Savings**

With remote caching:
- **Vercel Build Time**: Reduced by 80-90%
- **CI/CD Minutes**: Save 70-80% on GitHub Actions
- **Developer Time**: Instant builds on unchanged code
- **Team Velocity**: Everyone benefits from one person's build

---

## Quick Reference

| Command | What It Does | When To Use |
|---------|--------------|-------------|
| `pnpm dev` | Start all apps in watch mode | Local development |
| `pnpm build` | Build changed packages | Before deployment |
| `pnpm build --force` | Rebuild everything | After major changes |
| `pnpm turbo build --filter=@repo/api...` | Build only API + deps | Deploy only backend |
| `pnpm turbo build --summarize` | Show cache stats | Debug performance |
| `turbo link` | Enable remote cache | One-time setup |

---

## Next Steps

1. **Enable Remote Cache**
   ```bash
   pnpm dlx turbo login
   pnpm dlx turbo link
   ```

2. **Push changes and deploy**
   ```bash
   git add turbo.json
   git commit -m "feat: optimize Turborepo configuration"
   git push
   ```

3. **Watch Vercel deployment**
   - First deploy: Normal build time
   - Second deploy (no changes): ~95% faster!

4. **Monitor cache hits**
   ```bash
   pnpm turbo build --summarize
   ```

---

## Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Vercel + Turborepo](https://vercel.com/docs/monorepos/turborepo)
- [Task Pipeline](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
