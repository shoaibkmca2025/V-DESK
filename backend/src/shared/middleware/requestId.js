import { randomUUID } from 'node:crypto';

const SAFE_ID = /^[\w.-]{1,64}$/;

/** Reuses the caller's X-Request-Id (from a proxy or the frontend) or creates one, and echoes it back. */
export function requestId(req, res, next) {
  const incoming = req.get('x-request-id');
  req.id = incoming && SAFE_ID.test(incoming) ? incoming : randomUUID();
  res.set('X-Request-Id', req.id);
  next();
}
