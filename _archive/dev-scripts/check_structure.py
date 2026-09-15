import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

slides = re.findall(r'<div[^>]*class="[^"]*hero-rmc__slide[^"]*"[^>]*id="([^"]+)"', text)
print("Hero slides:", slides)

sections = re.findall(r'<section[^>]*id="([^"]+)"', text)
print("Sections found:", sections)
