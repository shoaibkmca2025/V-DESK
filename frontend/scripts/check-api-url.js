/**
 * Build-time check of VITE_API_URL for production builds (used by vite.config.js).
 *
 * The address is baked into the bundle, so a wrong one ships silently: on 30 Oct 2026 the live site was built
 * with http://127.0.0.1:5080/api/v1 from a developer's .env.local, every API call failed in visitors' browsers,
 * and leads, bookings and staff sign-in quietly fell back to browser-only storage. A production build now
 * refuses to finish unless the address is a public https URL ending in /api/v1.
 */

const LOCAL_HOSTS = /^(localhost|0\.0\.0\.0|127(\.\d{1,3}){3}|\[::1\]|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2})$|\.local$/i;

/** @returns {string | null} what is wrong with `value`, or null when it is fine for production */
export function apiUrlProblem(value) {
  if (!value) return 'VITE_API_URL is not set, so the site would run on browser-only data.';
  let url;
  try {
    url = new URL(value);
  } catch {
    return `VITE_API_URL is not a valid URL: "${value}".`;
  }
  if (url.protocol !== 'https:') return `VITE_API_URL must use https (browsers block http calls from an https page): "${value}".`;
  if (LOCAL_HOSTS.test(url.hostname)) {
    return `VITE_API_URL points at a local or private address, which visitors cannot reach: "${value}".`;
  }
  if (!url.pathname.replace(/\/+$/, '').endsWith('/api/v1')) return `VITE_API_URL must end in /api/v1: "${value}".`;
  return null;
}

/** Vite plugin: fails `vite build` in production mode when VITE_API_URL would break the live site. */
export function apiUrlGuard({ mode, apiUrl }) {
  return {
    name: 'vdesk-api-url-guard',
    apply: 'build',
    buildStart() {
      if (mode !== 'production') return;
      const problem = apiUrlProblem(apiUrl);
      if (problem) {
        this.error(
          `${problem}\nSet it in frontend/.env.production (committed) or on the command line — and check that no ` +
            '.env.production.local overrides it. See docs/deployment.md.',
        );
      }
    },
  };
}
