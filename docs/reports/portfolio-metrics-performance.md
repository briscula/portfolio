# Portfolio Metrics Calculation Performance Optimization

## Status: 🔴 Open Issue

**Created:** 2024-10-25
**Priority:** High
**Affected Components:** Dashboard, Portfolio Metrics
**Related Files:** `src/hooks/usePortfoliosWithMetrics.ts`, `src/services/portfolioService.ts`

---

## Problem Statement

### Current Implementation Issue

The portfolio metrics calculation currently fetches ALL position data for each portfolio to calculate summary metrics (totalValue, totalCost, unrealizedGain, etc.). This creates significant performance and scalability problems.

**Technical Details:**

- `usePortfoliosWithMetrics` calls `getPositions(portfolioId, 1, 100)` for EVERY portfolio
- Happens on dashboard load and every 5-minute auto-refresh
- With pagination (page size 100), we might miss positions if a portfolio has >100 holdings
- This approach doesn't scale well with multiple portfolios

### Performance Impact

**Current Behavior:**

- Dashboard with 5 portfolios = **5 separate API calls** to fetch positions
- Each call transfers up to **100+ position records**
- All position data transferred **just to calculate 6 aggregate metrics**
- Process repeats every **5 minutes** via auto-refresh

**Data Transfer:**

```
Example calculation:
5 portfolios × 100 positions × ~500 bytes per position = ~250KB per dashboard load
With auto-refresh: 250KB × 12 times/hour = 3MB/hour of redundant data
```

**User Experience Impact:**

- Slower dashboard load times
- Increased bandwidth usage
- More API quota consumption
- Battery drain on mobile devices (frequent large requests)

---

## Recommended Solutions

### Option 1: Database View (BEST) ⭐

**Implementation:**

- Create a materialized view or computed columns in the database
- Add API endpoint: `GET /portfolios/:id/metrics`
- Returns pre-calculated metrics only

**Benefits:**

- ✅ Single lightweight API call per portfolio
- ✅ No position data transfer needed
- ✅ Database-level caching and optimization
- ✅ Metrics updated via database triggers on position insert/update
- ✅ Consistent with database normalization principles

**Backend Requirements:**

```sql
-- Example materialized view
CREATE MATERIALIZED VIEW portfolio_metrics AS
SELECT
    portfolio_id,
    SUM(total_value) as total_value,
    SUM(ABS(total_cost)) as total_cost,
    SUM(total_value) - SUM(ABS(total_cost)) as unrealized_gain,
    CASE
        WHEN SUM(ABS(total_cost)) > 0
        THEN ((SUM(total_value) - SUM(ABS(total_cost))) / SUM(ABS(total_cost))) * 100
        ELSE 0
    END as unrealized_gain_percent,
    COUNT(*) as position_count,
    NOW() as last_updated
FROM positions
GROUP BY portfolio_id;

-- Auto-refresh trigger
CREATE TRIGGER refresh_portfolio_metrics
AFTER INSERT OR UPDATE OR DELETE ON positions
FOR EACH ROW
EXECUTE FUNCTION refresh_materialized_view('portfolio_metrics');
```

**Frontend Changes:**

```typescript
// In PortfolioService
async getPortfolioMetrics(portfolioId: string): Promise<PortfolioMetrics> {
  return await this.apiClient.getPortfolioMetrics(portfolioId);
}
```

---

### Option 2: Backend Aggregation Endpoint (GOOD)

**Implementation:**

- Create dedicated endpoint: `GET /portfolios/:id/summary`
- Backend calculates metrics using SQL aggregations
- Returns only calculated metrics (no position data)

**Benefits:**

- ✅ Reduces data transfer significantly (~500 bytes vs ~50KB+)
- ✅ Server-side calculation is more efficient
- ✅ Still works with existing pagination for detail views
- ✅ Easier to implement than materialized views

**API Response:**

```json
{
  "portfolioId": "123",
  "totalValue": 50000.0,
  "totalCost": 45000.0,
  "unrealizedGain": 5000.0,
  "unrealizedGainPercent": 11.11,
  "dividendYield": 3.5,
  "positionCount": 25,
  "lastUpdated": "2024-10-25T10:30:00Z"
}
```

---

### Option 3: Batch Metrics Endpoint (ALTERNATIVE)

**Implementation:**

