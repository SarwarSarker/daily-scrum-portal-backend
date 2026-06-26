// validators/department.validator.ts
import { z } from 'zod';
import { nameValidator, slugValidator } from './common.validator';

/**
 * Create Department Schema
 */
export const createDepartmentSchema = z.object({
  name: nameValidator,
  slug: slugValidator,
});

/**
 * Update Department Schema
 * All fields are optional to allow partial updates
 */
export const updateDepartmentSchema = z.object({
  name: nameValidator.optional(),
  slug: slugValidator.optional(),
}).strict();
