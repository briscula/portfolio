import { TimePeriod } from '../types/dividend';

/**
 * Format currency amount with proper locale and currency symbol
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format currency amount in compact notation (e.g., €1.2K, €1.5M)
 */
export const formatCurrencyCompact = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};

/**
 * Format percentage with proper sign and decimal places
 */
export const formatPercentage = (
  percentage: number,
  decimals: number = 1,
  showSign: boolean = true
): string => {
  const sign = showSign && percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
};

/**
 * Format date for display based on context
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'medium' | 'long' | 'month-year' = 'medium',
  locale: string = 'es-ES'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    case 'medium':
      return dateObj.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    case 'month-year':
      return dateObj.toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      });
    default:
      return dateObj.toLocaleDateString(locale);
  }
};

/**
 * Format date range for period display
 */
export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date,
  locale: string = 'es-ES'
): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // If same year, show abbreviated format
  if (start.getFullYear() === end.getFullYear()) {
    const startFormatted = start.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    });
    const endFormatted = end.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${startFormatted} - ${endFormatted}`;
  }

  // Different years, show full format
  const startFormatted = start.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const endFormatted = end.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Format time period for display
 */
export const formatTimePeriod = (period: TimePeriod, locale: string = 'es-ES'): string => {
  const translations: Record<TimePeriod, Record<string, string>> = {
    month: {
      'es-ES': 'Mes',
      'en-US': 'Month',
    },
    quarter: {
      'es-ES': 'Trimestre',
      'en-US': 'Quarter',
    },
    year: {
      'es-ES': 'Año',
      'en-US': 'Year',
    },
    all: {
      'es-ES': 'Todo',
      'en-US': 'All Time',
    },
  };

  return translations[period][locale] || translations[period]['en-US'] || period;
};

/**
 * Format number with proper locale formatting
 */
export const formatNumber = (
  number: number,
  decimals: number = 0,
  locale: string = 'es-ES'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Format large numbers in compact notation (e.g., 1.2K, 1.5M)
 */
export const formatNumberCompact = (
  number: number,
  locale: string = 'es-ES'
): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
};

/**
 * Format dividend payment type for display
 */
export const formatPaymentType = (
  paymentType: 'regular' | 'special' | 'interim',
  locale: string = 'es-ES'
): string => {
  const translations: Record<string, Record<string, string>> = {
    regular: {
      'es-ES': 'Regular',
      'en-US': 'Regular',
    },
    special: {
      'es-ES': 'Especial',
      'en-US': 'Special',
    },
    interim: {
      'es-ES': 'Interino',
      'en-US': 'Interim',
    },
  };

  return translations[paymentType][locale] || translations[paymentType]['en-US'] || paymentType;
};

/**
 * Format trend direction for display
 */
export const formatTrendDirection = (
  direction: 'up' | 'down' | 'stable',
  locale: string = 'es-ES'
): string => {
  const translations: Record<string, Record<string, string>> = {
    up: {
      'es-ES': 'Creciente',
      'en-US': 'Increasing',
    },
    down: {
      'es-ES': 'Decreciente',
      'en-US': 'Decreasing',
    },
    stable: {
      'es-ES': 'Estable',
      'en-US': 'Stable',
    },
  };

  return translations[direction][locale] || translations[direction]['en-US'] || direction;
};

/**
 * Format confidence level for display
 */
export const formatConfidenceLevel = (
  confidence: 'high' | 'medium' | 'low',
  locale: string = 'es-ES'
): string => {
  const translations: Record<string, Record<string, string>> = {
    high: {
      'es-ES': 'Alta',
      'en-US': 'High',
    },
    medium: {
      'es-ES': 'Media',
      'en-US': 'Medium',
    },
    low: {
      'es-ES': 'Baja',
      'en-US': 'Low',
    },
  };

  return translations[confidence][locale] || translations[confidence]['en-US'] || confidence;
};

/**
 * Get appropriate currency symbol
 */
export const getCurrencySymbol = (currency: string = 'EUR'): string => {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
  };

  return symbols[currency] || currency;
};

/**
 * Format tooltip content for chart data points
 */
export const formatTooltipContent = (
  amount: number,
  date: string | Date,
  company?: string,
  paymentType?: 'regular' | 'special' | 'interim',
  locale: string = 'es-ES'
): string => {
  const formattedAmount = formatCurrency(amount, 'EUR', locale);
  const formattedDate = formatDate(date, 'medium', locale);
  
  let content = `${formattedAmount} - ${formattedDate}`;
  
  if (company) {
    content += `\n${company}`;
  }
  
  if (paymentType) {
    const formattedType = formatPaymentType(paymentType, locale);
    content += ` (${formattedType})`;
  }
  
  return content;
};