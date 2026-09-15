/** Helpers for the HTML-string renderers used by the dynamic widgets. */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes untrusted text (lead names, search queries, ...) before interpolating into HTML. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/**
 * Declarative click action for rendered HTML strings.
 * `<button ${action('openQuoteModal', 'Location: Mumbai')}>` is dispatched by lib/actions.js.
 */
export function action(name, ...args) {
  return `data-action="${name}"${args.length ? ` data-args="${escapeHtml(JSON.stringify(args))}"` : ''}`;
}

/** Declarative change action; the element's current value is appended as the last argument. */
export function changeAction(name, ...args) {
  return `data-change-action="${name}"${args.length ? ` data-args="${escapeHtml(JSON.stringify(args))}"` : ''}`;
}
