import { ApiProperty } from '@nestjs/swagger';

export class DividendMonthlyAggregateDto {
  @ApiProperty({ example: '2023' })
  year: string;

  @ApiProperty({ example: '01' })
  month: string;

  @ApiProperty({ example: 'January' })
  monthName: string;

  @ApiProperty({ example: 1250.75 })
  totalDividends: number;

  @ApiProperty({ example: 8 })
  dividendCount: number;

  @ApiProperty({ example: ['AAPL', 'MSFT', 'JNJ'] })
  companies: string[];
}

export class DividendMonthlyComparisonDto {
  @ApiProperty({ example: '01' })
  month: string;

  @ApiProperty({ example: 'January' })
  monthName: string;

  @ApiProperty({ type: [DividendMonthlyAggregateDto] })
  yearlyData: DividendMonthlyAggregateDto[];
}
