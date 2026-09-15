with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\styles.css", "r", encoding="utf-8") as f:
    css = f.read()

# Let's inspect the sections in styles.css
import re
headers = re.findall(r'/\* =+ \s* ([^\n*]+) \s* =+ \*/', css)
print(f"Total section comment headers ({len(headers)}):")
for h in headers:
    print("  -", h.strip())
