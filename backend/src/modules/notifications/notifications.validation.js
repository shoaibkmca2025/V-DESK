/**
 * Notifications request schemas (zod) — staff endpoints, plus `notifyInput` for the module's public `notify()`
 * (internal callers are validated exactly like HTTP input).
 */
import { z } from 'zod';
import {
  CHANNELS,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  MAX_VARIABLES,
  NOTIFICATION_STATUSES,
  TEMPLATE_KEY_PATTERN,
} from './notifications.constants.js';

const int = (min, max) => z.coerce.number().int().min(min).max(max);
const templateKey = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(TEMPLATE_KEY_PATTERN, 'Key must look like lead.confirmation');
const variableName = z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'Variable names are plain identifiers');

const templateFields = {
  subject: z.string().trim().min(1).max(200).nullable().optional(),
  body: z.string().trim().min(1).max(4000),
  variables: z.array(variableName).max(MAX_VARIABLES).default([]),
  transactional: z.boolean().default(false),
  active: z.boolean().default(true),
};

/** Body for POST /api/v1/notifications/templates */
export const createTemplateBody = z.object({ key: templateKey, channel: z.enum(CHANNELS), ...templateFields });

/** Body for PATCH /api/v1/notifications/templates/:key — the full editable content plus the version being edited. */
export const updateTemplateBody = z.object({ version: int(1, 1_000_000), ...templateFields });

export const templateKeyParams = z.object({ key: templateKey });

/** Query for GET /api/v1/notifications (staff log). */
export const listNotificationsQuery = z.object({
  status: z.enum(NOTIFICATION_STATUSES).optional(),
  channel: z.enum(CHANNELS).optional(),
  templateKey: templateKey.optional(),
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: int(1, LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});

/** Input to the public `notify()`. Recipient format is checked per channel by the service. */
export const notifyInput = z.object({
  templateKey,
  to: z.string().trim().min(1).max(254),
  variables: z.record(z.string(), z.unknown()).default({}),
  /** Stable per message, e.g. `lead.created:VD-MUM-8921:confirmation`; a repeat never sends twice. */
  dedupeKey: z.string().trim().min(1).max(200),
});
