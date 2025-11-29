import { z } from 'zod';

/**
 * Schema for pagination query parameters
 */
export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/**
 * Schema for sort parameters
 */
export const SortQuerySchema = z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SortQuery = z.infer<typeof SortQuerySchema>;

/**
 * Combined pagination and sort schema
 */
export const PaginationWithSortSchema = PaginationQuerySchema.merge(SortQuerySchema);

export type PaginationWithSort = z.infer<typeof PaginationWithSortSchema>;

/**
 * Schema for pagination metadata in responses
 */
export const PaginationMetaSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Generic paginated response schema
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        data: z.array(dataSchema),
        meta: PaginationMetaSchema,
    });
