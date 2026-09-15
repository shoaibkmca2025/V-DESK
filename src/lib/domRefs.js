/*
 * Ref helpers for the few cases React's props can't express faithfully.
 * Each factory memoises its callback so React never re-attaches it on re-render.
 */

const rawStyleRefs = new Map();

/**
 * Sets a literal `style` attribute. Used where the exact declaration text matters:
 * `!important` declarations (unsupported by React style objects) and elements targeted by
 * `[style*="background: #081D40"]` attribute selectors in the design system.
 */
export function rawStyle(cssText) {
  let ref = rawStyleRefs.get(cssText);
  if (!ref) {
    ref = (el) => {
      if (el) el.setAttribute('style', cssText);
    };
    rawStyleRefs.set(cssText, ref);
  }
  return ref;
}

/**
 * Binds a native DOM event. React's `onChange` fires on every keystroke for text-like inputs,
 * whereas these date/number fields should only react when the value is committed.
 */
export function nativeEvent(type, handler) {
  return (el) => {
    if (!el) return undefined;
    el.addEventListener(type, handler);
    return () => el.removeEventListener(type, handler);
  };
}
