/**
 * CMS constants — content types, key formats, the HTML allowed in legal pages, and the site map's fixed pages.
 * Shapes mirror the frontend's data files (rules.md §42) so the switch-over is a transport change:
 * data/faqs.js, data/testimonials.js, data/guides.js, content/legal.js.
 */

/** Content types, used as-is in URLs: /content/faqs, /content/admin/guides/:key … */
export const CONTENT_TYPES = ['faqs', 'testimonials', 'guides', 'legal', 'trust-claims', 'seo'];

/** Types listed publicly at GET /content/:type (seo is looked up by path instead). */
export const LISTED_TYPES = ['faqs', 'testimonials', 'guides', 'legal', 'trust-claims'];

/** Keys are URL slugs; SEO entries are keyed by the page path they describe ("/" or "/locations/mumbai"). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PATH_PATTERN = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/;

/**
 * The frontend renders legal pages as HTML (dangerouslySetInnerHTML), so stored HTML is sanitised to this list —
 * what content/legal.js uses plus a few safe extras. Scripts, styles, event handlers and javascript: links go.
 */
export const LEGAL_HTML = {
  allowedTags: ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br', 'a'],
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['https', 'mailto'],
};

/** Legal keys match content/legal.js; their pages live at /legal/<path> (pages/legal/LegalPage.jsx). */
export const LEGAL_PATHS = { privacy: 'privacy', terms: 'terms', refund: 'refund-policy', compliance: 'compliance' };

/** Pages of the React app without a data source, for sitemap.xml (frontend/src/app/router.jsx). */
export const STATIC_PAGES = [
  '/',
  '/virtual-office',
  '/coworking-spaces',
  '/meeting-rooms',
  '/pricing',
  '/company-registration',
  '/contact',
  '/services',
  '/locations',
  '/workspaces',
  '/resources',
  '/faqs',
];

/** frontend/src/data/cities.js CITY_PRODUCTS — each city has a page per product: /locations/<city>/<product>. */
export const CITY_PRODUCT_SLUGS = ['virtual-office', 'coworking', 'meeting-rooms', 'private-office'];

/** Public content changes reach browsers and CDNs within this time (Express adds ETags, so re-checks are cheap). */
export const PUBLIC_CACHE_SECONDS = 300;
