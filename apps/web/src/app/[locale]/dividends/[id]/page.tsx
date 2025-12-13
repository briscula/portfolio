'use client';

import React, { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect, useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { usePortfolios, usePositions } from '@/hooks/usePortfolio';
import { Card, CardHeader, CardTitle, CardContent, DividendCalendar, MetricCard, MetricCardsGrid, DollarSignIcon, CalendarIcon, PercentIcon } from '@/components/ui';
import DividendChart from '@/components/DividendChart';
import { useApiClient } from '@/lib/apiClient';

export default function PortfolioDividendsPage() {
    const { user, isLoading } = useUser();
    const { apiClient, isAuthenticated } = useApiClient();
    const params = useParams();
    const portfolioId = params.id as string;

    const { portfolios, loading: portfoliosLoading, error: portfoliosError } = usePortfolios();
    const selectedPortfolio = portfolios.find(p => p.id === portfolioId);
    const { positions, loading: positionsLoading, error: positionsError } = usePositions(portfolioId);

    // State for dividend summary
    const [dividendSummary, setDividendSummary] = React.useState({
        totalDividends: 0,
        dividendYield: 0,
        avgMonthlyDividends: 0,
        totalCost: 0,
        dividendCount: 0,
        period: 'last12Months',
    });
    const [summaryLoading, setSummaryLoading] = React.useState(true);

    // Fetch dividend summary
    useEffect(() => {
        const fetchDividendSummary = async () => {
            if (!isAuthenticated || !portfolioId) {
                setSummaryLoading(false);
                return;
            }

            try {
                setSummaryLoading(true);
                const summary = await apiClient.getDividendSummary(portfolioId, 'last12Months');
                setDividendSummary(summary as typeof dividendSummary);
            } catch (error) {
                console.error('Failed to fetch dividend summary:', error);
            } finally {
                setSummaryLoading(false);
            }
        };

        fetchDividendSummary();
    }, [isAuthenticated, portfolioId, apiClient]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        redirect('/api/auth/login');
    }

    if (!selectedPortfolio && !portfoliosLoading) {
        return (
            <AppLayout>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">Portfolio Not Found</h1>
                    <p className="text-gray-600 mb-6">The portfolio you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/en/dividends" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Back to Dividends
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const formatCurrency = (amount: number) => {
        const currencyCode = selectedPortfolio?.currencyCode || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Mock upcoming dividends for this portfolio
    const mockUpcomingDividends = [
        {
            id: '1',
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            dividendAmount: 0.24,
            exDividendDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            paymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            shares: 50,
            estimatedPayout: 12.00,
            frequency: 'quarterly' as const,
        },
        {
            id: '2',
            symbol: 'MSFT',
            companyName: 'Microsoft Corporation',
            dividendAmount: 0.68,
            exDividendDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            paymentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            shares: 25,
            estimatedPayout: 17.00,
            frequency: 'quarterly' as const,
        },
    ];

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Page header */}
                <div className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <Link href="/en/dividends" className="text-blue-600 hover:text-blue-500">
                                    ← Back to Dividends
                                </Link>
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                                {selectedPortfolio?.name || 'Loading...'} - Dividends
                                {selectedPortfolio && (
                                    <span className="ml-3 text-lg text-blue-600">
                                        {selectedPortfolio.currency.symbol}
                                    </span>
                                )}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Dividend tracking and history for this portfolio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error handling */}
                {(portfoliosError || positionsError) && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800">
                            Error loading data: {portfoliosError || positionsError}
                        </p>
                    </div>
                )}

                {/* Dividend Metrics */}
                {summaryLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading dividend summary...</p>
                    </div>
                ) : (
                    <MetricCardsGrid>
                        <MetricCard
                            title="Total Dividends Received"
                            value={formatCurrency(dividendSummary.totalDividends)}
                            icon={DollarSignIcon}
                            iconColor="green"
                        />

                        <MetricCard
                            title="Yield on Cost"
                            value={`${dividendSummary.dividendYield.toFixed(2)}%`}
                            icon={PercentIcon}
                            iconColor="blue"
                        />

                        <MetricCard
                            title="Est. Monthly Dividends"
                            value={formatCurrency(dividendSummary.avgMonthlyDividends)}
                            icon={CalendarIcon}
                            iconColor="purple"
                        />
                    </MetricCardsGrid>
                )}

                {/* Dividend Holdings Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dividend-Paying Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {positionsLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-sm text-gray-600">Loading positions...</p>
                            </div>
                        ) : positions.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">
                                    No dividend data found
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Add dividend-paying stocks to see dividend information.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Symbol
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Shares
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Dividends
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dividend Count
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Yield on Cost
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {positions.filter(pos => pos.totalDividends && pos.totalDividends > 0).map((position) => (
                                            <tr key={position.stockSymbol} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {position.stockSymbol}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {position.companyName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {position.currentQuantity?.toLocaleString() || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                                                    {formatCurrency(position.totalDividends || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {position.dividendCount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                    {(
                                                        position.totalDividends && position.totalCost && position.totalCost !== 0
                                                        ? `${((position.totalDividends / Math.abs(position.totalCost)) * 100).toFixed(2)}%`
                                                        : 'N/A'
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Dividend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Dividend History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DividendChart
                            portfolioId={portfolioId}
                            apiClient={apiClient}
                            isAuthenticated={isAuthenticated}
                        />
                    </CardContent>
                </Card>

                {/* Upcoming Dividends */}
                <DividendCalendar
                    dividends={mockUpcomingDividends}
                    title="Upcoming Dividends"
                    maxItems={10}
                    showViewAll={false}
                />
            </div>
        </AppLayout>
    );
}