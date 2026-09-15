with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
matches = re.findall(r'class="[^"]*modal[^"]*"', html)
print('Modal classes count:', len(matches))
print('Unique modal classes:', set(matches))

# Now check styles.css for modal
with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

matches_css = re.findall(r'\.[a-zA-Z0-9_-]*modal[a-zA-Z0-9_-]*', css)
print('CSS modal rules count:', len(matches_css))
print('Unique CSS modal classes:', set(matches_css))
