export declare class MonthlyDataPointDto {
    year: string;
    totalDividends: number;
    dividendCount: number;
    companies: string[];
}
export declare class DividendMonthlyChartDto {
    month: string;
    monthName: string;
    yearlyData: MonthlyDataPointDto[];
}
export declare class DividendMonthlyChartResponseDto {
    months: string[];
    years: string[];
    data: DividendMonthlyChartDto[];
}
