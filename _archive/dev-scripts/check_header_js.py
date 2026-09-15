with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re
matches = [line for line in js.splitlines() if 'site-header' in line or 'siteHeader' in line or 'initHeader' in line]
print(f"Header matches in app.js ({len(matches)}):")
for m in matches:
    print("  ", m.strip())
