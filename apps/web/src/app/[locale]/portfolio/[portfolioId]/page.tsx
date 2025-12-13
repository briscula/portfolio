'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect, useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

// Force dynamic rendering - uses localStorage and Auth0
export const dynamic = 'force-dynamic';
import { Portfolio, Position, PaginationInfo } from '@/hooks/usePortfolio';
import { useApiClient } from '@/lib/apiClient';
import { Card, CardHeader, CardTitle, CardContent, MetricCard, MetricCardsGrid, DollarSignIcon, TrendingUpIcon, TrendingDownIcon, Button } from '@/components/ui';
import DividendChart from '@/components/DividendChart';
import { ChevronUpIcon, ChevronDownIcon, RefreshIcon } from '@/components/ui/icons';

// Sortable table header component
const SortableHeader = ({ 
  field, 
  children, 
  currentSortBy, 
  currentSortOrder, 
  onSort, 
  className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
}: {
  field: string;
  children: React.ReactNode;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}) => (
  <th 
    className={`${className} cursor-pointer hover:bg-gray-100 select-none`}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      {currentSortBy === field && (
        currentSortOrder === 'desc' ? 
          <ChevronDownIcon className="h-4 w-4" /> : 
          <ChevronUpIcon className="h-4 w-4" />
      )}
    </div>
  </th>
);

// Gain/Loss component for styling
const GainLossDisplay = ({ value, percent }: { value: number; percent: number }) => {
  const isPositive = value >= 0;
  const textColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
  const sign = isPositive ? '+' : '';

  return (
    <div className={`flex flex-col items-end ${textColor}`}>
      <span className="font-medium">{sign}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}</span>
      <span className={`text-xs font-mono px-1 py-0.5 rounded ${bgColor}`}>{sign}{percent.toFixed(2)}%</span>
    </div>
  );
};


import AddPositionModal from '@/components/AddPositionModal';



