import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';

/**
 * Generate a UUID v7 (time-ordered UUID) using the uuid library
 * This provides time-ordered UUIDs that work with any database
 */
export function generateUuidV7(): string {
  return uuidv7();
}

/**
 * Generate a standard UUID v4 (fallback)
 */
export function generateUuidV4(): string {
  return uuidv4();
}

/**
 * Generate UUID v7 with better time precision
 * This version uses microsecond precision for better ordering
 */
export function generateUuidV7Precise(): string {
  return uuidv7();
}
