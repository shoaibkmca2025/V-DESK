/**
 * Event delegation for markup rendered from HTML strings (location cards, CRM tables,
 * command palette, portal tabs, ...). Elements declare `data-action` / `data-change-action`
 * (see lib/html.js) instead of inline `onclick` attributes.
 */

const registry = new Map();
let installed = false;

export function registerActions(actions) {
  for (const [name, fn] of Object.entries(actions)) registry.set(name, fn);
}

function readArgs(el) {
  try {
    return el.dataset.args ? JSON.parse(el.dataset.args) : [];
  } catch {
    return [];
  }
}

function run(name, args) {
  const fn = registry.get(name);
  if (!fn) {
    console.warn(`[V-DESK] Unknown action "${name}"`);
    return;
  }
  fn(...args);
}

export function installActionDelegation(root = document) {
  if (installed) return;
  installed = true;

  root.addEventListener('click', (event) => {
    const el = event.target instanceof Element ? event.target.closest('[data-action]') : null;
    if (el) run(el.dataset.action, readArgs(el));
  });

  root.addEventListener('change', (event) => {
    const el = event.target instanceof Element ? event.target.closest('[data-change-action]') : null;
    if (el) run(el.dataset.changeAction, [...readArgs(el), el.value]);
  });
}
