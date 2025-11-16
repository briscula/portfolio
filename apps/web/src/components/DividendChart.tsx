'use client';

import { ResponsiveBar } from '@nivo/bar';
import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useTranslation } from '../lib/hooks/useTranslation';
import { DividendService, ChartDataPoint } from '@/services/dividendService';

interface DividendChartProps {
  portfolioId?: string;
  startYear?: number;
  endYear?: number;
  apiClient?: any; // Pass the authenticated API client
  isAuthenticated?: boolean; // Pass authentication state
}

const colorMap = {
  '2020': '#3b82f6', // Blue-500 - Professional blue
  '2021': '#10b981', // Emerald-500 - Fresh green
  '2022': '#f59e0b', // Amber-500 - Warm orange
  '2023': '#ef4444', // Red-500 - Bold red
  '2024': '#8b5cf6', // Violet-500 - Rich purple
  '2025': '#06b6d4', // Cyan-500 - Bright cyan
  '2026': '#84cc16', // Lime-500 - Vibrant lime
  '2027': '#f97316', // Orange-500 - Bright orange
  '2028': '#ec4899', // Pink-500 - Energetic pink
};

export default function DividendChart({
  portfolioId,
  startYear,
  endYear,
  apiClient,
  isAuthenticated
}: DividendChartProps) {
  const { user, isLoading } = useUser();
  const { t, locale, formatCurrency } = useTranslation();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  const dividendService = useMemo(() => new DividendService(apiClient), [apiClient]);

  useEffect(() => {
    const fetchDividendData = async () => {
      if (!user || !isAuthenticated || !portfolioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calculate year range using service
        const { startYear: defaultStart, endYear: defaultEnd } = dividendService.getDefaultYearRange();
        const finalStartYear = startYear || defaultStart;
        const finalEndYear = endYear || defaultEnd;


        // Fetch data via service
        const apiResponse = await dividendService.getDividendMonthlyOverview(
          portfolioId,
          finalStartYear,
          finalEndYear
        );

        // Transform for chart using service
        if (apiResponse.data && apiResponse.data.length > 0) {
          const transformedData = dividendService.transformToChartFormat(apiResponse, locale);
          setChartData(transformedData);
          setKeys(apiResponse.years.sort());
        } else {
          setChartData([]);
          setKeys([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dividend data');

        // Fallback to sample data on error
        const fallbackData = [
          { month: 'jan', '2020': 20, '2021': 55, '2022': 85, '2023': 75 },
          { month: 'feb', '2020': 40, '2021': 80, '2022': 140, '2023': 110 },
          { month: 'mar', '2020': 55, '2021': 115, '2022': 105, '2023': 100 },
        ];
        setChartData(fallbackData);
        setKeys(['2020', '2021', '2022', '2023']);
      } finally {
        setLoading(false);
      }
    };

    fetchDividendData();
  }, [dividendService, user, portfolioId, startYear, endYear, isAuthenticated, locale]);

  if (isLoading || loading) {
    return (
      <div className="w-full h-96 p-4">
        {/* Chart skeleton */}
        <div className="animate-pulse">
          {/* Chart title area */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart area */}
          <div className="relative h-80">
            {/* Y-axis */}
            <div className="absolute left-0 top-0 h-full w-12 flex flex-col justify-between py-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
              ))}
            </div>

            {/* Chart bars */}
            <div className="ml-16 mr-32 h-full flex items-end justify-between px-4">
              {[...Array(12)].map((_, monthIndex) => (
                <div key={monthIndex} className="flex items-end space-x-1 flex-1 max-w-16">
                  {[...Array(5)].map((_, yearIndex) => (
                    <div
                      key={yearIndex}
                      className="bg-gray-200 rounded-t w-3"
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                      }}
                    ></div>
                  ))}
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-16 right-32 flex justify-between">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                <div key={month} className="h-3 bg-gray-200 rounded w-6"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t('dividends.errorLoadingData')}:</p>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">{t('dividends.showingFallbackData')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-600">{t('auth.pleaseLogin')}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-600">{t('dividends.noDataAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveBar
        data={chartData}
        keys={keys}
        indexBy="month"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        groupMode="grouped"
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id }) => colorMap[id as keyof typeof colorMap] || '#6b7280'}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t('dividends.month'),
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: `${t('dividends.dividends')} (${t('dividends.currency')})`,
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        enableLabel={false}
        labelSkipWidth={1000}
        labelSkipHeight={1000}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role="application"
        ariaLabel={t('dividends.monthlyOverview')}
        barAriaLabel={function (e) {
          const value = typeof e.value === 'number' ? formatCurrency(e.value) : e.value;
          return `${e.id}: ${value} ${t('dividends.month').toLowerCase()} ${e.indexValue}`;
        }}
        tooltip={({ id, value, indexValue, color }) => (
          <div
            style={{
              background: 'white',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: color,
                  marginRight: '8px',
                  borderRadius: '2px',
                }}
              />
              <strong>{id}</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <strong>{typeof value === 'number' ? formatCurrency(value) : value}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {indexValue}
            </div>
          </div>
        )}
      />
    </div>
  );
} 