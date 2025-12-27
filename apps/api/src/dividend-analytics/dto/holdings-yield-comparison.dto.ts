import { ApiProperty } from '@nestjs/swagger';

export class HoldingYieldDataDto {
  @ApiProperty({ example: 'AAPL' })
  tickerSymbol: string;

  @ApiProperty({ example: 'Apple Inc.' })
  companyName: string;

  @ApiProperty({ example: 100 })
  currentQuantity: number;

  @ApiProperty({ example: 150.5 })
  currentPrice: number;

  @ApiProperty({ example: 'USD' })
  currencyCode: string;

  @ApiProperty({ example: 8.5, description: 'Yield on Cost percentage' })
  yieldOnCost: number;

  @ApiProperty({
    example: 6.2,
    description: 'Trailing 12-month yield percentage',
  })
  trailing12MonthYield: number;

  @ApiProperty({
    example: 450.0,
    description: 'Total dividends received in last 12 months',
  })
  trailing12MonthDividends: number;

  @ApiProperty({ example: 12000.0, description: 'Original cost basis' })
  totalCost: number;

  @ApiProperty({
    example: 850.0,
    description: 'Total dividends received all time',
  })
  totalDividends: number;

  @ApiProperty({
    example: 2.5,
    description: 'Official dividend yield from Yahoo Finance',
    nullable: true,
  })
  officialDividendYield: number | null;
}

export class HoldingsYieldComparisonResponseDto {
  @ApiProperty({ type: [HoldingYieldDataDto] })
  holdings: HoldingYieldDataDto[];

  @ApiProperty({ example: '2024-12-20T10:30:00Z' })
  lastPriceUpdate: Date;
}
