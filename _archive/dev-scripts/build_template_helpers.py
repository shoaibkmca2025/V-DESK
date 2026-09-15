import os
import re

# Read index.html to extract shared head, top utility, site header, modals, and footer
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# 1. Shared Head template (fonts, icons, stylesheets)
head_end = index_html.find('</head>')
head_content = index_html[:head_end]

# Extract navigation bar and update links to multi-page routes
header_start = index_html.find('<header class="site-header"')
header_end = index_html.find('</header>') + len('</header>')
header_raw = index_html[header_start:header_end]

# Top utility bar
top_util_start = index_html.find('<div class="top-utility-bar">')
top_util_end = index_html.find('<!-- ====================================================================\n       SITE HEADER')
top_util_raw = index_html[top_util_start:top_util_end]

# Footer
footer_start = index_html.find('<footer class="site-footer"')
footer_end = index_html.find('</footer>') + len('</footer>')
footer_raw = index_html[footer_start:footer_end]

# Modals
modals_start = index_html.find('<!-- ====================================================================\n       PRD v2.0 MODAL: UNIVERSAL SEARCH RESULTS')
modals_end = index_html.find('<!-- ====================================================================\n       PRD v2.0: ENHANCED MOBILE FLOATING APP DOCK')
modals_raw = index_html[modals_start:modals_end]

# Dock
dock_start = index_html.find('<nav class="mobile-app-bottom-dock"')
dock_end = index_html.find('</nav>', dock_start) + len('</nav>')
dock_raw = index_html[dock_start:dock_end]

def make_header(active_page='home'):
    h = header_raw
    # Update links
    h = h.replace('href="#top" class="header-nav__link active"', 'href="index.html" class="header-nav__link"')
    h = h.replace('href="#top"', 'href="index.html"')
    h = h.replace('href="#voConfigurator"', 'href="virtual-office.html"')
    h = h.replace('href="#solutionFinder"', 'href="coworking-spaces.html"')
    h = h.replace('href="#journey"', 'href="company-registration.html"')
    h = h.replace('href="#pricing"', 'href="pricing.html"')
    h = h.replace('href="#locations"', 'href="locations.html"')
    h = h.replace('href="#knowledge"', 'href="virtual-office.html#knowledge"')
    h = h.replace('href="#wizard"', 'href="company-registration.html#wizard"')
    h = h.replace('onclick="openMeetingBookingModal()" class="dropdown-item"', 'href="meeting-rooms.html" class="dropdown-item"')
    h = h.replace('onclick="openCompanyRegModal()" class="dropdown-item"', 'href="company-registration.html" class="dropdown-item"')
    h = h.replace('onclick="openCustomerPortal()" class="dropdown-item"', 'href="portal.html" class="dropdown-item"')
    h = h.replace('onclick="openGstTrackerModal()" class="dropdown-item"', 'href="virtual-office.html#gstTrackerSection" class="dropdown-item"')
    
    # Active class insertion
    if active_page == 'home':
        h = h.replace('href="index.html" class="header-nav__link"', 'href="index.html" class="header-nav__link active"')
    elif active_page == 'virtual-office':
        h = h.replace('href="virtual-office.html" class="header-nav__link"', 'href="virtual-office.html" class="header-nav__link active"')
    elif active_page == 'coworking':
        h = h.replace('href="coworking-spaces.html" class="header-nav__link"', 'href="coworking-spaces.html" class="header-nav__link active"')
    elif active_page == 'meeting-rooms':
        h = h.replace('href="meeting-rooms.html" class="header-nav__link"', 'href="meeting-rooms.html" class="header-nav__link active"')
    elif active_page == 'locations':
        h = h.replace('href="locations.html" class="header-nav__link"', 'href="locations.html" class="header-nav__link active"')
    elif active_page == 'pricing':
        h = h.replace('href="pricing.html" class="header-nav__link"', 'href="pricing.html" class="header-nav__link active"')
    elif active_page == 'company-reg':
        h = h.replace('href="company-registration.html" class="header-nav__link"', 'href="company-registration.html" class="header-nav__link active"')

    # Top utility links
    util = top_util_raw
    util = util.replace('onclick="openCustomerPortal()"', 'onclick="window.location.href=\'portal.html\'"')
    util = util.replace('onclick="openMeetingBookingModal()"', 'onclick="window.location.href=\'meeting-rooms.html\'"')
    util = util.replace('onclick="openAllLocationsModal()"', 'onclick="window.location.href=\'locations.html\'"')
    util = util.replace('onclick="openAdminSuite()"', 'onclick="window.location.href=\'admin.html\'"')

    return util + '\n' + h

def make_footer():
    f = footer_raw
    f = f.replace('href="#services"', 'href="virtual-office.html"')
    f = f.replace('href="#pricing"', 'href="pricing.html"')
    f = f.replace('href="#solutionFinder"', 'href="coworking-spaces.html"')
    f = f.replace('href="#wizard"', 'href="company-registration.html"')
    f = f.replace('href="#locations"', 'href="locations.html"')
    return f

print('Header and Footer generators ready.')
