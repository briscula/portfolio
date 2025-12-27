import { ApiProperty } from '@nestjs/swagger';

export class DividendSummaryDto {
  @ApiProperty({
    description: 'Total dividends received in the specified period',
    example: 5000.0,
  })
  totalDividends: number;

  @ApiProperty({
    description: 'Dividend yield percentage (dividends / total cost)',
    example: 4.5,
  })
  dividendYield: number;

  @ApiProperty({
    description: 'Average monthly dividends in the period',
    example: 416.67,
  })
  avgMonthlyDividends: number;

  @ApiProperty({
    description: 'Total cost basis of dividend-paying positions',
    example: 111111.11,
  })
  totalCost: number;

  @ApiProperty({
    description: 'Number of dividend payments received',
    example: 48,
  })
  dividendCount: number;

  @ApiProperty({
    description: 'Period of calculation (e.g., "last12Months", "allTime")',
    example: 'last12Months',
  })
  period: string;
}
