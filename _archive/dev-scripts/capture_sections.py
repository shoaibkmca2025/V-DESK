import subprocess
import os
import time

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# We can capture full scrollable height by setting a tall window size or using a test script
heights = [
    ("hero", 900),
    ("configurator", 2400),
    ("meeting_rooms", 3800),
    ("gst_tracker", 5200),
    ("marketplace", 6800),
]

for name, h in heights:
    out_file = os.path.abspath(f"render_{name}.png")
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        f"--screenshot={out_file}",
        f"--window-size=1440,{h}",
        "http://localhost:8080/index.html"
    ]
    subprocess.run(cmd, capture_output=True, timeout=20)
    if os.path.exists(out_file):
        print(f"Captured {name}: {os.path.getsize(out_file)} bytes")
