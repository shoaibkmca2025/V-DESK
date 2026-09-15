import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

for d in [desktop_dir, scratch_dir]:
    html_file = os.path.join(d, "index.html")
    if not os.path.exists(html_file):
        continue
    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    # Update logo tags to use vdesk-emblem-white.png
    html = re.sub(r'<img[^>]*class="header-logo__img"[^>]*>', '<img src="assets/vdesk-emblem-white.png" alt="V-DESK Official Logo" class="header-logo__img">', html)
    html = re.sub(r'<img[^>]*class="mobile-drawer__logo"[^>]*>', '<img src="assets/vdesk-emblem-white.png" alt="V-DESK" class="mobile-drawer__logo">', html)
    html = re.sub(r'<img[^>]*class="footer-logo__img"[^>]*>', '<img src="assets/vdesk-emblem-white.png" alt="V-DESK" class="footer-logo__img">', html)

    # In header-logo__brand, make sure V is Deep Navy (#0B2348) and -DESK is Gold (#C8922E)
    html = re.sub(
        r'<span class="header-logo__brand">.*?</span>',
        '<span class="header-logo__brand">V<span class="brand-desk">-DESK</span></span>',
        html
    )

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated logo and brand in {html_file}")
