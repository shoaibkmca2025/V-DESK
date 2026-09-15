import { catalog } from '@/features/catalog/catalogStore.js';
import { listen, onPageExit } from '@/lib/pageScope.js';

/* Auto-rotating testimonial carousel (pause on hover, swipe on touch). */

const ROTATE_EVERY_MS = 6500;
const SWIPE_THRESHOLD = 40;

let currentTestimonial = 0;
let rotateTimer;

export function showTestimonial(index) {
  currentTestimonial = index;
  const t = catalog.testimonials[index];
  if (!t) return;

  const quoteEl = document.getElementById('testiQuote');
  const nameEl = document.getElementById('testiName');
  const roleEl = document.getElementById('testiRole');
  const locEl = document.getElementById('testiLocation');

  if (quoteEl) {
    quoteEl.style.opacity = '0';
    quoteEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      quoteEl.textContent = t.quote;
      if (nameEl) nameEl.textContent = t.name;
      if (roleEl) roleEl.textContent = t.role;
      if (locEl) locEl.textContent = t.location;
      quoteEl.style.opacity = '1';
      quoteEl.style.transform = 'translateY(0)';
    }, 220);
  }

  document.querySelectorAll('.testimonial-dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

export function initTestimonials() {
  const display = document.getElementById('testimonialDisplay');
  if (!display) return;
  currentTestimonial = 0;
  showTestimonial(0);

  const total = () => catalog.testimonials.length;

  function startAutoRotate() {
    clearInterval(rotateTimer);
    rotateTimer = setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % total();
      showTestimonial(currentTestimonial);
    }, ROTATE_EVERY_MS);
  }

  startAutoRotate();
  onPageExit(() => clearInterval(rotateTimer));

  listen(display, 'mouseenter', () => clearInterval(rotateTimer));
  listen(display, 'mouseleave', () => startAutoRotate());

  let touchStartX = 0;
  listen(display, 'touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  listen(display, 'touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
      currentTestimonial = (currentTestimonial + 1) % total();
      showTestimonial(currentTestimonial);
    } else if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
      currentTestimonial = (currentTestimonial - 1 + total()) % total();
      showTestimonial(currentTestimonial);
    }
  }, { passive: true });
}
