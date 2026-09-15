with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('<header class="site-header"')
end = text.find('</header>') + len('</header>')
print(text[start:end])
