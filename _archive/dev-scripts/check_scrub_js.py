with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re
m = re.search(r'// =+ \s* // V-DESK SCROLL-CONTROLLED CINEMATIC VIDEO SCRUBBING ENGINE.*?}\)\(\);', js, re.DOTALL)
if m:
    print("Found initVideoHeroScrub:")
    print(m.group(0)[:300])
    print("...")
    print(m.group(0)[-200:])
else:
    print("initVideoHeroScrub not found")
