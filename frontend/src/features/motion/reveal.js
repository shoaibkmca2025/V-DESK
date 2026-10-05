import { scopedObserver } from '@/lib/pageScope.js';

/* Scroll-triggered reveal animations and animated metric counters. */

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateCounter(el) {
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const target = parseFloat(el.dataset.target);
  if (Number.isNaN(target)) return;
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = eased * target;
    el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/**
 * Luxury reveal observer: tags cards/section headers with `.reveal-on-scroll`
 * and reveals them as they enter the viewport.
 */
export function initRevealObserver() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-on-scroll').forEach((el) => {
      el.classList.add('is-revealed', 'visible');
    });
    return;
  }

  const revealObserver = scopedObserver(
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed', 'visible');
          entry.target.querySelectorAll('.counter').forEach((counter) => {
            if (!counter.dataset.animated) {
              animateCounter(counter);
              counter.dataset.animated = '1';
            }
          });
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    ),
  );

  document
    .querySelectorAll(
      '.reveal, .reveal-stagger, .reveal-on-scroll, .service-card, .location-card, ' +
        '.trust-strip__item, .knowledge__card, .faq-item, .showcase-card, .section__header, ' +
        '.pricing__controls, .pricing__summary, .wizard__container, .contact__form-card',
    )
    .forEach((el) => {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
}

/** Generic reveal classes (`.reveal`, `.scroll-reveal--left`, `.gold-line-draw`, ...). */
export function initScrollAnimations() {
  const revealSelectors = [
    '.reveal',
    '.reveal-stagger',
    '.scroll-reveal',
    '.scroll-reveal-group',
    '.reveal-on-scroll',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.scroll-reveal--left',
    '.scroll-reveal--right',
    '.scroll-reveal--scale',
    '.gold-line-draw',
  ].join(', ');

  if (prefersReducedMotion()) {
    document.querySelectorAll(revealSelectors).forEach((el) => {
      el.classList.add('visible', 'is-revealed');
    });
    return;
  }

  const observer = scopedObserver(
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible', 'is-revealed');

          entry.target.querySelectorAll('.counter, [data-counter-target], [data-target]').forEach((counter) => {
            if (!counter.dataset.animated) {
              animateCounter(counter);
              counter.dataset.animated = '1';
            }
          });

          if ((entry.target.classList.contains('counter') || entry.target.dataset.target) && !entry.target.dataset.animated) {
            animateCounter(entry.target);
            entry.target.dataset.animated = '1';
          }

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    ),
  );

  document.querySelectorAll(revealSelectors).forEach((el) => observer.observe(el));
  document.querySelectorAll('.counter:not([data-animated])').forEach((el) => observer.observe(el));
}

/** Number tickers for `.counter[data-target]` metrics. */
export function initMetricCounters() {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;

  const observer = scopedObserver(
    new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target')) || 0;
          const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
          const duration = 1600;
          const startTime = performance.now();

          function updateNumber(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentVal = target * (1 - Math.pow(1 - progress, 3));
            el.textContent = decimals > 0 ? currentVal.toFixed(decimals) : Math.floor(currentVal).toLocaleString('en-IN');

            if (progress < 1) {
              requestAnimationFrame(updateNumber);
            } else {
              el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString('en-IN');
            }
          }

          requestAnimationFrame(updateNumber);
          obs.unobserve(el);
        });
      },
      { threshold: 0.25 },
    ),
  );

  counters.forEach((c) => observer.observe(c));
}
