// validators/project.validator.ts
import { z } from 'zod';
import { nameValidator, projectStatusEnum } from './common.validator';

/**
 * Create Project Schema
 */
export const createProjectSchema = z.object({
  name: nameValidator,
  description: z.string().optional(),
  status: projectStatusEnum.optional(),
  owner_id: z.union([z.number(), z.string()]).optional().transform((val) => val ? BigInt(val) : null),
  team_id: z.union([z.number(), z.string()]).optional().transform((val) => val ? BigInt(val) : null),
  created_by: z.union([z.number(), z.string()]).optional().transform((val) => val ? BigInt(val) : null),
  blocker: z.string().max(255, 'Blocker must not exceed 255 characters').optional(),
});

/**
 * Update Project Schema
 * All fields are optional to allow partial updates
 */
export const updateProjectSchema = z.object({
  name: nameValidator.optional(),
  description: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  owner_id: z.union([z.number(), z.string()]).optional().transform((val) => val ? BigInt(val) : null),
  team_id: z.union([z.number(), z.string()]).optional().transform((val) => val ? BigInt(val) : null),
  created_by: z.union([z.number(), z.string()]).optional().transform((val) => val ? BigInt(val) : null),
  blocker: z.string().max(255, 'Blocker must not exceed 255 characters').optional().nullable(),
}).strict();
