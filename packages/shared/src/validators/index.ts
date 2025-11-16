// Shared Zod validation schemas
import { z } from 'zod';

// Example validators
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);

// Add more validators that both frontend and backend can use
// This ensures validation logic is consistent across the stack
