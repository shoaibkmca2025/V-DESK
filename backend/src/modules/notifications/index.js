/** Public surface of the Notifications module. Other code imports from here, never from the files inside. */
export { notificationsRouter } from './notifications.routes.js';
/**
 * `notify()` queues a templated message (never sends); `notifyIfConfigured()` is the form event handlers use —
 * it queues nothing until staff have written and switched on the template; `processDueNotifications()` is for
 * the job worker.
 */
export { notify, notifyIfConfigured, processDueNotifications } from './notifications.service.js';
export { CHANNELS } from './notifications.constants.js';
