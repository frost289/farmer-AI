import multer from 'multer';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) =>
  next(new ApiError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));

// The only place that formats error responses (docs/ERROR_FORMATS.md).
export function errorHandler(err, req, res, _next) {
  let e = err;
  if (err instanceof ZodError) {
    e = new ApiError(
      400,
      'VALIDATION_ERROR',
      'Invalid input',
      err.issues.map((i) => ({ field: i.path.join('.'), issue: i.message })),
    );
  } else if (err instanceof multer.MulterError) {
    e =
      err.code === 'LIMIT_FILE_SIZE'
        ? new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Image is too large (max 5 MB)')
        : new ApiError(400, 'INVALID_IMAGE', err.message);
  } else if (err.type === 'entity.parse.failed') {
    e = new ApiError(400, 'VALIDATION_ERROR', 'Request body is not valid JSON');
  } else if (!(err instanceof ApiError)) {
    logger.error('unhandled error', { request_id: req.id, error: err.message, stack: err.stack });
    e = new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong');
  }
  res.status(e.status).json({
    error: { code: e.code, message: e.message, details: e.details, request_id: req.id },
  });
}
