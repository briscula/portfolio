import { ApiProperty } from '@nestjs/swagger';

export class MonthlyDataPointDto {
  @ApiProperty({ example: '2023' })
  year: string;

  @ApiProperty({ example: 1250.75 })
  totalDividends: number;

  @ApiProperty({ example: 8 })
  dividendCount: number;

  @ApiProperty({ example: ['AAPL', 'MSFT', 'JNJ'] })
  companies: string[];
}

export class DividendMonthlyChartDto {
  @ApiProperty({ example: '01' })
  month: string;

  @ApiProperty({ example: 'January' })
  monthName: string;

  @ApiProperty({ type: [MonthlyDataPointDto] })
  yearlyData: MonthlyDataPointDto[];
}

export class DividendMonthlyChartResponseDto {
  @ApiProperty({
    example: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  })
  months: string[];

  @ApiProperty({ example: ['2022', '2023', '2024'] })
  years: string[];

  @ApiProperty({ type: [DividendMonthlyChartDto] })
  data: DividendMonthlyChartDto[];
}
