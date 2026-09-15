import re

# 1. Verify index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check key elements in HTML
checks_html = [
    'heroUniversalSearch',
    'universalHeroInput',
    'heroIntentBanner',
    'heroSearchDropdown',
    'voConfigurator',
    'meetingRoomsSection',
    'gstTrackerSection',
    'universalSearchResultsModal',
    'meetingRoomBookingModal',
    'customerPortalModal',
    'digitalKycModal',
    'quoteProposalModal',
    'paymentCheckoutModal',
    'adminSuiteModal',
    'companyRegModal',
    'mobile-app-bottom-dock'
]

print("=== HTML ELEMENT VERIFICATION ===")
for chk in checks_html:
    found = chk in html
    print(f"  [{'PASS' if found else 'FAIL'}] {chk}")

# 2. Verify app.js functions
with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

checks_js = [
    'parseSearchIntent',
    'handleHeroSearchInput',
    'clearHeroSearch',
    'quickChipSearch',
    'executeSearchQuery',
    'openUniversalSearchResults',
    'filterExplorerResults',
    'handleVoCityChange',
    'updateVoDynamicPrice',
    'openMeetingBookingModal',
    'handleRoomBookingHold',
    'lookupGstTrackerStatus',
    'openCustomerPortal',
    'openDigitalKycModal',
    'openCheckoutModal',
    'openAdminSuite',
    'switchAdminTab',
    'switchMobileNav',
    'trackSearchEvent'
]

print("\n=== JS FUNCTION VERIFICATION ===")
for chk in checks_js:
    found = chk in js
    print(f"  [{'PASS' if found else 'FAIL'}] {chk}")
