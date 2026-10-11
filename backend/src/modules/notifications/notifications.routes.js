/**
 * Notifications routes — mounted at /api/v1/notifications in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 *
 * Staff only. Other modules queue messages through the module's `notify()` (index.js), never over HTTP.
 * `POST /webhooks/whatsapp` (inbound → leads) is Notifications v2 and needs a WhatsApp provider.
 */
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './notifications.controller.js';
import {
  createTemplateBody,
  listNotificationsQuery,
  templateKeyParams,
  updateTemplateBody,
} from './notifications.validation.js';

export const notificationsRouter = Router();

const manage = requireStaff('notifications:manage');

notificationsRouter.get('/templates', manage, controller.listTemplates);
notificationsRouter.post('/templates', manage, validate({ body: createTemplateBody }), controller.createTemplate);
notificationsRouter.get('/templates/:key', manage, validate({ params: templateKeyParams }), controller.getTemplate);
notificationsRouter.patch(
  '/templates/:key',
  manage,
  validate({ params: templateKeyParams, body: updateTemplateBody }),
  controller.updateTemplate,
);
notificationsRouter.delete(
  '/templates/:key',
  manage,
  validate({ params: templateKeyParams }),
  controller.deleteTemplate,
);

notificationsRouter.get(
  '/',
  requireStaff('notifications:read'),
  validate({ query: listNotificationsQuery }),
  controller.listNotifications,
);
