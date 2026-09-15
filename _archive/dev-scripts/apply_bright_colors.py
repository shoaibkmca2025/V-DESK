import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

def update_bright_theme(dir_path):
    html_file = os.path.join(dir_path, "index.html")
    css_file = os.path.join(dir_path, "styles.css")
    
    # 1. Update HTML
    if os.path.exists(html_file):
        with open(html_file, "r", encoding="utf-8") as f:
            html = f.read()
        
        # Point logo image to bright vivid emblem
        html = re.sub(
            r'src="assets/vdesk-emblem-[^"]+\.png"',
            r'src="assets/vdesk-emblem-vivid.png"',
            html
        )
        html = re.sub(
            r'src="assets/vdesk-logo\.jpg"',
            r'src="assets/vdesk-emblem-vivid.png"',
            html
        )
        
        # Update header brand wordmark to bright colors
        old_brand_markup = r'<span class="header-logo__brand">[^<]+(?:<span>[^<]+</span>)?</span>'
        new_brand_markup = '<span class="header-logo__brand"><span class="brand-v">V</span><span class="brand-desk">-DESK</span></span>'
        html = re.sub(old_brand_markup, new_brand_markup, html)
        
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Updated bright HTML in {html_file}")

    # 2. Update CSS with Bright Color Tokens and Logo Styles
    if os.path.exists(css_file):
        with open(css_file, "r", encoding="utf-8") as f:
            css = f.read()

        bright_css = '''
/* ==========================================================================
   BRIGHT VIVID V-DESK BRAND THEME (HIGH VIBRANCY & RADIANCE)
   ========================================================================== */

:root {
  --vd-accent: #FFB800; /* Bright Vivid Radiant Gold */
  --vd-accent-hover: #FFC933;
  --vd-accent-glow: rgba(255, 184, 0, 0.45);
  --vd-blue-bright: #38BDF8; /* Electric Vivid Cyan-Blue */
  --vd-blue-deep: #1E40AF;
}

/* Header Logo with Bright Vivid Styling */
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.header-logo:hover {
  transform: translateY(-1px);
}

.header-logo__emblem-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: radial-gradient(circle at 35% 35%, rgba(56, 189, 248, 0.18) 0%, rgba(11, 30, 66, 0.85) 60%, #06152f 100%);
  border: 1.8px solid #FFB800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6), 
              0 0 18px rgba(255, 184, 0, 0.35), 
              0 0 10px rgba(56, 189, 248, 0.2), 
              inset 0 0 8px rgba(255, 184, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.header-logo:hover .header-logo__emblem-wrap {
  border-color: #FFC933;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.7), 
              0 0 24px rgba(255, 184, 0, 0.55), 
              0 0 15px rgba(56, 189, 248, 0.35), 
              inset 0 0 12px rgba(255, 184, 0, 0.3);
  transform: scale(1.05);
}

.header-logo__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  display: block;
}

.header-logo__text {
  display: flex;
  flex-direction: column;
}

.header-logo__brand {
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.05;
  text-transform: uppercase;
}

.header-logo__brand .brand-v {
  color: #38BDF8; /* Electric Bright Blue */
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
}

.header-logo__brand .brand-desk {
  background: linear-gradient(135deg, #FFF2A3 0%, #FFB800 50%, #FFA000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(255, 184, 0, 0.5));
}

.header-logo__tagline {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #FFB800;
  font-weight: 700;
  margin-top: 3px;
  text-shadow: 0 0 8px rgba(255, 184, 0, 0.4);
}

/* Mobile Drawer Brand */
.mobile-drawer__logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 0%, #06152f 100%);
  border: 1.5px solid #FFB800;
  padding: 4px;
  object-fit: contain;
  box-shadow: 0 0 14px rgba(255, 184, 0, 0.35);
}

/* Bright Buttons Enhancement */
.btn--gold {
  background: linear-gradient(135deg, #FFC933 0%, #FFB800 60%, #E69D00 100%) !important;
  color: #040e20 !important;
  font-weight: 800 !important;
  box-shadow: 0 4px 18px rgba(255, 184, 0, 0.45) !important;
}

.btn--gold:hover {
  background: linear-gradient(135deg, #FFD666 0%, #FFC41F 60%, #FFB800 100%) !important;
  box-shadow: 0 6px 24px rgba(255, 184, 0, 0.65) !important;
  transform: translateY(-2px);
}

/* Top Utility Bar Bright Badges */
.utility-badge {
  background: rgba(255, 184, 0, 0.18) !important;
  color: #FFB800 !important;
  border-color: rgba(255, 184, 0, 0.4) !important;
  font-weight: 700 !important;
}

.text-gold {
  background: linear-gradient(135deg, #FFFFFF 15%, #FFE27A 50%, #FFB800 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}
'''
        # Replace or append
        if 'BRIGHT VIVID V-DESK BRAND THEME' in css:
            m = re.search(r'/\* =+ \s* BRIGHT VIVID V-DESK BRAND THEME.*?(?=(/\* =+|$))', css, re.DOTALL)
            if m:
                css = css[:m.start()] + bright_css + css[m.end():]
            else:
                css += "\n" + bright_css
        else:
            css += "\n" + bright_css

        with open(css_file, "w", encoding="utf-8") as f:
            f.write(css)
        print(f"Updated bright CSS in {css_file}")

for d in [desktop_dir, scratch_dir]:
    update_bright_theme(d)

print("Applied bright vivid theme across all workspaces successfully.")
