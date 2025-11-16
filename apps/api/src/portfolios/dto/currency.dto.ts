import { ApiProperty } from '@nestjs/swagger';

export class CurrencyDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;
}
