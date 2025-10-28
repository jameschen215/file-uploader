import multer from 'multer';
import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import {
  CustomBadRequestError,
  CustomForbiddenError,
  CustomInternalError,
  CustomNotFoundError,
  CustomUnauthorizedError,
} from './index.js';

export function errorsHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('Error caught:', error);

  // Check if request expects JSON response
  const isJSONRequest =
    req.xhr || // AJAX request
    req.headers.accept?.includes('application/json') ||
    req.path.startsWith('/api'); // API routes

  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    let statusCode = 400;
    let message = error.message;

    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the maximum limit';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }

    return isJSONRequest
      ? res.status(statusCode).json({ error: message })
      : res.status(statusCode).render('error-page', {
          title: 'UploadError',
          message,
          statusCode,
        });
  }

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Record not found (e.g., update/delete non-existent record)
    if (error.code === 'P2025') {
      const statusCode = 404;
      const message = 'The requested record was not found';

      return isJSONRequest
        ? res.status(statusCode).json({ error: message })
        : res.status(statusCode).render('error-page', {
            title: 'NotFoundError',
            message,
            statusCode,
          });
    }

    // Unique constraint violation
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      const statusCode = 409;
      const message = `A record with this ${target.join(', ')} already exists`;

      return isJSONRequest
        ? res.status(statusCode).json({ error: message })
        : res.status(409).render('error-page', {
            title: 'ConflictError',
            message,
            statusCode,
          });
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      const statusCode = 400;
      const message = 'Invalid reference to related record';

      return isJSONRequest
        ? res.status(statusCode).json({ error: message })
        : res.status(statusCode).render('error-page', {
            title: 'BadRequestError',
            message,
            statusCode,
          });
    }

    // Invalid query (wrong data type, etc.)
    if (error.code === 'P2006' || error.code === 'P2007') {
      const statusCode = 400;
      const message = 'Invalid data provided';

      return isJSONRequest
        ? res.status(statusCode).json({ error: message })
        : res.status(400).render('error-page', {
            title: 'BadRequestError',
            message,
            statusCode,
          });
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    const statusCode = 400;
    const message = 'Invalid data provided to database';
    return isJSONRequest
      ? res.status(statusCode).json({ error: message })
      : res.status(400).render('error-page', {
          title: 'ValidationError',
          message,
          statusCode,
        });
  }

  // Handle custom errors
  if (
    error instanceof CustomBadRequestError ||
    error instanceof CustomForbiddenError ||
    error instanceof CustomInternalError ||
    error instanceof CustomNotFoundError ||
    error instanceof CustomUnauthorizedError
  ) {
    return isJSONRequest
      ? res.status(error.statusCode).json({
          error: error.message,
          statusCode: error.statusCode,
        })
      : res.status(error.statusCode).render('error-page', {
          title: error.name,
          message: error.message,
          statusCode: error.statusCode,
        });
  }

  // Fallback for unexpected errors
  console.error('Unexpected error:', error);
  const statusCode = 500;
  const message = 'Something went wrong';

  return isJSONRequest
    ? res.status(statusCode).json({ error: message })
    : res.status(statusCode).render('error-page', {
        title: 'InternalServerError',
        message,
        statusCode,
      });
}
