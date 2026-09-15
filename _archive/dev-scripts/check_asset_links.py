import re
import os

html_path = r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html"
base_dir = os.path.dirname(html_path)

with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

# Find all src and href references
srcs = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html)

missing = []
found = []
for s in srcs:
    # Ignore anchors and external URLs
    if s.startswith(('#', 'http://', 'https://', 'tel:', 'mailto:', 'javascript:')):
        continue
    # Local file path
    full_path = os.path.normpath(os.path.join(base_dir, s))
    if os.path.exists(full_path):
        found.append((s, os.path.getsize(full_path)))
    else:
        missing.append((s, full_path))

print(f"Total local references: {len(found) + len(missing)}")
print(f"Found: {len(found)}")
if missing:
    print(f"MISSING ({len(missing)}):")
    for s, p in missing:
        print(f"  - {s} -> {p}")
else:
    print("ALL local files exist!")
