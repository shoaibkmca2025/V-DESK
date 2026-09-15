with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

print("--- Header snippet ---")
print(html[4059:5404][:300])
print("...")
print(html[4059:5404][-200:])

print("--- Between header and drawer ---")
print(repr(html[5404:5516]))

print("--- Drawer snippet ---")
print(html[5516:9115][:300])
print("...")
print(html[5516:9115][-200:])
