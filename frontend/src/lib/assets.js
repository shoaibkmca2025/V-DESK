const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Resolves a public asset path ("assets/vdesk-logo.png") against the deployment base path.
 * Absolute URLs (https://, data:) are returned unchanged.
 */
export function asset(path) {
  if (!path || /^([a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return BASE_URL + path.replace(/^\/+/, '');
}

/**
 * Photography is served as WebP in two widths: the cards and heroes never render wider than
 * ~1600 CSS px, so anything larger is bytes the visitor pays for and never sees.
 * `photo('vdesk-reception')` → `{ src, srcSet }` for an <img>.
 */
export function photo(name) {
  return {
    src: asset(`assets/${name}.webp`),
    srcSet: `${asset(`assets/${name}-800.webp`)} 800w, ${asset(`assets/${name}.webp`)} 1600w`,
  };
}

/** Just the URL, for CSS backgrounds and inline styles. */
export function photoUrl(name, width) {
  return asset(`assets/${name}${width === 800 ? '-800' : ''}.webp`);
}

/**
 * srcset for a bundled photo path ('assets/vdesk-coworking.webp'), or undefined for anything else
 * (remote URLs, logos, icons) so callers can pass it straight to an <img> either way.
 */
export function srcSetFor(path) {
  const match = /^assets\/(vdesk-(?:reception|coworking|boardroom))\.webp$/.exec(path ?? '');
  if (!match) return undefined;
  return `${asset(`assets/${match[1]}-800.webp`)} 800w, ${asset(`assets/${match[1]}.webp`)} 1600w`;
}
