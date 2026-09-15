with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Top utility links
html = html.replace('onclick="openCustomerPortal()"><i class="ph-bold ph-user-circle"></i> Client Portal', 'onclick="window.location.href=\'portal.html\'"><i class="ph-bold ph-user-circle"></i> Client Portal')
html = html.replace('onclick="openMeetingBookingModal()"><i class="ph-bold ph-presentation"></i> Book Room', 'onclick="window.location.href=\'meeting-rooms.html\'"><i class="ph-bold ph-presentation"></i> Book Room')
html = html.replace('onclick="openAllLocationsModal()"><i class="ph-bold ph-map-pin"></i> All Locations', 'onclick="window.location.href=\'locations.html\'"><i class="ph-bold ph-map-pin"></i> All Locations')
html = html.replace('onclick="openAdminSuite()"><i class="ph-bold ph-gear-six"></i> Admin CRM', 'onclick="window.location.href=\'admin.html\'"><i class="ph-bold ph-gear-six"></i> Admin CRM')

# Header dropdown links
html = html.replace('<li><a href="#voConfigurator" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>Virtual Office Platform</strong>', '<li><a href="virtual-office.html" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>Virtual Office Platform</strong>')
html = html.replace('<li><a href="#solutionFinder" class="dropdown-item"><i class="ph-bold ph-laptop"></i> <div><strong>Workspace Marketplace</strong>', '<li><a href="coworking-spaces.html" class="dropdown-item"><i class="ph-bold ph-laptop"></i> <div><strong>Workspace Marketplace</strong>')
html = html.replace('<li><a href="javascript:void(0)" onclick="openMeetingBookingModal()" class="dropdown-item"><i class="ph-bold ph-presentation"></i> <div><strong>Meeting Room Scheduler</strong>', '<li><a href="meeting-rooms.html" class="dropdown-item"><i class="ph-bold ph-presentation"></i> <div><strong>Meeting Room Scheduler</strong>')
html = html.replace('<li><a href="#solutionFinder" class="dropdown-item"><i class="ph-bold ph-door"></i> <div><strong>Private Cabins</strong>', '<li><a href="coworking-spaces.html" class="dropdown-item"><i class="ph-bold ph-door"></i> <div><strong>Private Cabins</strong>')

# Ecosystem dropdown
html = html.replace('<li><a href="javascript:void(0)" onclick="openCompanyRegModal()" class="dropdown-item"><i class="ph-bold ph-file-text"></i> <div><strong>START: Company Formation</strong>', '<li><a href="company-registration.html" class="dropdown-item"><i class="ph-bold ph-file-text"></i> <div><strong>START: Company Formation</strong>')
html = html.replace('<li><a href="#voConfigurator" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>ESTABLISH: Virtual Office &amp; GST</strong>', '<li><a href="virtual-office.html" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>ESTABLISH: Virtual Office &amp; GST</strong>')
html = html.replace('<li><a href="#solutionFinder" class="dropdown-item"><i class="ph-bold ph-users-three"></i> <div><strong>WORK: Coworking &amp; Cabins</strong>', '<li><a href="coworking-spaces.html" class="dropdown-item"><i class="ph-bold ph-users-three"></i> <div><strong>WORK: Coworking &amp; Cabins</strong>')
html = html.replace('<li><a href="javascript:void(0)" onclick="openGstTrackerModal()" class="dropdown-item"><i class="ph-bold ph-check-square-offset"></i> <div><strong>GROW: GST Status Tracker</strong>', '<li><a href="virtual-office.html#gstTrackerSection" class="dropdown-item"><i class="ph-bold ph-check-square-offset"></i> <div><strong>GROW: GST Status Tracker</strong>')

# Tools dropdown
html = html.replace('<li><a href="#wizard" class="dropdown-item"><i class="ph-bold ph-magic-wand"></i> <div><strong>Business Setup Wizard</strong>', '<li><a href="company-registration.html#wizard" class="dropdown-item"><i class="ph-bold ph-magic-wand"></i> <div><strong>Business Setup Wizard</strong>')
html = html.replace('<li><a href="#pricing" class="dropdown-item"><i class="ph-bold ph-calculator"></i> <div><strong>ROI &amp; Savings Calculator</strong>', '<li><a href="pricing.html" class="dropdown-item"><i class="ph-bold ph-calculator"></i> <div><strong>ROI &amp; Savings Calculator</strong>')
html = html.replace('<li><a href="javascript:void(0)" onclick="openCustomerPortal()" class="dropdown-item"><i class="ph-bold ph-user-circle"></i> <div><strong>Customer Portal</strong>', '<li><a href="portal.html" class="dropdown-item"><i class="ph-bold ph-user-circle"></i> <div><strong>Customer Portal</strong>')

# Main links
html = html.replace('<a href="#locations" class="header-nav__link">Locations</a>', '<a href="locations.html" class="header-nav__link">Locations</a>')
html = html.replace('<a href="#pricing" class="header-nav__link">Pricing</a>', '<a href="pricing.html" class="header-nav__link">Pricing</a>')
html = html.replace('<a href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20a%20workspace%20quote" target="_blank" rel="noopener" class="header-contact-link">', '<a href="contact.html" class="header-contact-link">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated index.html navigation links successfully!')
