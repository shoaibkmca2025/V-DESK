import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

# 1. FIX APP.JS
def fix_app_js(dir_path):
    js_file = os.path.join(dir_path, "app.js")
    if not os.path.exists(js_file):
        return
    with open(js_file, "r", encoding="utf-8") as f:
        js = f.read()

    # Clean up initHeader to use is-scrolled cleanly
    old_init_header = r'function initHeader\(\)\s*\{.*?^\}'
    new_init_header = '''function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  function updateHeaderOnScroll() {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
      header.classList.remove('site-header--transparent');
      header.classList.add('site-header--solid');
    } else {
      header.classList.remove('is-scrolled');
      header.classList.remove('site-header--transparent');
      header.classList.remove('site-header--solid');
    }
  }

  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();
}'''
    js = re.sub(old_init_header, new_init_header, js, flags=re.MULTILINE | re.DOTALL)

    # Remove legacy initVideoHeroScrub if present
    js = re.sub(r'// =+ \s* // V-DESK SCROLL-CONTROLLED CINEMATIC VIDEO SCRUBBING ENGINE.*?}\)\(\);', '', js, flags=re.DOTALL)

    # Ensure openQuoteModal defaults safely without TypeError
    old_open_quote = "function openQuoteModal(source) {"
    if old_open_quote in js:
        js = js.replace(old_open_quote, "function openQuoteModal(source = '') {")

    with open(js_file, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"Fixed app.js in {dir_path}")

