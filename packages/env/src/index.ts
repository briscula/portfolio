/**
 * @repo/env
 *
 * Centralized, type-safe environment variable validation for the monorepo.
 * Uses Zod for runtime validation and TypeScript type inference.
 */

// Export schemas for custom validation if needed
export { sharedEnvSchema, type SharedEnv } from "./shared";
export { getWebEnv, type WebEnv } from "./web";
export { getApiEnv, type ApiEnv } from "./api";
