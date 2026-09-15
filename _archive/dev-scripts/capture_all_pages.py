import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

pages = [
    ('virtual-office', 'http://localhost:8080/virtual-office.html'),
    ('coworking-spaces', 'http://localhost:8080/coworking-spaces.html'),
    ('meeting-rooms', 'http://localhost:8080/meeting-rooms.html'),
    ('locations', 'http://localhost:8080/locations.html'),
    ('pricing', 'http://localhost:8080/pricing.html'),
    ('company-registration', 'http://localhost:8080/company-registration.html'),
    ('portal', 'http://localhost:8080/portal.html'),
    ('admin', 'http://localhost:8080/admin.html'),
    ('contact', 'http://localhost:8080/contact.html'),
]

for name, url in pages:
    out = os.path.abspath(f"page_{name}.png")
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        f"--screenshot={out}",
        "--window-size=1440,900",
        url
    ]
    subprocess.run(cmd, capture_output=True, timeout=15)
    if os.path.exists(out):
        print(f"Captured {name}: {os.path.getsize(out):,} bytes")
