with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
m_hero = re.search(r'<(?:main|section)[^>]*class="[^"]*hero', html)
if m_hero:
    print("Hero starts at:", m_hero.start())
    print("Snippet preceding hero:")
    print(repr(html[m_hero.start()-200:m_hero.start()]))
else:
    print("Hero not found by regex")
