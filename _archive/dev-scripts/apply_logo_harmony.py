import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

def update_logo_markup(dir_path):
    html_file = os.path.join(dir_path, "index.html")
    if not os.path.exists(html_file):
        return
    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update Header Logo img src to vdesk-emblem-dark.png
    # Replace assets/vdesk-logo.jpg in header-logo
    html = re.sub(
        r'<img\s+src="assets/vdesk-logo\.jpg"\s+alt="V-DESK Official Logo"[^>]*>',
        r'<img src="assets/vdesk-emblem-dark.png" alt="V-DESK Emblem" class="header-logo__img">',
        html
    )

    # 2. Update Mobile Drawer Logo img src
    html = re.sub(
        r'<img\s+src="assets/vdesk-logo\.jpg"\s+alt="V-DESK"[^>]*class="mobile-drawer__logo"[^>]*>',
        r'<img src="assets/vdesk-emblem-dark.png" alt="V-DESK Emblem" class="mobile-drawer__logo">',
        html
    )

    # 3. Update Footer Brand Area with the full dark logo if desired or keep clean
    # Let's check footer brand area
    footer_old = '<span class="header-logo__text" style="font-size:1.3rem;">V<span style="color:var(--vd-accent);">-DESK</span></span>'
    footer_new = '''<div class="footer-brand-wrap">
            <div class="footer-logo">
              <img src="assets/vdesk-emblem-dark.png" alt="V-DESK" class="footer-logo__img">
              <div class="footer-logo__text">
                <span class="footer-logo__brand">V<span class="text-gold">-DESK</span></span>
                <span class="footer-logo__tagline">Workspace & Consulting LLP</span>
              </div>
            </div>
          </div>'''
    if footer_old in html:
        html = html.replace(footer_old, footer_new)

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated HTML logo markup in {html_file}")

def update_logo_css(dir_path):
    css_file = os.path.join(dir_path, "styles.css")
    if not os.path.exists(css_file):
        return
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()

    # Replace or add the refined logo styling
    logo_css_block = '''
/* ==========================================================================
   REFINED V-DESK BRAND LOGO (PERFECT COLOR HARMONY WITH DARK THEME)
   ========================================================================== */

.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.header-logo:hover {
  transform: translateY(-1px);
}

.header-logo__emblem-wrap {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: radial-gradient(circle at center, #0b1e42 0%, #06152f 100%);
  border: 1.5px solid rgba(197, 146, 57, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6), 
              0 0 14px rgba(197, 146, 57, 0.2), 
              inset 0 0 8px rgba(197, 146, 57, 0.15);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.header-logo:hover .header-logo__emblem-wrap {
  border-color: #c59239;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7), 
              0 0 20px rgba(197, 146, 57, 0.4), 
              inset 0 0 12px rgba(197, 146, 57, 0.25);
  transform: scale(1.04);
}

.header-logo__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
  display: block;
}

.header-logo__text {
  display: flex;
  flex-direction: column;
}

.header-logo__brand {
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #ffffff;
  line-height: 1.05;
  text-transform: uppercase;
}

.header-logo__brand span {
  background: linear-gradient(135deg, #ffffff 10%, #e2b96e 50%, #c59239 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-logo__tagline {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #c59239;
  font-weight: 600;
  margin-top: 3px;
}

/* Mobile Drawer Brand Harmony */
.mobile-drawer__logo {
  width: 42px;
  height: 42px;
  border-radius: 9px;
  background: radial-gradient(circle at center, #0b1e42 0%, #06152f 100%);
  border: 1.5px solid rgba(197, 146, 57, 0.4);
  padding: 4px;
  object-fit: contain;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5), 0 0 10px rgba(197, 146, 57, 0.2);
}

/* Footer Brand Harmony */
.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.footer-logo__img {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: radial-gradient(circle at center, #0b1e42 0%, #06152f 100%);
  border: 1.5px solid rgba(197, 146, 57, 0.4);
  padding: 5px;
  object-fit: contain;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px rgba(197, 146, 57, 0.2);
}

.footer-logo__text {
  display: flex;
  flex-direction: column;
}

.footer-logo__brand {
  font-family: 'Cinzel', serif;
  font-size: 1.45rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.08em;
  line-height: 1.1;
}

.footer-logo__brand .text-gold {
  background: linear-gradient(135deg, #ffffff 10%, #e2b96e 50%, #c59239 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-logo__tagline {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  color: #c59239;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 3px;
}
'''

    if 'REFINED V-DESK BRAND LOGO' in css:
        m = re.search(r'/\* =+ \s* REFINED V-DESK BRAND LOGO.*?(?=(/\* =+|$))', css, re.DOTALL)
        if m:
            css = css[:m.start()] + logo_css_block + css[m.end():]
        else:
            css += "\n" + logo_css_block
    else:
        css += "\n" + logo_css_block

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)
    print(f"Updated CSS logo styles in {css_file}")

for d in [desktop_dir, scratch_dir]:
    update_logo_markup(d)
    update_logo_css(d)

print("Applied logo color harmony updates successfully!")
