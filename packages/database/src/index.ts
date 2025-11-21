// Re-export Prisma Client for use across the monorepo
// NOTE: Run `pnpm db:generate` from root or packages/database to generate types

// Export the PrismaClient and Prisma namespace from the generated client
// Use relative path that works after compilation
export { PrismaClient, Prisma } from '../node_modules/.prisma/client';

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
} from '../node_modules/.prisma/client';

// Export enums - both as namespace and individual types
export { $Enums } from '../node_modules/.prisma/client';
export type {
  AuthProvider,
  TransactionType,
  CorporateActionType,
} from '../node_modules/.prisma/client';
