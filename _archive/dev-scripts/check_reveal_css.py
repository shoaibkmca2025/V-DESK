with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\styles.css", "r", encoding="utf-8") as f:
    css = f.read()

import re
matches = re.findall(r'(\.reveal[^{]*\{[^}]*\})', css)
print(f"Found {len(matches)} .reveal CSS rules:")
for m in matches[:10]:
    print(m)
