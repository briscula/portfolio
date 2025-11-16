export interface Transaction {
  id: number;
  portfolioId: string;
  stockSymbol: string;
  type: 'DIVIDEND' | 'BUY' | 'SELL' | 'TAX' | 'SPLIT';
  quantity: number;
  reference: string;
  amount: number;
  totalAmount: number;
  tax: number;
  taxPercentage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  portfolio?: {
    currencyCode: string;
    currency?: {
      code: string;
      name: string;
      symbol: string;
    };
  };
}

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    portfolioId: "1",
    stockSymbol: "AAPL",
    type: "BUY",
    quantity: 25,
    reference: "TXN-001",
    amount:3750.00,
    totalAmount:3750.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Initial purchase",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: {
        code: "USD",
        name: "US Dollar",
        symbol: "$"
      }
    }
  },
  {
    id: 2,
    portfolioId: "1",
    stockSymbol: "AAPL",
    type: "BUY",
    quantity: 25,
    reference: "TXN-002",
    amount:3750.00,
    totalAmount:3750.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Additional shares",
    createdAt: "2024-01-20T14:15:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 3,
    portfolioId: "1",
    stockSymbol: "AAPL",
    type: "DIVIDEND",
    quantity: 0,
    reference: "DIV-001",
    amount:31.25,
    totalAmount:31.25,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Quarterly dividend",
    createdAt: "2024-01-25T09:00:00Z",
    updatedAt: "2024-01-25T09:00:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 4,
    portfolioId: "1",
    stockSymbol: "MSFT",
    type: "BUY",
    quantity: 30,
    reference: "TXN-003",
    amount:9000.00,
    totalAmount:9000.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Microsoft position",
    createdAt: "2024-01-20T14:15:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 5,
    portfolioId: "1",
    stockSymbol: "MSFT",
    type: "DIVIDEND",
    quantity: 0,
    reference: "DIV-002",
    amount:45.00,
    totalAmount:45.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Quarterly dividend",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 6,
    portfolioId: "1",
    stockSymbol: "GOOGL",
    type: "BUY",
    quantity: 20,
    reference: "TXN-004",
    amount:2800.00,
    totalAmount:2800.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Alphabet position",
    createdAt: "2024-02-01T11:20:00Z",
    updatedAt: "2024-02-01T11:20:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 7,
    portfolioId: "2",
    stockSymbol: "JNJ",
    type: "BUY",
    quantity: 100,
    reference: "TXN-005",
    amount:15000.00,
    totalAmount:15000.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Johnson & Johnson position",
    createdAt: "2024-01-10T09:30:00Z",
    updatedAt: "2024-01-10T09:30:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 8,
    portfolioId: "2",
    stockSymbol: "JNJ",
    type: "DIVIDEND",
    quantity: 0,
    reference: "DIV-003",
    amount:100.00,
    totalAmount:100.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Quarterly dividend",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 9,
    portfolioId: "2",
    stockSymbol: "PG",
    type: "BUY",
    quantity: 75,
    reference: "TXN-006",
    amount:12000.00,
    totalAmount:12000.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Procter & Gamble position",
    createdAt: "2024-01-25T13:45:00Z",
    updatedAt: "2024-01-25T13:45:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 10,
    portfolioId: "2",
    stockSymbol: "PG",
    type: "DIVIDEND",
    quantity: 0,
    reference: "DIV-004",
    amount:75.00,
    totalAmount:75.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Quarterly dividend",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 11,
    portfolioId: "2",
    stockSymbol: "KO",
    type: "BUY",
    quantity: 200,
    reference: "TXN-007",
    amount:10000.00,
    totalAmount:10000.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Coca-Cola position",
    createdAt: "2024-02-05T15:20:00Z",
    updatedAt: "2024-02-05T15:20:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  },
  {
    id: 12,
    portfolioId: "2",
    stockSymbol: "KO",
    type: "DIVIDEND",
    quantity: 0,
    reference: "DIV-005",
    amount:70.00,
    totalAmount:70.00,
    tax: 0.00,
    taxPercentage: 0.0,
    notes: "Quarterly dividend",
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2024-02-10T09:00:00Z",
    portfolio: {
      currencyCode: "USD",
      currency: { code: "USD", name: "US Dollar", symbol: "$" }
    }
  }
];

export const mockRecentActivity = mockTransactions
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10);
