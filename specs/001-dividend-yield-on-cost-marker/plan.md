# Implementation Plan: Dividend Yield Comparison Enhancement

**Feature Spec**: `spec.md`  
**Created**: 2025-12-22  
**Status**: Planning

## 1. Technical Context

- **Feature**: Enhance the "Dividend Yield Comparison" widget to display a stock's current yield vs. the user's yield on cost.
- **Affected Components**:
  - `apps/web/src/components/HoldingsYieldChart.tsx`: The frontend chart component.
  - `apps/api/src/dividend-analytics/dividend-analytics.service.ts`: The backend service containing the business logic.
  - `packages/database/prisma/schema.prisma`: The `stock_price` table definition.

- **Analysis Summary**: A deep-dive investigation revealed that the frontend component (`HoldingsYieldChart`) and the backend service method (`getHoldingsYieldComparison`) are already fully implemented to meet the user's clarified request. The feature is non-functional due to a critical data gap: the `stock_price` table, which is meant to provide the current price for each holding, is never populated.

- **Root Cause**: The `trailing12MonthYield` calculation depends on the stock's current market value, which in turn requires its current price. With no data in the `stock_price` table, this calculation returns `0`, causing the chart's bars to be flat and giving the impression that the feature is broken or unimplemented.

- **Proposed Solution**: The plan is to implement a robust, scheduled background job within the `apps/api` service. This job will fetch current stock prices from a third-party financial data provider and populate the `stock_price` table daily. This will provide the necessary data to the existing `getHoldingsYieldComparison` service method, making the feature work as intended.

- **Unknowns**:
  - `[NEEDS CLARIFICATION]` The ideal third-party API for fetching stock prices. This will be resolved in Phase 0.
  - `[NEEDS CLARIFICATION]` The best way to manage the API key for the chosen third-party service. This will be resolved in Phase 0.

## 2. Constitution Check

- **I. Type Safety & Validation First**: The new price-fetching service MUST use Zod to validate the responses from the third-party API. New DTOs will be created for this purpose. Environment variables for the API key will use the `@repo/env` package.
- **II. Test-First Development**: An integration test will be written for the new scheduled service. It will mock the third-party API and verify that the service correctly parses the data and updates the `stock_price` table in the test database.
- **III. Monorepo Hygiene**: The new logic will be encapsulated within a new, dedicated module (e.g., `PriceUpdaterModule`) inside `apps/api` to maintain separation of concerns.
- **IV. Security & Authentication**: The third-party API key is a sensitive secret and MUST be managed via environment variables and the `@repo/env` package. It MUST NOT be committed to the repository.
- **V. Simplicity & YAGNI**: The solution is simple and directly addresses the identified data gap. It avoids over-engineering by using the built-in NestJS scheduler (`@nestjs/schedule`) rather than a more complex external queueing system.

**Gate Evaluation**: All constitutional principles are met. The plan proceeds.

## 3. Phase 0: Outline & Research

This phase will resolve the unknowns identified in the Technical Context. The findings will be documented in `research.md`.

- **Research Task 1**: Identify and select a third-party financial data provider.
  - **Criteria**: Reliability, generous free tier for development, simple API, good documentation.
  - **Candidates**: Financial Modeling Prep (FMP), Alpha Vantage, Finnhub.
  - **Goal**: Choose one provider and document the endpoint for fetching stock prices.

- **Research Task 2**: Determine the best practice for managing the API key.
  - **Goal**: Document the process for adding the new secret to the `.env.example` and the `@repo/env` schema.

## 4. Phase 1: Design & Contracts

This phase produces the core design artifacts based on the research from Phase 0.

- **`data-model.md`**: Document the schema and purpose of the `stock_price` table.
- **`contracts/price-updater.md`**: Define the behavior of the scheduled job. Since this is not a REST API, this document will describe the service's responsibility, the `Cron` schedule, and the data flow.
- **`quickstart.md`**: Provide a step-by-step guide for developers to implement the price updater service.
- **Agent Context Update**: Run the script to add new technologies (e.g., `@nestjs/schedule` and the chosen API client library) to the agent's knowledge base.

## 5. Phase 2: Implementation & Testing (High-Level)

- **Backend**:
  - Implement the `PriceUpdaterModule`, `PriceUpdaterService`, and associated DTOs with Zod validation.
  - Integrate the chosen financial data API.
  - Set up the scheduled task using `@nestjs/schedule`.
  - Write integration tests.
- **Frontend**:
  - No code changes are expected, but thorough testing is required once the backend is providing correct data.
- **Documentation**:
  - Update `docs/DEPLOYMENT.md` with instructions for setting the new API key in production environments.
