import { useState, useCallback, useMemo } from "react";

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setPageSize: (size: number) => void;
  getPaginatedData: (data: T[]) => T[];
}

/**
 * Custom hook for handling pagination logic
 */
export function usePagination<T>({
  initialPage = 1,
  initialPageSize = 25,
  totalItems,
}: UsePaginationOptions): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Calculate derived values
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, totalItems - 1);
  }, [startIndex, pageSize, totalItems]);

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages],
  );

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Page size change handler
  const setPageSize = useCallback(
    (size: number) => {
      const newPageSize = Math.max(1, size);
      setPageSizeState(newPageSize);

      // Adjust current page to maintain roughly the same position
      const currentStartIndex = (currentPage - 1) * pageSize;
      const newPage = Math.max(
        1,
        Math.ceil((currentStartIndex + 1) / newPageSize),
      );
      setCurrentPage(Math.min(newPage, Math.ceil(totalItems / newPageSize)));
    },
    [currentPage, pageSize, totalItems],
  );

  // Function to get paginated data slice
  const getPaginatedData = useCallback(
    (data: T[]): T[] => {
      const start = startIndex;
      const end = start + pageSize;
      return data.slice(start, end);
    },
    [startIndex, pageSize],
  );

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    getPaginatedData,
  };
}
