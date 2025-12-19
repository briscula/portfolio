import { http, HttpResponse } from 'msw';
import { mockPortfolios, mockPortfolioSummary } from './data/portfolios';
import { mockPositions } from './data/positions';
import { mockTransactions, mockRecentActivity } from './data/transactions';
import { mockDividendMonthlyOverview, mockUpcomingDividends } from './data/dividends';
import { 
  paginateData, 
  sortData, 
  filterData, 
  simulateDelay, 
  generateId,
  createErrorResponse,
  createSuccessResponse
} from './utils';

// In-memory storage for CRUD operations
let portfolios = [...mockPortfolios];
let positions = [...mockPositions];
let transactions = [...mockTransactions];

export const handlers = [
  // Auth endpoints
  http.get('/api/auth/token', async () => {
    await simulateDelay(100);
    return HttpResponse.json({
      accessToken: 'mock-access-token-12345',
      expiresIn: 3600
    });
  }),

  // Portfolio endpoints
  http.get('/portfolios', async ({ request }) => {
    await simulateDelay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    
    let filteredPortfolios = [...portfolios];
    
    if (sortBy) {
      filteredPortfolios = sortData(filteredPortfolios, sortBy, sortOrder);
    }
    
    const paginatedResponse = paginateData(filteredPortfolios, page, limit);
    return HttpResponse.json(paginatedResponse);
  }),

  http.get('/portfolios/:id', async ({ params }) => {
    await simulateDelay(150);
    
    const portfolio = portfolios.find(p => p.id === params.id);
    if (!portfolio) {
      return createErrorResponse(404, 'Portfolio not found');
    }
    
    return createSuccessResponse(portfolio);
  }),

  http.post('/portfolios', async ({ request }) => {
    await simulateDelay(300);
    
    const body = await request.json() as any;
    const newPortfolio = {
      id: generateId(),
      userId: 'user123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency: {
        code: body.currencyCode || 'USD',
        name: 'US Dollar',
        symbol: '$'
      },
      ...body
    };
    
    portfolios.push(newPortfolio);
    return createSuccessResponse(newPortfolio, 201);
  }),

  http.patch('/portfolios/:id', async ({ params, request }) => {
    await simulateDelay(250);
    
    const portfolioIndex = portfolios.findIndex(p => p.id === params.id);
    if (portfolioIndex === -1) {
      return createErrorResponse(404, 'Portfolio not found');
    }
    
    const body = await request.json() as any;
    portfolios[portfolioIndex] = {
      ...portfolios[portfolioIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return createSuccessResponse(portfolios[portfolioIndex]);
  }),

  http.delete('/portfolios/:id', async ({ params }) => {
    await simulateDelay(200);
    
    const portfolioIndex = portfolios.findIndex(p => p.id === params.id);
    if (portfolioIndex === -1) {
      return createErrorResponse(404, 'Portfolio not found');
    }
    
    portfolios.splice(portfolioIndex, 1);
    return createSuccessResponse({ message: 'Portfolio deleted successfully' });
  }),

  // Position endpoints
  http.get('/portfolios/:id/positions', async ({ params, request }) => {
    await simulateDelay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    
    let filteredPositions = positions.filter(p => p.portfolioId.toString() === params.id);
    
    if (sortBy) {
      filteredPositions = sortData(filteredPositions, sortBy, sortOrder);
    }
    
    const paginatedResponse = paginateData(filteredPositions, page, limit);
    return HttpResponse.json(paginatedResponse);
  }),

  // Transaction endpoints
  http.get('/transactions', async ({ request }) => {
    await simulateDelay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const portfolioId = url.searchParams.get('portfolioId');
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    let filteredTransactions = [...transactions];
    
    if (portfolioId) {
      filteredTransactions = filteredTransactions.filter(t => t.portfolioId === portfolioId);
    }
    
    if (sortBy) {
      filteredTransactions = sortData(filteredTransactions, sortBy, sortOrder);
    }
    
    const paginatedResponse = paginateData(filteredTransactions, page, limit);
    return HttpResponse.json(paginatedResponse);
  }),

  http.get('/portfolios/:id/transactions', async ({ params, request }) => {
    await simulateDelay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    let filteredTransactions = transactions.filter(t => t.portfolioId === params.id);
    
    if (sortBy) {
      filteredTransactions = sortData(filteredTransactions, sortBy, sortOrder);
    }
    
    const paginatedResponse = paginateData(filteredTransactions, page, limit);
    return HttpResponse.json(paginatedResponse);
  }),

  http.post('/portfolios/:id/transactions', async ({ params, request }) => {
    await simulateDelay(300);
    
    const body = await request.json() as any;
    const newTransaction = {
      id: Math.max(...transactions.map(t => t.id)) + 1,
      portfolioId: params.id as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body
    };
    
    transactions.push(newTransaction);
    return createSuccessResponse(newTransaction, 201);
  }),

  // Portfolio summary
  http.get('/portfolios/:id/summary', async ({ params }) => {
    await simulateDelay(150);
    
    const portfolioPositions = positions.filter(p => p.portfolioId.toString() === params.id);
    const totalValue = portfolioPositions.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    const totalCost = portfolioPositions.reduce((sum, pos) => sum + pos.totalCost, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    const totalDividends = portfolioPositions.reduce((sum, pos) => sum + pos.totalDividends, 0);
    const dividendYield = totalValue > 0 ? (totalDividends / totalValue) * 100 : 0;
    
    const summary = {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      dividendYield,
      monthlyDividends: totalDividends / 12
    };
    
    return HttpResponse.json(summary);
  }),

  // Dividend endpoints
  http.get('/portfolios/:id/dividends/monthly', async ({ params, request }) => {
    await simulateDelay(200);
    
    const url = new URL(request.url);
    const startYear = parseInt(url.searchParams.get('startYear') || '2023');
    const endYear = parseInt(url.searchParams.get('endYear') || '2024');
    const tickerSymbol = url.searchParams.get('tickerSymbol');

    // Filter data by year range and ticker symbol if provided
    let filteredData = mockDividendMonthlyOverview.data.map(monthData => ({
      ...monthData,
      yearlyData: monthData.yearlyData.filter(yearData => {
        const year = parseInt(yearData.year);
        return year >= startYear && year <= endYear;
      })
    }));

    if (tickerSymbol) {
      // In a real implementation, you'd filter by ticker symbol
      // For now, we'll return the full dataset
    }
    
    // Filter out months that have no data for the requested year range
    filteredData = filteredData.filter(monthData => monthData.yearlyData.length > 0);
    
    const response = {
      ...mockDividendMonthlyOverview,
      data: filteredData
    };
    
    return HttpResponse.json(response);
  }),
];

