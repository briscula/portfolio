export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

export const mockPortfolios: Portfolio[] = [
  {
    id: "1",
    userId: "user123",
    name: "Growth Portfolio",
    description: "Long-term growth focused investments",
    currencyCode: "USD",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    currency: {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
    },
  },
  {
    id: "2",
    userId: "user123",
    name: "Dividend Portfolio",
    description: "High dividend yield stocks for income",
    currencyCode: "USD",
    createdAt: "2024-02-01T14:20:00Z",
    updatedAt: "2024-02-01T14:20:00Z",
    currency: {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
    },
  },
  {
    id: "3",
    userId: "user123",
    name: "Tech Portfolio",
    description: "Technology sector focused investments",
    currencyCode: "USD",
    createdAt: "2024-02-15T09:45:00Z",
    updatedAt: "2024-02-15T09:45:00Z",
    currency: {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
    },
  },
];

export const mockPortfolioSummary = {
  totalValue: 24500.0,
  totalChange: 5.2,
  dividendYield: 4.2,
  monthlyDividends: 85.5,
};
