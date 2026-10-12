/**
 * CMS request schemas (zod) — the per-type content shapes, plus params/bodies for the staff endpoints.
 * Content shapes follow the frontend's data files exactly (rules.md §42), e.g. FAQ items stay
 * [question, answer] pairs as in data/faqs.js.
 */
import { z } from 'zod';
import { badRequest } from '../../shared/errors/AppError.js';
import { CONTENT_TYPES, LISTED_TYPES, PATH_PATTERN, SLUG_PATTERN } from './cms.constants.js';

const text = (max) => z.string().trim().min(1).max(max);
const optionalText = (max) => z.string().trim().max(max).default('');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

/** A complete content value per type — saving replaces the whole draft. */
export const CONTENT_SCHEMAS = {
  faqs: z.strictObject({
    title: text(120),
    icon: z
      .string()
      .regex(/^ph-[a-z0-9-]+$/, 'A Phosphor icon class, e.g. ph-receipt')
      .optional(),
    items: z
      .array(z.tuple([text(300), text(3000)]))
      .min(1)
      .max(50),
  }),
  testimonials: z.strictObject({
    quote: text(1000),
    name: text(120),
    role: optionalText(200),
    location: optionalText(200),
  }),
  guides: z.strictObject({
    title: text(200),
    category: text(60),
    readTime: z.number().int().min(1).max(120),
    date: isoDate,
    excerpt: text(400),
    sections: z
      .array(z.tuple([text(200), text(5000)]))
      .min(1)
      .max(40),
  }),
  legal: z.strictObject({
    title: text(200),
    /** HTML — sanitised on save to LEGAL_HTML (cms.service.js). */
    content: text(100_000),
    lastUpdated: isoDate.optional(),
  }),
  'trust-claims': z.strictObject({
    value: text(40), // e.g. "10,000+"
    label: text(120), // e.g. "Businesses served"
    /** Where the number comes from (an export, a review platform link…). Required to publish; never public. */
    evidence: z.string().trim().max(2000).optional(),
  }),
  seo: z.strictObject({
    title: text(120),
    description: text(320),
    noindex: z.boolean().default(false),
  }),
};

const type = z.enum(CONTENT_TYPES);

export const typeParams = z.object({ type });

/** `key` is a slug — or, for seo, a page path, URL-encoded in the address (%2Flocations%2Fmumbai). */
export const entryParams = z
  .object({ type, key: z.string().trim().toLowerCase().min(1).max(200) })
  .superRefine(({ type: t, key }, ctx) => {
    const ok = t === 'seo' ? PATH_PATTERN.test(key) : SLUG_PATTERN.test(key);
    if (!ok)
      ctx.addIssue({
        code: 'custom',
        path: ['key'],
        message: t === 'seo' ? 'Use a page path like /virtual-office' : 'Use a slug like virtual-office',
      });
  });

/** PUT body: the content plus, when editing an existing entry, the version that was loaded. */
export const saveBody = z.object({
  data: z.unknown().refine((value) => value !== undefined, 'data is required'),
  order: z.number().int().min(0).max(100_000).optional(),
  version: z.number().int().min(1).optional(),
});

export const publishBody = z.object({ version: z.number().int().min(1) });

/** Runs after `validate({ params: entryParams, body: saveBody })`: the data schema depends on `:type`. */
export function validateContentData(req, _res, next) {
  const result = CONTENT_SCHEMAS[req.validated.params.type].safeParse(req.validated.body.data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      in: 'body',
      path: ['data', ...issue.path].join('.'),
      message: issue.message,
    }));
    return next(badRequest('VALIDATION_FAILED', 'Some fields are missing or invalid', details));
  }
  req.validated.body.data = result.data;
  next();
}

// ── Public ────────────────────────────────────

export const publicTypeParams = z.object({ type: z.enum(LISTED_TYPES) });

export const publicEntryParams = z.object({
  type: z.enum(LISTED_TYPES),
  key: z.string().trim().toLowerCase().regex(SLUG_PATTERN, 'Not a valid key'),
});

export const publicListQuery = z.object({
  /** Guides only: a category from the guides, e.g. GST. */
  category: z.string().trim().max(60).optional(),
});

export const seoQuery = z.object({
  path: z.string().trim().toLowerCase().regex(PATH_PATTERN, 'Use a page path like /virtual-office'),
});
