// Re-export Prisma Client for use across the monorepo
// NOTE: Run `pnpm db:generate` from root or packages/database to generate types

export * from '@prisma/client';
export { PrismaClient, Prisma } from '@prisma/client';
