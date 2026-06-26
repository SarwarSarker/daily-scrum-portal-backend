// validators/project-update.validator.ts
import { z } from 'zod';
import { isoDateValidator } from './common.validator';

/**
 * Progress percentage validator (0-100)
 */
const progressValidator = z.number().int('Progress must be an integer').min(0, 'Progress must be at least 0').max(100, 'Progress must not exceed 100').optional();

/**
 * Create ProjectUpdate Schema
 */
export const createProjectUpdateSchema = z.object({
  project_id: z.string().regex(/^\d+$/, 'Invalid project ID format').transform(val => BigInt(val)),
  updated_by: z.string().regex(/^\d+$/, 'Invalid user ID format').transform(val => BigInt(val)),
  update_date: isoDateValidator,
  previous_progress: progressValidator,
  current_progress: progressValidator,
  weekly_movement: z.number().int('Weekly movement must be an integer').optional(),
  status: z.string().max(100, 'Status must not exceed 100 characters').optional(),
  today_update: z.string().optional(),
  blockers: z.string().optional(),
  next_action: z.string().optional(),
  timeline_note: z.string().optional(),
  remarks: z.string().optional(),
});

/**
 * Update ProjectUpdate Schema
 * All fields are optional to allow partial updates
 */
export const updateProjectUpdateSchema = z.object({
  project_id: z.string().regex(/^\d+$/, 'Invalid project ID format').transform(val => BigInt(val)).optional(),
  updated_by: z.string().regex(/^\d+$/, 'Invalid user ID format').transform(val => BigInt(val)).optional(),
  update_date: isoDateValidator.optional(),
  previous_progress: progressValidator,
  current_progress: progressValidator,
  weekly_movement: z.number().int('Weekly movement must be an integer').optional(),
  status: z.string().max(100, 'Status must not exceed 100 characters').optional().nullable(),
  today_update: z.string().optional().nullable(),
  blockers: z.string().optional().nullable(),
  next_action: z.string().optional().nullable(),
  timeline_note: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
}).strict();

/**
 * ProjectUpdate Query Schema
 * Used for filtering project updates in GET requests
 */
export const projectUpdateQuerySchema = z.object({
  project_id: z.string().regex(/^\d+$/, 'Invalid project ID format').optional(),
  updated_by: z.string().regex(/^\d+$/, 'Invalid user ID format').optional(),
  update_date: z.string().optional(),
});
