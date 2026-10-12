/**
 * sitemap.xml for search engines (PRD §57): every public page of the React app, built from live data so new cities,
 * services, guides and legal pages appear without a deploy. Pages with a published SEO `noindex` are left out.
 * Reads catalog and search through their public services; guides, legal and SEO from this module.
 */
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { listCities } from '../catalog/index.js';
import { listServices } from '../search/index.js';
import { CITY_PRODUCT_SLUGS, LEGAL_PATHS, STATIC_PAGES } from './cms.constants.js';
import * as repo from './cms.repository.js';

const escapeXml = (text) =>
  text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

/** Every public page as { path, lastmod? }, before the noindex filter. */
async function collectPages() {
  const [cities, services, guides, legal] = await Promise.all([
    listCities(),
    listServices(),
    repo.findPublished('guides'),
    repo.findPublished('legal'),
  ]);
  return [
    ...STATIC_PAGES.map((path) => ({ path })),
    ...cities.flatMap(({ slug }) => [
      { path: `/locations/${slug}` },
      { path: `/workspaces/${slug}` },
      ...CITY_PRODUCT_SLUGS.map((product) => ({ path: `/locations/${slug}/${product}` })),
    ]),
    ...services.map(({ slug }) => ({ path: `/services/${slug}` })),
    ...guides.map((doc) => ({ path: `/resources/${doc.key}`, lastmod: doc.published.date })),
    ...legal
      .filter((doc) => LEGAL_PATHS[doc.key])
      .map((doc) => ({ path: `/legal/${LEGAL_PATHS[doc.key]}`, lastmod: doc.published.lastUpdated })),
  ];
}

/** @returns {Promise<string>} the XML document */
export async function buildSitemap() {
  if (!env.SITE_URL) {
    throw new AppError(503, 'SITEMAP_NOT_CONFIGURED', 'The site address (SITE_URL) is not configured on this server');
  }
  const base = env.SITE_URL.replace(/\/+$/, '');
  const [pages, seo] = await Promise.all([collectPages(), repo.findPublished('seo')]);
  const hidden = new Set(seo.filter((doc) => doc.published.noindex).map((doc) => doc.key));

  const unique = [...new Map(pages.map((page) => [page.path, page])).values()];
  const entries = unique
    .filter(({ path }) => !hidden.has(path))
    .map(({ path, lastmod }) => {
      const loc = `<loc>${escapeXml(base + (path === '/' ? '/' : path))}</loc>`;
      return `  <url>${loc}${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}
