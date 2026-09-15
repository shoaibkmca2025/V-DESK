with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'siteHeader' in line or 'site-header' in line or 'initHeader' in line:
        print(f"L{idx+1}: {line.strip()}")
