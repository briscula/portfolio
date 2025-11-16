export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export function createPagination(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

export function paginateData<T>(
  data: T[],
  page: number = 1,
  limit: number = 50
): PaginatedResponse<T> {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: createPagination(page, limit, data.length)
  };
}

export function sortData<T>(
  data: T[],
  sortBy?: string,
  sortOrder?: string
): T[] {
  if (!sortBy) return data;
  
  const order = sortOrder === 'desc' ? -1 : 1;
  
  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortBy];
    const bValue = (b as any)[sortBy];
    
    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  });
}

export function filterData<T>(
  data: T[],
  filters: Record<string, string>
): T[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      const itemValue = (item as any)[key];
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      if (typeof itemValue === 'number') {
        return itemValue.toString().includes(value);
      }
      return itemValue === value;
    });
  });
}

export function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function createErrorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: message, status }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
