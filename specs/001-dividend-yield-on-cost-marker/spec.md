# Feature Specification: Dividend Yield Comparison Enhancement

**Feature Branch**: `001-dividend-yield-on-cost-marker`  
**Created**: 2025-12-22  
**Status**: Draft  
**Input**: User description: "we need to modify the 'Dividend Yield Comparison' widget. ideally, I would like a vertical bar to reflect the total dividends in the last 12 months.. and the marker to identify the amount it should have been as if the dividen would have been calculated with yeld on cost. Example, if stock X got 80€ during the last year reflecting the 3.5% yield.... then I would like a marker indicating how much I would have got if yield % was on cost."
**Clarification**: "the Y axis should be the dividend yeld... and the marker should be the yield on cost. for dividend yield... I probably need to an api.. but we will leave it out of the scope how we retrieve that for the moment. but marker will show yield on cost.. this we can calculate"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Compare Current Yield vs. Yield on Cost (Priority: P1)

As a dividend-focused investor, I want the "Dividend Yield Comparison" widget to show me a direct comparison between a stock's current dividend yield percentage and my personal yield on cost percentage for that same holding. This allows me to instantly gauge the stock's current market performance against the actual return on my initial investment, helping me make better decisions.

**Why this priority**: This is the core of the feature request and provides the primary user value by offering a clear, apples-to-apples comparison of key performance indicators.

**Independent Test**: The feature can be tested by navigating to the dashboard containing the "Dividend Yield Comparison" widget. If the widget correctly displays a bar for the current yield % and a marker for the yield on cost % for a given holding, the test passes.

**Acceptance Scenarios**:

1. **Given** a user is viewing their dashboard, **When** they look at the "Dividend Yield Comparison" widget, **Then** the Y-axis is clearly labeled to represent yield as a percentage (%).
2. **Given** a holding is displayed in the widget, **When** the user views its bar, **Then** the bar's height represents the stock's **current dividend yield percentage**.
3. **Given** the same holding, **When** the user views its marker, **Then** the marker's position represents the user's calculated **yield on cost percentage**.
4. **Given** the user hovers over the vertical bar, **When** a tooltip appears, **Then** it displays the precise 'Current Yield %'.
5. **Given** the user hovers over the marker, **When** a tooltip appears, **Then** it displays the precise 'Yield on Cost %'.

---

### Edge Cases

- **What happens when the current yield for a stock is not available?** The widget should not display the bar for that holding, but it may still display the 'Yield on Cost' marker.
- **What happens if the cost basis for a holding is zero or not available?** The 'Yield on Cost' marker cannot be calculated and must not be displayed.
- **What happens if a stock's yield is negative or zero?** The widget should correctly display the bar at the zero line.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The "Dividend Yield Comparison" widget's Y-axis MUST represent dividend yield in percentage (%).
- **FR-002**: For each holding, the widget MUST display a vertical bar representing the **current dividend yield percentage** of the stock.
- **FR-003**: For each holding, the widget MUST display a distinct marker (e.g., a horizontal line) representing the user's calculated **yield on cost percentage**.
- **FR-004**: The widget MUST provide clear visual labels or a legend to distinguish between "Current Yield" (the bar) and "Yield on Cost" (the marker).
- **FR-005**: The system MUST display a tooltip with the precise percentage value (e.g., "3.5%") when the user hovers over the bar or the marker.
- **FR-006**: The system MUST gracefully handle cases where data is unavailable (e.g., do not display the visual element for which data is missing).

### Key Entities

- **Holding**: Represents a user's investment in a specific stock. Key attributes for this feature include `total_cost_basis` and `shares_count`.
- **StockData**: Represents market data for a stock. The key attribute for this feature is `current_dividend_yield_percentage`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The widget successfully loads and displays the yield comparison for 99%+ of applicable holdings within 2 seconds.
- **SC-002**: On user hover, tooltips for both the bar and the marker appear in under 200ms.
- **SC-003**: A follow-up user satisfaction survey shows that at least 75% of respondents find the new visualization "helpful" or "very helpful" for assessing their portfolio's dividend performance.
- **SC-004**: There is a <5% error rate in the calculation and display of the two percentage points.

## Assumptions

- The `yield on cost %` can be calculated from data already available in the system (`Total Annual Dividend / Total Cost Basis`).
- The `current dividend yield %` for a stock is available. The specific mechanism for retrieving this (e.g., via an API) is considered out of scope for this specification and will be detailed during technical planning.

## Out of Scope

- This feature will not add functionality for users to manually input or adjust cost basis or dividend data.
- The implementation of the data fetching mechanism for `current dividend yield %` is not part of this specification.
- The visualization will not support time-range filtering.
