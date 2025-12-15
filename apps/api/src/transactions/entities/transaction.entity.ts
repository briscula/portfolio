import { $Enums, Transaction } from '@repo/database';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionEntity implements Transaction {
  @ApiProperty()
  id: number;

  @ApiProperty()
  portfolioId: string;

  @ApiProperty({ maxLength: 12 })
  listingIsin: string;

  @ApiProperty({ maxLength: 10 })
  listingExchangeCode: string;

  @ApiProperty()
  type: $Enums.TransactionType;

  @ApiProperty({ example: 10.5 })
  quantity: number;

  @ApiProperty({ example: 100.25 })
  price: number;

  @ApiProperty({ example: 5.99 })
  commission: number;

  @ApiProperty({ maxLength: 10 })
  currencyCode: string;

  @ApiProperty({ required: false })
  notes: string | null;

  @ApiProperty({ example: 1002.5 })
  amount: number;

  @ApiProperty({ example: 1008.49 })
  totalAmount: number;

  @ApiProperty({ example: 0 })
  tax: number;

  @ApiProperty({ example: 0 })
  taxPercentage: number;

  @ApiProperty({ maxLength: 255, required: false })
  reference: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
