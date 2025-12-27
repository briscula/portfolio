import { createZodDto } from 'nestjs-zod';
import {
  CreateTransactionSchema,
  QueryTransactionsSchema,
} from '../../common/schemas/transaction.schema';

// Create DTO classes from Zod schemas
export class CreateTransactionDto extends createZodDto(
  CreateTransactionSchema,
) {}
export class QueryTransactionsDto extends createZodDto(
  QueryTransactionsSchema,
) {}
