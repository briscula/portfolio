import { ApiClient } from "@/lib/apiClient";

export interface DividendApiResponse {
  months: string[];
  years: string[];
  data: {
    month: string;
    monthName: string;
    yearlyData: {
      year: string;
      totalDividends: number;
      dividendCount: number;
      companies: string[];
    }[];
  }[];
}

export interface ChartDataPoint {
  month: string;
  [year: string]: number | string;
}

export interface DividendSummary {
  totalDividends: number;
  averageMonthly: number;
  highestMonth: { month: string; amount: number; year: string };
  lowestMonth: { month: string; amount: number; year: string };
  yearOverYearGrowth: number;
  dividendsByYear: Record<string, number>;
}

export interface YearRange {
  startYear: number;
  endYear: number;
}

export class DividendService {
  private readonly MONTH_NAMES: Record<string, string[]> = {
    en: [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ],
    es: [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ],
  };

  constructor(private apiClient: ApiClient) {}

  // Fetch Operations
  async getDividendMonthlyOverview(
    portfolioId: string,
    startYear: number,
    endYear: number,
    stockSymbol?: string,
  ): Promise<DividendApiResponse> {
    // Fetch data from API
    const response = await this.apiClient.getDividendMonthlyOverview(
      portfolioId,
      startYear,
      endYear,
    );

    let filteredResponse = response as DividendApiResponse;

    // Apply stock symbol filter if provided
    if (stockSymbol) {
      filteredResponse = this.filterByStockSymbol(
        filteredResponse,
        stockSymbol,
      );
    }

    return filteredResponse;
  }

  // Year Range Calculation
  getDefaultYearRange(): YearRange {
    const currentYear = new Date().getFullYear();
    return {
      startYear: currentYear - 4,
      endYear: currentYear,
    };
  }
  calculateYearRange(yearsBack: number): YearRange {
    const currentYear = new Date().getFullYear();
    return {
      startYear: currentYear - yearsBack,
      endYear: currentYear,
    };
  }

  // Data Transformation
  transformToChartFormat(
    apiResponse: DividendApiResponse,
    locale: string,
  ): ChartDataPoint[] {
    return apiResponse.data.map((monthData) => {
      const monthNumber = parseInt(monthData.month);
      const chartPoint: ChartDataPoint = {
        month: this.getMonthName(monthNumber, locale),
      };

      // Add data for each year in this month
      monthData.yearlyData.forEach((yearData) => {
        chartPoint[yearData.year] = yearData.totalDividends;
      });

      // Fill missing years with 0
      return this.fillMissingYears(chartPoint, apiResponse.years);
    });
  }
  getMonthName(monthNumber: number, locale: string = "en"): string {
    const names = this.MONTH_NAMES[locale] || this.MONTH_NAMES.en;

    // Validate month number (1-12)
    if (monthNumber < 1 || monthNumber > 12) {
      return names[0];
    }

    return names[monthNumber - 1];
  }
  fillMissingYears(
    chartPoint: ChartDataPoint,
    years: string[],
  ): ChartDataPoint {
    const filled = { ...chartPoint };

    years.forEach((year) => {
      if (!(year in filled)) {
        filled[year] = 0;
      }
    });

    return filled;
  }

