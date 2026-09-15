with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
matches = re.findall(r'(\.modal-overlay\.[a-zA-Z0-9_-]+)', css)
print('Matches for .modal-overlay.<class> in styles.css:', set(matches))
