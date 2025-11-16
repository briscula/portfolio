import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '../entities/transaction.entity';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number (0-based)' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrevPage: boolean;
}

export class PaginatedTransactionsDto {
  @ApiProperty({
    description: 'Array of transactions',
    type: [TransactionEntity],
  })
  data: TransactionEntity[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
