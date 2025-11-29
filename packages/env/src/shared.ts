import { z } from 'zod';

/**
 * Shared environment variables used across multiple apps
 */
export const sharedEnvSchema = z.object({
    /**
     * Node environment
     */
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    /**
     * Database connection string
     * @example postgresql://user:password@localhost:5432/portfolio
     */
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;
