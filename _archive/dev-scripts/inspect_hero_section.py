import re

with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Locate hero section
m_hero = re.search(r'<section[^>]*class="[^"]*hero[^"]*"[^>]*>.*?</section>', html, re.DOTALL)
if m_hero:
    print("Hero match found! Start:", m_hero.start(), "End:", m_hero.end())
    print("Content preview (first 400 chars):")
    print(m_hero.group(0)[:400])
    print("...")
    print("Content preview (last 400 chars):")
    print(m_hero.group(0)[-400:])
else:
    print("Hero section not found by regex")