  // Analysis Operations
  calculateDividendSummary(apiResponse: DividendApiResponse): DividendSummary {
    // Calculate total dividends across all months and years
    let totalDividends = 0;
    let highestMonth = { month: "", amount: 0, year: "" };
    let lowestMonth = { month: "", amount: Infinity, year: "" };

    const dividendsByYear: Record<string, number> = {};

    // Initialize yearly totals
    apiResponse.years.forEach((year) => {
      dividendsByYear[year] = 0;
    });

    // Process each month
    apiResponse.data.forEach((monthData) => {
      const monthTotal = this.calculateMonthlyTotal(monthData);
      totalDividends += monthTotal;

      // Find highest and lowest months
      monthData.yearlyData.forEach((yearData) => {
        dividendsByYear[yearData.year] += yearData.totalDividends;

        if (yearData.totalDividends > highestMonth.amount) {
          highestMonth = {
            month: monthData.monthName,
            amount: yearData.totalDividends,
            year: yearData.year,
          };
        }

        if (
          yearData.totalDividends > 0 &&
          yearData.totalDividends < lowestMonth.amount
        ) {
          lowestMonth = {
            month: monthData.monthName,
            amount: yearData.totalDividends,
            year: yearData.year,
          };
        }
      });
    });

    // Calculate average monthly (across all years)
    const totalMonths = apiResponse.data.length * apiResponse.years.length;
    const averageMonthly = totalMonths > 0 ? totalDividends / totalMonths : 0;

    // Calculate year-over-year growth
    const yearOverYearGrowth = this.calculateYearOverYearGrowth(apiResponse);

    return {
      totalDividends,
      averageMonthly,
      highestMonth:
        lowestMonth.amount === Infinity
          ? { month: "", amount: 0, year: "" }
          : highestMonth,
      lowestMonth:
        lowestMonth.amount === Infinity
          ? { month: "", amount: 0, year: "" }
          : lowestMonth,
      yearOverYearGrowth,
      dividendsByYear,
    };
  }
  calculateMonthlyTotal(monthData: DividendApiResponse["data"][0]): number {
    return monthData.yearlyData.reduce((sum, yearData) => {
      return sum + yearData.totalDividends;
    }, 0);
  }
  calculateYearlyTotal(apiResponse: DividendApiResponse, year: string): number {
    return apiResponse.data.reduce((sum, monthData) => {
      const yearData = monthData.yearlyData.find((y) => y.year === year);
      return sum + (yearData?.totalDividends || 0);
    }, 0);
  }
  calculateYearOverYearGrowth(apiResponse: DividendApiResponse): number {
    if (apiResponse.years.length < 2) {
      return 0;
    }

    const sortedYears = [...apiResponse.years].sort();
    const mostRecentYear = sortedYears[sortedYears.length - 1];
    const previousYear = sortedYears[sortedYears.length - 2];

    const recentTotal = this.calculateYearlyTotal(apiResponse, mostRecentYear);
    const previousTotal = this.calculateYearlyTotal(apiResponse, previousYear);

    if (previousTotal === 0) {
      return recentTotal > 0 ? 100 : 0;
    }

    return ((recentTotal - previousTotal) / previousTotal) * 100;
  }

  // Filtering Operations
  filterByYearRange(
    apiResponse: DividendApiResponse,
    startYear: number,
    endYear: number,
  ): DividendApiResponse {
    // Filter yearly data within each month
    const filteredData = apiResponse.data
      .map((monthData) => ({
        ...monthData,
        yearlyData: monthData.yearlyData.filter((yearData) => {
          const year = parseInt(yearData.year);
          return year >= startYear && year <= endYear;
        }),
      }))
      // Remove months that have no data after filtering
      .filter((monthData) => monthData.yearlyData.length > 0);

    // Filter the years array
    const filteredYears = apiResponse.years.filter((year) => {
      const y = parseInt(year);
      return y >= startYear && y <= endYear;
    });

    return {
      ...apiResponse,
      data: filteredData,
      years: filteredYears,
    };
  }
  filterByStockSymbol(
    apiResponse: DividendApiResponse,
    stockSymbol: string,
  ): DividendApiResponse {
    const filteredData = apiResponse.data
      .map((monthData) => ({
        ...monthData,
        yearlyData: monthData.yearlyData
          .filter((yearData) => yearData.companies.includes(stockSymbol))
          .map((yearData) => ({
            ...yearData,
            companies: [stockSymbol], // Only include the filtered symbol
          })),
      }))
      // Remove months that have no data after filtering
      .filter((monthData) => monthData.yearlyData.length > 0);

    return {
      ...apiResponse,
      data: filteredData,
    };
  }
}