# 2. FIX STYLES.CSS
def fix_styles_css(dir_path):
    css_file = os.path.join(dir_path, "styles.css")
    if not os.path.exists(css_file):
        return
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()

    # Ensure Master White Theme overrides are cleanly in place
    master_white_rules = '''
/* ==========================================================================
   V-DESK MASTER WHITE THEME — CLEAN ARCHITECTURAL SUITE
   WHITE: 65-75% | NAVY: 15-20% | CREAM: 5-10% | GOLD: 5-8%
   ========================================================================== */

/* Universal Overrides */
html, body {
  background-color: #FFFFFF !important;
  color: #26344A !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

section {
  background-color: #FFFFFF !important;
  color: #26344A !important;
}

/* Supporting Cream Sections (5–10% warmth) */
#testimonials,
#knowledge,
.section--cream,
.trust-strip,
.pricing__controls,
.faq-section {
  background-color: #FAF8F3 !important;
}

/* Typography Hierarchy */
h1, h2, h3, h4, h5, h6,
.section__title,
.service-card__title,
.card-title,
.hero-white__headline {
  color: #0B2348 !important;
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif !important;
  line-height: 1.2 !important;
}

p, .section__desc, .service-card__desc, .body-text, .hero-white__subtitle {
  color: #26344A !important;
}

.text-gold, .highlight-gold, .accent {
  color: #C8922E !important;
  background: none !important;
  -webkit-text-fill-color: initial !important;
}

/* CARDS: Crisp White, Soft Border #E8E2D8, Soft Shadow, Gold Accent on Hover */
.card,
.service-card,
.pricing__summary,
.wizard__container,
.knowledge__card,
.faq-item,
.contact__form-card,
.trust-strip__item,
.location-card,
.finder__card,
.pricing__breakdown {
  background-color: #FFFFFF !important;
  border: 1px solid #E8E2D8 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(11, 35, 72, 0.05) !important;
  color: #26344A !important;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), border-color 300ms ease, box-shadow 300ms ease !important;
}

.card:hover,
.service-card:hover,
.knowledge__card:hover,
.location-card:hover,
.trust-strip__item:hover {
  transform: translateY(-4px) !important;
  border-color: #C8922E !important;
  box-shadow: 0 12px 32px rgba(11, 35, 72, 0.1) !important;
}

/* BUTTON SYSTEM (Strict 300ms transitions) */
/* PRIMARY: Navy background + White text. Hover: Gold background + Navy text */
.btn--primary,
.btn--gold,
button.btn--primary,
button.btn--gold,
.hero-white__ctas .btn--primary {
  background-color: #0B2348 !important;
  color: #FFFFFF !important;
  border: 1.5px solid #0B2348 !important;
  font-weight: 600 !important;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 4px 14px rgba(11, 35, 72, 0.15) !important;
  border-radius: 8px !important;
}

.btn--primary:hover,
.btn--gold:hover,
button.btn--primary:hover,
button.btn--gold:hover,
.hero-white__ctas .btn--primary:hover {
  background-color: #C8922E !important;
  color: #0B2348 !important;
  border-color: #C8922E !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(200, 146, 46, 0.3) !important;
}

/* SECONDARY: White background + Navy border + Navy text. Hover: Navy background + White text */
.btn--secondary,
.btn--outline,
button.btn--secondary,
button.btn--outline,
.hero-white__ctas .btn--secondary {
  background-color: #FFFFFF !important;
  color: #0B2348 !important;
  border: 1.5px solid #0B2348 !important;
  font-weight: 600 !important;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1) !important;
  border-radius: 8px !important;
}

.btn--secondary:hover,
.btn--outline:hover,
button.btn--secondary:hover,
button.btn--outline:hover,
.hero-white__ctas .btn--secondary:hover {
  background-color: #0B2348 !important;
  color: #FFFFFF !important;
  border-color: #0B2348 !important;
  transform: translateY(-2px) !important;
}

/* NAVBAR: Clean White, Deep Navy Text, Gold Active */
.site-header {
  background-color: #FFFFFF !important;
  border-bottom: 1px solid #E8E2D8 !important;
  box-shadow: none !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  width: 100% !important;
}

.site-header.is-scrolled {
  background-color: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  box-shadow: 0 4px 20px rgba(11, 35, 72, 0.06) !important;
  border-bottom: 1px solid rgba(200, 146, 46, 0.3) !important; /* Extremely thin gold line on scroll */
}

.header-nav__link {
  color: #0B2348 !important;
  font-weight: 600 !important;
}

.header-nav__link:hover {
  color: #C8922E !important;
  background-color: #FAF8F3 !important;
}

.header-nav__link.active {
  color: #C8922E !important;
}

.header-nav__link.active::after {
  background-color: #C8922E !important;
}

.header-nav__dropdown {
  background-color: #FFFFFF !important;
  border: 1px solid #E8E2D8 !important;
  box-shadow: 0 12px 36px rgba(11, 35, 72, 0.1) !important;
}

.dropdown-item {
  color: #26344A !important;
}

.dropdown-item:hover {
  background-color: #FAF8F3 !important;
}

.dropdown-item i {
  color: #C8922E !important;
}

.dropdown-item strong {
  color: #0B2348 !important;
}

.dropdown-item span {
  color: #687386 !important;
}

/* Top Utility Bar */
.top-utility-bar {
  background-color: #FAF8F3 !important;
  border-bottom: 1px solid #E8E2D8 !important;
  color: #687386 !important;
}

.utility-badge {
  background-color: rgba(200, 146, 46, 0.12) !important;
  color: #C8922E !important;
  border: 1px solid rgba(200, 146, 46, 0.3) !important;
}

.top-utility-link {
  color: #0B2348 !important;
}

.top-utility-link:hover {
  color: #C8922E !important;
}

.top-utility-btn {
  background: #FFFFFF !important;
  border: 1px solid #E8E2D8 !important;
  color: #0B2348 !important;
}

.top-utility-btn:hover {
  border-color: #C8922E !important;
  color: #C8922E !important;
}

/* Forms & Inputs */
input, select, textarea {
  background-color: #FFFFFF !important;
  border: 1px solid #E8E2D8 !important;
  color: #26344A !important;
  border-radius: 8px !important;
}

input:focus, select:focus, textarea:focus {
  border-color: #0B2348 !important;
  box-shadow: 0 0 0 3px rgba(11, 35, 72, 0.08) !important;
  outline: none !important;
}

/* FAQ Items */
.faq-item {
  background-color: #FFFFFF !important;
  border: 1px solid #E8E2D8 !important;
}

.faq-item.open {
  border-color: #C8922E !important;
  background-color: #FAF8F3 !important;
}

.faq-item__question {
  color: #0B2348 !important;
}

.faq-item__answer {
  color: #26344A !important;
}

/* Deep Navy Contrast Sections & Footer (15–20% Authority) */
.final-cta-section {
  background-color: #0B2348 !important;
  color: #FFFFFF !important;
}

.site-footer {
  background-color: #0B2348 !important;
  color: #F5EFE3 !important;
  border-top: 3px solid #C8922E !important;
}

.site-footer h4, .footer__col-title {
  color: #FFFFFF !important;
}

.site-footer a {
  color: rgba(245, 239, 227, 0.8) !important;
}

.site-footer a:hover {
  color: #D9B56A !important;
}

.footer-logo__brand {
  color: #FFFFFF !important;
}

.footer-logo__brand .brand-desk {
  color: #D9B56A !important;
}

/* Modals */
.modal-overlay, .modal {
  background-color: rgba(7, 26, 54, 0.65) !important;
}

.modal__dialog, .modal-content {
  background-color: #FFFFFF !important;
  border: 1px solid #E8E2D8 !important;
  box-shadow: 0 24px 60px rgba(7, 26, 54, 0.25) !important;
}

.modal__title {
  color: #0B2348 !important;
}
'''
    # Clean any duplicates and append
    marker = "/* ==========================================================================\n   V-DESK MASTER WHITE THEME — CLEAN ARCHITECTURAL SUITE"
    if marker in css:
        css = css[:css.find(marker)]
    css = css.rstrip() + "\n\n" + master_white_rules

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)
    print(f"Fixed styles.css in {dir_path}")

for d in [desktop_dir, scratch_dir]:
    fix_app_js(d)
    fix_styles_css(d)

print("All fixes applied successfully!")
