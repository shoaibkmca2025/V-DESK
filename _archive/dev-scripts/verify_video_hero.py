import urllib.request

def test_url(url):
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req) as resp:
            print(f"URL: {url} -> {resp.status} (Length: {resp.headers.get('Content-Length')})")
            return True
    except Exception as e:
        print(f"Error testing {url}: {e}")
        return False

test_url("http://localhost:8080/index.html")
test_url("http://localhost:8080/assets/vdesk-hero-video.mp4")

with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html", "r", encoding="utf-8") as f:
    html = f.read()

checks = [
    "video-hero-scroll-container",
    "heroScrubVideo",
    "assets/vdesk-hero-video.mp4",
    "YOUR BUSINESS.",
    "YOUR SPACE.",
    "MEET BETTER.",
    "LOOK PROFESSIONAL.",
    "GROW WITH V DESK.",
    "SCROLL TO EXPLORE",
    "hero-progress-dot",
    "Discover V DESK",
    "Explore Solutions"
]

all_passed = True
for c in checks:
    if c in html:
        print(f"[PASS] Found: {c}")
    else:
        print(f"[FAIL] Missing: {c}")
        all_passed = False

if all_passed:
    print("\nALL HERO VALIDATION CHECKS PASSED PERFECTLY!")
else:
    print("\nSOME CHECKS FAILED.")
