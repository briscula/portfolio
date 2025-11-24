# Claude Code - Portfolio Monorepo

**Claude Code specific instructions and settings.**

---

## 🎯 Quick Start

**Before coding, read these in order:**

1. **[`AGENTS.md`](../AGENTS.md)** - Instructions for all AI agents
2. **[`.docs/INDEX.md`](../.docs/INDEX.md)** - **Complete project documentation** (source of truth!)
3. **This file** - Claude-specific guidelines

**The `.docs/INDEX.md` contains everything:** commands, architecture, database schema, auth, deployment, troubleshooting, etc.

---

## 🤖 Claude Code Specific Guidelines

### Tool Usage

**File Operations:**
- ✅ Use `Read`, `Edit`, `Write` tools for file operations
- ❌ DON'T use bash commands (`cat`, `grep`, `sed`) for file operations
- ✅ Use `Glob` for finding files by pattern
- ✅ Use `Grep` for searching file contents

**Exploration:**
- ✅ Use `Task` tool with `subagent_type=Explore` for codebase exploration
- ❌ DON'T run multiple grep/glob commands manually when exploring

**Git Operations:**
- ✅ Follow the Git Safety Protocol in tool descriptions
- ✅ Create meaningful commit messages
- ✅ Add Claude Code attribution footer to commits
- ❌ NEVER run destructive git commands without user approval
- ❌ NEVER skip hooks or force push to main/master

### Communication Style

- ✅ Be concise and direct
- ✅ Use markdown for formatting
- ✅ Output text directly (not via echo/bash)
- ❌ DON'T use emojis unless user requests
- ❌ DON'T use excessive validation or praise

### Task Management

- ✅ Use `TodoWrite` tool for complex multi-step tasks
- ✅ Mark todos as completed immediately after finishing
- ✅ Keep todo list updated and relevant
- ❌ DON'T batch multiple completions

---

## 📋 Common Workflows

### Database Schema Changes
```
1. Read packages/database/prisma/schema.prisma
2. Make changes
3. Run: pnpm db:generate
4. Run: pnpm db:migrate
5. Update affected services/DTOs
6. Build and test
```

### Adding API Endpoint
```
1. Read .docs/INDEX.md for backend architecture
2. Create DTO
3. Update service
4. Update controller
5. Add Swagger annotations
6. Write tests
7. Build and test
```

### Fixing Build Errors
```
1. Run: pnpm typecheck (identify issues)
2. If Prisma-related: pnpm db:generate
3. Fix type errors
4. Run: pnpm build
5. Run: pnpm test
```

---

## ⚡ Critical Reminders

### Database
- **Schema location**: `packages/database/prisma/schema.prisma`
- **Import from**: `@repo/database` (NEVER `@prisma/client`)
- **After changes**: Always `pnpm db:generate`

### Transaction Model
- **Use**: `amount`, `totalAmount`
- **DON'T use**: `cost`, `netCost` (these are old field names)

### Package Manager
- **Use**: `pnpm` (not npm or yarn)
- **Install packages**: `pnpm --filter @repo/web add package-name`

### Turborepo
- **Build**: `pnpm build` (caches automatically, only rebuilds changes)
- **Dev**: `pnpm dev` (runs all apps in parallel)
- **Clean cache**: `rm -rf .turbo && pnpm build`

---

## 📖 Documentation Reference

**All documentation is in `.docs/INDEX.md` - that's your primary reference.**

Quick links:
- **Complete Overview**: [`.docs/INDEX.md`](../.docs/INDEX.md)
- **Setup**: [`.docs/setup/SETUP.md`](../.docs/setup/SETUP.md)
- **Turborepo**: [`.docs/setup/TURBOREPO_GUIDE.md`](../.docs/setup/TURBOREPO_GUIDE.md)
- **Deployment**: [`.docs/deployment/VERCEL_DEPLOYMENT.md`](../.docs/deployment/VERCEL_DEPLOYMENT.md)
- **Frontend Docs**: `apps/web/docs/`

---

## ✅ Pre-Commit Checklist

Before completing tasks:
- [ ] Read relevant documentation in `.docs/INDEX.md`
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] No secrets committed
- [ ] Git commit follows Safety Protocol

---

## 🎓 Claude Code Best Practices

### When Starting a New Task
1. Read `.docs/INDEX.md` for context
2. Use `Grep`/`Glob` to find relevant files
3. Use `Read` to understand existing code
4. Make changes
5. Test thoroughly
6. Create clear commit message

### When Stuck
1. Check `.docs/INDEX.md` Common Issues section
2. Check git history for recent changes
3. Read frontend docs in `apps/web/docs/`
4. Use `Task` tool with `Explore` agent

### When Making Breaking Changes
1. Explain impact to user
2. Update documentation
3. Update tests
4. Verify build passes
5. Clear about migration steps if needed

---

**Remember**: `.docs/INDEX.md` is the source of truth. Reference it liberally, keep it updated.

**Last Updated**: 2025-11-22
