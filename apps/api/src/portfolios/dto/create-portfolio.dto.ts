import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false, default: 'USD' })
  @IsString()
  @IsOptional()
  currencyCode?: string;
}