- Create endpoint: `POST /portfolios/metrics`
- Accepts array of portfolio IDs: `{ portfolioIds: [...] }`
- Returns metrics for multiple portfolios in one call

**Benefits:**

- ✅ Single API call for entire dashboard
- ✅ Reduces HTTP overhead (connection setup, headers, etc.)
- ✅ Can be combined with individual endpoints

**API Request/Response:**

```typescript
// Request
POST /api/portfolios/metrics
{
  "portfolioIds": ["portfolio1", "portfolio2", "portfolio3"]
}

// Response
{
  "data": [
    {
      "portfolioId": "portfolio1",
      "metrics": { /* ... */ }
    },
    {
      "portfolioId": "portfolio2",
      "metrics": { /* ... */ }
    }
  ]
}
```

---

### Option 4: Frontend Optimization (TEMPORARY)

**Quick wins while waiting for backend changes:**

1. **Increase cache TTL:**
   - Change from 5 minutes to 15-30 minutes
   - Reduces frequency of expensive calls
   - Trade-off: Slightly staler data

2. **Remove auto-refresh:**
   - Only fetch metrics on explicit user action (refresh button)
   - Reduces unnecessary background requests

3. **Progressive loading:**
   - Load first page of positions (25 items)
   - Fetch additional pages on demand
   - More accurate than pagination limit of 100

**Benefits:**

- ✅ Can implement immediately (no backend changes)
- ✅ Reduces API call frequency
- ❌ Doesn't solve root problem
- ❌ Increases stale data risk

---

## Comparison Matrix

| Solution             | API Calls       | Data Transfer | Backend Work | Frontend Work | Accuracy             |
| -------------------- | --------------- | ------------- | ------------ | ------------- | -------------------- |
| Current              | 5 per dashboard | ~250KB        | None         | None          | Limited (pagination) |
| Database View        | 5 per dashboard | ~2.5KB        | High         | Medium        | 100%                 |
| Aggregation Endpoint | 5 per dashboard | ~2.5KB        | Medium       | Medium        | 100%                 |
| Batch Endpoint       | 1 per dashboard | ~2.5KB        | Medium       | Low           | 100%                 |
| Frontend Cache       | 1 per 30min     | ~250KB        | None         | Low           | Limited (pagination) |

**Recommendation:** Implement **Option 1 (Database View)** or **Option 2 (Aggregation Endpoint)** for best long-term results. Use **Option 4** as a temporary workaround.

---

## Action Items

### Immediate (Temporary Fix)

- [ ] Increase cache TTL in `PortfolioService` from 5 to 30 minutes
- [ ] Make auto-refresh opt-in rather than default
- [ ] Add refresh button for manual metric updates

### Backend Team

- [ ] Discuss which solution to implement (Option 1 vs 2 vs 3)
- [ ] Design API endpoint for portfolio metrics
- [ ] Implement SQL aggregation or materialized view
- [ ] Add endpoint to API documentation
- [ ] Create migration scripts if using database views

### Frontend Team

- [ ] Update `PortfolioService.getPortfolioMetrics()` when endpoint is ready
- [ ] Update `usePortfoliosWithMetrics` to use new endpoint
- [ ] Remove workaround code after backend changes deploy
- [ ] Update tests to mock new endpoint

### Documentation

- [ ] Document new API endpoint in API docs
- [ ] Update architecture diagrams
- [ ] Add performance benchmarks before/after

---

## Expected Improvements

**After Implementation:**

- 📉 **99% reduction** in data transfer (250KB → 2.5KB)
- 📉 **50% reduction** in dashboard load time
- 📉 **90% reduction** in API quota usage (with batch endpoint)
- ✅ **100% accuracy** (no pagination limits)
- ✅ **Better scalability** (supports 100+ portfolios)

---

## References

- Original spec: ~~`docs/refactoring/portfolio-service-spec.md`~~ (removed after refactoring completion)
- Related hook: `src/hooks/usePortfolioWithMetrics.ts:75` (contains TODO comment)
- Service implementation: `src/services/portfolioService.ts`

---

## Notes

This performance issue was identified during the service layer refactoring (completed October 2024). While the refactoring successfully moved business logic to dedicated services, the underlying API architecture limitation remains unresolved as of October 2025. This document replaces the performance optimization section from the original refactoring specification.
