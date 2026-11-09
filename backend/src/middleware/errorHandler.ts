import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any {
  console.error('[Error Handler]', {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 422, err.errors);
  }

  if (err.name === 'CastError') {
    return sendError(res, `Invalid resource identifier: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `Duplicate value entered for ${field}. Please use another value.`, 409);
  }

  if (
    err.name === 'MulterError' ||
    err.message?.includes('Only PDF') ||
    err.message?.includes('Invalid file type') ||
    err.message?.includes('file size')
  ) {
    return sendError(res, err.message, 400);
  }

  return sendError(
    res,
    err.message || 'Internal server error occurred.',
    err.statusCode || 500,
    env.NODE_ENV === 'development' ? err.stack : undefined
  );
}
