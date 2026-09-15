with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re
m = re.search(r'// Instantly reveal everything.*?^}', js, re.MULTILINE | re.DOTALL)
if m:
    print(m.group(0))
else:
    # Search for observer
    m2 = re.search(r'function initScrollAnimations.*?^}', js, re.MULTILINE | re.DOTALL)
    if m2:
        print(m2.group(0))
    else:
        print("Not found by exact regex")
