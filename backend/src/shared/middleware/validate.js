import { badRequest } from '../errors/AppError.js';

/**
 * Validates request parts against zod schemas: `validate({ params, query, body })`.
 * Parsed (trimmed, coerced, defaulted) values are placed on `req.validated` — controllers read from there,
 * never from raw `req.body`/`req.query`.
 */
export function validate(schemas) {
  return (req, _res, next) => {
    const validated = {};
    const details = [];

    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part] ?? {});
      if (result.success) {
        validated[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          details.push({ in: part, path: issue.path.join('.'), message: issue.message });
        }
      }
    }

    if (details.length > 0) return next(badRequest('VALIDATION_FAILED', 'Some fields are missing or invalid', details));
    req.validated = validated;
    next();
  };
}
