import { LEGACY_FILE_ROUTES } from '@/config/pages.js';

let navigateImpl = null;

/** Called once by the router shell so non-React modules can trigger client-side navigation. */
export function setNavigator(navigate) {
  navigateImpl = navigate;
}

/** Maps "pricing.html#roi" style targets to router paths ("/pricing#roi"). */
export function resolveRoute(target) {
  const [file, hash] = target.split('#');
  const path = LEGACY_FILE_ROUTES[file] ?? file;
  return hash ? `${path}#${hash}` : path;
}

export function navigateTo(target) {
  const to = resolveRoute(target);
  if (navigateImpl) navigateImpl(to);
  else window.location.assign(to);
}
