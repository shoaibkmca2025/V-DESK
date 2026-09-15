import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Original index.html length:", len(html))

# Verify where heroSlide1 is
m = re.search(r'<div class="hero-rmc__slide" id="heroSlide1">([\s\S]*?)(?=<div class="hero-rmc__slide" id="heroSlide2">)', html)
if m:
    print("Found heroSlide1, length:", len(m.group(0)))
else:
    print("heroSlide1 not found!")
