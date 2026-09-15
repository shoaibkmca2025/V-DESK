with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
matches = re.findall(r'(\.explorer-header[^{]*\{[^}]*\})', css)
print('explorer-header rules:')
for m in matches:
    print(m)

matches_admin = re.findall(r'(\.admin-header[^{]*\{[^}]*\})', css)
print('admin-header rules:')
for m in matches_admin:
    print(m)

matches_step = re.findall(r'(\.booking-step[^{]*\{[^}]*\})', css)
print('booking-step rules:')
for m in matches_step:
    print(m)
