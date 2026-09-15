with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\styles.css", "r", encoding="utf-8") as f:
    css = f.read()

import re

# Find invalid selectors (like starting with numbers, punctuation, or missing selector before {)
# Pattern: text preceding '{'
blocks = re.findall(r'([^{}]+)\{([^{}]+)\}', css)
print(f"Total CSS rule blocks parsed: {len(blocks)}")

invalid_selectors = []
for sel, body in blocks:
    sel_clean = sel.strip()
    # Check if selector looks like broken CSS snippet
    if re.match(r'^\.[\d]', sel_clean) or sel_clean.startswith((';', ':', ')', '}')):
        invalid_selectors.append(sel_clean)

print(f"Found {len(invalid_selectors)} invalid broken selector fragments:")
for inv in invalid_selectors:
    print("  BROKEN:", repr(inv[:60]))
