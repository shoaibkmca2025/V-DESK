/**
 * Every module's event handlers, registered by importing its <module>.events.js (the subscriptions run on import).
 * The worker imports this file; the API process only publishes and doesn't need it. Add a line per consuming
 * module, like src/routes.js does for routers. See shared/events/README.md.
 */
import './modules/notifications/notifications.events.js';
