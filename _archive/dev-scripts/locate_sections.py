with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

targets = ['businessLifecycle', 'voConfigurator', 'meetingRoomsSection', 'gstTrackerSection', 'universalSearchResultsModal']
for t in targets:
    pos = text.find(f'id="{t}"')
    print(f'{t}: found at byte offset {pos}')

lines = text.splitlines()
for i, l in enumerate(lines):
    for t in targets:
        if f'id="{t}"' in l:
            print(f'{t} -> line {i+1}')
