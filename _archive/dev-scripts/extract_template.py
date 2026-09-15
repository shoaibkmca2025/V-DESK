with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

head_part = text[:text.find('</head>') + len('</head>')]
header_part = text[text.find('<header class="site-header"'):text.find('</header>') + len('</header>')]
footer_part = text[text.find('<footer class="site-footer"'):text.find('</footer>') + len('</footer>')]

# Find modals
modals_part = text[text.find('<!-- PRD v2.0 MODALS SUITE'):text.find('<!-- PRD v2.0 MOBILE BOTTOM APP DOCK')]
if not modals_part:
    modals_idx = text.find('id="universalSearchResultsModal"')
    if modals_idx != -1:
        # find start of comment before it
        start_c = text.rfind('<!--', 0, modals_idx)
        end_c = text.find('<!-- ====================================================================\n       PRD v2.0: ENHANCED MOBILE FLOATING APP DOCK')
        if end_c == -1:
            end_c = text.find('id="mobile-app-bottom-dock"')
        modals_part = text[start_c:end_c]

dock_start = text.find('id="mobile-app-bottom-dock"')
dock_part = text[text.rfind('<nav', 0, dock_start):text.find('</nav>', dock_start) + len('</nav>')]

print("Head length:", len(head_part))
print("Header length:", len(header_part))
print("Footer length:", len(footer_part))
print("Modals length:", len(modals_part))
print("Dock length:", len(dock_part))
