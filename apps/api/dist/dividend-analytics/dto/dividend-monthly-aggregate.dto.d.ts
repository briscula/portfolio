export declare class DividendMonthlyAggregateDto {
    year: string;
    month: string;
    monthName: string;
    totalDividends: number;
    dividendCount: number;
    companies: string[];
}
export declare class DividendMonthlyComparisonDto {
    month: string;
    monthName: string;
    yearlyData: DividendMonthlyAggregateDto[];
}
