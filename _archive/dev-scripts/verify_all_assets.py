import urllib.request

urls = [
    'http://localhost:8080/index.html',
    'http://localhost:8080/assets/vdesk-emblem-white.png',
    'http://localhost:8080/assets/vdesk-logo.jpg',
    'http://localhost:8080/assets/vdesk-hero-video.mp4',
    'http://localhost:8080/styles.css',
    'http://localhost:8080/app.js'
]

for u in urls:
    try:
        with urllib.request.urlopen(u) as resp:
            print(f'{u} -> {resp.status} (Length: {resp.headers.get("Content-Length")})')
    except Exception as e:
        print(f'Error for {u}: {e}')
