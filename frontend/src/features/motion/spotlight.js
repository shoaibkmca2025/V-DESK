import { listen, scopedObserver } from '@/lib/pageScope.js';

/* Cursor-follow spotlight glow on cards (sets --mouse-x / --mouse-y). */

export function initCardSpotlight() {
  document.querySelectorAll('.service-card, .location-card, .pricing-card, .knowledge-card').forEach((card) => {
    listen(card, 'mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}

const SPOTLIGHT_SELECTOR =
  '.journey__stage-card, .service-card, .service-card--featured, .service-card--compact, .discovery-card, .location-card, .pricing__controls, .pricing__breakdown, .wizard__card, .spotlight-card';

/** Pointer spotlight that also binds cards rendered later (location grid, discovery results, ...). */
export function initSpotlightCards() {
  const bound = new WeakSet();

  function bindSpotlight() {
    document.querySelectorAll(SPOTLIGHT_SELECTOR).forEach((card) => {
      if (bound.has(card)) return;
      bound.add(card);

      listen(card, 'pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
      listen(card, 'pointerleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  }

  bindSpotlight();
  scopedObserver(new MutationObserver(bindSpotlight)).observe(document.body, { childList: true, subtree: true });
}
