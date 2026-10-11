/** Public surface of the Notifications module. Other code imports from here, never from the files inside. */
export { notificationsRouter } from './notifications.routes.js';
/** `notify()` queues a templated message (never sends); `processDueNotifications()` is for the future job worker. */
export { notify, processDueNotifications } from './notifications.service.js';
export { CHANNELS } from './notifications.constants.js';
