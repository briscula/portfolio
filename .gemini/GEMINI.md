# Gemini Code Assist - Portfolio Monorepo

**Gemini Code Assist specific instructions and settings.**

---

## 🎯 Quick Start

**Before coding, read these in order:**

1. **[`AGENTS.md`](../AGENTS.md)** - Instructions for all AI agents
2. **[`.docs/INDEX.md`](../.docs/INDEX.md)** - **Complete project documentation** (source of truth!)
3. **This file** - Gemini-specific guidelines

**The `.docs/INDEX.md` contains everything:** commands, architecture, database schema, auth, deployment, troubleshooting, etc.

---

## 🤖 Gemini Code Assist Specific Guidelines

### Code Generation Preferences

**TypeScript:**
- ✅ Use explicit types (avoid `any`)
- ✅ Use interfaces for object shapes
- ✅ Use type aliases for unions/intersections
- ✅ Prefer const assertions where appropriate

**React/Next.js:**
- ✅ Use functional components
- ✅ Use hooks (useState, useEffect, useMemo, useCallback)
- ✅ Server Components by default (only use 'use client' when necessary)
- ✅ Use TypeScript for props

**NestJS:**
- ✅ Use decorators (@Injectable, @Controller, etc.)
- ✅ Follow NestJS module structure
- ✅ Use DTOs with class-validator
- ✅ Use dependency injection

### Code Style

**Formatting:**
- ✅ Use Prettier defaults (configured in project)
- ✅ Use 2 spaces for indentation
- ✅ Single quotes for strings
- ✅ Semicolons at end of statements

**Naming Conventions:**
- ✅ camelCase for variables and functions
- ✅ PascalCase for classes, interfaces, types, components
- ✅ UPPER_CASE for constants
- ✅ kebab-case for file names

### Import Organization

```typescript
// 1. External dependencies
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/database';

// 2. Internal absolute imports
import { UserService } from '@/services/user.service';
import { AuthGuard } from '@/guards/auth.guard';

// 3. Relative imports
import { CreateUserDto } from './dto/create-user.dto';
```

---

## 📋 Common Workflows

### Database Schema Changes
```
1. Edit packages/database/prisma/schema.prisma
2. Run: pnpm db:generate
3. Run: pnpm db:migrate
4. Update affected TypeScript files
5. Build and test
```

### Adding API Endpoint (NestJS)
```
1. Create DTO with class-validator decorators
2. Add method to service with proper types
3. Add controller endpoint with:
   - @ApiTags() for Swagger grouping
   - @ApiOperation() for description
   - @UseGuards(UnifiedAuthGuard) for auth
4. Write unit tests
5. Run: pnpm build && pnpm test
```

### Adding React Component (Next.js)
```
1. Create component file in appropriate directory
2. Use TypeScript for props interface
3. Use 'use client' directive if client-side features needed
4. Import types from @repo/database if needed
5. Write tests
6. Run: pnpm build && pnpm test
```

---

## ⚡ Critical Reminders

### Database
- **Schema location**: `packages/database/prisma/schema.prisma`
- **Import from**: `@repo/database` (NEVER `@prisma/client`)
- **After changes**: Always run `pnpm db:generate`

### Transaction Model Fields
- **Use**: `amount`, `totalAmount`
- **DON'T use**: `cost`, `netCost` (old field names)
- **Why**: More semantically accurate across all transaction types

### Package Manager
- **Use**: `pnpm` (not npm or yarn)
- **Install**: `pnpm --filter @repo/web add package-name`
- **Why**: Better monorepo support, faster installs

### Turborepo
- **Build**: `pnpm build` (uses cache, only rebuilds changes)
- **Dev**: `pnpm dev` (parallel execution)
- **Why**: 10-50x faster with remote caching enabled

---

## 🎯 Testing Guidelines

### Unit Tests (Jest)
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let prisma: PrismaClient;

  beforeEach(() => {
    // Setup
  });

  it('should do something', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Integration Tests
- Place in `test/` directory
- Use separate test database
- Mock external services (Auth0, etc.)

### Frontend Tests (React Testing Library)
```typescript
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

---

## 📖 Documentation Reference

**All documentation is in `.docs/INDEX.md` - that's your primary reference.**

Quick links:
- **Complete Overview**: [`.docs/INDEX.md`](../.docs/INDEX.md)
- **Setup**: [`.docs/setup/SETUP.md`](../.docs/setup/SETUP.md)
- **Turborepo**: [`.docs/setup/TURBOREPO_GUIDE.md`](../.docs/setup/TURBOREPO_GUIDE.md)
- **Deployment**: [`.docs/deployment/VERCEL_DEPLOYMENT.md`](../.docs/deployment/VERCEL_DEPLOYMENT.md)
- **Frontend Architecture**: `apps/web/docs/`

---

## ✅ Pre-Commit Checklist

Before suggesting completion:
- [ ] Read relevant documentation in `.docs/INDEX.md`
- [ ] Code is properly typed (no `any` without justification)
- [ ] Imports are organized correctly
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] No secrets or env vars in code

---

## 🎓 Gemini Code Assist Best Practices

### When Suggesting Code
1. Read `.docs/INDEX.md` for context
2. Use project's existing patterns
3. Include proper TypeScript types
4. Add comments for complex logic
5. Suggest tests alongside code

### When Explaining Code
1. Reference documentation when relevant
2. Explain trade-offs of different approaches
3. Highlight potential issues or edge cases
4. Suggest improvements if appropriate

### When Debugging
1. Check `.docs/INDEX.md` Common Issues
2. Verify Prisma client is generated
3. Check for type mismatches
4. Verify environment variables
5. Check Turborepo cache state

---

## 🔍 Code Quality Standards

### Error Handling
```typescript
// ✅ Good - Specific error handling
try {
  await service.doSomething();
} catch (error) {
  if (error instanceof NotFoundException) {
    throw new BadRequestException('Resource not found');
  }
  throw error;
}

// ❌ Avoid - Silent failures
try {
  await service.doSomething();
} catch (error) {
  // Silent
}
```

### Async/Await
```typescript
// ✅ Good - Proper async handling
async function fetchData() {
  const data = await prisma.user.findMany();
  return data;
}

// ❌ Avoid - Unhandled promises
function fetchData() {
  return prisma.user.findMany(); // Missing await in async context
}
```

### Type Safety
```typescript
// ✅ Good - Explicit types
interface UserResponse {
  id: string;
  email: string;
  name: string;
}

async function getUser(id: string): Promise<UserResponse> {
  return prisma.user.findUnique({ where: { id } });
}

// ❌ Avoid - Implicit any
async function getUser(id) {
  return prisma.user.findUnique({ where: { id } });
}
```

---

**Remember**: `.docs/INDEX.md` is the source of truth. Reference it for all architectural decisions and patterns.

**Last Updated**: 2025-11-22
