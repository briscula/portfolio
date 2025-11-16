# Instructions for Next Agent

## 🎯 Current Status

The monorepo migration is **75% complete**. The structure is in place, but the apps need final configuration updates before they can run.

**Git Commit**: `7ded08f` - "feat: initial monorepo migration with Turborepo"

## ✅ What's Been Completed

1. ✅ Both repositories cloned and migrated
2. ✅ Turborepo and pnpm workspace configured
3. ✅ Prisma extracted to shared `packages/database`
4. ✅ Shared packages created (typescript-config, eslint-config, shared)
5. ✅ Package.json files updated with workspace dependencies
6. ✅ Comprehensive documentation created
7. ✅ Git commit with full migration history

## 🔴 Critical Tasks - MUST DO FIRST

### 1. Update Prisma Imports in Backend (HIGH PRIORITY)

**Problem**: The backend still imports from `@prisma/client` instead of the shared `@repo/database` package.

**Location**: `apps/api/src/**/*.ts`

**What to do**:
```bash
# Search for all Prisma imports
grep -r "from '@prisma/client'" apps/api/src/

# Files that need updating (estimated 10-15 files):
# - apps/api/src/prisma/prisma.service.ts
# - apps/api/src/portfolios/portfolios.service.ts
# - apps/api/src/transactions/transactions.service.ts
# - apps/api/src/users/users.service.ts
# - apps/api/src/positions/positions.service.ts
# - apps/api/src/dividend-analytics/dividend-analytics.service.ts
# - Any other files that import Prisma types
```

**Find and Replace**:
```typescript
// BEFORE (OLD)
import { PrismaClient, User, Transaction } from '@prisma/client';

// AFTER (NEW)
import { PrismaClient, User, Transaction } from '@repo/database';
```

**How to verify**:
```bash
# Should return NO results
grep -r "from '@prisma/client'" apps/api/src/
```

### 2. Update TypeScript Configurations

#### Backend tsconfig.json

**File**: `apps/api/tsconfig.json`

**Current state**: Uses local config
**Needed**: Extend from shared config and add workspace paths

**Update to**:
```json
{
  "extends": "@repo/typescript-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./",
    "paths": {
      "@repo/database": ["../../packages/database/src"],
      "@repo/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

#### Frontend tsconfig.json

**File**: `apps/web/tsconfig.json`

**Update to**:
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@repo/database": ["../../packages/database/src"],
      "@repo/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Remove Old Prisma Directory from Backend

**After** completing steps 1-2 and verifying imports work:

```bash
# Verify the shared database package has everything
ls -la packages/database/prisma/

# Should contain:
# - schema.prisma
# - migrations/
# - seed.ts

# Then remove old directory
rm -rf apps/api/prisma/
```

## ⚡ Important Tasks - Do Next

### 4. Install Dependencies

```bash
# From monorepo root
pnpm install
```

**Expected outcome**:
- All dependencies installed
- Workspace packages linked
- No errors

**Possible issues**:
- If pnpm not installed: `npm install -g pnpm`
- If version mismatch: Use pnpm 8.15.0 or higher

### 5. Generate Prisma Client

```bash
pnpm --filter @repo/database db:generate
```

**Expected outcome**:
- Prisma Client generated in `packages/database/node_modules/.prisma/client/`
- Types available to both apps

**Verify**:
```bash
# Should see generated client
ls -la packages/database/node_modules/.prisma/client/
```

### 6. Test TypeScript Compilation

```bash
# Check backend types
pnpm --filter @repo/api typecheck

# Check frontend types
pnpm --filter @repo/web typecheck

# Check all
pnpm typecheck
```

**Expected outcome**: No type errors

**Common errors to fix**:
- Missing import paths → Check tsconfig.json paths
- Prisma types not found → Regenerate Prisma client
- Workspace packages not found → Run `pnpm install`

### 7. Test Builds

```bash
# Build backend
pnpm --filter @repo/api build

# Build frontend
pnpm --filter @repo/web build

