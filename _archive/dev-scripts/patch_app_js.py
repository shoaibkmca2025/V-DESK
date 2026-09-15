import os

paths = [
    r"C:\Users\ASUS\Desktop\V-DESK-Workspace\app.js",
    r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace\app.js"
]

for p in paths:
    if not os.path.exists(p):
        continue
    with open(p, "r", encoding="utf-8") as f:
        js = f.read()

    # 1. Fix openQuoteModal parameter default
    old_fn = "function openQuoteModal(source) {"
    new_fn = "function openQuoteModal(source = '') {"
    if old_fn in js:
        js = js.replace(old_fn, new_fn)

    # 2. Fix source.includes calls to safely check source
    js = js.replace("if (source.includes(", "if (source && source.includes(")

    # 3. Add helper functions at the end of app.js if missing
    helpers = '''
// Global Navigation & Modal Helpers
function openConsultationModal() {
  openQuoteModal('Free Consultation');
}

function closeMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const toggle = document.getElementById('mobileNavToggle') || document.getElementById('mobileToggle');
  if (drawer) {
    drawer.classList.remove('is-active', 'open');
  }
  if (toggle) {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

// Enhance mobile drawer binding to cover all class & ID variants
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('mobileNavToggle') || document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay') || document.getElementById('mobileOverlay');
  const closeBtn = document.getElementById('mobileDrawerClose') || document.getElementById('drawerClose');

  if (navToggle && drawer) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = drawer.classList.contains('is-active') || drawer.classList.contains('open');
      if (isActive) {
        closeMobileNav();
      } else {
        drawer.classList.add('is-active', 'open');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileNav);
  }
  if (overlay) {
    overlay.addEventListener('click', closeMobileNav);
  }

  // Close mobile drawer when clicking any link inside
  const drawerLinks = document.querySelectorAll('.mobile-drawer a, .mobile-nav__link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
});
'''

    if 'function openConsultationModal' not in js:
        js += "\n" + helpers

    with open(p, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"Patched {p} successfully.")
