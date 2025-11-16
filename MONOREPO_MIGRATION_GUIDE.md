# Turborepo Monorepo Migration Guide

## Mission Statement

Migrate two separate repositories (frontend and backend) into a unified Turborepo monorepo while preserving all existing functionality, git history, and deployment configurations. The goal is to enable shared code (particularly Prisma types), coordinated development, and better support for AI-assisted development across the full stack.

## Current State

### Repository A: Frontend
- **Tech Stack**: Next.js with App Router
- **Language**: TypeScript
- **Deployment**: Vercel (separate project)
- **URL**: `[FRONTEND_REPO_URL]` ← You will provide this
- **Key Features**:
  - Next.js 15+ with App Router
  - TypeScript
  - React components
  - May import types from backend or duplicate them

### Repository B: Backend
- **Tech Stack**: NestJS + Prisma
- **Language**: TypeScript
- **Deployment**: Vercel (separate project)
- **URL**: `[BACKEND_REPO_URL]` ← You will provide this
- **Key Features**:
  - NestJS framework
  - Prisma ORM with database schema
  - REST API endpoints
  - TypeScript DTOs and entities

### Current Pain Points
1. Type definitions duplicated or manually synced between repos
2. Prisma schema and generated types not easily shared
3. Breaking changes require coordinating PRs across two repos
4. Claude AI has limited context when working across repos
5. Shared utilities/validators need to be duplicated

## Desired End State

### Monorepo Structure
```
monorepo/
├── apps/
│   ├── web/                    # Frontend (Next.js)
│   │   ├── app/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── api/                    # Backend (NestJS)
│       ├── src/
│       ├── test/
│       ├── package.json
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── .env.example
├── packages/
│   ├── database/               # Shared Prisma schema and client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   └── index.ts       # Re-export Prisma client
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── typescript-config/      # Shared TypeScript configs
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── nestjs.json
│   │   └── package.json
│   ├── eslint-config/         # Shared ESLint configs
│   │   ├── base.js
│   │   ├── nextjs.js
│   │   ├── nestjs.js
│   │   └── package.json
│   └── shared/                # Shared types, validators, utils
│       ├── src/
│       │   ├── types/         # Shared TypeScript types
│       │   ├── validators/    # Zod schemas
│       │   └── utils/         # Common utilities
│       ├── package.json
│       └── tsconfig.json
├── .github/
│   └── workflows/             # CI/CD workflows
├── turbo.json                 # Turborepo configuration
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace configuration
├── .gitignore                 # Combined gitignore
├── README.md                  # Monorepo documentation
└── .env.example               # Environment variables template
```

### Vercel Deployment Strategy
**CRITICAL**: Maintain two separate Vercel projects exactly as they are now:
1. **Frontend Vercel Project**: Points to `apps/web` in monorepo
2. **Backend Vercel Project**: Points to `apps/api` in monorepo

Both projects will deploy from the same monorepo but build independently.

## Architecture Decisions

### 1. Package Manager: pnpm
- **Why**: Fast, efficient, best workspace support
- **Alternative considered**: yarn, npm
- **Decision**: Use pnpm for better monorepo performance

### 2. Monorepo Tool: Turborepo
- **Why**: Simple, fast, Vercel integration, perfect for 2-app setup
- **Alternative considered**: Nx (too complex for our needs)
- **Decision**: Turborepo for build orchestration

### 3. Shared Database Package
- **Strategy**: Move Prisma to `packages/database`
- **Benefits**:
  - Single source of truth for schema
  - Both apps import generated types
  - No type duplication
  - Coordinated migrations

### 4. Shared Code Philosophy
**What to share**:
- Prisma schema and generated client (`packages/database`)
- Type definitions used by both apps (`packages/shared/types`)
- Validation schemas (Zod) (`packages/shared/validators`)
- Common utilities (`packages/shared/utils`)
- TypeScript/ESLint configs (`packages/typescript-config`, `packages/eslint-config`)

**What NOT to share**:
- Framework-specific code (NestJS modules, Next.js pages)
- API route handlers
- React components (unless building a UI library later)
- App-specific business logic

