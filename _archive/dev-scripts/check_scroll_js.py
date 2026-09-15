with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re
matches = [line for line in js.splitlines() if any(w in line for w in ['reveal', 'scroll', 'IntersectionObserver', 'counter'])]
print(f"Scroll-related lines in app.js ({len(matches)}):")
for m in matches[:30]:
    print("  ", m.strip())
