# Monorepo Migration Configuration

**Fill in this template before starting the migration. Replace all `{{PLACEHOLDER}}` values with your actual information.**

---

## Repository Information

### Backend Repository
- **Git URL**: `{{BACKEND_REPO_URL}}`
  - Example: `https://github.com/yourusername/backend-api.git`
  - Or: `git@github.com:yourusername/backend-api.git`

- **Current Branch**: `{{BACKEND_BRANCH}}`
  - Usually: `main` or `master`

- **Tech Stack**:
  - Framework: NestJS
  - ORM: Prisma
  - Database: `{{DATABASE_TYPE}}` (e.g., PostgreSQL, MySQL, SQLite)
  - Language: TypeScript

### Frontend Repository
- **Git URL**: `{{FRONTEND_REPO_URL}}`
  - Example: `https://github.com/yourusername/frontend-web.git`
  - Or: `git@github.com:yourusername/frontend-web.git`

- **Current Branch**: `{{FRONTEND_BRANCH}}`
  - Usually: `main` or `master`

- **Tech Stack**:
  - Framework: Next.js (App Router)
  - Language: TypeScript

---

## Vercel Deployment Configuration

### Backend Vercel Project
- **Project Name**: `{{BACKEND_VERCEL_PROJECT}}`
  - Find this in Vercel dashboard URL: vercel.com/[team]/[project-name]

- **Production Domain**: `{{BACKEND_DOMAIN}}`
  - Example: `api.yourapp.com` or `yourapp-api.vercel.app`

- **Current Build Settings**:
  - Build Command: `{{BACKEND_BUILD_COMMAND}}`
    - Common: `npm run build` or `yarn build` or `pnpm build`
  - Output Directory: `{{BACKEND_OUTPUT_DIR}}`
    - Common: `dist` or `build`
  - Install Command: `{{BACKEND_INSTALL_COMMAND}}`
    - Common: `npm install` or `yarn` or `pnpm install`
  - Root Directory: `{{BACKEND_ROOT_DIR}}`
    - Usually: `.` (root) or leave blank

- **Environment Variables**:
  ```
  DATABASE_URL={{DATABASE_URL}}
  NODE_ENV=production
  {{OTHER_BACKEND_ENV_VARS}}
  ```

### Frontend Vercel Project
- **Project Name**: `{{FRONTEND_VERCEL_PROJECT}}`
  - Find this in Vercel dashboard URL: vercel.com/[team]/[project-name]

- **Production Domain**: `{{FRONTEND_DOMAIN}}`
  - Example: `app.yourapp.com` or `yourapp.vercel.app`

- **Current Build Settings**:
  - Build Command: `{{FRONTEND_BUILD_COMMAND}}`
    - Common: `npm run build` or `yarn build` or `next build`
  - Output Directory: `{{FRONTEND_OUTPUT_DIR}}`
    - Common: `.next` (Next.js default)
  - Install Command: `{{FRONTEND_INSTALL_COMMAND}}`
    - Common: `npm install` or `yarn` or `pnpm install`
  - Root Directory: `{{FRONTEND_ROOT_DIR}}`
    - Usually: `.` (root) or leave blank

- **Environment Variables**:
  ```
  NEXT_PUBLIC_API_URL={{API_URL}}
  NEXT_PUBLIC_APP_URL={{APP_URL}}
  {{OTHER_FRONTEND_ENV_VARS}}
  ```

---

## New Monorepo Configuration

### Monorepo Details
- **Name**: `{{MONOREPO_NAME}}`
  - Example: `my-app-monorepo` or `fullstack-app`

- **GitHub Organization/User**: `{{GITHUB_ORG}}`
  - Example: `yourusername` or `your-org-name`

- **New Monorepo URL**: `https://github.com/{{GITHUB_ORG}}/{{MONOREPO_NAME}}`

- **Package Manager**: `{{PACKAGE_MANAGER}}`
  - Recommended: `pnpm`
  - Alternatives: `yarn`, `npm`

### Development Ports
- **Frontend Dev Port**: `{{FRONTEND_DEV_PORT}}`
  - Common: `3000`

- **Backend Dev Port**: `{{BACKEND_DEV_PORT}}`
  - Common: `4000` or `3001`

---

## Database Configuration

- **Database Type**: `{{DATABASE_TYPE}}`
  - Example: PostgreSQL, MySQL, SQLite

- **Development Database URL**: `{{DEV_DATABASE_URL}}`
  - Example: `postgresql://user:password@localhost:5432/myapp_dev`
  - ⚠️ This will NOT be committed, only used locally

