with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

hdr_start = html.find('<header')
hdr_end = html.find('</header>') + 9
print("Current header snippet:")
print(html[hdr_start:hdr_end][:400])
print("...")
print(html[hdr_start:hdr_end][-400:])