# Build all (uses Turbo pipeline)
pnpm build
```

**Expected outcome**: Both apps build successfully

### 8. Test Development Servers

#### Backend Only
```bash
pnpm --filter @repo/api dev
# Should start on http://localhost:4000
```

#### Frontend Only
```bash
pnpm --filter @repo/web dev
# Should start on http://localhost:3001
```

#### Both Together
```bash
pnpm dev
# Starts both in parallel
```

**Expected outcome**:
- Both servers start without errors
- No import/module errors
- Prisma client works in backend
- Frontend can be reached

## 📋 Verification Checklist

Before marking migration as complete, verify:

- [ ] All Prisma imports updated to `@repo/database`
- [ ] No references to `@prisma/client` in apps/api/src/
- [ ] Both tsconfig.json files extend from shared configs
- [ ] Workspace paths configured correctly
- [ ] Old `apps/api/prisma/` directory removed
- [ ] `pnpm install` completes successfully
- [ ] Prisma client generated
- [ ] `pnpm typecheck` passes for all apps
- [ ] `pnpm build` succeeds for all apps
- [ ] Backend dev server starts: `pnpm --filter @repo/api dev`
- [ ] Frontend dev server starts: `pnpm --filter @repo/web dev`
- [ ] Both apps start together: `pnpm dev`
- [ ] No console errors in either app

## 🔧 Troubleshooting Guide

### Issue: "Cannot find module '@repo/database'"

**Solution**:
```bash
pnpm install
pnpm --filter @repo/database db:generate
```

### Issue: Type errors in backend after changing imports

**Solution**:
```bash
# Regenerate Prisma client
pnpm --filter @repo/database db:generate

# Restart TypeScript server in IDE
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: "Module not found" in frontend

**Solution**:
Check tsconfig.json paths are correct:
```json
"paths": {
  "@/*": ["./src/*"],
  "@repo/database": ["../../packages/database/src"],
  "@repo/shared": ["../../packages/shared/src"]
}
```

### Issue: Build fails with workspace dependency errors

**Solution**:
```bash
# Clean and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Issue: Prisma client out of sync

**Solution**:
```bash
# Delete generated client and regenerate
rm -rf packages/database/node_modules/.prisma
pnpm --filter @repo/database db:generate
```

## 📚 Reference Files

- **Migration History**: See `MIGRATION.md`
- **Setup Instructions**: See `SETUP.md`
- **Quick Start**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`

## 🎯 Success Criteria

The migration is **100% complete** when:

1. ✅ All imports updated
2. ✅ All configurations updated
3. ✅ Dependencies installed
4. ✅ Prisma client generated
5. ✅ Type checking passes
6. ✅ All builds succeed
7. ✅ Both dev servers work
8. ✅ No errors in console
9. ✅ Verification checklist complete

## 💡 Tips for Next Agent

1. **Work methodically**: Complete critical tasks in order
2. **Verify each step**: Don't move on if something fails
3. **Use the grep command**: To find all files that need updating
4. **Test incrementally**: Check types after each major change
5. **Keep commit history**: Make commits after each successful phase

## 🚀 After Migration is Complete

Once all tasks are done:

1. Update `MIGRATION.md` with completion status
2. Test end-to-end functionality
3. Consider running database migrations if needed
4. Review environment variables setup
5. Plan Vercel deployment configuration

## 📊 Progress Tracking

**Phase 1-7**: ✅ Complete (Structure setup)
**Phase 8**: 🔄 In Progress (Import updates and configuration)
**Phase 9**: ⏳ Pending (Testing and verification)
**Phase 10**: ⏳ Pending (Deployment and optimization)

---

**Good luck!** The hard work is done. Now it's just configuration and testing. 🎉

If you encounter any issues not covered here, refer to the main documentation files or the original migration guide.

---

**Last Updated**: November 16, 2024
**Handoff Agent**: Claude AI (Initial Migration)
**Next Agent**: Continue with critical tasks 1-8
