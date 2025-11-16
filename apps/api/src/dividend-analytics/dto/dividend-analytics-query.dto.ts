import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DividendAnalyticsQueryDto {
  @ApiProperty({ required: false, example: 2020 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  @Max(2100)
  startYear?: number;

  @ApiProperty({ required: false, example: 2023 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  @Max(2100)
  endYear?: number;

  @ApiProperty({
    required: false,
    example: '019948d2-53a8-7b91-858a-84524e123456',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @ApiProperty({ required: false, example: 'AAPL' })
  @IsOptional()
  @IsString()
  stockSymbol?: string;
}
