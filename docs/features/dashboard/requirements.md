# Dashboard Redesign Requirements

## Introduction

This feature focuses on redesigning the dashboard to provide a comprehensive overview of all portfolios in a clean, table-based layout. The dashboard will serve as the main hub for portfolio management and quick insights, moving away from card-based layouts to a more data-dense, professional interface.

## Requirements

### Requirement 1

**User Story:** As a dividend investor with multiple portfolios, I want to see all my portfolios in a table format on the dashboard, so that I can quickly compare performance metrics across all my investments.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard THEN the system SHALL display a table showing all portfolios with key metrics
2. WHEN a user views the portfolio table THEN the system SHALL show portfolio name, currency, total value, unrealized gain/loss, dividend yield, and last updated date
3. WHEN a user clicks on a portfolio name THEN the system SHALL navigate to the detailed portfolio view at `/portfolio/{portfolioId}`
4. WHEN a user has multiple portfolios THEN the system SHALL allow sorting by any column (name, value, performance, etc.)

### Requirement 2

**User Story:** As a user, I want the portfolio table to show real-time performance data, so that I can make informed decisions about my investments.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL fetch current portfolio values and performance metrics from the API
2. WHEN displaying performance data THEN the system SHALL show positive gains in green and losses in red with proper formatting
3. WHEN showing currency values THEN the system SHALL format amounts according to each portfolio's currency (USD, EUR, etc.)
4. WHEN data is loading THEN the system SHALL show skeleton loading states in the table rows

### Requirement 3

**User Story:** As a user, I want quick action buttons in the portfolio table, so that I can perform common tasks without navigating away from the dashboard.

#### Acceptance Criteria

1. WHEN viewing the portfolio table THEN the system SHALL provide action buttons for each portfolio (View Dividends, Edit)
2. WHEN a user clicks on the portfolio name THEN the system SHALL navigate to the portfolio details page at `/portfolio/{portfolioId}`
3. WHEN a user clicks "View Dividends" THEN the system SHALL navigate to the portfolio dividends page at `/dividends/{portfolioId}`
4. WHEN a user clicks "Edit" THEN the system SHALL open an edit modal without leaving the dashboard

### Requirement 4

**User Story:** As a user, I want the dashboard to be responsive and work well on different screen sizes, so that I can access my portfolio data from any device.

#### Acceptance Criteria

1. WHEN viewing on desktop THEN the system SHALL show the full table with all columns visible
2. WHEN viewing on tablet THEN the system SHALL hide less important columns and maintain usability
3. WHEN viewing on mobile THEN the system SHALL stack table data vertically or use a card-like mobile layout
4. WHEN the table has many portfolios THEN the system SHALL provide pagination or virtual scrolling

### Requirement 5

**User Story:** As a user, I want to see summary statistics above the portfolio table, so that I can understand my overall investment performance at a glance.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display total portfolio value across all portfolios
2. WHEN showing summary metrics THEN the system SHALL include total unrealized gain/loss and overall dividend yield
3. WHEN portfolios use different currencies THEN the system SHALL convert to a base currency (USD) for totals
4. WHEN summary data is loading THEN the system SHALL show loading states for the summary cards

### Requirement 6

**User Story:** As a user, I want to add new portfolios directly from the dashboard, so that I can manage my portfolio collection efficiently.

#### Acceptance Criteria

1. WHEN viewing the dashboard THEN the system SHALL provide an "Add Portfolio" button or link above the portfolio table
2. WHEN a user clicks "Add Portfolio" THEN the system SHALL open the existing portfolio creation modal form
3. WHEN a portfolio is created successfully THEN the system SHALL refresh the table and show the new portfolio
4. WHEN the creation fails THEN the system SHALL display appropriate error messages to the user

### Requirement 7

**User Story:** As a user, I want to see recent activity on the dashboard, so that I can track my latest transactions and portfolio changes across all my portfolios.

#### Acceptance Criteria

1. WHEN viewing the dashboard THEN the system SHALL display a "Recent Activity" section below the portfolio table
2. WHEN showing recent activity THEN the system SHALL display the latest transactions from all portfolios
3. WHEN activity data is loading THEN the system SHALL show appropriate loading states
4. WHEN there is no recent activity THEN the system SHALL display an appropriate empty state message

### Requirement 8

**User Story:** As a user, I want simplified navigation without redundant portfolio selectors, so that I can efficiently manage my portfolios through the dashboard table.

#### Acceptance Criteria

1. WHEN viewing the dashboard THEN the system SHALL remove the portfolio selector from the header
2. WHEN a user wants to switch portfolios THEN the system SHALL use the portfolio table for navigation
3. WHEN a user navigates to portfolio-specific pages THEN the system SHALL use the portfolio ID from the URL
4. WHEN the portfolio selector is removed THEN the system SHALL maintain all existing functionality through table navigation
