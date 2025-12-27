import { PortfolioWithMetrics } from "./portfolio-metrics";

export interface ExportColumn {
  key: string;
  label: string;
  getValue: (item: PortfolioWithMetrics) => string | number;
  format?: (value: string | number) => string;
}

export interface ExportOptions {
  filename?: string;
  columns?: ExportColumn[];
  includeHeaders?: boolean;
}

// Default columns for portfolio export
export const DEFAULT_PORTFOLIO_COLUMNS: ExportColumn[] = [
  {
    key: "name",
    label: "Portfolio Name",
    getValue: (portfolio) => portfolio.name,
  },
  {
    key: "currency",
    label: "Currency",
    getValue: (portfolio) => portfolio.currencyCode,
  },
  {
    key: "totalValue",
    label: "Total Value",
    getValue: (portfolio) => portfolio.metrics.totalValue,
    format: (value) =>
      typeof value === "number" ? value.toFixed(2) : value.toString(),
  },
  {
    key: "totalCost",
    label: "Total Cost",
    getValue: (portfolio) => portfolio.metrics.totalCost,
    format: (value) =>
      typeof value === "number" ? value.toFixed(2) : value.toString(),
  },
  {
    key: "unrealizedGain",
    label: "Unrealized Gain/Loss",
    getValue: (portfolio) => portfolio.metrics.unrealizedGain,
    format: (value) =>
      typeof value === "number" ? value.toFixed(2) : value.toString(),
  },
  {
    key: "unrealizedGainPercent",
    label: "Unrealized Gain/Loss %",
    getValue: (portfolio) => portfolio.metrics.unrealizedGainPercent,
    format: (value) =>
      typeof value === "number" ? `${value.toFixed(2)}%` : value.toString(),
  },
  {
    key: "dividendYield",
    label: "Dividend Yield",
    getValue: (portfolio) => portfolio.metrics.dividendYield,
    format: (value) =>
      typeof value === "number" ? `${value.toFixed(2)}%` : value.toString(),
  },
  {
    key: "positionCount",
    label: "Positions",
    getValue: (portfolio) => portfolio.metrics.positionCount,
  },
  {
    key: "lastUpdated",
    label: "Last Updated",
    getValue: (portfolio) => portfolio.metrics.lastUpdated.toISOString(),
    format: (value) => new Date(value).toLocaleDateString(),
  },
];

/**
 * Export portfolios to CSV format
 */
export function exportToCSV(
  portfolios: PortfolioWithMetrics[],
  options: ExportOptions = {},
): void {
  const {
    filename = `portfolios-${new Date().toISOString().split("T")[0]}.csv`,
    columns = DEFAULT_PORTFOLIO_COLUMNS,
    includeHeaders = true,
  } = options;

  const csvContent = generateCSVContent(portfolios, columns, includeHeaders);
  downloadFile(csvContent, filename, "text/csv");
}

/**
 * Export portfolios to PDF format
 * Note: This is a basic implementation. For production, consider using a library like jsPDF
 */
export function exportToPDF(
  portfolios: PortfolioWithMetrics[],
  options: ExportOptions = {},
): void {
  const { columns = DEFAULT_PORTFOLIO_COLUMNS } = options;

  // For now, we'll create a simple HTML table and let the browser handle PDF generation
  // In a production app, you'd want to use a proper PDF library like jsPDF or Puppeteer
  const htmlContent = generateHTMLTable(portfolios, columns);

  // Create a new window with the content for printing/PDF
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Portfolio Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { margin-bottom: 20px; }
            .export-date { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Portfolio Export</h1>
            <p class="export-date">Generated on ${new Date().toLocaleString()}</p>
          </div>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Generate CSV content from portfolios data
 */
function generateCSVContent(
  portfolios: PortfolioWithMetrics[],
  columns: ExportColumn[],
  includeHeaders: boolean,
): string {
  const rows: string[] = [];

  // Add headers if requested
  if (includeHeaders) {
    const headers = columns.map((col) => escapeCSVValue(col.label));
    rows.push(headers.join(","));
  }

  // Add data rows
  portfolios.forEach((portfolio) => {
    const values = columns.map((col) => {
      const rawValue = col.getValue(portfolio);
      const formattedValue = col.format
        ? col.format(rawValue)
        : rawValue.toString();
      return escapeCSVValue(formattedValue);
    });
    rows.push(values.join(","));
  });

  return rows.join("\n");
}

/**
 * Generate HTML table from portfolios data
 */
function generateHTMLTable(
  portfolios: PortfolioWithMetrics[],
  columns: ExportColumn[],
): string {
  const headerRow = columns
    .map((col) => `<th>${escapeHTML(col.label)}</th>`)
    .join("");

  const dataRows = portfolios
    .map((portfolio) => {
      const cells = columns
        .map((col) => {
          const rawValue = col.getValue(portfolio);
          const formattedValue = col.format
            ? col.format(rawValue)
            : rawValue.toString();
          return `<td>${escapeHTML(formattedValue)}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `
    <table>
      <thead>
        <tr>${headerRow}</tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>
  `;
}

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
function escapeCSVValue(value: string): string {
  // Convert to string if not already
  const stringValue = value.toString();

  // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/**
 * Download file with given content
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Filter portfolios based on search query
 */
export function filterPortfolios(
  portfolios: PortfolioWithMetrics[],
  searchQuery: string,
): PortfolioWithMetrics[] {
  if (!searchQuery || !searchQuery.trim()) {
    return portfolios;
  }

  const query = searchQuery.toLowerCase().trim();

  return portfolios.filter((portfolio) => {
    // Search in portfolio name
    if (portfolio.name.toLowerCase().includes(query)) {
      return true;
    }

    // Search in currency code
    if (portfolio.currencyCode.toLowerCase().includes(query)) {
      return true;
    }

    // Search in description if available
    if (
      portfolio.description &&
      portfolio.description.toLowerCase().includes(query)
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Get filtered columns based on visibility settings
 */
export function getVisibleColumns(
  columns: ExportColumn[],
  visibleColumnKeys: string[],
): ExportColumn[] {
  return columns.filter((col) => visibleColumnKeys.includes(col.key));
}
