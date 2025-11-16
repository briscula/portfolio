// Re-export Prisma Client for use across the monorepo
// NOTE: Run `pnpm db:generate` from root or packages/database to generate types

// Export the PrismaClient and Prisma namespace from the generated client
export { PrismaClient, Prisma } from '.prisma/client';

// Export all types from the generated Prisma Client
export type {
  User,
  Portfolio,
  Currency,
  Stock,
  CorporateAction,
  StockPrice,
  Transaction,
  UserAuthAccount,
  UserPosition,
} from '.prisma/client';

// Export enums - both as namespace and individual types
export { $Enums } from '.prisma/client';
export type {
  AuthProvider,
  TransactionType,
  CorporateActionType,
} from '.prisma/client';
