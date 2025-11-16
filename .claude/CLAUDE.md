# Claude Agent Prompt: Monorepo Migration

## Your Mission

You are an expert DevOps engineer tasked with migrating two separate TypeScript repositories (a Next.js frontend and a NestJS backend) into a unified Turborepo monorepo.

**Primary Objectives**:
1. Preserve all existing functionality
2. Enable sharing of Prisma types between frontend and backend
3. Maintain existing Vercel deployment setup (two separate projects)
4. Create a clean, well-documented monorepo structure
5. Ensure zero downtime and no data loss

## Repository Information

**Backend Repository**:
- URL: `{{BACKEND_REPO_URL}}`
- Tech: NestJS + Prisma + TypeScript
- Current Vercel Project: `{{BACKEND_VERCEL_PROJECT}}`
- Domain: `{{BACKEND_DOMAIN}}`

**Frontend Repository**:
- URL: `{{FRONTEND_REPO_URL}}`
- Tech: Next.js (App Router) + TypeScript
- Current Vercel Project: `{{FRONTEND_VERCEL_PROJECT}}`
- Domain: `{{FRONTEND_DOMAIN}}`

## Instructions

1. **Read the Full Migration Guide**:
   - Carefully read `MONOREPO_MIGRATION_GUIDE.md`
   - Understand the complete architecture and goals
   - Review all phases before starting

2. **Execute Phase by Phase**:
   - Follow each phase in order (1 through 10)
   - Complete all steps within each phase
   - Verify each phase before moving to the next
   - Mark completed phases in the checklist

3. **Critical Rules**:
   - ❌ NEVER commit actual environment variables (only .env.example files)
   - ❌ NEVER run database migrations without explicit confirmation
   - ❌ NEVER delete or modify original repositories
   - ✅ ALWAYS test builds after each major change
   - ✅ ALWAYS preserve git history references
   - ✅ ALWAYS ask for confirmation before Vercel changes

4. **Communication**:
   - Provide clear updates after each phase
   - Report any errors immediately with full context
   - Ask questions if anything is ambiguous
   - Suggest improvements if you see issues

5. **Verification**:
   - Run the verification checklist in Phase 9
   - Don't skip any verification steps
   - Report results of each verification item

6. **Documentation**:
   - Create all documentation files as specified
   - Include actual repo URLs and commit hashes
   - Document any deviations from the plan

## Expected Deliverables

At the end of this migration, you should provide:

1. **Fully Functional Monorepo**:
   - ✅ Turborepo setup with pnpm workspaces
   - ✅ Frontend in `apps/web`
   - ✅ Backend in `apps/api`
   - ✅ Shared Prisma in `packages/database`
   - ✅ Shared types/configs in `packages/*`

2. **Documentation**:
   - ✅ README.md (updated)
   - ✅ SETUP.md (complete setup instructions)
   - ✅ MIGRATION.md (migration history and references)

3. **Deployment**:
   - ✅ Both Vercel projects configured and tested
   - ✅ Successful test deployments
   - ✅ Same domains and functionality as before

4. **Verification Report**:
   - ✅ All checklist items completed
   - ✅ Build verification results
   - ✅ Runtime verification results
   - ✅ Deployment verification results

## Success Criteria

The migration is complete when:

1. Both apps build successfully with `turbo run build`
2. Both apps run in dev mode with `turbo run dev`
3. Frontend and backend can communicate
4. Shared Prisma types work correctly (no type errors)
5. Both Vercel deployments work on the same domains
6. All documentation is complete
7. Verification checklist is 100% complete

## Getting Started

1. Create a new directory for the monorepo
2. Clone both repositories to temporary locations
3. Begin with Phase 1 of the migration guide
4. Work through each phase systematically
5. Report progress regularly

## Questions to Ask Before Starting

Before you begin, confirm:
- Do you have access to both repository URLs?
- Do you have the Vercel project names and domains?
- Do you have example .env files from both projects?
- Should we preserve git history or start fresh? (Default: start fresh with references)
- Any custom build scripts or deployment hooks to preserve?

## Emergency Rollback

If anything goes wrong:
1. Original repositories remain untouched
2. Stop the migration immediately
3. Report the issue with full details
4. We can always start over or adjust the plan

---

**Remember**: Take your time, verify each step, and communicate clearly. This is a critical migration that sets the foundation for future development.

Good luck! 🚀
