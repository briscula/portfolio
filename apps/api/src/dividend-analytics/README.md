# Dividend Analytics Module

This module provides comprehensive dividend analysis functionality for your portfolio application. It allows you to track and analyze dividend income across different time periods and companies.

## Features

### 1. Monthly Dividend Overview (Recommended for Visualization)
- **Endpoint**: `GET /dividend-analytics/monthly-overview`
- **Description**: Get monthly dividend data optimized for charting with months on x-axis and years as separate series
- **Query Parameters**:
  - `startYear` (optional): Filter from specific year
  - `endYear` (optional): Filter to specific year
  - `portfolioId` (optional): Filter by specific portfolio
  - `stockSymbol` (optional): Filter by specific stock
- **Perfect for**: Line charts, bar charts, time series visualization

**Response Example**:
```json
{
  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "years": ["2022", "2023", "2024"],
  "data": [
    {
      "month": "01",
      "monthName": "January",
      "yearlyData": [
        {
          "year": "2022",
          "totalDividends": 850.25,
          "dividendCount": 6,
          "companies": ["AAPL", "MSFT"]
        },
        {
          "year": "2023",
          "totalDividends": 920.50,
          "dividendCount": 7,
          "companies": ["AAPL", "MSFT", "JNJ"]
        },
        {
          "year": "2024",
          "totalDividends": 1050.75,
          "dividendCount": 8,
          "companies": ["AAPL", "MSFT", "JNJ", "GOOGL"]
        }
      ]
    }
  ]
}
```

**Chart Usage**: 
- Use `months` array for x-axis labels
- Use `years` array for legend/series names
- Use `data[].yearlyData[].totalDividends` for y-axis values
- Each year becomes a separate line/series in your chart

### 2. Company Dividend Summaries
- **Endpoint**: `GET /dividend-analytics/company-summaries`
- **Description**: Get dividend summaries by company and year, including yield on cost
- **Key Metrics**:
  - Total dividends received per year per company
  - Number of dividend payments
  - Total cost basis for the company
  - Yield on cost (dividends / cost basis * 100)
  - Average dividend per payment

**Response Example**:
```json
[
  {
    "stockSymbol": "AAPL",
    "companyName": "Apple Inc.",
    "year": 2023,
    "totalDividends": 1250.75,
    "dividendCount": 4,
    "totalCost": 15000.00,
    "yieldOnCost": 8.33,
    "averageDividendPerPayment": 312.69
  }
]
```



## Usage Examples

### Get monthly overview data for visualization (2020-2023)
```
GET /dividend-analytics/monthly-overview?startYear=2020&endYear=2023
```

### Get company summaries for a specific portfolio
```
GET /dividend-analytics/company-summaries?portfolioId=1&startYear=2023
```



## Data Requirements

For accurate dividend analysis, ensure your transactions include:

1. **Dividend Transactions**: Set `type: 'DIVIDEND'` with the dividend amount in `amount`
2. **Buy Transactions**: Set `type: 'BUY'` with the purchase cost in `amount`
3. **Stock Information**: Ensure stocks are properly linked with company names

## Yield on Cost Calculation

The yield on cost is calculated as:
```
Yield on Cost = (Total Dividends / Total Cost Basis) × 100
```

This metric shows the annual dividend yield relative to your original investment cost, which is useful for evaluating the performance of dividend-paying stocks over time.

## Authentication

All endpoints require authentication using the AuthGuard. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
``` 