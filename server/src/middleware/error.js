// server/src/middleware/error.js
import { HttpError } from '../utils/httpError.js';
import { ErrorCodes } from '../utils/codes.js';

export function notFound(req, res, next) {
  next(new HttpError(404, ErrorCodes.NOT_FOUND, null, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let code = ErrorCodes.INTERNAL_ERROR;
  let details = null;
  let message = 'An unexpected internal error occurred';

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    code = err.code;
    details = err.details;
    message = err.message || code;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    code = ErrorCodes.VALIDATION_FAILED;
    details = err.errors.map((e) => ({
      path: e.path.join('.'),
      code: e.code,
      message: e.message
    }));
    message = 'Validation failed';
  } else if (err.code === 11000) {
    // Mongo duplicate key error
    statusCode = 409;
    if (err.keyPattern && err.keyPattern.email) {
      code = ErrorCodes.AUTH_EMAIL_TAKEN;
      message = 'An account with this email address already exists';
    } else if (err.keyPattern && err.keyPattern.key && err.keyPattern.user) {
      code = ErrorCodes.IDEMPOTENCY_CONFLICT;
      message = 'An order is already being processed with this idempotency key';
    } else {
      code = ErrorCodes.VALIDATION_FAILED;
      details = { duplicateKey: Object.keys(err.keyPattern || {}) };
      message = 'Duplicate key constraint violation';
    }
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = ErrorCodes.VALIDATION_FAILED;
    details = { path: err.path, value: err.value };
    message = `Invalid format for field ${err.path}`;
  } else {
    // Log unexpected errors
    console.error('[Unhandled Error]', err);
  }

  const response = {
    ok: false,
    code,
    message,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };

  res.status(statusCode).json(response);
}

export default {
  notFound,
  errorHandler
};
