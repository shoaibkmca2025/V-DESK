import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# 1. Base Head
head_end = index_html.find('</head>')
base_head = index_html[:head_end]

# 2. Extract Key Sections from index.html to reuse inside subpages
def extract_between(start_str, end_str):
    s = index_html.find(start_str)
    if s == -1: return ""
    e = index_html.find(end_str, s)
    if e == -1: return ""
    return index_html[s:e]

vo_configurator = extract_between('id="voConfigurator"', '<!-- ====================================================================\n       SECTION 06')
if not vo_configurator:
    vo_configurator = extract_between('id="voConfigurator"', 'id="meetingRoomsSection"')
if vo_configurator:
    vo_configurator = '<section class="section vo-platform-section" ' + vo_configurator

meeting_rooms_section = extract_between('id="meetingRoomsSection"', 'id="gstTrackerSection"')
if meeting_rooms_section:
    meeting_rooms_section = '<section class="section meeting-rooms-section" ' + meeting_rooms_section

gst_tracker_section = extract_between('id="gstTrackerSection"', 'id="calculator"')
if not gst_tracker_section:
    gst_tracker_section = extract_between('id="gstTrackerSection"', 'id="locations"')
if gst_tracker_section:
    gst_tracker_section = '<section class="section gst-tracker-section" ' + gst_tracker_section

marketplace_section = extract_between('id="solutionFinder"', 'id="journey"')
if marketplace_section:
    marketplace_section = '<section class="section finder" ' + marketplace_section

locations_section = extract_between('id="locations"', 'id="pricing"')
if locations_section:
    locations_section = '<section class="section locations" ' + locations_section

pricing_section = extract_between('id="pricing"', 'id="calculator"')
if not pricing_section:
    pricing_section = extract_between('id="pricing"', 'id="knowledge"')
if pricing_section:
    pricing_section = '<section class="section pricing" ' + pricing_section

calculator_section = extract_between('id="calculator"', 'id="testimonials"')
if calculator_section:
    calculator_section = '<section class="section calculator" ' + calculator_section

journey_section = extract_between('id="journey"', 'id="services"')
if journey_section:
    journey_section = '<section class="section journey" ' + journey_section

wizard_section = extract_between('id="wizard"', 'id="locations"')
if not wizard_section:
    wizard_section = extract_between('id="wizard"', 'id="footer"')
if wizard_section:
    wizard_section = '<section class="section wizard" ' + wizard_section

# Modals
modals_start = index_html.find('<!-- ====================================================================\n       PRD v2.0 MODAL: UNIVERSAL SEARCH RESULTS')
modals_end = index_html.find('<!-- ====================================================================\n       PRD v2.0: ENHANCED MOBILE FLOATING APP DOCK')
if modals_end == -1:
    modals_end = index_html.find('id="mobile-app-bottom-dock"')
shared_modals = index_html[modals_start:modals_end]

# Footer
footer_start = index_html.find('<footer class="site-footer"')
footer_end = index_html.find('</footer>') + len('</footer>')
shared_footer = index_html[footer_start:footer_end]

# Mobile dock
dock_start = index_html.find('<nav class="mobile-app-bottom-dock"')
dock_end = index_html.find('</nav>', dock_start) + len('</nav>')
shared_dock = index_html[dock_start:dock_end]

# Build page header with active class
def build_header(active_nav='home'):
    h_start = index_html.find('<div class="top-utility-bar">')
    h_end = index_html.find('</header>') + len('</header>')
    h = index_html[h_start:h_end]
    
    # replace anchor links with dedicated pages
    h = h.replace('href="#top" class="header-nav__link active"', 'href="index.html" class="header-nav__link"')
    h = h.replace('href="#top"', 'href="index.html"')
    h = h.replace('href="#voConfigurator"', 'href="virtual-office.html"')
    h = h.replace('href="#solutionFinder"', 'href="coworking-spaces.html"')
    h = h.replace('href="#journey"', 'href="company-registration.html"')
    h = h.replace('href="#pricing"', 'href="pricing.html"')
    h = h.replace('href="#locations"', 'href="locations.html"')
    h = h.replace('href="#knowledge"', 'href="virtual-office.html#faq"')
    h = h.replace('href="#wizard"', 'href="company-registration.html#wizard"')

    # Replace top utility button handlers
    h = h.replace('onclick="openCustomerPortal()"', 'onclick="window.location.href=\'portal.html\'"')
    h = h.replace('onclick="openMeetingBookingModal()"', 'onclick="window.location.href=\'meeting-rooms.html\'"')
    h = h.replace('onclick="openAllLocationsModal()"', 'onclick="window.location.href=\'locations.html\'"')
    h = h.replace('onclick="openAdminSuite()"', 'onclick="window.location.href=\'admin.html\'"')

    # Set active nav link
    if active_nav == 'virtual-office':
        h = h.replace('href="virtual-office.html" class="dropdown-item"', 'href="virtual-office.html" class="dropdown-item active"')
        h = h.replace('<a href="coworking-spaces.html" class="header-nav__link">Workspaces', '<a href="coworking-spaces.html" class="header-nav__link active">Workspaces')
    elif active_nav == 'coworking':
        h = h.replace('href="coworking-spaces.html" class="dropdown-item"', 'href="coworking-spaces.html" class="dropdown-item active"')
        h = h.replace('<a href="coworking-spaces.html" class="header-nav__link">Workspaces', '<a href="coworking-spaces.html" class="header-nav__link active">Workspaces')
    elif active_nav == 'meeting-rooms':
        h = h.replace('onclick="openMeetingBookingModal()" class="dropdown-item"', 'href="meeting-rooms.html" class="dropdown-item active"')
        h = h.replace('<a href="coworking-spaces.html" class="header-nav__link">Workspaces', '<a href="coworking-spaces.html" class="header-nav__link active">Workspaces')
    elif active_nav == 'company-reg':
        h = h.replace('<a href="company-registration.html" class="header-nav__link">Ecosystem', '<a href="company-registration.html" class="header-nav__link active">Ecosystem')
    elif active_nav == 'locations':
        h = h.replace('href="locations.html" class="header-nav__link"', 'href="locations.html" class="header-nav__link active"')
    elif active_nav == 'pricing':
        h = h.replace('href="pricing.html" class="header-nav__link"', 'href="pricing.html" class="header-nav__link active"')
    elif active_nav == 'contact':
        h = h.replace('class="header-contact-link"', 'class="header-contact-link active"')

    return h

def wrap_page(title, meta_desc, active_nav, body_content):
    head = base_head
    head = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', head)
    head = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{meta_desc}">', head)
    
    header = build_header(active_nav)
    
    footer = shared_footer
    footer = footer.replace('href="#services"', 'href="virtual-office.html"')
    footer = footer.replace('href="#pricing"', 'href="pricing.html"')
    footer = footer.replace('href="#solutionFinder"', 'href="coworking-spaces.html"')
    footer = footer.replace('href="#wizard"', 'href="company-registration.html"')
    footer = footer.replace('href="#locations"', 'href="locations.html"')
    
    page = f"""<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
{head}
</head>
<body id="top" class="subpage subpage--{active_nav}">
  <div id="scrollProgressBar" class="scroll-progress-bar"></div>
  {header}
  <main id="main-content">
    {body_content}
  </main>
  {footer}
  {shared_modals}
  {shared_dock}
  <script src="app.js"></script>
</body>
</html>
"""
    return page

print("Wrapper function ready.")
