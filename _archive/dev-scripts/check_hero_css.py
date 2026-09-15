import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

m = re.findall(r'(\.hero-rmc[^{]*\{[^}]+\})', css)
for rule in m[:10]:
    print(rule)
    print('-'*40)
