import { z } from "zod";
import { sharedEnvSchema } from "./shared";

/**
 * Next.js web application environment variables
 */
const webEnvSchema = sharedEnvSchema.extend({
  /**
   * Backend API URL (exposed to browser)
   * @example https://api.yourapp.com
   */
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL"),

  /**
   * Auth0 secret for session encryption (server-side only)
   * Must be at least 32 characters
   */
  AUTH0_SECRET: z
    .string()
    .min(32, "AUTH0_SECRET must be at least 32 characters"),

  /**
   * Base URL of the Next.js app (for Auth0 callbacks)
   * @example https://yourapp.com
   */
  AUTH0_BASE_URL: z.string().url("AUTH0_BASE_URL must be a valid URL"),

  /**
   * Auth0 tenant domain
   * @example https://your-tenant.auth0.com
   */
  AUTH0_ISSUER_BASE_URL: z
    .string()
    .url("AUTH0_ISSUER_BASE_URL must be a valid URL"),

  /**
   * Auth0 application client ID
   */
  AUTH0_CLIENT_ID: z.string().min(1, "AUTH0_CLIENT_ID is required"),

  /**
   * Auth0 application client secret (server-side only)
   */
  AUTH0_CLIENT_SECRET: z.string().min(1, "AUTH0_CLIENT_SECRET is required"),

  /**
   * Auth0 API audience identifier
   */
  AUTH0_AUDIENCE: z.string().min(1, "AUTH0_AUDIENCE is required"),

  /**
   * Enable Mock Service Worker for API mocking (optional)
   */
  NEXT_PUBLIC_ENABLE_MSW: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional()
    .default("false"),
});

/**
 * Validated and typed web environment variables
 * This will throw an error at startup if any required variables are missing or invalid
 */
export function getWebEnv() {
  /**
   * Validated and typed web environment variables
   * This will throw an error at startup if any required variables are missing or invalid
   */
  return webEnvSchema.parse(process.env);
}

export type WebEnv = z.infer<typeof webEnvSchema>;
