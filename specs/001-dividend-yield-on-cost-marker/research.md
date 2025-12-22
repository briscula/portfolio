# Research & Decisions: Price Update Mechanism

**Status**: Completed

## 1. Decision: Third-Party Financial Data Provider

- **Decision**: **Financial Modeling Prep (FMP)** will be used as the third-party data provider for fetching stock prices.
- **Rationale**:
  - **Generous Free Tier**: FMP provides a sufficient number of free API calls per day for development and small-scale production use, which is ideal for this project.
  - **Simple API**: It offers a straightforward REST API endpoint for fetching single or multiple stock prices, which is easy to integrate using a standard HTTP client like `axios`.
  - **Data Quality**: It is a reputable source for financial data.
- **Endpoint to be used**:
  - `GET https://financialmodelingprep.com/api/v3/quote/{TICKERS}?apikey={YOUR_API_KEY}`
  - This endpoint can fetch prices for multiple tickers in a single call, which is efficient for our use case.
- **Alternatives Considered**:
  - **Alpha Vantage**: A popular choice, but its free tier API is more rate-limited and can be slower.
  - **Finnhub**: Another strong candidate, but FMP's API for batch quotes is slightly more convenient for our planned implementation.

## 2. Decision: API Key Management

- **Decision**: The API key for FMP will be managed as a secret environment variable, integrated into the existing type-safe environment handling system (`@repo/env`).
- **Rationale**:
  - This adheres to **Constitution Principle I (Type Safety)** and **IV (Security & Authentication)**.
  - It prevents API keys from being committed to source control.
  - It leverages the existing, validated project pattern for managing secrets, ensuring consistency.
- **Implementation Steps**:
  1.  Add `FMP_API_KEY` to the `.env.example` file in `apps/api`.
  2.  Update the Zod schema in the `@repo/env` package to include `FMP_API_KEY: z.string().min(1)`.
  3.  The new `PriceUpdaterService` will access the key via the injected, validated environment service, not via `process.env`.
