import {
  DividendDataPoint,
  DividendMetrics,
  TrendData,
  PeriodSummary,
  TimePeriod,
  ProcessedDividendData,
} from '../types/dividend';

/**
 * Calculate total dividend income from data points
 */
export const calculateTotalIncome = (dataPoints: DividendDataPoint[]): number => {
  return dataPoints.reduce((total, point) => total + point.amount, 0);
};

/**
 * Calculate average dividend payment
 */
export const calculateAveragePayment = (dataPoints: DividendDataPoint[]): number => {
  if (dataPoints.length === 0) return 0;
  return calculateTotalIncome(dataPoints) / dataPoints.length;
};

/**
 * Calculate growth rate between two periods
 */
export const calculateGrowthRate = (
  currentPeriodData: DividendDataPoint[],
  previousPeriodData: DividendDataPoint[]
): number => {
  const currentTotal = calculateTotalIncome(currentPeriodData);
  const previousTotal = calculateTotalIncome(previousPeriodData);
  
  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  
  return ((currentTotal - previousTotal) / previousTotal) * 100;
};

/**
 * Determine trend direction and confidence
 */
export const calculateTrend = (
  dataPoints: DividendDataPoint[],
  comparisonPoints?: DividendDataPoint[]
): TrendData => {
  if (dataPoints.length < 2) {
    return {
      direction: 'stable',
      percentage: 0,
      confidence: 'low',
    };
  }

  // If comparison points provided, use them for trend calculation
  if (comparisonPoints && comparisonPoints.length > 0) {
    const currentTotal = calculateTotalIncome(dataPoints);
    const previousTotal = calculateTotalIncome(comparisonPoints);
    const percentageChange = calculateGrowthRate(dataPoints, comparisonPoints);
    
    return {
      direction: currentTotal > previousTotal ? 'up' : currentTotal < previousTotal ? 'down' : 'stable',
      percentage: Math.abs(percentageChange),
      confidence: dataPoints.length >= 6 ? 'high' : dataPoints.length >= 3 ? 'medium' : 'low',
    };
  }

  // Calculate trend based on recent data points
  const recentPoints = dataPoints.slice(-6); // Last 6 data points
  const olderPoints = dataPoints.slice(-12, -6); // Previous 6 data points
  
  if (olderPoints.length === 0) {
    return {
      direction: 'stable',
      percentage: 0,
      confidence: 'low',
    };
  }

  const recentAverage = calculateAveragePayment(recentPoints);
  const olderAverage = calculateAveragePayment(olderPoints);
  const percentageChange = ((recentAverage - olderAverage) / olderAverage) * 100;

  return {
    direction: recentAverage > olderAverage ? 'up' : recentAverage < olderAverage ? 'down' : 'stable',
    percentage: Math.abs(percentageChange),
    confidence: dataPoints.length >= 12 ? 'high' : dataPoints.length >= 6 ? 'medium' : 'low',
  };
};

/**
 * Filter data points by time period
 */
export const filterDataByPeriod = (
  dataPoints: DividendDataPoint[],
  period: TimePeriod,
  referenceDate: Date = new Date()
): DividendDataPoint[] => {
  if (period === 'all') return dataPoints;

  const now = referenceDate;
  const startDate = new Date(now);

  switch (period) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return dataPoints.filter(point => new Date(point.date) >= startDate);
};

/**
 * Create period summary
 */
export const createPeriodSummary = (
  dataPoints: DividendDataPoint[],
  period: TimePeriod
): PeriodSummary => {
  if (dataPoints.length === 0) {
    const now = new Date();
    return {
      period,
      startDate: now.toISOString(),
      endDate: now.toISOString(),
      totalPayments: 0,
      totalAmount: 0,
    };
  }

  const sortedPoints = [...dataPoints].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startDate = sortedPoints[0].date;
  const endDate = sortedPoints[sortedPoints.length - 1].date;

  return {
    period,
    startDate,
    endDate,
    totalPayments: dataPoints.length,
    totalAmount: calculateTotalIncome(dataPoints),
  };
};

/**
 * Calculate year-over-year change
 */
export const calculateYearOverYearChange = (
  currentYearData: DividendDataPoint[],
  previousYearData: DividendDataPoint[]
): number | undefined => {
  if (previousYearData.length === 0) return undefined;
  
  return calculateGrowthRate(currentYearData, previousYearData);
};

/**
 * Generate dividend metrics from data points
 */
export const generateDividendMetrics = (
  dataPoints: DividendDataPoint[],
  previousPeriodData?: DividendDataPoint[]
): DividendMetrics => {
  const totalIncome = calculateTotalIncome(dataPoints);
  const paymentCount = dataPoints.length;
  const averagePayment = calculateAveragePayment(dataPoints);
  
  const growthRate = previousPeriodData 
    ? calculateGrowthRate(dataPoints, previousPeriodData)
    : 0;
  
  const trend = calculateTrend(dataPoints, previousPeriodData);
  const yearOverYearChange = previousPeriodData 
    ? calculateYearOverYearChange(dataPoints, previousPeriodData)
    : undefined;

  return {
    totalIncome,
    paymentCount,
    averagePayment,
    growthRate,
    yearOverYearChange,
    trend: trend.direction === 'up' ? 'increasing' : trend.direction === 'down' ? 'decreasing' : 'stable',
  };
};

/**
 * Process raw dividend data into structured format
 */
export const processDividendData = (
  rawData: DividendDataPoint[],
  period: TimePeriod,
  referenceDate?: Date
): ProcessedDividendData => {
  // Filter data by selected period
  const filteredData = filterDataByPeriod(rawData, period, referenceDate);
  
  // Get previous period data for comparison
  const previousPeriodData = getPreviousPeriodData(rawData, period, referenceDate);
  
  // Generate metrics
  const metrics = generateDividendMetrics(filteredData, previousPeriodData);
  
  // Calculate trends
  const trends = calculateTrend(filteredData, previousPeriodData);
  
  // Create period summary
  const periodSummary = createPeriodSummary(filteredData, period);

  return {
    dataPoints: filteredData,
    metrics,
    trends,
    periodSummary,
  };
};

/**
 * Get previous period data for comparison
 */
export const getPreviousPeriodData = (
  dataPoints: DividendDataPoint[],
  period: TimePeriod,
  referenceDate: Date = new Date()
): DividendDataPoint[] => {
  if (period === 'all') return [];

  const now = referenceDate;
  const periodStart = new Date(now);
  const periodEnd = new Date(now);

  switch (period) {
    case 'month':
      periodStart.setMonth(now.getMonth() - 2);
      periodEnd.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      periodStart.setMonth(now.getMonth() - 6);
      periodEnd.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      periodStart.setFullYear(now.getFullYear() - 2);
      periodEnd.setFullYear(now.getFullYear() - 1);
      break;
  }

  return dataPoints.filter(point => {
    const pointDate = new Date(point.date);
    return pointDate >= periodStart && pointDate < periodEnd;
  });
};

/**
 * Group data points by time period for aggregation
 */
export const groupDataByPeriod = (
  dataPoints: DividendDataPoint[],
  groupBy: 'month' | 'quarter' | 'year'
): Record<string, DividendDataPoint[]> => {
  const groups: Record<string, DividendDataPoint[]> = {};

  dataPoints.forEach(point => {
    const date = new Date(point.date);
    let key: string;

    switch (groupBy) {
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(point);
  });

  return groups;
};