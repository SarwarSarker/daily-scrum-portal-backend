// validators/index.ts
import { ZodError, z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../utlis/response';

/**
 * Validation middleware factory for request bodies
 * Validates req.body against the provided Zod schema
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        return sendError(res, 400, errors.join(', '));
      }

      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      return sendError(res, 500, 'Validation error occurred');
    }
  };
};

/**
 * Validation middleware factory for route parameters
 * Validates req.params against the provided Zod schema
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        return sendError(res, 400, errors.join(', '));
      }

      // Replace req.params with validated data
      req.params = result.data as any;
      next();
    } catch (error) {
      console.error('Parameter validation error:', error);
      return sendError(res, 500, 'Parameter validation error occurred');
    }
  };
};

/**
 * Validation middleware factory for query parameters
 * Validates req.query against the provided Zod schema
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        return sendError(res, 400, errors.join(', '));
      }

      // Replace req.query with validated data
      req.query = result.data as any;
      next();
    } catch (error) {
      console.error('Query validation error:', error);
      return sendError(res, 500, 'Query validation error occurred');
    }
  };
};

/**
 * Format Zod errors into human-readable messages
 */
const formatZodErrors = (error: ZodError): string[] => {
  return error.issues.map((err: any) => {
    const path = err.path.join('.');
    const message = err.message;

    // Convert technical messages to user-friendly ones
    const userFriendlyMessages: Record<string, string> = {
      'Invalid input: expected string, received undefined': 'is required',
      'Invalid email format': 'must be a valid email address',
      'Invalid ID format': 'must be a valid ID',
      'Unrecognized keys': 'contains unexpected fields',
    };

    const friendlyMessage = userFriendlyMessages[message] || message;

    // Format specific field errors nicely
    if (path) {
      // Handle different error types
      if (message.includes('expected string, received undefined')) {
        return `${path} is required`;
      }
      if (message.includes('Unrecognized keys')) {
        const unexpectedFields = message.match(/"([^"]+)"/g)?.map((f: string) => f.replace(/"/g, '')).join(', ');
        return `Unexpected fields: ${unexpectedFields}`;
      }
      return `${path} ${friendlyMessage}`;
    }

    return friendlyMessage;
  });
};

/**
 * Export all validators
 */
export * from './common.validator';
export * from './user.validator';
export * from './team.validator';
export * from './project.validator';
export * from './task.validator';
export * from './project-update.validator';
export * from './task-comment.validator';
