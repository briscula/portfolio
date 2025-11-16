import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
  IsDateString,
  IsOptional,
  IsUUID,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @ApiProperty({ maxLength: 10 })
  @IsString()
  stockSymbol: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.000001, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({ example: 100.25 })
  @IsNumber()
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @ApiProperty({ example: 5.99, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commission?: number;

  @ApiProperty({ maxLength: 10, default: 'USD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiProperty({ maxLength: 255, required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 100.25 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  netCost: number;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  date?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    enum: $Enums.TransactionType,
    enumName: 'TransactionType',
  })
  type: $Enums.TransactionType;
}
