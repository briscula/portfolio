# Mock Service Worker (MSW) Setup

This directory contains the Mock Service Worker configuration for frontend development and testing without a backend server.

## Overview

MSW intercepts network requests at the service worker level, allowing you to:
- Develop frontend features without a backend
- Test components with realistic API responses
- Simulate different network conditions and errors
- Gradually migrate from mock to real API endpoints

## Usage

### Development with Mocks

```bash
npm run dev:mock
```

This starts the development server with MSW enabled, intercepting all API calls.

### Development with Real API

```bash
npm run dev
```

This starts the development server without MSW, making real API calls.

### Environment Configuration

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_MSW=true
```

## Mock Data

The mock data is organized in the `data/` directory:

- `portfolios.ts` - Portfolio entities and summary data
- `positions.ts` - Stock positions with calculated metrics
- `transactions.ts` - Transaction history and recent activity
- `dividends.ts` - Dividend data and upcoming payments

## API Endpoints Mocked

### Portfolios
- `GET /portfolios` - List portfolios with pagination
- `GET /portfolios/:id` - Get portfolio details
- `POST /portfolios` - Create portfolio
- `PATCH /portfolios/:id` - Update portfolio
- `DELETE /portfolios/:id` - Delete portfolio

### Positions
- `GET /portfolios/:id/positions` - Get positions with pagination/sorting

### Transactions
- `GET /transactions` - List transactions with pagination
- `GET /portfolios/:id/transactions` - Portfolio-specific transactions
- `POST /portfolios/:id/transactions` - Create transaction
- `GET /transactions/positions` - Get all positions
- `GET /transactions/recent` - Recent activity

### Dividends
- `GET /portfolios/:id/dividends/monthly` - Monthly dividend data
- `GET /dividends/upcoming` - Upcoming dividends

### Authentication
- `GET /api/auth/token` - Auth0 token endpoint (returns mock token)

## Features

### Realistic Behavior
- **Pagination**: All list endpoints support pagination with metadata
- **Sorting**: Support for sorting by various fields
- **Filtering**: Basic filtering capabilities
- **Delays**: Simulated network delays (100-300ms)
- **CRUD Operations**: Full create, read, update, delete support

### Error Simulation
Add `?mockError=true` to any URL to simulate a 500 error response.

### Data Persistence
- In-memory storage during session
- CRUD operations modify mock data
- Data resets on page refresh

## Testing

MSW handlers can be imported in Jest tests:

```typescript
import { handlers } from '../mocks/handlers';
import { setupServer } from 'msw/node';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## File Structure

```
src/mocks/
├── browser.ts          # Browser MSW setup
├── handlers.ts         # API route handlers
├── utils.ts            # Helper functions
├── data/               # Mock data files
│   ├── portfolios.ts
│   ├── positions.ts
│   ├── transactions.ts
│   └── dividends.ts
└── README.md           # This file
```

## Troubleshooting

### MSW Not Working
1. Check that `NEXT_PUBLIC_ENABLE_MSW=true` is set
2. Verify the service worker is registered in browser dev tools
3. Check console for MSW initialization messages

### Service Worker Issues
1. Clear browser cache and reload
2. Check that `mockServiceWorker.js` exists in `public/` directory
3. Verify service worker registration in browser dev tools

### API Calls Not Intercepted
1. Ensure API calls use the correct base URL (`http://localhost:3000`)
2. Check that MSW handlers match the exact endpoint patterns
3. Verify authentication headers are properly set

## Benefits

- ✅ No separate server process needed
- ✅ Works in browser and Node.js (for tests)
- ✅ Intercepts actual fetch calls (no code changes)
- ✅ Easy toggle between mock and real API
- ✅ Realistic network behavior simulation
- ✅ Same handlers for dev and testing
- ✅ Type-safe with TypeScript
- ✅ Can gradually migrate to real API endpoints
