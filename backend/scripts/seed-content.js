/**
 * Seed script — CMS module
 *
 * Copies today's site content from the frontend into the CMS, imported directly so the two can't drift:
 *   data/faqs.js → faqs · data/testimonials.js → testimonials · data/guides.js → guides · content/legal.js → legal
 * Each goes through the same validation and HTML sanitising as a staff edit, and is published as version 1.
 *
 * Trust claims from the homepage ("10,000+ businesses"…) are created as **drafts only**: they need evidence and a
 * super admin's approval before the API serves them (memory.md §5).
 *
 * Usage (from repo root; needs the monorepo checkout because it reads the frontend files):
 *   node --env-file-if-exists=backend/.env backend/scripts/seed-content.js
 *
 * Safe to re-run: entries that already exist are left exactly as staff last edited them.
 */
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { LEGAL_DOCUMENTS } from '../../frontend/src/content/legal.js';
import { FAQ_GROUPS } from '../../frontend/src/data/faqs.js';
import { GUIDES } from '../../frontend/src/data/guides.js';
import { TESTIMONIALS } from '../../frontend/src/data/testimonials.js';
import { publish, saveDraft } from '../src/modules/cms/cms.service.js';
import { CONTENT_SCHEMAS } from '../src/modules/cms/cms.validation.js';

/** pages/legal/LegalPage.jsx shows "Last updated 15 September 2026". */
const LEGAL_LAST_UPDATED = '2026-09-15';

/** Figures shown on the homepage and mobile dock — unsubstantiated until someone records evidence. */
export const TRUST_CLAIM_DRAFTS = [
  { key: 'businesses-served', value: '10,000+', label: 'Businesses served' },
  { key: 'client-rating', value: '4.9★', label: 'Client rating' },
  { key: 'reviews', value: '2,400+', label: 'Reviews' },
  {
    key: 'approval-support',
    value: '100%',
    label: 'Approval support — full refund if our documents cause a rejection',
  },
  { key: 'activation-time', value: '24 hrs', label: 'Activation' },
  { key: 'cities', value: '10+', label: 'Cities' },
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function contentToSeed() {
  return [
    ...FAQ_GROUPS.map(({ id, title, icon, items }, order) => ({
      type: 'faqs',
      key: id,
      order,
      data: { title, icon, items },
    })),
    ...TESTIMONIALS.map((t, order) => ({ type: 'testimonials', key: slugify(t.name), order, data: t })),
    ...GUIDES.map(({ slug, ...guide }) => ({ type: 'guides', key: slug, order: 0, data: guide })),
    ...Object.entries(LEGAL_DOCUMENTS).map(([key, doc], order) => ({
      type: 'legal',
      key,
      order,
      data: { title: doc.title, content: doc.content, lastUpdated: LEGAL_LAST_UPDATED },
    })),
  ];
}

/** Seeds an already-connected database. Returns how many entries were created per type. */
export async function seedContent() {
  const created = {};
  const add = async ({ type, key, order, data }, { publishIt }) => {
    try {
      const entry = await saveDraft(type, key, { data: CONTENT_SCHEMAS[type].parse(data), order }, 'seed');
      if (publishIt) await publish(type, key, { version: entry.version }, 'seed');
      created[type] = (created[type] ?? 0) + 1;
    } catch (err) {
      if (err.code !== 'CONTENT_EXISTS') throw err;
    }
  };
  for (const item of contentToSeed()) await add(item, { publishIt: true });
  for (const [order, { key, ...data }] of TRUST_CLAIM_DRAFTS.entries()) {
    await add({ type: 'trust-claims', key, order, data }, { publishIt: false });
  }
  return created;
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vdesk';
  console.log(`[seed-content] connecting to ${uri}`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const { detectTransactionSupport } = await import('../src/config/db.js');
  await detectTransactionSupport();
  const created = await seedContent();
  console.log(`[seed-content] created: ${JSON.stringify(created)} (existing entries left unchanged)`);
  await mongoose.disconnect();
  console.log('[seed-content] done ✓');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('[seed-content] failed:', err);
    process.exit(1);
  });
}
