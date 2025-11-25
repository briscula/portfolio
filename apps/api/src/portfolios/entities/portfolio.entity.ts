import { ApiProperty } from '@nestjs/swagger';
import { Portfolio } from '@repo/database';
import { Exclude } from 'class-transformer';
import { CurrencyDto } from '../dto/currency.dto';

export class PortfolioEntity implements Portfolio {
  constructor(partial: Partial<PortfolioEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @Exclude()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  currencyCode: string;

  @ApiProperty({ description: 'Currency information' })
  currency?: CurrencyDto;

  @Exclude()
  createdAt: Date;

  updatedAt: Date;
}
