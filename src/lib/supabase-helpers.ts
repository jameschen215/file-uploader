// utils/supabaseHelpers.ts
import {
  CustomBadRequestError,
  CustomInternalError,
  CustomForbiddenError,
} from '../errors/index.js';

export function throwSupabaseError(error: any, operation: string): never {
  console.error(`Supabase ${operation} error:`, error);

  const message = error.message || '';

  if (message.includes('already exists')) {
    throw new CustomBadRequestError('Resource already exists');
  }

  if (message.includes('Bucket not found')) {
    throw new CustomInternalError('Storage bucket not configured');
  }

  if (message.includes('row-level security')) {
    throw new CustomForbiddenError('Access denied');
  }

  if (message.includes('size exceeds')) {
    throw new CustomBadRequestError('File size exceeds limit');
  }

  if (message.includes('not found')) {
    throw new CustomBadRequestError('Resource not found');
  }

  // Generic error
  throw new CustomInternalError(`Failed to ${operation}`);
}

/**
Why Not in Global Error Handler?

1. supabase errors aren't thrown - They're returned as objects
2. You need context - Different operations need different error messages
3. Better control - You can handle specific Supabase errors differently per operation
4. Already caught - Once you throw `CustomBadRequestError`, the global handler catches it

Flow Diagram
Supabase operation
    ↓
Returns { data, error }
    ↓
if (error) → throw CustomBadRequestError()
    ↓
asyncHandler catches it
    ↓
Global error handler handles CustomBadRequestError
    ↓
Returns JSON or HTML based on isJSONRequest
 */
