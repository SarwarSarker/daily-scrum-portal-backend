// validators/team.validator.ts
import { z } from 'zod';
import { nameValidator, optionalNumericId } from './common.validator';

/**
 * Create Team Schema
 */
export const createTeamSchema = z.object({
  name: nameValidator,
  department_id: optionalNumericId('department ID'),
  lead_id: optionalNumericId('lead ID'),
});

/**
 * Update Team Schema
 * All fields are optional to allow partial updates
 */
export const updateTeamSchema = z.object({
  name: nameValidator.optional(),
  department_id: optionalNumericId('department ID'),
  lead_id: optionalNumericId('lead ID'),
}).strict();

/**
 * Team Query Schema
 * Used for filtering teams in GET requests
 */
export const teamQuerySchema = z.object({
  department_id: z.string().regex(/^\d+$/, 'Invalid department ID format').optional(),
});
