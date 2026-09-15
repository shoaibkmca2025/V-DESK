import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

# The final, uncompromising white theme stylesheet to place at the end of styles.css
white_theme_final_css = '''
/* ==========================================================================
   V-DESK PREMIUM WHITE THEME (ABSOLUTE CASCADE PRIORITY)
   WHITE: 65-75% | NAVY: 15-20% | CREAM: 5-10% | GOLD: 5-8%
   ========================================================================== */

/* Universal Overrides */
html, body {
  background-color: #FFFFFF !important;
  color: #26344A !important;
}

/* Sections */
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
.card-title {
  color: #0B2348 !important;
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif !important;
}

p, .section__desc, .service-card__desc, .body-text {
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
}

input:focus, select:focus, textarea:focus {
  border-color: #0B2348 !important;
  box-shadow: 0 0 0 3px rgba(11, 35, 72, 0.08) !important;
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

for d in [desktop_dir, scratch_dir]:
    css_file = os.path.join(d, "styles.css")
    if not os.path.exists(css_file):
        continue
    
    with open(css_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove any existing duplicate block
    marker = "/* ==========================================================================\n   V-DESK PREMIUM WHITE THEME (ABSOLUTE CASCADE PRIORITY)"
    if marker in content:
        content = content[:content.find(marker)]

    # Append to the end of styles.css
    content = content + "\n\n" + white_theme_final_css

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Applied final white theme styles to {css_file}")

print("Master White Theme harmonization complete!")
