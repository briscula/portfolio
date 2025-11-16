import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryTransactionsDto {
  @ApiProperty({
    description: 'Comma-separated list of portfolio IDs to filter by',
    example: '123,456,789',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value?.split(',').map((id) => id.trim()))
  portfolioId?: string[];

  @ApiProperty({
    description: 'Transaction type to filter by',
    enum: $Enums.TransactionType,
    required: false,
  })
  @IsOptional()
  @IsEnum($Enums.TransactionType)
  type?: $Enums.TransactionType;

  @ApiProperty({
    description: 'Stock symbol to filter by',
    example: 'AAPL',
    required: false,
  })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiProperty({
    description: 'Start date for filtering transactions (ISO 8601)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    description: 'End date for filtering transactions (ISO 8601)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiProperty({
    description: 'Page number (0-based)',
    example: 0,
    default: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number = 0;

  @ApiProperty({
    description: 'Sort field and direction',
    example: 'createdAt:desc',
    default: 'createdAt:desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';
}
