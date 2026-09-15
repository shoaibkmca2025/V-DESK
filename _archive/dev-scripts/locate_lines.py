import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_line(pattern):
    for idx, line in enumerate(lines):
        if re.search(pattern, line):
            return idx + 1, line.strip()
    return None, None

targets = [
    r'id="top"',
    r'class="top-utility-bar"',
    r'class="site-header"',
    r'id="heroSlide1"',
    r'class="hero-white__ctas"',
    r'class="hero-white__showcase"',
    r'id="trustStrip"',
    r'id="journey"',
    r'id="services"',
    r'id="solutionFinder"',
    r'id="kycDocs"',
    r'id="locations"',
    r'id="pricing"',
    r'id="wizard"',
    r'id="quoteModal"',
    r'id="adminModal"',
    r'id="commandPaletteModal"',
    r'id="allLocationsModal"',
    r'class="mobile-sticky-dock"',
]

for t in targets:
    ln, text = find_line(t)
    print(f"{ln}: {t} -> {text[:60] if text else 'NOT FOUND'}")
