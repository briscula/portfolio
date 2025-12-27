import { z } from "zod";
import { sharedEnvSchema } from "./shared";

/**
 * NestJS API application environment variables
 */
const apiEnvSchema = sharedEnvSchema.extend({
  /**
   * Server port (defaults to 3000)
   */
  PORT: z.coerce.number().int().positive().default(3000),

  /**
   * JWT secret for token signing
   * Must be at least 32 characters
   */
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  /**
   * Auth0 tenant domain (without https://)
   * @example your-tenant.auth0.com
   */
  AUTH0_DOMAIN: z.string().min(1, "AUTH0_DOMAIN is required"),

  /**
   * Auth0 API audience identifier
   */
  AUTH0_AUDIENCE: z.string().min(1, "AUTH0_AUDIENCE is required"),

  /**
   * Frontend URL for CORS configuration
   * @example https://yourapp.com
   */
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL").optional(),

  /**
   * Comma-separated list of allowed CORS origins (optional)
   * @example http://localhost:3001,https://yourapp.com
   */
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(",").map((origin) => origin.trim()))
    .optional(),

  /**
   * Log level for the application
   */
  LOG_LEVEL: z
    .enum(["error", "warn", "log", "debug", "verbose"])
    .default("log")
    .optional(),

  /**
   * API key for Financial Modeling Prep
   */
  FMP_API_KEY: z.string().min(1, "FMP_API_KEY is required"),
});

/**
 * Validated and typed API environment variables
 * This will throw an error at startup if any required variables are missing or invalid
 */
export function getApiEnv() {
  /**
   * Validated and typed API environment variables
   * This will throw an error at startup if any required variables are missing or invalid
   */
  return apiEnvSchema.parse(process.env);
}

export type ApiEnv = z.infer<typeof apiEnvSchema>;
