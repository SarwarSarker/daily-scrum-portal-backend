// validators/project.validator.ts
import { z } from 'zod';
import { nameValidator, isoDateValidator, projectStatusEnum, optionalIsoDate } from './common.validator';

/**
 * Create Project Schema
 */
export const createProjectSchema = z.object({
  name: nameValidator,
  description: z.string().optional(),
  status: projectStatusEnum.optional(),
  start_date: optionalIsoDate(),
  end_date: optionalIsoDate(),
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
 * Update Project Schema
 * All fields are optional to allow partial updates
 */
export const updateProjectSchema = z.object({
  name: nameValidator.optional(),
  description: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  start_date: optionalIsoDate(),
  end_date: optionalIsoDate(),
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
