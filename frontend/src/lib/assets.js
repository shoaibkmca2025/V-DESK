const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Resolves a public asset path ("assets/vdesk-logo.png") against the deployment base path.
 * Absolute URLs (https://, data:) are returned unchanged.
 */
export function asset(path) {
  if (!path || /^([a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return BASE_URL + path.replace(/^\/+/, '');
}
