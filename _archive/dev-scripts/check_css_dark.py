with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\styles.css", "r", encoding="utf-8") as f:
    css = f.read()

import re

# Check occurrences of dark backgrounds
dark_bgs = re.findall(r'background(?:-color)?:\s*(?:#0A0A0B|#18181B|#1E1E22|#06152F|#040e20|#020814)', css, re.IGNORECASE)
print(f"Total occurrences of old dark backgrounds: {len(dark_bgs)}")

# Check core variables in :root
roots = re.findall(r':root\s*\{[^}]+\}', css)
print(f"Found {len(roots)} :root blocks")
for i, r in enumerate(roots):
    print(f"--- :root block {i+1} (first 200 chars) ---")
    print(r[:200])
