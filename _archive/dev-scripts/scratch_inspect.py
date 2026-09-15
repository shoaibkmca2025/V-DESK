import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all modals
modals = re.findall(r'<div[^>]*class="[^"]*modal[^"]*"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*modal[^"]*"|$)', text)
for m_id, m_content in modals:
    title_m = re.search(r'<h[1-4][^>]*>([\s\S]*?)</h[1-4]>', m_content)
    t = re.sub(r'<[^>]+>', '', title_m.group(1)).strip() if title_m else 'No title'
    print(f"Modal #{m_id:<24}: {t}")
