with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
reveals = re.findall(r'class="[^"]*reveal[^"]*"', html)
print(f"Total elements with reveal in index.html: {len(reveals)}")
for r in reveals[:15]:
    print("  -", r)
