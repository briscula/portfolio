<!--
  Sync Impact Report
  ====================
  Version change: 0.0.0 → 1.0.0 (Initial ratification)

  Modified principles: N/A (initial creation)

  Added sections:
  - Core Principles (5 principles)
  - Technology Constraints
  - Development Workflow
  - Quality Gates
  - Governance

  Removed sections: N/A

  Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section already exists)
  - .specify/templates/spec-template.md ✅ (No constitution-specific updates required)
  - .specify/templates/tasks-template.md ✅ (Test-first guidance already aligned)

  Follow-up TODOs: None
-->

# Portfolio Tracker Constitution

## Core Principles

### I. Type Safety & Validation First

All data crossing boundaries MUST be validated using Zod schemas. This applies to:
- API request/response payloads via DTOs in `apps/api/src/*/dto/`
- Environment variables via `@repo/env` package (NEVER use `process.env` directly)
- Database inputs/outputs via Prisma types
- Frontend form data and API responses

**Rationale**: Financial data integrity is non-negotiable. Type-safe validation at boundaries prevents data corruption, security vulnerabilities, and runtime errors that could affect portfolio calculations or user funds.

### II. Test-First Development

Tests MUST be written before implementation for all non-trivial features:
- Write failing test → Get approval → Implement → Test passes
- Red-Green-Refactor cycle strictly enforced
- Contract tests for API endpoints
- Integration tests for critical user flows (portfolio operations, transactions)

**Rationale**: Investment tracking requires high reliability. Test-first ensures requirements are understood before coding and prevents regressions in financial calculations.

### III. Monorepo Hygiene

The Turborepo structure MUST be maintained with clear boundaries:
- `apps/web`: Next.js 15 frontend ONLY
- `apps/api`: NestJS backend ONLY
- `packages/*`: Shared code with explicit exports
- Cross-package imports MUST use workspace protocol (`@repo/*`)
- NEVER duplicate code that exists in a shared package

**Rationale**: Clear separation enables independent deployment, faster builds via caching, and prevents circular dependencies that complicate maintenance.

### IV. Security & Authentication

All protected resources MUST use the dual authentication system:
- Auth0 for user session management (`@auth0/nextjs-auth0`)
- JWT validation for API access (`UnifiedAuthGuard`)
- Credentials (`.env`, API keys, tokens) MUST NEVER be committed
- Database migrations require explicit confirmation

**Rationale**: Financial applications are high-value targets. Defense in depth with validated auth flows protects user data and portfolio information.

### V. Simplicity & YAGNI

Every addition MUST justify its complexity:
- Start with the simplest solution that works
- No speculative features or "future-proofing" abstractions
- Prefer 3 similar lines over a premature abstraction
- Delete unused code immediately (no `_prefixed` variables, no re-exports for compatibility)

**Rationale**: Complexity is the enemy of reliability. Financial systems benefit from understandable, auditable code over clever abstractions.

## Technology Constraints

**Mandated Stack** (deviations require documented justification):

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js (App Router) | 15.x |
| Frontend Styling | Tailwind CSS | 4.x |
| Backend Framework | NestJS | Latest |
| ORM | Prisma | Latest |
| Database | PostgreSQL | 14+ |
| Validation | Zod (`nestjs-zod`) | Latest |
| Auth Provider | Auth0 | Current |
| State Management | React Query | v5 |
| Package Manager | pnpm | 8+ |
| Build System | Turborepo | Latest |

**Prohibited Patterns**:
- `process.env.*` without `@repo/env` wrapper
- `class-validator` (replaced by Zod)
- Direct database queries outside Prisma
- Documentation files outside `docs/` directory
- Migrations without explicit user confirmation

## Development Workflow

### Branch Strategy

- `main`: Production-ready code, protected
- `develop`: Integration branch for features
- `feat/*`: Feature branches from develop
- `fix/*`: Bug fix branches
- `hotfix/*`: Emergency production fixes from main

### Pull Request Requirements

1. All PRs MUST pass CI checks (build, lint, typecheck, test)
2. PRs MUST reference related issues or feature specs
3. Breaking changes MUST be documented in PR description
4. Database migrations MUST be reviewed separately

### Commit Standards

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Reference issue numbers where applicable
- Keep commits atomic and focused

## Quality Gates

### Pre-Commit (Automated)

- [ ] TypeScript compilation succeeds (`pnpm typecheck`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Prettier formatting applied

### Pre-Merge (CI Pipeline)

- [ ] All tests pass (`pnpm test`)
- [ ] Build succeeds for all apps (`pnpm build`)
- [ ] No new TypeScript errors
- [ ] Bundle size within limits (if configured)

### Pre-Deploy (Manual Verification)

- [ ] Environment variables validated for target environment
- [ ] Database migrations reviewed and tested
- [ ] Auth0 configuration verified
- [ ] Swagger documentation up to date

## Governance

### Amendment Process

1. Propose change via PR to this constitution
2. Document rationale and impact assessment
3. Update dependent templates if principles change
4. Version bump according to semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or section added
   - PATCH: Clarifications, wording improvements

### Compliance

- All PRs/reviews MUST verify adherence to these principles
- Constitution violations require documented justification in PR
- Complexity additions must pass Principle V review

### Reference Documents

- Primary guidance: `AGENTS.md` (root)
- Documentation index: `docs/README.md`
- Deployment guide: `docs/DEPLOYMENT.md`
- Environment setup: `packages/env/README.md`

**Version**: 1.0.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-22