- **Prisma Schema Location** (current):
  - In backend repo at: `{{PRISMA_SCHEMA_PATH}}`
  - Common: `prisma/schema.prisma` or `src/prisma/schema.prisma`

---

## Additional Configuration

### Custom Build Scripts
Does either repo have custom build/deployment scripts?
- Backend custom scripts: `{{BACKEND_CUSTOM_SCRIPTS}}`
  - Example: post-build hooks, custom deployment commands
  - If none, write: `None`

- Frontend custom scripts: `{{FRONTEND_CUSTOM_SCRIPTS}}`
  - Example: pre-build scripts, asset generation
  - If none, write: `None`

### Dependencies to Note
Any special dependencies or configurations?
- Monorepo-incompatible packages: `{{INCOMPATIBLE_PACKAGES}}`
  - Some packages don't work well in monorepos
  - If unknown, write: `Unknown - investigate during migration`

- Native modules: `{{NATIVE_MODULES}}`
  - Example: bcrypt, sharp, canvas
  - If none, write: `None`

### Testing Setup
- Backend testing: `{{BACKEND_TEST_COMMAND}}`
  - Common: `npm test`, `jest`, `vitest`

- Frontend testing: `{{FRONTEND_TEST_COMMAND}}`
  - Common: `npm test`, `jest`, `vitest`, `playwright`

---

## Migration Preferences

### Git History
- **Preserve full git history?**: `{{PRESERVE_GIT_HISTORY}}`
  - Recommended: `No` (start fresh with references to original repos)
  - Advanced: `Yes` (use git filter-branch/subtree to preserve history)

### Shared Packages to Create
Which packages should be shared? (check all that apply)
- [x] `packages/database` - Prisma schema and client
- [x] `packages/shared` - Shared types, validators, utilities
- [x] `packages/typescript-config` - Shared TypeScript configs
- [x] `packages/eslint-config` - Shared ESLint configs
- [ ] `packages/ui` - Shared React components (future)
- [ ] `packages/api-client` - Generated API client (future)

---

## Pre-Migration Checklist

Before starting the migration, confirm:

- [ ] I have access to both repository URLs
- [ ] I have admin access to both Vercel projects
- [ ] I have documented all environment variables
- [ ] I have backup of current .env files
- [ ] I have tested that both apps currently work
- [ ] I have notified team members (if applicable)
- [ ] I have a rollback plan if needed
- [ ] Original repositories will remain untouched
- [ ] I understand this is a one-way migration

---

## Timeline and Approach

**Expected Duration**: `{{EXPECTED_DURATION}}`
- Estimated: 2-4 hours for migration + testing
- Plan extra time for Vercel configuration

**Migration Approach**: `{{APPROACH}}`
- Recommended: Do migration in non-production branch first
- Test thoroughly before switching production

**Deployment Strategy**: `{{DEPLOYMENT_STRATEGY}}`
- Recommended: Deploy to Vercel preview first, test, then switch production

---

## Notes and Special Considerations

Add any additional notes, concerns, or special requirements:

```
{{ADDITIONAL_NOTES}}

Example notes:
- Backend uses custom Prisma migrations that need special handling
- Frontend has environment-specific builds
- Some shared types are already duplicated and need consolidation
- Team uses specific commit message conventions
- Specific CI/CD pipelines to preserve
```

---

## Contact Information (for Claude to ask questions)

If Claude has questions during migration:
- **Your availability**: `{{YOUR_AVAILABILITY}}`
  - Example: "Available for questions M-F 9am-5pm EST"

- **Preferred communication**: `{{COMMUNICATION_METHOD}}`
  - Example: "Ask in this chat", "Create TODO items for review"

---

## Final Confirmation

**I confirm that**:
- [ ] All information above is accurate
- [ ] I have backups of both repositories
- [ ] I understand the migration process
- [ ] I'm ready to proceed with the migration
- [ ] I will review Claude's work at each phase

**Signature**: `{{YOUR_NAME}}`
**Date**: `{{DATE}}`

---

## How to Use This Template

1. **Fill in all {{PLACEHOLDER}} values** with your actual information
2. **Save this as** `MIGRATION_CONFIG.md` in your new monorepo directory
3. **Provide this file to Claude** along with `CLAUDE_AGENT_PROMPT.md` and `MONOREPO_MIGRATION_GUIDE.md`
4. **Claude will use this information** to perform the migration with your specific configuration

---

**Ready to migrate?** Once this template is complete, share it with Claude and reference the `CLAUDE_AGENT_PROMPT.md` to begin! 🚀
