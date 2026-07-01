// validators/common.validator.ts
import { z } from 'zod';

/**
 * Common validation schemas and enums used across all validators
 */

// Role enum from utlis/role.ts
export const roleEnum = z.enum(['admin', 'manager', 'team_lead', 'employee']);

// User status enum
export const userStatusEnum = z.enum(['active', 'inactive']);

// Project status enum
export const projectStatusEnum = z.enum(['planning', 'in_progress', 'continue_development', 'on_hold', 'completed']);

// Task status enum
export const taskStatusEnum = z.enum(['pending', 'on_hold', 'in_progress', 'in_review', 'completed']);


// Task priority enum
export const taskPriorityEnum = z.enum(['low', 'medium', 'high']);

/**
 * Common field validators
 */

// Email validation with proper format
export const emailValidator = z.string().email('Invalid email format').max(120, 'Email must not exceed 120 characters');

// Password validation with strength requirements
export const passwordValidator = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(255, 'Password must not exceed 255 characters')
  // .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  // .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  // .regex(/[0-9]/, 'Password must contain at least one number');

// Name validator (for user names, department names, etc.)
export const nameValidator = z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name must not exceed 120 characters');

// Designation validator
export const designationValidator = z.string().max(100, 'Designation must not exceed 100 characters').optional();

// Slug validator (for URLs, lowercase with dashes)
export const slugValidator = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must not exceed 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and dashes');

// URL validator for avatars
export const urlValidator = z.string().url('Invalid URL format').optional();

// BigInt ID validator (for database IDs)
export const bigIntIdValidator = z.string().regex(/^\d+$/, 'Invalid ID format').transform((val) => BigInt(val));

/**
 * Parameter validators for route parameters
 */

// ID schema for route parameters (:id)
export const idSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Please provide a valid ID'),
});

// Task ID schema for route parameters (:taskId)
export const taskIdSchema = z.object({
  taskId: z.string().regex(/^\d+$/, 'Please provide a valid task ID'),
});

// Comment ID schema for route parameters (:commentId)
export const commentIdSchema = z.object({
  commentId: z.string().regex(/^\d+$/, 'Please provide a valid comment ID'),
});

// Combined Task and Comment ID schema for routes with both parameters
export const taskAndCommentIdSchema = z.object({
  taskId: z.string().regex(/^\d+$/, 'Please provide a valid task ID'),
  commentId: z.string().regex(/^\d+$/, 'Please provide a valid comment ID'),
});

/**
 * Common date validators
 */

// ISO date string validator
export const isoDateValidator = z.string().refine(
  (val) => {
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  },
  { message: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01)' }
);

/**
 * Pagination validators for query parameters
 */

export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  sort_by: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

/**
 * Helper function to create optional BigInt validators
 */
export const optionalBigIntId = () => bigIntIdValidator.optional().nullable();

/**
 * Flexible optional/nullable ID validator.
 * Accepts both string ("5") and number (5) inputs, validates digits-only,
 * and transforms to BigInt. Returns null when the value is absent.
 */
export const optionalNumericId = (label = 'ID') =>
  z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .refine(
      (val) => val === undefined || val === null || /^\d+$/.test(String(val)),
      { message: `Invalid ${label} format` }
    )
    .transform((val) => (val === undefined || val === null ? null : BigInt(val)));

/**
 * Helper function to create optional ISO date validators
 */
export const optionalIsoDate = () => isoDateValidator.optional().nullable();
