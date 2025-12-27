# Market Value Calculation

This document explains how market value is calculated and displayed in the application, and the recent fixes that were implemented.

## Problem

The frontend was displaying the "Total Cost" of a portfolio as the same as its "Market Value". This was incorrect, as the market value should reflect the current prices of the stocks in the portfolio, not their historical cost.

## Root Cause

The issue was in the frontend's `apps/web/src/services/portfolioService.ts` file. The functions responsible for calculating portfolio metrics were not correctly using the `marketValue` data that was being provided by the backend API.

Specifically:

- The `calculatePortfolioMetrics` function was trying to use a non-existent `totalValue` property on the `Position` object.
- The `calculatePortfolioSummary` function was hardcoded to use `totalCost` as `totalValue`.

## Fix

The following changes were made in `apps/web/src/services/portfolioService.ts` to correct the calculations:

1.  **`calculatePortfolioMetrics`:** Updated to use the `marketValue` property from the `Position` object when calculating the `totalValue` of the portfolio. It now correctly sums up the `marketValue` of all positions.

2.  **`calculatePortfolioSummary`:** Refactored to also use the `marketValue` property to calculate `totalValue`. The calculations for `totalGain` and `totalGainPercent` were also updated to be based on the correct `totalValue`.

With these changes, the frontend now accurately reflects the market value of the portfolio based on the data provided by the backend.

## How Pricing Sync Works

The backend is responsible for providing the `marketValue` for each position. Here's how it works:

1.  **Database:** There is a `stockPrice` table in the database that stores the latest price for each stock symbol.

2.  **Backend API:** The backend service in `apps/api/src/positions/positions.service.ts` reads from the `stockPrice` table. When a portfolio's positions are requested, the backend fetches the latest prices for all stocks in the portfolio and calculates the `marketValue` for each position (`marketValue = currentQuantity * currentPrice`).

3.  **Frontend:** The frontend receives the positions with the calculated `marketValue` and uses this to display the correct market value for the portfolio.

**To sync prices, you need to ensure that the `stockPrice` table is populated with up-to-date prices for all relevant stock symbols.**

We've also noticed an untracked `apps/api/src/prices/` directory, which suggests a new feature for automatically fetching and syncing prices is under development. This would likely be the long-term solution for keeping prices up-to-date.
