export interface Position {
  userId: number;
  portfolioId: number;
  portfolioName: string;
  stockSymbol: string;
  companyName: string;
  sector: string | null;
  currentQuantity: number;
  totalCost: number;
  totalDividends: number;
  dividendCount: number;
  lastTransactionDate: string;
  portfolioPercentage: number;
  averagePrice?: number;
  currentPrice?: number;
  totalValue?: number;
  unrealizedGain?: number;
  unrealizedGainPercent?: number;
  dividendYield?: number;
}

export const mockPositions: Position[] = [
  {
    userId: 123,
    portfolioId: 1,
    portfolioName: "Growth Portfolio",
    stockSymbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    currentQuantity: 50,
    totalCost: 7500.00,
    totalDividends: 125.50,
    dividendCount: 4,
    lastTransactionDate: "2024-01-15T10:30:00Z",
    portfolioPercentage: 30.6,
    averagePrice: 150.00,
    currentPrice: 185.25,
    totalValue: 9262.50,
    unrealizedGain: 1762.50,
    unrealizedGainPercent: 23.5,
    dividendYield: 1.4
  },
  {
    userId: 123,
    portfolioId: 1,
    portfolioName: "Growth Portfolio",
    stockSymbol: "MSFT",
    companyName: "Microsoft Corporation",
    sector: "Technology",
    currentQuantity: 30,
    totalCost: 9000.00,
    totalDividends: 90.00,
    dividendCount: 3,
    lastTransactionDate: "2024-01-20T14:15:00Z",
    portfolioPercentage: 36.7,
    averagePrice: 300.00,
    currentPrice: 385.50,
    totalValue: 11565.00,
    unrealizedGain: 2565.00,
    unrealizedGainPercent: 28.5,
    dividendYield: 0.8
  },
  {
    userId: 123,
    portfolioId: 1,
    portfolioName: "Growth Portfolio",
    stockSymbol: "GOOGL",
    companyName: "Alphabet Inc.",
    sector: "Technology",
    currentQuantity: 20,
    totalCost: 2800.00,
    totalDividends: 0.00,
    dividendCount: 0,
    lastTransactionDate: "2024-02-01T11:20:00Z",
    portfolioPercentage: 11.4,
    averagePrice: 140.00,
    currentPrice: 142.75,
    totalValue: 2855.00,
    unrealizedGain: 55.00,
    unrealizedGainPercent: 2.0,
    dividendYield: 0.0
  },
  {
    userId: 123,
    portfolioId: 2,
    portfolioName: "Dividend Portfolio",
    stockSymbol: "JNJ",
    companyName: "Johnson & Johnson",
    sector: "Healthcare",
    currentQuantity: 100,
    totalCost: 15000.00,
    totalDividends: 400.00,
    dividendCount: 4,
    lastTransactionDate: "2024-01-10T09:30:00Z",
    portfolioPercentage: 45.2,
    averagePrice: 150.00,
    currentPrice: 158.75,
    totalValue: 15875.00,
    unrealizedGain: 875.00,
    unrealizedGainPercent: 5.8,
    dividendYield: 2.5
  },
  {
    userId: 123,
    portfolioId: 2,
    portfolioName: "Dividend Portfolio",
    stockSymbol: "PG",
    companyName: "Procter & Gamble Co.",
    sector: "Consumer Staples",
    currentQuantity: 75,
    totalCost: 12000.00,
    totalDividends: 300.00,
    dividendCount: 4,
    lastTransactionDate: "2024-01-25T13:45:00Z",
    portfolioPercentage: 36.1,
    averagePrice: 160.00,
    currentPrice: 165.50,
    totalValue: 12412.50,
    unrealizedGain: 412.50,
    unrealizedGainPercent: 3.4,
    dividendYield: 2.4
  },
  {
    userId: 123,
    portfolioId: 2,
    portfolioName: "Dividend Portfolio",
    stockSymbol: "KO",
    companyName: "The Coca-Cola Company",
    sector: "Consumer Staples",
    currentQuantity: 200,
    totalCost: 10000.00,
    totalDividends: 280.00,
    dividendCount: 4,
    lastTransactionDate: "2024-02-05T15:20:00Z",
    portfolioPercentage: 18.7,
    averagePrice: 50.00,
    currentPrice: 52.25,
    totalValue: 10450.00,
    unrealizedGain: 450.00,
    unrealizedGainPercent: 4.5,
    dividendYield: 2.7
  }
];
