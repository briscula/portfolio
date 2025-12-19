export interface DividendData {
  months: string[];
  years: string[];
  data: Array<{
    month: string;
    monthName: string;
    yearlyData: Array<{
      year: string;
      totalDividends: number;
      dividendCount: number;
      companies: string[];
    }>;
  }>;
}

export interface UpcomingDividend {
  id: string;
  tickerSymbol: string;
  companyName: string;
  amount: number;
  exDate: string;
  payDate: string;
  portfolioId: string;
}

export const mockDividendMonthlyOverview: DividendData = {
  months: [
    "January",
    "February", 
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ],
  years: ['2020', '2021', '2022', '2023', '2024', '2025'],
  data: [
    {
      month: '01',
      monthName: 'January',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 45.20, dividendCount: 3, companies: ['AAPL', 'JNJ', 'PG'] },
        { year: '2022', totalDividends: 52.80, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2023', totalDividends: 58.90, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 68.90, dividendCount: 5, companies: ['AAPL', 'JNJ', 'PG', 'KO', 'MSFT'] }
      ]
    },
    {
      month: '02',
      monthName: 'February',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 38.50, dividendCount: 3, companies: ['AAPL', 'MSFT', 'JNJ'] },
        { year: '2022', totalDividends: 42.30, dividendCount: 3, companies: ['AAPL', 'MSFT', 'JNJ'] },
        { year: '2023', totalDividends: 46.75, dividendCount: 3, companies: ['AAPL', 'MSFT', 'JNJ'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 51.87, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] }
      ]
    },
    {
      month: '03',
      monthName: 'March',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 85.40, dividendCount: 6, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O'] },
        { year: '2022', totalDividends: 92.15, dividendCount: 6, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O'] },
        { year: '2023', totalDividends: 98.60, dividendCount: 6, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 104.28, dividendCount: 6, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O'] }
      ]
    },
    {
      month: '04',
      monthName: 'April',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 62.30, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2022', totalDividends: 68.45, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2023', totalDividends: 74.20, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 73.82, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] }
      ]
    },
    {
      month: '05',
      monthName: 'May',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 125.80, dividendCount: 7, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O', 'T'] },
        { year: '2022', totalDividends: 138.25, dividendCount: 7, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O', 'T'] },
        { year: '2023', totalDividends: 152.40, dividendCount: 7, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O', 'T'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 260.34, dividendCount: 8, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O', 'T', 'VZ'] }
      ]
    },
    {
      month: '06',
      monthName: 'June',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 95.60, dividendCount: 5, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'] },
        { year: '2022', totalDividends: 102.35, dividendCount: 5, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'] },
        { year: '2023', totalDividends: 108.90, dividendCount: 5, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 194.28, dividendCount: 6, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O'] }
      ]
    },
    {
      month: '07',
      monthName: 'July',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 78.90, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2022', totalDividends: 84.25, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2023', totalDividends: 89.60, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 140.15, dividendCount: 5, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'] }
      ]
    },
    {
      month: '08',
      monthName: 'August',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 42.15, dividendCount: 3, companies: ['AAPL', 'MSFT', 'JNJ'] },
        { year: '2022', totalDividends: 45.80, dividendCount: 3, companies: ['AAPL', 'MSFT', 'JNJ'] },
        { year: '2023', totalDividends: 48.95, dividendCount: 3, companies: ['AAPL', 'MSFT', 'JNJ'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 49.21, dividendCount: 4, companies: ['AAPL', 'MSFT', 'JNJ', 'PG'] }
      ]
    },
    {
      month: '09',
      monthName: 'September',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 88.75, dividendCount: 5, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'] },
        { year: '2022', totalDividends: 95.40, dividendCount: 5, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'] },
        { year: '2023', totalDividends: 102.85, dividendCount: 5, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 156.25, dividendCount: 6, companies: ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'O'] }
      ]
    },
    {
      month: '10',
      monthName: 'October',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 35.60, dividendCount: 2, companies: ['KO', 'O'] },
        { year: '2022', totalDividends: 38.25, dividendCount: 2, companies: ['KO', 'O'] },
        { year: '2023', totalDividends: 41.80, dividendCount: 2, companies: ['KO', 'O'] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 10.68, dividendCount: 2, companies: ['KO', 'O'] }
      ]
    },
    {
      month: '11',
      monthName: 'November',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2022', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2023', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2024', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2025', totalDividends: 0, dividendCount: 0, companies: [] }
      ]
    },
    {
      month: '12',
      monthName: 'December',
      yearlyData: [
        { year: '2020', totalDividends: 0, dividendCount: 0, companies: [] },
        { year: '2021', totalDividends: 12.50, dividendCount: 1, companies: ['JNJ'] },
        { year: '2022', totalDividends: 13.25, dividendCount: 1, companies: ['JNJ'] },
        { year: '2023', totalDividends: 14.80, dividendCount: 1, companies: ['JNJ'] },
        { year: '2024', totalDividends: 9.47, dividendCount: 1, companies: ['JNJ'] },
        { year: '2025', totalDividends: 0, dividendCount: 0, companies: [] }
      ]
    }
  ]
};

export const mockUpcomingDividends: UpcomingDividend[] = [
  {
    id: "1",
    tickerSymbol: "JNJ",
    companyName: "Johnson & Johnson",
    amount: 1.13,
    exDate: "2024-03-15",
    payDate: "2024-04-01",
    portfolioId: "2"
  },
  {
    id: "2",
    tickerSymbol: "PG",
    companyName: "Procter & Gamble Co.",
    amount: 0.94,
    exDate: "2024-03-20",
    payDate: "2024-04-15",
    portfolioId: "2"
  },
  {
    id: "3",
    tickerSymbol: "KO",
    companyName: "The Coca-Cola Company",
    amount: 0.46,
    exDate: "2024-03-25",
    payDate: "2024-04-01",
    portfolioId: "2"
  },
  {
    id: "4",
    tickerSymbol: "AAPL",
    companyName: "Apple Inc.",
    amount: 0.25,
    exDate: "2024-05-10",
    payDate: "2024-05-16",
    portfolioId: "1"
  },
  {
    id: "5",
    tickerSymbol: "MSFT",
    companyName: "Microsoft Corporation",
    amount: 0.75,
    exDate: "2024-05-15",
    payDate: "2024-06-13",
    portfolioId: "1"
  }
];
