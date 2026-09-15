import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

# HTML logo markup
new_header_logo = '''      <!-- BRAND LOGO (OFFICIAL V-DESK LOGO LOCKUP) -->
      <a href="#top" class="header-logo" aria-label="V-DESK Home">
        <img src="assets/vdesk-navbar-logo.png" alt="V-DESK Workspace & Consulting LLP" class="header-logo__full-img">
      </a>'''

new_drawer_brand = '''      <div class="mobile-drawer__brand">
        <a href="#top" class="mobile-drawer__brand-link" onclick="closeMobileNav()">
          <img src="assets/vdesk-navbar-logo.png" alt="V-DESK Workspace & Consulting LLP" class="mobile-drawer__full-logo">
        </a>
      </div>'''

new_footer_logo = '''          <div class="footer-brand-wrap">
            <div class="footer-logo">
              <img src="assets/vdesk-navbar-logo.png" alt="V-DESK Workspace & Consulting LLP" class="footer-logo__full-img">
            </div>
            <p class="footer__brand-desc">V-DESK Workspace & Consulting LLP is India's premier business infrastructure platform, uniting verified virtual offices, coworking, private cabins and enterprise compliance.</p>
            <div class="footer__llp">LLPIN: AAY-9842 • 100% Verified Corporate Registrations</div>
          </div>'''

# CSS styling for the logo
navbar_logo_css = '''
/* ==========================================================================
   OFFICIAL V-DESK NAVBAR & BRAND LOGO INTEGRATION
   ========================================================================== */

.header-logo {
  display: inline-flex !important;
  align-items: center !important;
  text-decoration: none !important;
  flex-shrink: 0 !important;
  padding: 2px 0 !important;
  transition: opacity 0.2s ease, transform 0.2s ease !important;
}

.header-logo:hover {
  opacity: 0.9 !important;
  transform: translateY(-1px) !important;
}

.header-logo__full-img {
  height: 52px !important;
  width: auto !important;
  max-width: 175px !important;
  object-fit: contain !important;
  display: block !important;
}

/* Mobile Drawer Logo */
.mobile-drawer__brand-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.mobile-drawer__full-logo {
  height: 44px !important;
  width: auto !important;
  max-width: 150px !important;
  object-fit: contain !important;
  display: block !important;
}

/* Footer Logo */
.footer-logo__full-img {
  height: 54px !important;
  width: auto !important;
  max-width: 185px !important;
  object-fit: contain !important;
  display: block !important;
  margin-bottom: 16px !important;
  /* subtle glow on dark navy footer */
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.5)) !important;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(200, 146, 46, 0.35);
}

@media (max-width: 768px) {
  .header-logo__full-img {
    height: 42px !important;
    max-width: 140px !important;
  }
}
'''

for d in [desktop_dir, scratch_dir]:
    if not os.path.exists(d):
        continue

    # 1. Update index.html
    html_file = os.path.join(d, "index.html")
    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace header logo
    html = re.sub(
        r'<!-- BRAND LOGO.*?-->\s*<a href="#top" class="header-logo".*?</a>',
        new_header_logo,
        html,
        flags=re.DOTALL
    )

    # Replace mobile drawer brand
    html = re.sub(
        r'<div class="mobile-drawer__brand">.*?</div>',
        new_drawer_brand,
        html,
        flags=re.DOTALL
    )

    # Replace footer brand
    html = re.sub(
        r'<div class="footer-brand-wrap">.*?<div class="footer__llp">.*?</div>\s*</div>',
        new_footer_logo,
        html,
        flags=re.DOTALL
    )

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated index.html with new navbar logo in {d}")

    # 2. Update styles.css
    css_file = os.path.join(d, "styles.css")
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()

    marker = "/* ==========================================================================\n   OFFICIAL V-DESK NAVBAR & BRAND LOGO INTEGRATION"
    if marker in css:
        css = css[:css.find(marker)]
    css = css.rstrip() + "\n\n" + navbar_logo_css

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)
    print(f"Updated styles.css with logo styling in {d}")

print("Logo update successfully applied to both workspaces!")
