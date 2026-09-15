import re

with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Check all button onclick handlers
onclicks = re.findall(r'onclick=["\']([^"\']+)["\']', html)
print(f"Total onclick handlers in index.html: {len(onclicks)}")
unique_onclicks = set(re.sub(r'\(.*?\)', '()', o.strip()) for o in onclicks)
print("Unique onclick calls:")
for u in sorted(unique_onclicks):
    print("  -", u)

# 2. Check all id anchors that href links point to
href_anchors = re.findall(r'href=["\']#([^"\']+)["\']', html)
unique_anchors = set(href_anchors)
print(f"\nUnique #anchor hrefs ({len(unique_anchors)}):")
for a in sorted(unique_anchors):
    if a:
        has_target = f'id="{a}"' in html or f"id='{a}'" in html or f'name="{a}"' in html
        print(f"  #{a} -> {'EXISTS' if has_target else 'MISSING TARGET'}")
