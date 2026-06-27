// validators/task.validator.ts
import { z } from 'zod';
import { taskStatusEnum, taskPriorityEnum, optionalIsoDate } from './common.validator';

/**
 * Create Task Schema
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must not exceed 255 characters'),
  project_id: z.union([z.number(), z.string()]).transform(val => BigInt(val)),
  assigned_to: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? BigInt(val) : null),
  created_by: z.union([z.number(), z.string()]).optional().transform(val => val ? BigInt(val) : null),
  description: z.string().optional().nullable(),
  priority: taskPriorityEnum.optional(),
  progress: z.number().int().min(0).max(100).optional().default(0),
  start_date: optionalIsoDate(),
  end_date: optionalIsoDate(),
  status: taskStatusEnum.optional(),
  blocker: z.string().max(255, 'Blocker must not exceed 255 characters').optional().nullable(),
  output: z.string().optional().nullable(),
}).refine(
  (data) => {
    // If both dates are provided, end_date must be after start_date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate > startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

/**
 * Update Task Schema
 * All fields are optional to allow partial updates
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must not exceed 255 characters').optional(),
  project_id: z.union([z.number(), z.string()]).transform(val => BigInt(val)).optional(),
  assigned_to: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? BigInt(val) : null),
  created_by: z.union([z.number(), z.string()]).optional().transform(val => val ? BigInt(val) : null),
  description: z.string().optional().nullable(),
  priority: taskPriorityEnum.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  start_date: optionalIsoDate(),
  end_date: optionalIsoDate(),
  status: taskStatusEnum.optional(),
  blocker: z.string().max(255, 'Blocker must not exceed 255 characters').optional().nullable(),
  output: z.string().optional().nullable(),
}).refine(
  (data) => {
    // If both dates are provided, end_date must be after start_date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate > startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
).strict();

/**
 * Task Query Schema
 * Used for filtering tasks in GET requests
 */
export const taskQuerySchema = z.object({
  project_id: z.string().regex(/^\d+$/, 'Invalid project ID format').optional(),
  status: taskStatusEnum.optional(),
  assigned_to: z.string().regex(/^\d+$/, 'Invalid assigned user ID format').optional(),
});
