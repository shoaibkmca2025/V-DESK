/**
 * Notifications controller — reads `req.validated`, calls notifications.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here. All endpoints are staff-only.
 */
import * as notificationsService from './notifications.service.js';

// ── Templates ─────────────────────────────────

export async function listTemplates(_req, res) {
  res.json({ data: await notificationsService.listTemplates() });
}

export async function getTemplate(req, res) {
  res.json({ data: await notificationsService.getTemplate(req.validated.params.key) });
}

export async function createTemplate(req, res) {
  res.status(201).json({ data: await notificationsService.createTemplate(req.validated.body, req.actor) });
}

export async function updateTemplate(req, res) {
  const data = await notificationsService.updateTemplate(req.validated.params.key, req.validated.body, req.actor);
  res.json({ data });
}

export async function deleteTemplate(req, res) {
  await notificationsService.deleteTemplate(req.validated.params.key, req.actor);
  res.status(204).end();
}

// ── Log ───────────────────────────────────────

export async function listNotifications(req, res) {
  const query = req.validated.query;
  const { notifications, nextCursor } = await notificationsService.listNotifications(query);
  res.json({ data: notifications, meta: { limit: query.limit, nextCursor } });
}
