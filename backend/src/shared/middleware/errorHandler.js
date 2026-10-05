import { AppError, notFound } from '../errors/AppError.js';
import { logger } from '../lib/logger.js';

/** Maps anything thrown in a route to the `{ error: { code, message, details?, requestId } }` envelope. */
function toAppError(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  if (err.type === 'entity.too.large') return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  if (err.name === 'CastError') return new AppError(400, 'INVALID_ID', 'Invalid identifier');
  if (err.code === 11000) return new AppError(409, 'DUPLICATE', 'A record with these details already exists');
  return new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
}

export function notFoundHandler(req, _res, next) {
  next(notFound('ROUTE_NOT_FOUND', `No route for ${req.method} ${req.path}`));
}

// Express recognises error handlers by their four parameters, so `next` must stay in the signature.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const error = toAppError(err);
  // Unexpected errors are logged with their stack; the client only ever sees the generic message.
  if (error.status >= 500) (req.log ?? logger).error({ err }, 'request failed');

  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
      requestId: req.id,
    },
  });
}
