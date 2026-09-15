import re

with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

m_footer = re.search(r'<footer.*?</footer>', html, re.DOTALL)
if m_footer:
    print("Footer found (first 500 chars):")
    print(m_footer.group(0)[:500])
else:
    print("Footer not found")