### 5. Git History Preservation
- Use git subtree/filter-branch to preserve commit history
- Tag the migration point in both original repos
- Archive original repos (don't delete)

## Step-by-Step Migration Plan

### Phase 1: Environment Setup

#### Step 1.1: Create New Monorepo Directory
```bash
# Create and navigate to new directory
mkdir monorepo && cd monorepo

# Initialize git
git init

# Create initial README
cat > README.md << 'EOF'
# Full-Stack Monorepo

Turborepo monorepo containing frontend (Next.js) and backend (NestJS) applications.

## Structure
- `apps/web` - Next.js frontend
- `apps/api` - NestJS backend
- `packages/*` - Shared packages

## Getting Started
See [SETUP.md](./SETUP.md) for detailed setup instructions.
EOF

git add README.md
git commit -m "Initial commit: monorepo setup"
```

#### Step 1.2: Initialize Turborepo
```bash
# Install Turborepo globally (optional)
npm install -g turbo

# Initialize pnpm
npm install -g pnpm
pnpm init
```

#### Step 1.3: Create Root package.json
```json
{
  "name": "monorepo",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

#### Step 1.4: Create pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### Step 1.5: Create turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:generate": {
      "cache": false,
      "outputs": ["node_modules/.prisma/**"]
    }
  }
}
```

#### Step 1.6: Create Directory Structure
```bash
# Create apps directory
mkdir -p apps/web apps/api

# Create packages directory
mkdir -p packages/database/prisma/src
mkdir -p packages/typescript-config
mkdir -p packages/eslint-config
mkdir -p packages/shared/src/{types,validators,utils}
```

### Phase 2: Clone and Migrate Backend Repository

#### Step 2.1: Clone Backend Repository
```bash
# Clone backend repo (temporary location)
cd /tmp
git clone [BACKEND_REPO_URL] backend-temp
cd backend-temp

# Note the current git hash for reference
git log --oneline -1 > /tmp/backend-migration-point.txt
```

#### Step 2.2: Copy Backend to Monorepo
```bash
# Copy all files to apps/api (excluding .git)
cd /path/to/monorepo
rsync -av --exclude='.git' --exclude='node_modules' /tmp/backend-temp/ apps/api/

# Preserve .env.example if it exists
if [ -f /tmp/backend-temp/.env.example ]; then
  cp /tmp/backend-temp/.env.example apps/api/.env.example
fi
```

#### Step 2.3: Extract and Move Prisma to Shared Package
```bash
# Move Prisma schema to shared package
mv apps/api/prisma/* packages/database/prisma/

# Create database package index
cat > packages/database/src/index.ts << 'EOF'
// Re-export Prisma Client for use across the monorepo
export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';
EOF

# Create database package.json
cat > packages/database/package.json << 'EOF'
{
  "name": "@repo/database",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0"
  }
}
EOF

# Create database tsconfig.json
cat > packages/database/tsconfig.json << 'EOF'
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

#### Step 2.4: Update Backend Dependencies
```bash
# Update apps/api/package.json to reference shared database
cd apps/api

# Add workspace dependency to package.json
# This needs to be done by editing the file:
```

Update `apps/api/package.json`:
```json
{
  "name": "@repo/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "test": "jest",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/shared": "workspace:*",
    // ... keep all existing NestJS dependencies
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    // ... keep all existing dev dependencies
  }
}
```

#### Step 2.5: Update Backend Imports
Find and replace all Prisma imports in the backend:

```bash
# Find all files importing from @prisma/client or local prisma
cd apps/api
grep -r "from '@prisma/client'" src/
grep -r "from '../prisma'" src/
grep -r "from './prisma'" src/

# Update imports to use shared package
# Replace: import { PrismaClient } from '@prisma/client'
# With:    import { PrismaClient } from '@repo/database'
```

**Manual update required**: Go through each file and update imports.

Example before:
```typescript
import { PrismaClient } from '@prisma/client';
```

Example after:
```typescript
import { PrismaClient } from '@repo/database';
```

#### Step 2.6: Update Backend tsconfig.json
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

### Phase 3: Clone and Migrate Frontend Repository

#### Step 3.1: Clone Frontend Repository
```bash
# Clone frontend repo (temporary location)
cd /tmp
git clone [FRONTEND_REPO_URL] frontend-temp
cd frontend-temp

# Note the current git hash for reference
git log --oneline -1 > /tmp/frontend-migration-point.txt
```

#### Step 3.2: Copy Frontend to Monorepo
```bash
# Copy all files to apps/web (excluding .git)
cd /path/to/monorepo
rsync -av --exclude='.git' --exclude='node_modules' /tmp/frontend-temp/ apps/web/

# Preserve .env.example if it exists
if [ -f /tmp/frontend-temp/.env.example ]; then
  cp /tmp/frontend-temp/.env.example apps/web/.env.example
fi
```

#### Step 3.3: Update Frontend Dependencies
Update `apps/web/package.json`:
```json
{
  "name": "@repo/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/shared": "workspace:*",
    // ... keep all existing Next.js dependencies
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    // ... keep all existing dev dependencies
  }
}
```

#### Step 3.4: Update Frontend Imports
If the frontend currently imports types from the backend or has duplicated types:

```bash
# Find any imports that reference backend types or duplicated Prisma types
cd apps/web
grep -r "from '@prisma/client'" .
grep -r "// TODO: sync with backend" .
```

Update to use shared packages:
```typescript
// Before (if importing Prisma types)
import { User } from '@prisma/client'

// After
import { User } from '@repo/database'

// Before (if using custom types that should be shared)
import { CreateUserDto } from '../types/user'

// After (move to shared package first)
import { CreateUserDto } from '@repo/shared/types'
```

#### Step 3.5: Update Frontend tsconfig.json
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./app/*"],
      "@repo/database": ["../../packages/database/src"],
      "@repo/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Phase 4: Create Shared Packages

#### Step 4.1: TypeScript Config Package
```bash
cd packages/typescript-config
```

Create `base.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true
  }
}
```

Create `nextjs.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  }
}
```

Create `nestjs.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

Create `package.json`:
```json
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "files": [
    "base.json",
    "nextjs.json",
    "nestjs.json"
  ]
}
```

#### Step 4.2: ESLint Config Package
```bash
cd packages/eslint-config
```

Create `base.js`:
```javascript
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
  },
};
```

Create `nextjs.js`:
```javascript
module.exports = {
  extends: ['next/core-web-vitals', './base.js'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
```

Create `nestjs.js`:
```javascript
module.exports = {
  extends: ['./base.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
```

Create `package.json`:
```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "files": [
    "base.js",
    "nextjs.js",
    "nestjs.js"
  ],
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "eslint-config-prettier": "^9.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

#### Step 4.3: Shared Package
```bash
cd packages/shared
```

Create `package.json`:
```json
{
  "name": "@repo/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.3.0"
  }
}
```

Create `src/index.ts`:
```typescript
// Export all shared types, validators, and utilities
export * from './types';
export * from './validators';
export * from './utils';
```

Create `src/types/index.ts`:
```typescript
// Shared TypeScript types
// Add types that are used by both frontend and backend

// Example:
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Add more shared types as needed
```

Create `src/validators/index.ts`:
```typescript
// Shared Zod validation schemas
import { z } from 'zod';

// Example validator
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);

// Add more validators that both frontend and backend can use
// This ensures validation logic is consistent across the stack
```

Create `src/utils/index.ts`:
```typescript
// Shared utility functions

// Example utilities
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Add more utilities as needed
```

Create `tsconfig.json`:
```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Phase 5: Install Dependencies and Test

#### Step 5.1: Install All Dependencies
```bash
cd /path/to/monorepo

# Install all dependencies across workspace
pnpm install

# This will:
# - Install root dependencies
# - Install dependencies for apps/web
# - Install dependencies for apps/api
# - Install dependencies for all packages
# - Link workspace dependencies automatically
```

#### Step 5.2: Generate Prisma Client
```bash
# Generate Prisma client in shared database package
cd packages/database
pnpm db:generate

# Or from root:
cd /path/to/monorepo
pnpm --filter @repo/database db:generate
```

#### Step 5.3: Build Shared Packages
```bash
# Build all packages (if they have build steps)
turbo run build --filter="./packages/*"
```

#### Step 5.4: Test Backend
```bash
# Create .env file for backend (copy from .env.example)
cd apps/api
cp .env.example .env
# Edit .env with actual values

# Test backend dev server
cd /path/to/monorepo
turbo run dev --filter=@repo/api

# Should start successfully on port 4000 (or configured port)
# Verify:
# - NestJS starts without errors
# - Prisma connection works
# - No import errors
```

#### Step 5.5: Test Frontend
```bash
# Create .env file for frontend (copy from .env.example)
cd apps/web
cp .env.example .env.local
# Edit .env.local with actual values (including backend API URL)

# Test frontend dev server
cd /path/to/monorepo
turbo run dev --filter=@repo/web

# Should start successfully on port 3000 (or configured port)
# Verify:
# - Next.js starts without errors
# - No import errors
# - Pages load correctly
```

#### Step 5.6: Test Both Apps Together
```bash
# Run both apps simultaneously
cd /path/to/monorepo
turbo run dev

# This should start both frontend and backend in parallel
# Verify:
# - Both apps start successfully
# - Frontend can communicate with backend API
# - No type errors
# - Shared types are working correctly
```

### Phase 6: Git Configuration

#### Step 6.1: Create .gitignore
```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov

# Next.js
.next/
out/
build
dist/

# NestJS
dist/

# Production
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Turbo
.turbo

# Prisma
*.db
*.db-journal

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/
.loadpath

# OS
Thumbs.db
EOF
```

#### Step 6.2: Commit Initial Migration
```bash
git add .
git commit -m "feat: initial monorepo migration

- Migrate backend from [BACKEND_REPO_URL]
- Migrate frontend from [FRONTEND_REPO_URL]
- Setup Turborepo with pnpm workspaces
- Extract Prisma to shared package
- Create shared packages for configs and types
- Configure build pipeline

Backend migration point: $(cat /tmp/backend-migration-point.txt)
Frontend migration point: $(cat /tmp/frontend-migration-point.txt)"
```

#### Step 6.3: Create GitHub Repository
```bash
# Create new GitHub repository (use gh CLI or web interface)
gh repo create your-org/monorepo --private --source=. --remote=origin

# Or manually:
# 1. Create repo on GitHub
# 2. Add remote: git remote add origin <repo-url>

# Push to GitHub
git push -u origin main
```

### Phase 7: Vercel Configuration

**CRITICAL**: Configure Vercel to deploy both apps separately from the monorepo.

#### Step 7.1: Detect Existing Vercel Projects

**ACTION REQUIRED**: Before proceeding, document the current Vercel setup:

1. **Frontend Vercel Project**:
   - Project name: `__________________`
   - Domain: `__________________`
   - Environment variables: List all env vars
   - Build command: `__________________`
   - Output directory: `__________________`
   - Install command: `__________________`

2. **Backend Vercel Project**:
   - Project name: `__________________`
   - Domain: `__________________`
   - Environment variables: List all env vars
   - Build command: `__________________`
   - Output directory: `__________________`
   - Install command: `__________________`

#### Step 7.2: Configure Frontend Vercel Project

**Option A: Via Vercel Dashboard**

1. Go to your frontend Vercel project settings
2. Go to "General" → "Build & Development Settings"
3. Update settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: Leave default or use `cd ../.. && turbo run build --filter=@repo/web`
   - **Output Directory**: Leave default (`.next`)
   - **Install Command**: `pnpm install` (or leave default if using npm/yarn detection)

4. Update Git settings:
   - Point to the new monorepo repository
   - Keep the same branch (usually `main`)

5. Environment Variables:
   - Copy all existing environment variables
   - Verify they still work with monorepo structure

**Option B: Via vercel.json in apps/web**

Create `apps/web/vercel.json`:
```json
{
  "buildCommand": "cd ../.. && pnpm run build --filter=@repo/web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

#### Step 7.3: Configure Backend Vercel Project

**Option A: Via Vercel Dashboard**

1. Go to your backend Vercel project settings
2. Go to "General" → "Build & Development Settings"
3. Update settings:
   - **Framework Preset**: Other (or NestJS if available)
   - **Root Directory**: `apps/api`
   - **Build Command**: `cd ../.. && turbo run build --filter=@repo/api`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. Update Git settings:
   - Point to the new monorepo repository
   - Keep the same branch

5. Environment Variables:
   - Copy all existing environment variables (including DATABASE_URL, etc.)
   - Verify Prisma connection works

**Option B: Via vercel.json in apps/api**

Create `apps/api/vercel.json`:
```json
{
  "buildCommand": "cd ../.. && pnpm run build --filter=@repo/api",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": "dist",
  "framework": null
}
```

#### Step 7.4: Test Vercel Deployments

**Test Backend Deployment**:
```bash
# From monorepo root
cd apps/api
vercel --prod

# Verify:
# - Builds successfully
# - Environment variables are loaded
# - Prisma migrations run (if configured)
# - API endpoints work
# - Same domain as before
```

**Test Frontend Deployment**:
```bash
# From monorepo root
cd apps/web
vercel --prod

# Verify:
# - Builds successfully
# - Environment variables are loaded
# - Can connect to backend API
# - Pages load correctly
# - Same domain as before
```

#### Step 7.5: Configure GitHub Integration

If using Vercel GitHub integration for auto-deploys:

1. Ensure both Vercel projects are connected to the new monorepo
2. Configure path filtering (optional):
   - Frontend: Only deploy when `apps/web/**` or `packages/**` changes
   - Backend: Only deploy when `apps/api/**` or `packages/**` changes

3. Set up preview deployments for both apps

### Phase 8: Documentation

#### Step 8.1: Create SETUP.md
```markdown
# Setup Guide

## Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL (or your database)

## Initial Setup

1. Clone the repository:
   \`\`\`bash
   git clone <repo-url>
   cd monorepo
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   # Backend
   cp apps/api/.env.example apps/api/.env
   # Edit apps/api/.env with your database URL and other secrets

   # Frontend
   cp apps/web/.env.example apps/web/.env.local
   # Edit apps/web/.env.local with API URL and other config
   \`\`\`

4. Generate Prisma client:
   \`\`\`bash
   pnpm --filter @repo/database db:generate
   \`\`\`

5. Run database migrations:
   \`\`\`bash
   pnpm --filter @repo/database db:migrate
   \`\`\`

6. Start development servers:
   \`\`\`bash
   pnpm dev
   \`\`\`

   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

## Common Commands

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm typecheck` - Type check all TypeScript
- `pnpm clean` - Clean all build artifacts and node_modules

## Working with Specific Apps

Run commands for specific apps using filters:

\`\`\`bash
# Frontend only
pnpm --filter @repo/web dev
pnpm --filter @repo/web build

# Backend only
pnpm --filter @repo/api dev
pnpm --filter @repo/api build

# Database package
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:studio
\`\`\`

## Adding Dependencies

\`\`\`bash
# Add to frontend
pnpm --filter @repo/web add <package>

# Add to backend
pnpm --filter @repo/api add <package>

# Add to shared package
pnpm --filter @repo/shared add <package>

# Add to workspace root (rare)
pnpm add -w <package>
\`\`\`

## Troubleshooting

### Prisma client not found
\`\`\`bash
pnpm --filter @repo/database db:generate
\`\`\`

### Type errors after pulling
\`\`\`bash
pnpm install
pnpm --filter @repo/database db:generate
pnpm typecheck
\`\`\`

### Build failures
\`\`\`bash
pnpm clean
pnpm install
pnpm build
\`\`\`
```

#### Step 8.2: Update Root README.md
Add comprehensive documentation about the monorepo structure, architecture decisions, and development workflow.

#### Step 8.3: Create MIGRATION.md
Document the migration process, original repo URLs, migration dates, and any important notes for future reference.

### Phase 9: Verification Checklist

Go through this checklist to ensure migration is complete:

#### Code Verification
- [ ] All backend files copied to `apps/api`
- [ ] All frontend files copied to `apps/web`
- [ ] Prisma schema moved to `packages/database`
- [ ] Shared types/validators created in `packages/shared`
- [ ] All imports updated to use workspace packages
- [ ] No references to old repo paths
- [ ] All TypeScript configs extend from shared configs

#### Build Verification
- [ ] `pnpm install` completes without errors
- [ ] `pnpm --filter @repo/database db:generate` works
- [ ] `turbo run build` builds all apps successfully
- [ ] No TypeScript errors in any app
- [ ] No ESLint errors in any app

#### Runtime Verification
- [ ] Backend starts with `turbo run dev --filter=@repo/api`
- [ ] Frontend starts with `turbo run dev --filter=@repo/web`
- [ ] Both apps start together with `turbo run dev`
- [ ] Frontend can call backend API successfully
- [ ] Database connections work
- [ ] Shared types are correctly imported and typed
- [ ] Environment variables load correctly

#### Deployment Verification
- [ ] Backend Vercel project configured and deployed
- [ ] Frontend Vercel project configured and deployed
- [ ] Both projects deploy from monorepo successfully
- [ ] Same domains as before migration
- [ ] Environment variables transferred
- [ ] Production builds work
- [ ] API endpoints accessible
- [ ] Frontend loads and functions correctly

#### Git Verification
- [ ] Monorepo pushed to GitHub
- [ ] All files committed
- [ ] .gitignore excludes correct files
- [ ] Migration documented in commit message
- [ ] Original repos archived/tagged

#### Documentation Verification
- [ ] README.md updated
- [ ] SETUP.md created
- [ ] MIGRATION.md created with original repo references
- [ ] Environment variable examples updated
- [ ] Development workflow documented

### Phase 10: Future Enhancements (Optional)

After successful migration, consider these enhancements:

#### Enhancement 1: Shared UI Component Library (Future)
When you need to share React components:
```bash
mkdir -p packages/ui
# Create component library that both apps can use
```

#### Enhancement 2: Mastra Agent Integration (Future - 6-12 months)
When ready to add AI agents:
```bash
mkdir -p apps/agents
# Add Mastra + AG-UI + CopilotKit
# See AG-UI integration guide
```

#### Enhancement 3: GitHub Actions CI/CD
Create `.github/workflows/ci.yml` for automated testing and deployments.

#### Enhancement 4: Shared API Client
Generate typed API client from NestJS for frontend:
```bash
mkdir -p packages/api-client
# Use @nestjs/swagger + openapi-typescript-codegen
```

## Critical Notes for Claude Agent

### Environment Variables
**IMPORTANT**: Never commit actual environment variables. Always use .env.example files as templates.

Current environment variables to preserve:
- Backend: DATABASE_URL, JWT_SECRET, API keys, etc.
- Frontend: NEXT_PUBLIC_API_URL, feature flags, etc.

### Database Migrations
**IMPORTANT**: Do not run migrations automatically. The user should review and run migrations manually to avoid data loss.

### Git History
We are NOT preserving full git history from both repos in the monorepo. We're starting fresh with a clean migration commit that references the original repo states. Original repos should be archived for history reference.

### Deployment Strategy
**CRITICAL**: The goal is to maintain the same deployment setup as before:
- Same Vercel projects
- Same domains
- Same environment variables
- Only difference: both deploy from monorepo instead of separate repos

### Type Safety
The primary goal of this migration is to enable sharing Prisma types between frontend and backend. After migration:
- Both apps import from `@repo/database` for Prisma types
- No duplicate type definitions
- Type safety across the full stack

### Testing Strategy
Before considering migration complete:
1. Test backend independently
2. Test frontend independently
3. Test both together
4. Deploy to Vercel staging/preview
5. Verify production deployment

### Rollback Plan
If migration fails:
- Original repos remain unchanged
- Can revert to original setup
- Monorepo is additive, not destructive

## Success Criteria

Migration is successful when:

1. ✅ Both apps build without errors
2. ✅ Both apps run in development mode
3. ✅ Shared Prisma types work across apps
4. ✅ Both apps deploy to Vercel successfully
5. ✅ Same functionality as before migration
6. ✅ Same deployment URLs as before
7. ✅ All environment variables working
8. ✅ No type errors or import issues
9. ✅ Documentation complete
10. ✅ Developer experience improved (shared types, coordinated development)

## Conclusion

This migration creates a foundation for:
- ✅ Shared Prisma types (immediate benefit)
- ✅ Coordinated full-stack development
- ✅ Better AI-assisted development (Claude sees full context)
- ✅ Future enhancements (Mastra, shared UI, etc.)

The monorepo maintains all current functionality while enabling better code sharing and development workflows.

---

**Original Repository References**:
- Backend: [BACKEND_REPO_URL] - Migrated from commit [COMMIT_HASH]
- Frontend: [FRONTEND_REPO_URL] - Migrated from commit [COMMIT_HASH]

Migration Date: [DATE]
Performed By: Claude AI Agent
