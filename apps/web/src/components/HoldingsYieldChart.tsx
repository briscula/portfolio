'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

interface HoldingsYieldChartProps {
  portfolioId: string;
  apiClient: any;
  isAuthenticated: boolean;
}

export default function HoldingsYieldChart({
  portfolioId,
  apiClient,
  isAuthenticated,
}: HoldingsYieldChartProps) {
  const { user, isLoading: userLoading } = useUser();
  const [holdings, setHoldings] = useState<HoldingYieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'symbol' | 'yieldOnCost' | 'trailing'>('yieldOnCost');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !isAuthenticated || !portfolioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getHoldingsYieldComparison(portfolioId);
        console.log('[HoldingsYieldChart] Response:', response);
        console.log('[HoldingsYieldChart] Holdings count:', response.holdings?.length || 0);
        setHoldings(response.holdings || []);
      } catch (err) {
        console.error('[HoldingsYieldChart] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch yield data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, portfolioId, apiClient]);

  const sortedHoldings = useMemo(() => {
    const sorted = [...holdings];
    switch (sortBy) {
      case 'symbol':
        return sorted.sort((a, b) => a.tickerSymbol.localeCompare(b.tickerSymbol));
      case 'yieldOnCost':
        return sorted.sort((a, b) => b.yieldOnCost - a.yieldOnCost);
      case 'trailing':
        return sorted.sort((a, b) => b.trailing12MonthYield - a.trailing12MonthYield);
      default:
        return sorted;
    }
  }, [holdings, sortBy]);

  // Transform data to include goals (markers) on bars
  const chartData = useMemo(() => {
    const data = sortedHoldings.map(h => ({
      x: h.tickerSymbol,
      y: h.trailing12MonthYield,
      goals: [
        {
          name: 'Yield on Cost',
          value: h.yieldOnCost,
          strokeWidth: 10,
          strokeHeight: 0,
          strokeLineCap: 'round' as const,
          strokeColor: '#10b981', // Green color for YOC marker
        }
      ]
    }));
    console.log('[HoldingsYieldChart] Chart data:', data);
    return data;
  }, [sortedHoldings]);

  // ApexCharts configuration for bar with markers (goals)
  const chartOptions = useMemo<ApexOptions>(() => ({
    chart: {
      height: 400,
      type: 'bar'
    },
    plotOptions: {
      bar: {
        columnWidth: '60%'
      }
    },
    colors: ['#3b82f6'],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Yield (%)',
      },
      labels: {
        formatter: (value) => `${value.toFixed(1)}%`,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const holding = sortedHoldings[dataPointIndex];
        const trailingYield = holding.trailing12MonthYield;
        const yoc = holding.yieldOnCost;

        return `
          <div class="bg-white p-3 border border-gray-200 rounded shadow-lg" style="min-width: 200px;">
            <p class="font-semibold text-gray-900 mb-2">${holding.tickerSymbol}</p>
            <div class="text-sm">
              <div class="mb-1">
                <span class="font-medium text-blue-600">Trailing 12mo:</span> ${trailingYield.toFixed(2)}%
                <div class="text-xs text-gray-500">($${holding.trailing12MonthDividends.toFixed(2)})</div>
              </div>
              <div>
                <span class="font-medium text-green-600">Yield on Cost:</span> ${yoc.toFixed(2)}%
                <div class="text-xs text-gray-500">Total: $${holding.totalDividends.toFixed(2)} / Cost: $${holding.totalCost.toFixed(2)}</div>
              </div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      customLegendItems: ['Trailing 12-Month Yield', 'Yield on Cost'],
      markers: {
        fillColors: ['#3b82f6', '#10b981']
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
  }), [sortedHoldings]);

  const series = useMemo(() => [
    {
      name: 'Trailing 12-Month Yield',
      data: chartData,
    },
  ], [chartData]);

  if (userLoading || loading) {
    return (
      <div className="w-full h-96 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading yield data</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user || holdings.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-gray-600 mb-2">No dividend-paying holdings found</p>
          <p className="text-sm text-gray-500">
            Add stocks with dividend payments and ensure prices are synced
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="yieldOnCost">Yield on Cost</option>
            <option value="trailing">Trailing 12-Month Yield</option>
            <option value="symbol">Ticker Symbol</option>
          </select>
        </div>
      </div>

      <div className="w-full" style={{ height: '400px' }}>
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height={400}
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Bars:</strong> Trailing 12-Month Yield - Last 12 months of dividends divided by current position value.
          <br />
          <strong>Markers (●):</strong> Yield on Cost - Total dividends received divided by original investment cost.
        </p>
      </div>
    </div>
  );
}
