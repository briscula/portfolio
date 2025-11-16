'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { 
  DividendProgressViewProps, 
  TimePeriod, 
  DividendDataPoint,
  ProcessedDividendData 
} from './types/dividend';
import { processDividendData } from './utils/calculations';
import { formatCurrency, formatPercentage, formatTimePeriod } from './utils/formatters';

// Mock dividend data for demonstration
const mockDividendData: DividendDataPoint[] = [
  { date: '2024-01-15', amount: 125.50, symbol: 'AAPL', company: 'Apple Inc.', paymentType: 'regular' },
  { date: '2024-02-20', amount: 89.25, symbol: 'MSFT', company: 'Microsoft Corp.', paymentType: 'regular' },
  { date: '2024-03-10', amount: 156.75, symbol: 'JNJ', company: 'Johnson & Johnson', paymentType: 'regular' },
  { date: '2024-04-05', amount: 98.40, symbol: 'KO', company: 'Coca-Cola Co.', paymentType: 'regular' },
  { date: '2024-05-18', amount: 134.20, symbol: 'AAPL', company: 'Apple Inc.', paymentType: 'regular' },
  { date: '2024-06-22', amount: 92.80, symbol: 'MSFT', company: 'Microsoft Corp.', paymentType: 'regular' },
  { date: '2024-07-12', amount: 167.30, symbol: 'JNJ', company: 'Johnson & Johnson', paymentType: 'regular' },
  { date: '2024-08-08', amount: 105.60, symbol: 'KO', company: 'Coca-Cola Co.', paymentType: 'regular' },
  { date: '2024-09-14', amount: 142.90, symbol: 'AAPL', company: 'Apple Inc.', paymentType: 'regular' },
];

const TimeFilter: React.FC<{
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}> = ({ selectedPeriod, onPeriodChange }) => {
  const periods: TimePeriod[] = ['month', 'quarter', 'year', 'all'];

  return (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            selectedPeriod === period
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {formatTimePeriod(period, 'en-US')}
        </button>
      ))}
    </div>
  );
};

const MetricsPanel: React.FC<{
  data: ProcessedDividendData;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { metrics, trends } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Income</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(metrics.totalIncome, 'USD', 'en-US')}
          </div>
          <div className={`text-sm flex items-center ${
            trends.direction === 'up' ? 'text-green-600' : 
            trends.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trends.direction === 'up' ? '↗' : trends.direction === 'down' ? '↘' : '→'}
            <span className="ml-1">{formatPercentage(trends.percentage)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">Payment Count</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.paymentCount}
          </div>
          <div className="text-sm text-gray-600">
            {metrics.trend === 'increasing' ? 'Increasing' : 
             metrics.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">Average Payment</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(metrics.averagePayment, 'USD', 'en-US')}
          </div>
          <div className="text-sm text-gray-600">
            Growth: {formatPercentage(metrics.growthRate)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SimpleChart: React.FC<{
  data: DividendDataPoint[];
}> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No dividend data available
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount));
  
  return (
    <div className="h-64 flex items-end space-x-2 p-4">
      {data.map((point, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="bg-blue-500 rounded-t w-full transition-all hover:bg-blue-600"
            style={{
              height: `${(point.amount / maxAmount) * 200}px`,
              minHeight: '4px'
            }}
            title={`${point.symbol}: ${formatCurrency(point.amount, 'USD', 'en-US')} on ${new Date(point.date).toLocaleDateString()}`}
          />
          <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
            {point.symbol}
          </div>
        </div>
      ))}
    </div>
  );
};

export const DividendProgressView: React.FC<DividendProgressViewProps> = ({
  userId,
  className = '',
  defaultPeriod = 'quarter'
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(defaultPeriod);
  const [isLoading, setIsLoading] = useState(false);

  // Process dividend data based on selected period
  const processedData = useMemo(() => {
    return processDividendData(mockDividendData, selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (period: TimePeriod) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dividend Progress</CardTitle>
          <TimeFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Panel */}
        <MetricsPanel data={processedData} isLoading={isLoading} />
        
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dividend Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <SimpleChart data={processedData.dataPoints} />
            )}
          </CardContent>
        </Card>

        {/* Recent Dividends List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {processedData.dataPoints.slice(-5).reverse().map((payment, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="font-medium text-sm">{payment.symbol}</div>
                      <div className="text-sm text-gray-600">{payment.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payment.amount, 'USD', 'en-US')}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default DividendProgressView;