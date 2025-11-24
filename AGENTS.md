# AI Agent Instructions

**Welcome!** This file provides instructions for all AI coding agents working on this project.

---

## 🎯 Quick Start for All AI Agents

**Before doing ANYTHING, read this in order:**

1. **This file** (AGENTS.md) - You're reading it now ✓
2. **[`.docs/INDEX.md`](.docs/INDEX.md)** - **Complete project documentation** (READ THIS!)
3. **Agent-specific file** (optional) - See "Agent-Specific Settings" below

**The `.docs/INDEX.md` file is your source of truth.** It contains:
- Complete monorepo structure
- Technology stack
- Common commands
- Database schema (including field naming conventions!)
- Authentication architecture
- Deployment guidelines
- All documentation links

---

## 🤖 Agent-Specific Settings

Different AI agents may have additional configuration files:

### Claude Code
- **Settings**: `.claude/CLAUDE.md`
- **Purpose**: Claude-specific development guidelines and tool usage
- **Note**: Also references `.docs/INDEX.md` as primary source

### Gemini Code Assist
- **Settings**: `.gemini/GEMINI.md`
- **Purpose**: Gemini-specific configuration and preferences
- **Note**: Also references `.docs/INDEX.md` as primary source

### Cursor AI
- **Settings**: `.cursorrules` (if present)
- **Note**: Should reference `.docs/INDEX.md`

### GitHub Copilot
- No specific config needed, but read `.docs/INDEX.md` for context

---

## ⚡ Critical Information (Must Know!)

### 1. This is a Turborepo Monorepo
```
portfolio/
├── apps/web/       # Next.js frontend (port 3001)
├── apps/api/       # NestJS backend (port 3000)
└── packages/
    ├── database/   # Shared Prisma schema
    └── shared/     # Shared utilities
```

### 2. Database Package is Shared
- **Schema location**: `packages/database/prisma/schema.prisma`
- **Import from**: `@repo/database` (NEVER from `@prisma/client`)
- **After schema changes**: Always run `pnpm db:generate`

### 3. Transaction Model Field Names
**IMPORTANT**: The Transaction model uses `amount`/`totalAmount`, NOT `cost`/`netCost`:
- `amount` - Base transaction amount (quantity × price)
- `totalAmount` - Total including fees/taxes

This is a recent change. If you see `cost` or `netCost` in code, it's outdated.

### 4. Turborepo Commands
```bash
pnpm dev        # Start all apps in parallel
pnpm build      # Build only what changed (smart caching!)
pnpm test       # Run all tests
```

### 5. Package Management
- **Package manager**: pnpm (NOT npm or yarn)
- **Installing packages**: `pnpm --filter @repo/web add package-name`
- **Workspace protocol**: All internal packages use `workspace:*`

---

## 📋 Common Tasks

### Starting Development
```bash
pnpm install     # Install all dependencies
pnpm db:generate # Generate Prisma client
pnpm dev         # Start frontend + backend
```

### Making Database Changes
```bash
# 1. Edit packages/database/prisma/schema.prisma
# 2. Generate Prisma client
pnpm db:generate
# 3. Create migration
pnpm db:migrate
# 4. Update affected services/DTOs
```

### Adding a New API Endpoint
1. Read backend structure in `.docs/INDEX.md`
2. Create DTO in module directory
3. Add service method
4. Add controller endpoint with guards
5. Update Swagger annotations
6. Run `pnpm build` and `pnpm test`

### Fixing Type Errors
```bash
pnpm db:generate  # Regenerate Prisma types
pnpm build        # Check build
pnpm typecheck    # Type check without building
```

---

## 🚨 Important Rules

### DO:
✅ Read `.docs/INDEX.md` before making changes
✅ Use `pnpm` (not npm or yarn)
✅ Import from `@repo/database`, not `@prisma/client`
✅ Run `pnpm db:generate` after schema changes
✅ Use `amount`/`totalAmount` for Transaction fields
✅ Run tests before committing (`pnpm test`)
✅ Keep documentation updated

### DON'T:
❌ Import from `@prisma/client` directly
❌ Create Prisma schema files in apps (use `packages/database/`)
❌ Use `cost`/`netCost` field names (use `amount`/`totalAmount`)
❌ Commit environment variables or secrets
❌ Skip type checking (`pnpm typecheck`)
❌ Ignore Turborepo cache (use `pnpm build`, not manual compilation)

---

## 🎓 Learning the Codebase

**Recommended reading order:**

1. **Start**: `.docs/INDEX.md` - Complete overview
2. **Setup**: `.docs/setup/SETUP.md` - Get project running
3. **Architecture**:
   - Backend: See "Backend API" section in INDEX.md
   - Frontend: `apps/web/docs/architecture/`
4. **Deployment**: `.docs/deployment/VERCEL_DEPLOYMENT.md`
5. **Optimization**: `.docs/setup/TURBOREPO_GUIDE.md`

---

## 🔧 Troubleshooting

### "Cannot find module '@repo/database'"
```bash
pnpm db:generate
pnpm build
```

### "Column 'cost' does not exist"
The database uses `amount`/`totalAmount`, not `cost`/`netCost`. Update your code.

### "Turborepo cache issues"
```bash
rm -rf .turbo
pnpm build
```

### "Port already in use"
- Frontend runs on port 3001
- Backend runs on port 3000
- Check if other processes are using these ports

---

## 📖 Documentation Structure

```
.docs/
├── INDEX.md              ← READ THIS FIRST (complete reference)
├── setup/
│   ├── SETUP.md          ← Initial project setup
│   └── TURBOREPO_GUIDE.md← Performance optimization
├── deployment/
│   ├── VERCEL_DEPLOYMENT.md ← Recommended deployment
│   └── DEPLOYMENT.md     ← Legacy deployment
└── archive/              ← Historical migration docs
```

---

## 🤝 Working with Other Agents

If another AI agent worked on this project before you:
1. Read the git commit history
2. Check `.docs/INDEX.md` for latest architecture decisions
3. Look for TODO comments in code
4. Review recent PRs/issues on GitHub

---

## 💬 Communication Style

When explaining changes to the user:
- Be concise but thorough
- Explain "why" not just "what"
- Reference documentation when relevant
- Highlight breaking changes
- Suggest testing steps

---

## 📞 Getting Help

**Stuck on something?**

1. Check `.docs/INDEX.md` for the topic
2. Look in relevant guide (setup, deployment, etc.)
3. Check frontend-specific docs in `apps/web/docs/`
4. Review git commit history for recent changes
5. Check the "Common Issues" section in INDEX.md

---

## ✅ Pre-Commit Checklist

Before completing any task:
- [ ] Read relevant documentation in `.docs/`
- [ ] Code builds successfully (`pnpm build`)
- [ ] Types are correct (`pnpm typecheck`)
- [ ] Code is linted (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
- [ ] No secrets in code
- [ ] Documentation updated if needed

---

**Remember**: `.docs/INDEX.md` is your friend. Read it first, reference it often, keep it updated.

**Last Updated**: 2025-11-22
