# Documentation Index

This directory contains all project documentation for the Portfolio Monorepo.

> **🤖 For AI Agents**: See [AGENTS.md](../AGENTS.md) in the root directory for quick reference and guidelines.

## 📚 Documentation Structure

### Setup & Deployment
- **[SETUP.md](./SETUP.md)** - Development environment setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide for Vercel (frontend & backend)

### Archived Documentation
> Old migration guides and checklists are preserved in [docs/archive/](./archive/) for reference.

- **[MONOREPO_MIGRATION_GUIDE.md](./archive/MONOREPO_MIGRATION_GUIDE.md)** - Complete monorepo migration guide
- **[MIGRATION.md](./archive/MIGRATION.md)** - Migration history and references
- **[MIGRATION_PROGRESS_CHECKLIST.md](./archive/MIGRATION_PROGRESS_CHECKLIST.md)** - Migration progress tracking
- **[NEXT_AGENT_INSTRUCTIONS.md](./archive/NEXT_AGENT_INSTRUCTIONS.md)** - Instructions for future agent work

## 🏗️ Architecture

For detailed architecture and patterns, see the root [AGENTS.md](../AGENTS.md) which contains:
- Frontend patterns (Next.js, Auth0, i18n, MSW)
- Backend patterns (NestJS, Prisma, Zod validation)
- Development workflows and commands

Additional package-specific documentation:
- [../packages/env/README.md](../packages/env/README.md) - Environment variable management

## 📝 Adding New Documentation

When creating new documentation:

1. **Place files in this `docs/` directory** (or appropriate subdirectory)
2. **Update this README.md** to include the new document
3. **Reference it in [AGENTS.md](../AGENTS.md)** if it's important for AI agents
4. **Use descriptive filenames** in SCREAMING_SNAKE_CASE or kebab-case

### Suggested Subdirectories

Consider creating these subdirectories as needed:
- `docs/architecture/` - System architecture and design docs
- `docs/features/` - Feature specifications and requirements
- `docs/api/` - API documentation
- `docs/guides/` - How-to guides and tutorials

---

**Last Updated**: 2025-11-29