export default function PortfolioDetailPage() {
  const { user, isLoading } = useUser();
  const params = useParams();
  const portfolioId = params.portfolioId as string;
  const [isAddPositionModalOpen, setIsAddPositionModalOpen] = useState(false);

  // Use a single API client instance to avoid multiple token fetches
  const { apiClient, isLoading: authLoading, isAuthenticated, error: authError } = useApiClient();

  // Manage data fetching state manually to control API calls
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [positionsLoading, setPositionsLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [positionsError, setPositionsError] = useState<string | null>(null);

  // Sorting and pagination state
  const [sortBy, setSortBy] = useState('marketValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(25);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);

  // Portfolio summary state (fetched from backend)
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    totalGain: 0,
    totalGainPercent: 0,
    positionCount: 0,
    totalDividends: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    if (!isAuthenticated || authError) {
      setPortfolioLoading(false);
      if (authError) {
        setPortfolioError(authError);
      }
      return;
    }

    try {
      setPortfolioLoading(true);
      setPortfolioError(null);
      const response = await apiClient.getPortfolio(portfolioId);
      setSelectedPortfolio(response as Portfolio);

      // Store the last viewed portfolio in localStorage
      localStorage.setItem('lastViewedPortfolioId', portfolioId);
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setPortfolioLoading(false);
    }
  }, [isAuthenticated, authError, apiClient, portfolioId]);

  // Fetch portfolio summary
  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated || authError) {
      setSummaryLoading(false);
      return;
    }

    try {
      setSummaryLoading(true);
      const summary = await apiClient.getPortfolioSummary(portfolioId);
      setPortfolioSummary(summary as typeof portfolioSummary);
    } catch (err) {
      console.error('Failed to fetch portfolio summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [isAuthenticated, authError, apiClient, portfolioId]);

  // Fetch positions data
  const fetchPositions = useCallback(async (page: number = 1, currentSortBy: string = sortBy, currentSortOrder: string = sortOrder, limit: number = pageSize) => {
    if (!isAuthenticated || authError) {
      setPositionsLoading(false);
      if (authError) {
        setPositionsError(authError);
      }
      return;
    }

    try {
      setPositionsLoading(true);
      setPositionsError(null);
      const response = await apiClient.getPositions(portfolioId, page, limit, currentSortBy, currentSortOrder) as { data: Position[]; meta: PaginationInfo };
      
      if (response && response.data && Array.isArray(response.data)) {
        setPositions(response.data);
        setPagination(response.meta);
      } else {
        setPositions([]);
        setPagination(null);
      }
    } catch (err) {
      setPositionsError(err instanceof Error ? err.message : 'Failed to fetch positions');
    } finally {
      setPositionsLoading(false);
    }
  }, [isAuthenticated, authError, apiClient, portfolioId, pageSize, sortBy, sortOrder]);


  // Handler for price synchronization
  const handleSyncPrices = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await apiClient.syncPrices();
      // Wait a moment for the backend to process before refetching
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      await Promise.all([
        fetchSummary(),
        fetchPositions(pagination?.page || 1, sortBy, sortOrder, pageSize),
      ]);
    } catch (error) {
      console.error("Failed to sync prices:", error);
      // Optionally set an error state to show in the UI
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPortfolio();
      fetchSummary();
      fetchPositions(1, sortBy, sortOrder, pageSize);
    }
  }, [portfolioId, isAuthenticated, authLoading, fetchPortfolio, fetchSummary, fetchPositions, sortBy, sortOrder, pageSize]);

  // Handler for pagination
  const fetchPage = (page: number) => {
    fetchPositions(page, sortBy, sortOrder, pageSize);
  };

  // Handler for sorting
  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newSortOrder);
    fetchPositions(1, field, newSortOrder, pageSize);
  };

  // Handler for page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    fetchPositions(1, sortBy, sortOrder, newSize);
  };

  // Handler for adding positions
  const handleAddPosition = async (positionData: {
    stockSymbol: string;
    companyName: string;
    shares: number;
    averagePrice: number;
  }) => {
    if (!isAuthenticated) {
      return;
    }

    try {

      // Calculate total amount from shares and average price
      const totalCost = positionData.shares * positionData.averagePrice;

      // Generate UUID v7 for reference
      const reference = crypto.randomUUID();

      const payload = {
        stockSymbol: positionData.stockSymbol,
        quantity: positionData.shares,
        reference: reference,
        amount: parseFloat(totalCost.toFixed(2)),
        totalAmount: 0,
        tax: 0,
        taxPercentage: 0,
        date: new Date().toISOString(),
        notes: `Added ${positionData.shares} shares of ${positionData.companyName}`,
        type: 'BUY' as const,
      };

      await apiClient.createTransaction(portfolioId, payload);

      // Refresh the positions list and summary
      await fetchPositions(1, sortBy, sortOrder, pageSize);
      await fetchSummary();
      setIsAddPositionModalOpen(false);
    } catch (error) {
      // You might want to show a toast notification here
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    // Handle null, undefined, or NaN values
    if (amount == null || isNaN(amount)) {
      return 'N/A';
    }
    
    const currencyCode = selectedPortfolio?.currencyCode || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    if (percent == null || isNaN(percent)) return '0.00%';
    return `${percent >= 0 ? '+' : ''}${Number(percent).toFixed(2)}%`;
  };



  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    redirect('/api/auth/login');
  }

  if (!selectedPortfolio && !portfolioLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Portfolio Not Found</h1>
          <p className="text-gray-600 mb-6">The portfolio you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/en/portfolio" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Back to Portfolios
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Link href="/en/dashboard" className="text-blue-600 hover:text-blue-500">
                  ← Back to Dashboard
                </Link>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                {selectedPortfolio?.name || 'Loading...'}
                {selectedPortfolio && (
                  <span className="ml-3 text-lg text-blue-600">
                    {selectedPortfolio.currency.symbol}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {selectedPortfolio?.description || 'Manage your dividend investments'}
              </p>
            </div>
          </div>
        </div>

        {/* Error handling */}
        {(portfolioError || positionsError) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">
              Error loading portfolio data: {portfolioError || positionsError}
            </p>
          </div>
        )}

        {/* Portfolio Summary Cards */}
        {summaryLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading summary...</p>
          </div>
        ) : (
          <MetricCardsGrid>
            <MetricCard
              title="Market Value"
              value={formatCurrency(portfolioSummary.totalValue)}
              change={{
                value: Math.abs(portfolioSummary.totalGainPercent),
                type: portfolioSummary.totalGainPercent >= 0 ? 'increase' : 'decrease',
                period: 'total return'
              }}
              icon={DollarSignIcon}
              iconColor="blue"
            />

            <MetricCard
              title="Total Cost"
              value={formatCurrency(portfolioSummary.totalCost)}
              icon={DollarSignIcon}
              iconColor="gray"
            />

            <MetricCard
              title="Unrealized P&L"
              value={formatCurrency(portfolioSummary.totalGain)}
              change={{
                value: Math.abs(portfolioSummary.totalGainPercent),
                type: portfolioSummary.totalGain >= 0 ? 'increase' : 'decrease',
                period: 'return'
              }}
              icon={portfolioSummary.totalGain >= 0 ? TrendingUpIcon : TrendingDownIcon}
              iconColor={portfolioSummary.totalGain >= 0 ? 'green' : 'red'}
            />
          </MetricCardsGrid>
        )}

        {/* Dividend Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Dividend Evolution</CardTitle>
            <p className="text-sm text-gray-600">
              Monthly dividend payments over the last 5 years
            </p>
          </CardHeader>
          <CardContent>
            <DividendChart
              portfolioId={portfolioId}
              apiClient={apiClient}
              isAuthenticated={isAuthenticated}
            />
          </CardContent>
        </Card>

        {/* Positions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Positions ({pagination ? `${positions.length} of ${pagination.total}` : positions.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-600">
                    Show:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                  </div>
                )}
                 <Button
                  onClick={handleSyncPrices}
                  size="sm"
                  variant="secondary"
                  disabled={isSyncing}
                >
                  <RefreshIcon className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Refresh Prices'}
                </Button>
                <Button
                  onClick={() => setIsAddPositionModalOpen(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  + Add Position
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {positionsLoading ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unrealized P&L</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(pageSize)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="flex items-center justify-end"><div className="h-4 bg-gray-200 rounded w-12 mr-2"></div><div className="w-16 bg-gray-200 rounded-full h-2"></div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No positions found
                </h3>
                <p className="text-sm text-gray-600">
                  Start investing to see your positions here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader field="stockSymbol" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort}>Symbol</SortableHeader>
                      <SortableHeader field="companyName" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort}>Company</SortableHeader>
                      <SortableHeader field="currentQuantity" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</SortableHeader>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                      <SortableHeader field="totalCost" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</SortableHeader>
                      <SortableHeader field="marketValue" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</SortableHeader>
                      <SortableHeader field="unrealizedGain" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unrealized P&L</SortableHeader>
                      <SortableHeader field="portfolioPercentage" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio %</SortableHeader>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {positions.map((position) => (
                      <tr key={position.stockSymbol} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{position.stockSymbol}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 max-w-xs truncate">{position.companyName}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{position.currentQuantity ? position.currentQuantity.toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {position.currentQuantity > 0 ? formatCurrency(position.totalCost / position.currentQuantity) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">{formatCurrency(position.currentPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{formatCurrency(position.totalCost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(position.marketValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <GainLossDisplay value={position.unrealizedGain} percent={position.unrealizedGainPercent} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          <div className="flex items-center justify-end">
                            <span className="mr-2">
                              {position.portfolioPercentage != null ? `${position.portfolioPercentage.toFixed(2)}%` : '0.00%'}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(position.portfolioPercentage || 0, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!positionsLoading && pagination && pagination.total > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} positions
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchPage(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchPage(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Position Modal */}
      <AddPositionModal
        isOpen={isAddPositionModalOpen}
        onClose={() => setIsAddPositionModalOpen(false)}
        onSubmit={handleAddPosition}
        portfolioId={portfolioId}
      />
    </AppLayout>
  );
}