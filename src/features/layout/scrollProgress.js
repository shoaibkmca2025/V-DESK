import { listen } from '@/lib/pageScope.js';

/*
 * Reading progress bar, back-to-top button and mobile conversion docks.
 * These three initialisers are registered in the original order (see features/pageRuntime.js)
 * because their scroll handlers write to the same elements.
 */

/** Top reading-progress bar + back-to-top visibility (cinematic scroll system). */
export function initScrollChrome() {
  const progressBar = document.getElementById('scrollProgressBar');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!progressBar || !scrollTopBtn) return;

  listen(scrollTopBtn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  let isTicking = false;
  function onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight > 0) {
      progressBar.style.width = (scrollY / docHeight) * 100 + '%';
    }
    scrollTopBtn.classList.toggle('is-visible', scrollY > 1600);
    isTicking = false;
  }

  listen(
    window,
    'scroll',
    () => {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(onWindowScroll);
      }
    },
    { passive: true },
  );
  onWindowScroll();
}

/** Circular back-to-top progress ring and the floating mobile sticky dock. */
export function initScrollProgressAndFab() {
  const progressBar = document.getElementById('scrollProgressBar');
  const fabContainer = document.getElementById('mobileStickyDock');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const progressCircle = scrollTopBtn?.querySelector('.progress-ring circle');
  const circumference = 138; // 2 * pi * 22 approx

  let ticking = false;
  function onScrollTick() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

    // Fallback when CSS scroll-driven animations are unsupported
    if (progressBar && (!window.CSS || !CSS.supports || !CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)'))) {
      progressBar.style.width = scrollPercent + '%';
    }

    if (progressCircle) {
      progressCircle.style.strokeDashoffset = circumference - (scrollPercent / 100) * circumference;
    }

    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('is-visible', scrollY > 360);
    }

    if (fabContainer) {
      fabContainer.classList.toggle('floating-actions--hidden', scrollY <= 320);
    }

    ticking = false;
  }

  listen(
    window,
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScrollTick);
      }
    },
    { passive: true },
  );

  onScrollTick();

  if (scrollTopBtn) {
    listen(scrollTopBtn, 'click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

export function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  listen(
    window,
    'scroll',
    () => {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      if (totalH <= 0) return;
      const progress = Math.min(100, Math.max(0, (window.pageYOffset / totalH) * 100));
      bar.style.width = `${progress}%`;
    },
    { passive: true },
  );
}

/** Sticky bottom conversion bar on small screens. */
export function initMobileStickyBar() {
  const dock = document.getElementById('mobileStickyDock');
  if (!dock) return;

  listen(
    window,
    'scroll',
    () => {
      dock.classList.toggle('is-visible', window.innerWidth <= 768 && window.pageYOffset > 420);
    },
    { passive: true },
  );
}
