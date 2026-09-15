with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
sections = re.findall(r'<(?:section|header|footer|div)[^>]*(?:id="([^"]+)"|class="([^"]+)")', html)
print("Found matches:")
seen = set()
for id_attr, cls_attr in sections:
    name = id_attr if id_attr else cls_attr
    if name and name not in seen:
        seen.add(name)
        if any(w in name.lower() for w in ['header', 'hero', 'trust', 'service', 'location', 'pricing', 'calc', 'wizard', 'why', 'testimonial', 'faq', 'knowledge', 'contact', 'footer']):
            print(f"ID: {id_attr} | Class: {cls_attr}")
