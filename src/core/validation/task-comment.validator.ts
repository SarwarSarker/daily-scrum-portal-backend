// validators/task-comment.validator.ts
import { z } from 'zod';

/**
 * Create TaskComment Schema
 */
export const createTaskCommentSchema = z.object({
  task_id: z.string().regex(/^\d+$/, 'Invalid task ID format').transform(val => BigInt(val)),
  user_id: z.string().regex(/^\d+$/, 'Invalid user ID format').transform(val => BigInt(val)),
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
  task_id: z.string().regex(/^\d+$/, 'Invalid task ID format').optional(),
  user_id: z.string().regex(/^\d+$/, 'Invalid user ID format').optional(),
});
