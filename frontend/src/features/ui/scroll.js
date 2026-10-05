const HEADER_OFFSET = 80;

export function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function smoothScrollToTop(e) {
  if (e) e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
