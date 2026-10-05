/**
 * Page lifecycle scope.
 *
 * Every route mounts a fresh page. Feature initialisers attach window/document
 * listeners, observers and timers through these helpers so that everything is
 * torn down when the user navigates away (the equivalent of a full page unload
 * in the original multi-page site).
 */

let activeScope = null;

export function beginPageScope() {
  const scope = { controller: new AbortController(), cleanups: [] };
  activeScope = scope;
  return scope;
}

export function endPageScope(scope) {
  scope.controller.abort();
  for (const cleanup of scope.cleanups.reverse()) {
    try {
      cleanup();
    } catch (error) {
      console.error('[V-DESK] page cleanup failed', error);
    }
  }
  if (activeScope === scope) activeScope = null;
}

/** addEventListener that is removed automatically when the page scope ends. */
export function listen(target, type, handler, options = {}) {
  if (!target) return;
  const signal = activeScope?.controller.signal;
  target.addEventListener(type, handler, signal ? { ...options, signal } : options);
}

/** Registers a teardown callback (disconnect observers, clear timers, ...). */
export function onPageExit(cleanup) {
  if (activeScope) activeScope.cleanups.push(cleanup);
}

/** IntersectionObserver / MutationObserver that disconnects with the page. */
export function scopedObserver(observer) {
  onPageExit(() => observer.disconnect());
  return observer;
}
