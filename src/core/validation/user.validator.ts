// validators/user.validator.ts
import { z } from 'zod';
import {
  nameValidator,
  emailValidator,
  passwordValidator,
  designationValidator,
  urlValidator,
  roleEnum,
  userStatusEnum,
  optionalBigIntId,
  optionalNumericId,
} from './common.validator';

/**
 * User Registration Schema
 * Used when users register themselves
 */
export const registerSchema = z.object({
  name: nameValidator,
  email: emailValidator,
  password: passwordValidator,
  role: roleEnum.optional(),
  designation: designationValidator,
  avatar: urlValidator,
  team_id: optionalNumericId('team ID'),
  department_id: optionalNumericId('department ID'),
  status: userStatusEnum.optional(),
});

/**
 * User Login Schema
 * Used for user authentication
 */
export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Create User Schema
 * Used by admins/managers to create new users
 */
export const createUserSchema = z.object({
  name: nameValidator,
  email: emailValidator,
  password: passwordValidator,
  role: roleEnum.optional(),
  designation: designationValidator,
  avatar: urlValidator,
  team_id: optionalNumericId('team ID'),
  department_id: optionalNumericId('department ID'),
  status: userStatusEnum.optional(),
});

/**
 * Update User Schema
 * Used for updating user information
 * All fields are optional to allow partial updates
 */
export const updateUserSchema = z.object({
  name: nameValidator.optional(),
  email: emailValidator.optional(),
  password: passwordValidator.optional(),
  role: roleEnum.optional(),
  designation: designationValidator.optional(),
  avatar: urlValidator.optional().nullable(),
  team_id: optionalNumericId('team ID'),
  department_id: optionalNumericId('department ID'),
  status: userStatusEnum.optional(),
}).strict();

/**
 * User Query Schema
 * Used for filtering users in GET requests
 */
export const userQuerySchema = z.object({
  role: roleEnum.optional(),
  status: userStatusEnum.optional(),
  department_id: z.string().regex(/^\d+$/, 'Invalid department ID format').optional(),
  team_id: z.string().regex(/^\d+$/, 'Invalid team ID format').optional(),
});
