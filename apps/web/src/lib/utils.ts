/**
 * Utility function to merge Tailwind CSS classes
 * Simple implementation without external dependencies
 */
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs
    .filter(Boolean)
    .map((input) => String(input).trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Common class combinations for consistent styling
 */
export const classNames = {
  // Layout
  container: "app-container",
  sidebarLayout: "sidebar-layout",

  // Cards
  card: "card card-padding",
  cardHover: "card card-padding card-hover",
  metricCard: "metric-card",

  // Buttons
  buttonPrimary: "btn-base btn-primary",
  buttonSecondary: "btn-base btn-secondary",
  buttonGhost: "btn-base btn-ghost",

  // Inputs
  input: "input-base",
  inputError: "input-base input-error",

  // Lists
  listItem: "list-item",
  listItemContent: "list-item-content",
  listItemPrimary: "list-item-primary",
  listItemSecondary: "list-item-secondary",
  listItemActions: "list-item-actions",

  // Navigation
  navItem: "nav-item",
  navItemActive: "nav-item active",
  navItemIcon: "nav-item-icon",

  // Status
  statusActive: "status-indicator status-active",
  statusInactive: "status-indicator status-inactive",
  statusPending: "status-indicator status-pending",

  // Metrics
  metricValue: "metric-value",
  metricLabel: "metric-label",
  metricChangePositive: "metric-change positive",
  metricChangeNegative: "metric-change negative",

  // Loading
  spinner: "spinner",
  skeleton: "skeleton",
} as const;

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Common spacing values for consistent layouts
 */
export const spacing = {
  section: "space-y-6",
  form: "space-y-4",
  list: "space-y-2",
  inline: "space-x-2",
  inlineMd: "space-x-4",
  inlineLg: "space-x-6",
} as const;

/**
 * Format a number as currency with the currency code
 * @param amount - The amount to format
 * @param currencyCode - The ISO currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
): string {
  return `${currencyCode} ${Math.abs(amount).toFixed(2)}`;
}
