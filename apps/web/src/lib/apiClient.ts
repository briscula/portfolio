import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * Centralized API client that uses shared authentication
 */
export class ApiClient {
  private accessToken: string | null = null;
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<unknown> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please log in.');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && retryCount === 0) {
        // Token might be expired, try to refresh it
        try {
          const tokenResponse = await fetch('/api/auth/token');
          if (tokenResponse.ok) {
            const { accessToken: newToken } = await tokenResponse.json();
            this.setAccessToken(newToken);
            // Retry the original request with the new token
            return this.makeRequest(endpoint, options, retryCount + 1);
          }
        } catch (refreshError) {
        }
        throw new Error('Authentication required. Please log in again.');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Portfolio methods (READ operations)
  async getPortfolios() {
    return this.makeRequest('/portfolios');
  }

  async getPortfolio(portfolioId: string) {
    return this.makeRequest(`/portfolios/${portfolioId}`);
  }

  async getPositions(portfolioId: string, page: number = 1, pageSize: number = 50, sortBy?: string, sortOrder?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
    }
    
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }
    
    return this.makeRequest(`/portfolios/${portfolioId}/positions?${params.toString()}`);
  }

  async getTransactions(portfolioId?: string, page: number = 1, pageSize: number = 50) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });
    
    if (portfolioId) {
      params.append('portfolioId', portfolioId);
    }
    
    return this.makeRequest(`/transactions?${params.toString()}`);
  }

  async getPortfolioSummary(portfolioId: string) {
    return this.makeRequest(`/portfolios/${portfolioId}/summary`);
  }

  // Transaction methods (WRITE operations)
  async createTransaction(portfolioId: string, transactionData: {
    stockSymbol: string;
    quantity: number;
    reference: string;
    amount: number;
    totalAmount: number;
    tax: number;
    taxPercentage: number;
    date: string;
    notes: string;
    type: 'BUY' | 'SELL';
  }) {
    return this.makeRequest(`/portfolios/${portfolioId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Portfolio methods (WRITE operations)
  async createPortfolio(data: { name: string; description: string; currencyCode: string }) {
    return this.makeRequest('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePortfolio(id: string, data: { name: string; description: string; currencyCode: string }) {
    return this.makeRequest(`/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePortfolio(id: string) {
    return this.makeRequest(`/portfolios/${id}`, {
      method: 'DELETE',
    });
  }

  // Dividend methods
  async getDividendSummary(portfolioId: string, period: 'last12Months' | 'allTime' = 'last12Months') {
    const params = new URLSearchParams({ period });
    return this.makeRequest(`/portfolios/${portfolioId}/dividends/summary?${params.toString()}`);
  }

  async getDividendMonthlyOverview(portfolioId: string, startYear: number, endYear: number) {
    const params = new URLSearchParams({
      startYear: startYear.toString(),
      endYear: endYear.toString(),
    });
    return this.makeRequest(`/portfolios/${portfolioId}/dividends/monthly?${params.toString()}`);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Hook to get the API client with current auth state
export function useApiClient() {
  const { accessToken, isLoading, error, isAuthenticated, refreshToken } = useAuth();
  
  // Update the API client with the current token
  apiClient.setAccessToken(accessToken);
  
  // Handle token refresh when needed
  const handleTokenRefresh = async () => {
    if (error && error.includes('Authentication')) {
      await refreshToken();
    }
  };
  
  return {
    apiClient,
    isLoading,
    error,
    isAuthenticated,
    refreshToken: handleTokenRefresh
  };
}
