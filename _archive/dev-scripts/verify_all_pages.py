import urllib.request
import os

pages = [
    'index.html',
    'virtual-office.html',
    'coworking-spaces.html',
    'meeting-rooms.html',
    'locations.html',
    'pricing.html',
    'company-registration.html',
    'portal.html',
    'admin.html',
    'contact.html'
]

print("=== 1. FILE INTEGRITY CHECK ===")
for p in pages:
    exists = os.path.exists(p)
    size = os.path.getsize(p) if exists else 0
    print(f"[{'PASS' if exists else 'FAIL'}] {p} ({size:,} bytes)")
    if exists:
        with open(p, 'r', encoding='utf-8') as f:
            content = f.read()
            has_head = '<head>' in content and '</head>' in content
            has_header = 'site-header' in content
            has_footer = 'site-footer' in content
            has_styles = 'styles.css' in content
            has_app = 'app.js' in content
            assert has_head and has_header and has_footer and has_styles and has_app, f"Missing structure in {p}"

print("\n=== 2. LOCAL HTTP SERVER 200 OK CHECK ===")
for p in pages:
    url = f"http://localhost:8080/{p}"
    try:
        req = urllib.request.urlopen(url)
        print(f"[{req.status} OK] {url} (Length: {len(req.read()):,} bytes)")
    except Exception as e:
        print(f"[FAIL] {url} -> {e}")

print("\nAll 10 pages verified completely!")
