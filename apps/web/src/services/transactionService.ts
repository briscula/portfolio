import { ApiClient } from '@/lib/apiClient';
import type { Transaction, TransactionType } from '@/types';
import type { ActivityItem } from '@/components/ui/ActivityList';
import { formatCurrency } from '@/lib/utils';

export interface TransactionFilters {
  portfolioId?: string;
  type?: TransactionType;
  stockSymbol?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TransactionSummary {
  totalBuys: number;
  totalSells: number;
  totalDividends: number;
  totalTax: number;
  totalAmount: number;
  transactionCount: number;
}

export class TransactionService {
  constructor(private apiClient: ApiClient) {}

  // Fetch Operations
  async getTransactions(
    portfolioId?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<Transaction[]> {
    const response = await this.apiClient.getTransactions(portfolioId, page, limit);

    // Normalize response format
    if (Array.isArray(response)) {
      return response;
    }

    return (response as { data?: Transaction[] }).data || [];
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return await this.getTransactions(undefined, 1, limit);
  }

  async getTransactionsByPortfolio(portfolioId: string): Promise<Transaction[]> {
    return await this.getTransactions(portfolioId, 1, 1000); // Large limit to get all
  }

  // Transformation Operations
  getActivityType(type: TransactionType): ActivityItem['type'] {
    switch (type) {
      case 'DIVIDEND':
        return 'dividend_received';
      case 'BUY':
        return 'stock_added';
      case 'SELL':
        return 'stock_removed';
      case 'TAX':
      case 'SPLIT':
      default:
        return 'stock_added'; // fallback
    }
  }

  // Business Logic - Display Formatting
  getTitle(transaction: Transaction): string {
    const { type, stockSymbol } = transaction;

    switch (type) {
      case 'DIVIDEND':
        return `${stockSymbol} Dividend Received`;
      case 'BUY':
        return `Bought ${stockSymbol}`;
      case 'SELL':
        return `Sold ${stockSymbol}`;
      case 'TAX':
        return `Tax on ${stockSymbol}`;
      case 'SPLIT':
        return `${stockSymbol} Stock Split`;
      default:
        return `${stockSymbol} Transaction`;
    }
  }

  getAmount(transaction: Transaction): string {
    const { type, quantity, amount, tax, portfolio } = transaction;
    const currencyCode = portfolio?.currencyCode || 'USD';

    switch (type) {
      case 'DIVIDEND':
        // Show absolute value for dividends
        return formatCurrency(amount, currencyCode);

      case 'BUY':
      case 'SELL':
        // Show shares and total amount
        return `${quantity} shares • ${formatCurrency(amount, currencyCode)}`;

      case 'TAX':
        // Use tax field if available, otherwise use amount field
        const taxAmount = tax !== 0 ? tax : amount;
        return formatCurrency(taxAmount, currencyCode);

      case 'SPLIT':
        // For stock splits, just show the number of shares
        return `${quantity} shares`;

      default:
        return `${quantity} shares`;
    }
  }

  getDescription(transaction: Transaction): string {
    const { notes, stockSymbol } = transaction;

    // Use notes if available and not empty
    if (notes && notes.trim() !== '') {
      return notes;
    }

    // Fallback to stock symbol
    return stockSymbol;
  }

  // Transformation Operations
  transactionToActivityItem(transaction: Transaction): ActivityItem {
    return {
      id: transaction.id.toString(),
      type: this.getActivityType(transaction.type),
      title: this.getTitle(transaction),
      description: this.getDescription(transaction),
      amount: this.getAmount(transaction),
      date: new Date(transaction.createdAt),
      status: 'completed'
    };
  }

  transactionsToActivityItems(transactions: Transaction[]): ActivityItem[] {
    return transactions.map(transaction => this.transactionToActivityItem(transaction));
  }

  // Analysis Operations
  calculateTransactionSummary(transactions: Transaction[]): TransactionSummary {
    let totalBuys = 0;
    let totalSells = 0;
    let totalDividends = 0;
    let totalTax = 0;

    transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'BUY':
          totalBuys += Math.abs(transaction.amount);
          break;
        case 'SELL':
          totalSells += Math.abs(transaction.amount);
          break;
        case 'DIVIDEND':
          totalDividends += Math.abs(transaction.amount);
          break;
        case 'TAX':
          const taxAmount = transaction.tax !== 0 ? transaction.tax : transaction.amount;
          totalTax += Math.abs(taxAmount);
          break;
      }
    });

    const totalAmount = totalBuys - totalSells + totalDividends - totalTax;

    return {
      totalBuys,
      totalSells,
      totalDividends,
      totalTax,
      totalAmount,
      transactionCount: transactions.length
    };
  }

  groupTransactionsByMonth(transactions: Transaction[]): Map<string, Transaction[]> {
    const grouped = new Map<string, Transaction[]>();

    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(transaction);
    });

    return grouped;
  }

  groupTransactionsByStock(transactions: Transaction[]): Map<string, Transaction[]> {
    const grouped = new Map<string, Transaction[]>();

    transactions.forEach(transaction => {
      const { stockSymbol } = transaction;

      if (!grouped.has(stockSymbol)) {
        grouped.set(stockSymbol, []);
      }

      grouped.get(stockSymbol)!.push(transaction);
    });

    return grouped;
  }

  // Filtering & Sorting
  filterTransactions(
    transactions: Transaction[],
    filters: TransactionFilters
  ): Transaction[] {
    return transactions.filter(transaction => {
      // Filter by portfolio ID
      if (filters.portfolioId && transaction.portfolioId !== filters.portfolioId) {
        return false;
      }

      // Filter by type
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      // Filter by stock symbol
      if (filters.stockSymbol && transaction.stockSymbol !== filters.stockSymbol) {
        return false;
      }

      // Filter by date range
      const transactionDate = new Date(transaction.createdAt);

      if (filters.startDate && transactionDate < filters.startDate) {
        return false;
      }

      if (filters.endDate && transactionDate > filters.endDate) {
        return false;
      }

      return true;
    });
  }

  sortByDate(
    transactions: Transaction[],
    order: 'asc' | 'desc' = 'desc'
  ): Transaction[] {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }
}
