import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
screenshot_path = os.path.abspath("desktop_test.png")

cmd = [
    chrome_path,
    "--headless",
    "--disable-gpu",
    f"--screenshot={screenshot_path}",
    "--window-size=1440,900",
    "http://localhost:8080/index.html"
]

try:
    print("Running chrome screenshot...")
    res = subprocess.run(cmd, capture_output=True, timeout=15)
    print("Return code:", res.returncode)
    print("Stdout:", res.stdout.decode(errors='ignore'))
    print("Stderr:", res.stderr.decode(errors='ignore'))
    print("Exists:", os.path.exists(screenshot_path))
    if os.path.exists(screenshot_path):
        print("Size:", os.path.getsize(screenshot_path))
except Exception as e:
    print("Exception:", e)
