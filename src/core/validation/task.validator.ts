// validators/task.validator.ts
import { z } from 'zod';
import { taskStatusEnum, taskPriorityEnum, optionalIsoDate } from './common.validator';

/**
 * Create Task Schema
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must not exceed 255 characters'),
  project_id: z.string().regex(/^\d+$/, 'Invalid project ID format').transform(val => BigInt(val)),
  assigned_to: z.string().regex(/^\d+$/, 'Invalid assigned user ID format').optional().nullable().transform(val => val ? BigInt(val) : null),
  description: z.string().optional().nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  due_date: optionalIsoDate(),
});

/**
 * Update Task Schema
 * All fields are optional to allow partial updates
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must not exceed 255 characters').optional(),
  project_id: z.string().regex(/^\d+$/, 'Invalid project ID format').transform(val => BigInt(val)).optional(),
  assigned_to: z.string().regex(/^\d+$/, 'Invalid assigned user ID format').optional().nullable().transform(val => val ? BigInt(val) : null),
  description: z.string().optional().nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  due_date: optionalIsoDate(),
}).strict();

/**
 * Task Query Schema
 * Used for filtering tasks in GET requests
 */
export const taskQuerySchema = z.object({
  project_id: z.string().regex(/^\d+$/, 'Invalid project ID format').optional(),
  status: taskStatusEnum.optional(),
  assigned_to: z.string().regex(/^\d+$/, 'Invalid assigned user ID format').optional(),
});
