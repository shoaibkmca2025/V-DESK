import re

html_path = r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

# Locate <header ... </header>
hdr_match = re.search(r'<header.*?</header>', html, re.DOTALL)
print("Header match:", hdr_match.span() if hdr_match else None)

# Check if there is already a mobile nav or drawer immediately following or later
# Look for mobile drawer / nav
drawer_match = re.search(r'<div class="mobile-(?:drawer|nav)".*?</div>\s*</div>\s*</div>', html, re.DOTALL)
print("Drawer match:", drawer_match.span() if drawer_match else None)
if not drawer_match:
    m = re.search(r'id=["\']mobileDrawer["\']', html)
    print("mobileDrawer id match:", m.span() if m else None)
