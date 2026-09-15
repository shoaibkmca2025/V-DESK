import urllib.request

for p in ['index.html', 'assets/vdesk-emblem-vivid.png', 'assets/vdesk-logo-vivid.png']:
    url = f'http://localhost:8080/{p}'
    try:
        with urllib.request.urlopen(url) as resp:
            print(f'{url} -> {resp.status} (Length: {resp.headers.get("Content-Length")})')
    except Exception as e:
        print(f'Error for {url}: {e}')
