import { listen } from '@/lib/pageScope.js';

const HEADER_OFFSET = 80;

/** Smooth in-page anchor scrolling with header offset, plus scroll-spy for `.header-nav__link`. */
export function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    listen(anchor, 'click', function onAnchorClick(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const top = targetEl.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
        history.pushState(history.state, '', targetId);
      }
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header-nav__link');

  listen(
    window,
    'scroll',
    () => {
      let current = '';
      const scrollY = window.pageYOffset;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = '#' + section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('header-nav__link--active');
        if (link.getAttribute('href') === current) {
          link.classList.add('header-nav__link--active');
        }
      });
    },
    { passive: true },
  );
}
