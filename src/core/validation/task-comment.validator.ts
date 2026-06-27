// validators/task-comment.validator.ts
import { z } from 'zod';

/**
 * Create TaskComment Schema
 */
export const createTaskCommentSchema = z.object({
  user_id: z.union([z.number(), z.string()]).transform(val => BigInt(val)),
  comment: z.string().min(1, 'Comment is required'),
});

/**
 * Update TaskComment Schema
 * Only comment field can be updated
 */
export const updateTaskCommentSchema = z.object({
  comment: z.string().min(1, 'Comment is required').optional(),
}).strict();

/**
 * TaskComment Query Schema
 * Used for filtering task comments in GET requests
 */
export const taskCommentQuerySchema = z.object({
  user_id: z.string().regex(/^\d+$/, 'Invalid user ID format').optional(),
});
