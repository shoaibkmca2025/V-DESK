with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

print("--- Right after hero (pos 17950 - 18800) ---")
print(html[17950:18800])
