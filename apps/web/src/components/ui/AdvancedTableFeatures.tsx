"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, IconButton } from "./Button";
import { SearchInput } from "./Input";
import { cn } from "@/lib/utils";
import { DownloadIcon, EyeIcon } from "./icons";

export interface TableColumn {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean; // Some columns like 'name' might be required
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export interface ExportFormat {
  id: string;
  label: string;
  extension: string;
  mimeType: string;
}

export interface AdvancedTableFeaturesProps {
  // Search functionality
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Column visibility
  columns: TableColumn[];
  onColumnVisibilityChange: (columns: TableColumn[]) => void;

  // Bulk actions
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  bulkActions?: BulkAction[];
  onBulkAction?: (actionId: string, selectedIds: string[]) => void;
  totalItems: number;

  // Export functionality
  exportFormats?: ExportFormat[];
  onExport?: (format: ExportFormat, selectedIds?: string[]) => void;

  // UI customization
  className?: string;
  showSearch?: boolean;
  showColumnVisibility?: boolean;
  showBulkActions?: boolean;
  showExport?: boolean;
}

const DEFAULT_EXPORT_FORMATS: ExportFormat[] = [
  {
    id: "csv",
    label: "CSV",
    extension: "csv",
    mimeType: "text/csv",
  },
  {
    id: "pdf",
    label: "PDF",
    extension: "pdf",
    mimeType: "application/pdf",
  },
];

export const AdvancedTableFeatures: React.FC<AdvancedTableFeaturesProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search portfolios...",
  columns,
  onColumnVisibilityChange,
  selectedItems,
  onSelectionChange,
  bulkActions = [],
  onBulkAction,
  totalItems,
  exportFormats = DEFAULT_EXPORT_FORMATS,
  onExport,
  className,
  showSearch = true,
  showColumnVisibility = true,
  showBulkActions = true,
  showExport = true,
}) => {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowColumnMenu(false);
        setShowExportMenu(false);
        setShowBulkMenu(false);
      }
    };

    if (showColumnMenu || showExportMenu || showBulkMenu) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showColumnMenu, showExportMenu, showBulkMenu]);

  // Calculate selection state
  const isAllSelected = selectedItems.length === totalItems && totalItems > 0;
  const isPartiallySelected =
    selectedItems.length > 0 && selectedItems.length < totalItems;

  // Handle select all/none
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      // This would need to be implemented by the parent component
      // For now, we'll just clear the selection
      onSelectionChange([]);
    }
  }, [isAllSelected, onSelectionChange]);

  // Handle column visibility toggle
  const handleColumnToggle = useCallback(
    (columnKey: string) => {
      const updatedColumns = columns.map((col) =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col,
      );
      onColumnVisibilityChange(updatedColumns);
    },
    [columns, onColumnVisibilityChange],
  );

  // Handle bulk action
  const handleBulkAction = useCallback(
    (actionId: string) => {
      if (onBulkAction && selectedItems.length > 0) {
        onBulkAction(actionId, selectedItems);
      }
      setShowBulkMenu(false);
    },
    [onBulkAction, selectedItems],
  );

  // Handle export
  const handleExport = useCallback(
    (format: ExportFormat, exportSelected: boolean = false) => {
      if (onExport) {
        const idsToExport =
          exportSelected && selectedItems.length > 0
            ? selectedItems
            : undefined;
        onExport(format, idsToExport);
      }
      setShowExportMenu(false);
    },
    [onExport, selectedItems],
  );

  // Memoize visible columns count
  const visibleColumnsCount = useMemo(
    () => columns.filter((col) => col.visible).length,
    [columns],
  );

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between",
        className,
      )}
    >
      {/* Left side - Search and selection info */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
        {/* Search */}
        {showSearch && (
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </div>
        )}

        {/* Selection info and bulk actions */}
        {showBulkActions && selectedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedItems.length} of {totalItems} selected
            </span>

            {bulkActions.length > 0 && (
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="ml-2"
                >
                  Actions ({bulkActions.length})
                </Button>

                {showBulkMenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      {bulkActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleBulkAction(action.id)}
                          disabled={action.disabled}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                            action.variant === "danger" &&
                              "text-red-600 hover:bg-red-50",
                            action.variant === "primary" &&
                              "text-blue-600 hover:bg-blue-50",
                          )}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* Select All/None */}
        {showBulkActions && totalItems > 0 && (
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isPartiallySelected;
                }}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Select all
            </label>
          </div>
        )}

        {/* Column Visibility */}
        {showColumnVisibility && (
          <div className="relative">
            <IconButton
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              variant="ghost"
              size="sm"
              aria-label="Column visibility"
              title="Column visibility"
              icon={<EyeIcon className="h-4 w-4" />}
            />

            {showColumnMenu && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Show Columns ({visibleColumnsCount}/{columns.length})
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => handleColumnToggle(column.key)}
                          disabled={column.required}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={cn(
                            column.required && "text-gray-500",
                            !column.visible && "line-through",
                          )}
                        >
                          {column.label}
                          {column.required && " (required)"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export */}
        {showExport && exportFormats.length > 0 && (
          <div className="relative">
            <IconButton
              onClick={() => setShowExportMenu(!showExportMenu)}
              variant="ghost"
              size="sm"
              aria-label="Export data"
              title="Export data"
              icon={<DownloadIcon className="h-4 w-4" />}
            />

            {showExportMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Export Format
                  </div>
                  {exportFormats.map((format) => (
                    <div key={format.id}>
                      <button
                        onClick={() => handleExport(format, false)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>All as {format.label}</span>
                      </button>
                      {selectedItems.length > 0 && (
                        <button
                          onClick={() => handleExport(format, true)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between text-blue-600"
                        >
                          <span>Selected as {format.label}</span>
                          <span className="text-xs">
                            ({selectedItems.length})
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside handlers */}
      {(showColumnMenu || showExportMenu || showBulkMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowColumnMenu(false);
            setShowExportMenu(false);
            setShowBulkMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default AdvancedTableFeatures;
