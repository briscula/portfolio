'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect, useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { usePortfolios } from '@/hooks/usePortfolio';
import { Card, CardHeader, CardTitle, CardContent, DividendCalendar, MetricCard, MetricCardsGrid, DollarSignIcon, CalendarIcon, PercentIcon } from '@/components/ui';
import DividendChart from '@/components/DividendChart';
import HoldingsYieldChart from '@/components/HoldingsYieldChart';
import { useApiClient } from '@/lib/apiClient';

interface HoldingYieldData {
    tickerSymbol: string;
    companyName: string;
    currentQuantity: number;
    currentPrice: number;
    currencyCode: string;
    yieldOnCost: number;
    trailing12MonthYield: number;
    trailing12MonthDividends: number;
    totalCost: number;
    totalDividends: number;
}

export default function PortfolioDividendsPage() {
    const { user, isLoading } = useUser();
    const { apiClient, isAuthenticated } = useApiClient();
    const params = useParams();
    const portfolioId = params.id as string;

    const { portfolios, loading: portfoliosLoading, error: portfoliosError } = usePortfolios();
    const selectedPortfolio = portfolios.find(p => p.id === portfolioId);

    // State for dividend-paying holdings (last 12 months)
    const [holdings, setHoldings] = useState<HoldingYieldData[]>([]);
    const [holdingsLoading, setHoldingsLoading] = useState(true);
    const [holdingsError, setHoldingsError] = useState<string | null>(null);

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

    // Fetch dividend-paying holdings (last 12 months)
    useEffect(() => {
        const fetchHoldings = async () => {
            if (!isAuthenticated || !portfolioId) {
                setHoldingsLoading(false);
                return;
            }

            try {
                setHoldingsLoading(true);
                setHoldingsError(null);
                const response = await apiClient.getHoldingsYieldComparison(portfolioId) as { holdings: HoldingYieldData[] };
                // Filter to only show holdings with dividends in last 12 months
                const holdingsWithRecentDividends = (response.holdings || []).filter(
                    (h: HoldingYieldData) => h.trailing12MonthDividends > 0
                );
                setHoldings(holdingsWithRecentDividends);
            } catch (error) {
                console.error('Failed to fetch holdings:', error);
                setHoldingsError(error instanceof Error ? error.message : 'Failed to fetch holdings');
            } finally {
                setHoldingsLoading(false);
            }
        };

        fetchHoldings();
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

    // Handle auth errors - redirect to login
    if (portfoliosError && (portfoliosError.includes('Authentication') || portfoliosError.includes('401'))) {
        redirect('/api/auth/login');
    }

    if (!selectedPortfolio && !portfoliosLoading) {
        // If there's an error, show it instead of "Not Found"
        if (portfoliosError) {
            return (
                <AppLayout>
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Portfolio</h1>
                        <p className="text-gray-600 mb-6">{portfoliosError}</p>
                        <Link href="/en/dividends" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            Back to Dividends
                        </Link>
                    </div>
                </AppLayout>
            );
        }

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
                {(portfoliosError || holdingsError) && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800">
                            Error loading data: {portfoliosError || holdingsError}
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

                {/* Dividend Holdings Table - Last 12 Months */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dividend-Paying Holdings (Last 12 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {holdingsLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-sm text-gray-600">Loading holdings...</p>
                            </div>
                        ) : holdings.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">
                                    No dividends received in the last 12 months
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Holdings that paid dividends in the last year will appear here.
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
                                                Last 12M Dividends
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Dividends
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Yield on Cost
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {holdings.map((holding) => (
                                            <tr key={holding.tickerSymbol} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {holding.tickerSymbol}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {holding.companyName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {holding.currentQuantity?.toLocaleString() || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                                                    {formatCurrency(holding.trailing12MonthDividends)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                                                    {formatCurrency(holding.totalDividends)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                    {holding.yieldOnCost.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dividend Yield Comparison Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dividend Yield Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HoldingsYieldChart
                            portfolioId={portfolioId}
                            apiClient={apiClient}
                            isAuthenticated={isAuthenticated}
                        />
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