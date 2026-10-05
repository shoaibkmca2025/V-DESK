import { listen } from '@/lib/pageScope.js';

export function openMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const toggle = document.getElementById('mobileNavToggle');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer) {
    drawer.classList.add('is-active', 'open', 'active');
    drawer.setAttribute('aria-hidden', 'false');
  }
  if (toggle) {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
  }
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const toggle = document.getElementById('mobileNavToggle');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer) {
    drawer.classList.remove('is-active', 'open', 'active');
    drawer.setAttribute('aria-hidden', 'true');
  }
  if (toggle) {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

export function toggleMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const isOpen = drawer && (drawer.classList.contains('is-active') || drawer.classList.contains('open') || drawer.classList.contains('active'));
  if (isOpen) closeMobileNav();
  else openMobileNav();
}

export function initMobileDrawer() {
  const toggle = document.getElementById('mobileNavToggle');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const closeBtn = document.getElementById('mobileDrawerClose');

  if (toggle) {
    toggle.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileNav();
    };
  }
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.preventDefault();
      closeMobileNav();
    };
  }
  if (overlay) {
    overlay.onclick = (e) => {
      e.preventDefault();
      closeMobileNav();
    };
  }

  document.querySelectorAll('.mobile-drawer a, .mobile-nav__link').forEach((link) => {
    listen(link, 'click', () => closeMobileNav());
  });
}
