import { listen } from '@/lib/pageScope.js';

/** Header switches from transparent to solid once the page is scrolled. */
export function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let isTicking = false;
  function updateHeaderOnScroll() {
    const isScrolled = window.scrollY > 20;
    header.classList.toggle('is-scrolled', isScrolled);
    header.classList.toggle('site-header--solid', isScrolled);
    header.classList.toggle('site-header--transparent', !isScrolled);
    isTicking = false;
  }

  listen(
    window,
    'scroll',
    () => {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateHeaderOnScroll);
      }
    },
    { passive: true },
  );
  updateHeaderOnScroll();
}
