with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\styles.css", "r", encoding="utf-8") as f:
    css = f.read()

import re

# Find any color: #fff or #ffffff or rgba(255,255,255 inside cards or body
white_texts = re.findall(r'(\.[a-zA-Z0-9_-]+[^{]*\{[^}]*color:\s*(?:#fff|#ffffff|rgba\(255,\s*255,\s*255)[^}]*\})', css, re.IGNORECASE)
print(f"Total CSS rules with white text: {len(white_texts)}")

# Inspect rules with white text to ensure they have dark background (like .btn--primary, .site-footer, .final-cta)
suspicious = []
for rule in white_texts:
    # Check if rule has background color specified
    has_dark_bg = bool(re.search(r'background(?:-color)?:\s*(?:#0B2348|#071A36|var\(--vd-navy|#1|#2|#3|linear-gradient)', rule, re.IGNORECASE))
    selector = rule.split('{')[0].strip()
    if not has_dark_bg and not any(k in selector.lower() for k in ['footer', 'cta', 'btn--primary', 'btn--gold', 'button', 'badge', 'modal-overlay', 'overlay', 'tag', 'tooltip']):
        suspicious.append(selector)

print(f"Suspicious selectors with white text ({len(suspicious)}):")
for s in suspicious[:20]:
    print("  -", s)
