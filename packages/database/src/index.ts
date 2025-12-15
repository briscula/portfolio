// Re-export everything from Prisma Client
export * from '@prisma/client';

// Explicitly re-export PrismaClient class
export { PrismaClient } from '@prisma/client';

// Explicitly re-export the Prisma namespace (contains type utilities)
export { Prisma } from '@prisma/client';

// Explicitly re-export the $Enums namespace (contains enum values)
export { $Enums } from '@prisma/client';

// Re-export all model types explicitly for better IDE support
export type {
  User,
  Portfolio,
  Currency,
  CorporateAction,
  StockPrice,
  Transaction,
  UserAuthAccount,
  UserPosition,
} from '@prisma/client';

// Re-export enum types for type-only imports
export type {
  AuthProvider,
  CorporateActionType,
  TransactionType,
} from '@prisma/client';
