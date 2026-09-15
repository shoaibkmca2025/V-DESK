# -*- coding: utf-8 -*-
"""
Script to apply PRD Version 2.0 updates to index.html
"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Original HTML length:", len(html))

# 1. Update Title & Meta
old_title_snippet = '<title>V-DESK &mdash; Business Infrastructure, Reimagined. | Virtual Office, Coworking & Business Solutions</title>'
new_title_snippet = '<title>V-DESK &mdash; Business Infrastructure &amp; Workspace Platform | PRD v2.0</title>'
html = html.replace(old_title_snippet, new_title_snippet)

# 2. Update Top Utility Bar with Client Portal & Quick Action buttons
old_utility_right = '''        <button class="top-utility-btn" onclick="openConsultationModal()"><i class="ph-bold ph-phone"></i> Request Callback</button>
        <button class="top-utility-btn" onclick="openAllLocationsModal()"><i class="ph-bold ph-map-pin"></i> All Locations</button>
        <button class="top-utility-btn" onclick="openAdminModal()"><i class="ph-bold ph-lock-key"></i> Admin CRM</button>'''

new_utility_right = '''        <button class="top-utility-btn" onclick="openCustomerPortal()"><i class="ph-bold ph-user-circle"></i> Client Portal</button>
        <button class="top-utility-btn" onclick="openMeetingBookingModal()"><i class="ph-bold ph-presentation"></i> Book Room</button>
        <button class="top-utility-btn" onclick="openAllLocationsModal()"><i class="ph-bold ph-map-pin"></i> All Locations</button>
        <button class="top-utility-btn" onclick="openAdminSuite()"><i class="ph-bold ph-gear-six"></i> Admin CRM</button>'''

html = html.replace(old_utility_right, new_utility_right)

# 3. Update Header Navigation with direct access to new PRD v2.0 modules
old_nav_items = '''          <!-- WORKSPACES DROPDOWN -->
          <li class="header-nav__item header-nav__item--has-dropdown">
            <a href="#services" class="header-nav__link">Workspaces <i class="ph-bold ph-caret-down"></i></a>
            <ul class="header-nav__dropdown">
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>Virtual Office</strong><span>GST & Business Registration</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-laptop"></i> <div><strong>Coworking Spaces</strong><span>Dedicated & Flex Desks</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-presentation"></i> <div><strong>Meeting Rooms</strong><span>Hourly & Daily Bookings</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-door"></i> <div><strong>Private Cabins</strong><span>Secure Executive Cabins</span></div></a></li>
            </ul>
          </li>

          <!-- BUSINESS SERVICES DROPDOWN -->
          <li class="header-nav__item header-nav__item--has-dropdown">
            <a href="#wizard" class="header-nav__link">Business Services <i class="ph-bold ph-caret-down"></i></a>
            <ul class="header-nav__dropdown">
              <li><a href="#wizard" class="dropdown-item"><i class="ph-bold ph-file-text"></i> <div><strong>Company Registration</strong><span>Pvt Ltd, LLP, OPC Incorporation</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-certificate"></i> <div><strong>GST Registration</strong><span>PPOB & Multi-State APOB</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-trademark"></i> <div><strong>Trademark Protection</strong><span>Search, Filing & Class Support</span></div></a></li>
            </ul>
          </li>'''

new_nav_items = '''          <!-- WORKSPACES DROPDOWN -->
          <li class="header-nav__item header-nav__item--has-dropdown">
            <a href="#solutionFinder" class="header-nav__link">Workspaces <i class="ph-bold ph-caret-down"></i></a>
            <ul class="header-nav__dropdown">
              <li><a href="#voConfigurator" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>Virtual Office Platform</strong><span>Custom Setup &amp; Pricing</span></div></a></li>
              <li><a href="#solutionFinder" class="dropdown-item"><i class="ph-bold ph-laptop"></i> <div><strong>Workspace Marketplace</strong><span>Coworking, Cabins &amp; Desks</span></div></a></li>
              <li><a href="javascript:void(0)" onclick="openMeetingBookingModal()" class="dropdown-item"><i class="ph-bold ph-presentation"></i> <div><strong>Meeting Room Scheduler</strong><span>Hourly / Daily State Machine</span></div></a></li>
              <li><a href="#solutionFinder" class="dropdown-item"><i class="ph-bold ph-door"></i> <div><strong>Private Cabins</strong><span>Secure Executive Suites</span></div></a></li>
            </ul>
          </li>

          <!-- BUSINESS SERVICES DROPDOWN -->
          <li class="header-nav__item header-nav__item--has-dropdown">
            <a href="#journey" class="header-nav__link">Ecosystem <i class="ph-bold ph-caret-down"></i></a>
            <ul class="header-nav__dropdown">
              <li><a href="javascript:void(0)" onclick="openCompanyRegModal()" class="dropdown-item"><i class="ph-bold ph-file-text"></i> <div><strong>START: Company Formation</strong><span>Pvt Ltd, LLP, OPC, Sec 8</span></div></a></li>
              <li><a href="#voConfigurator" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>ESTABLISH: Virtual Office &amp; GST</strong><span>100% Tax &amp; MCA Approval</span></div></a></li>
              <li><a href="#solutionFinder" class="dropdown-item"><i class="ph-bold ph-users-three"></i> <div><strong>WORK: Coworking &amp; Cabins</strong><span>50+ Grade-A Commercial Hubs</span></div></a></li>
              <li><a href="javascript:void(0)" onclick="openGstTrackerModal()" class="dropdown-item"><i class="ph-bold ph-check-square-offset"></i> <div><strong>GROW: GST Status Tracker</strong><span>Real-Time ARN Step Tracker</span></div></a></li>
            </ul>
          </li>

          <!-- TOOLS DROPDOWN -->
          <li class="header-nav__item header-nav__item--has-dropdown">
            <a href="#pricing" class="header-nav__link">Interactive Tools <i class="ph-bold ph-caret-down"></i></a>
            <ul class="header-nav__dropdown">
              <li><a href="#wizard" class="dropdown-item"><i class="ph-bold ph-magic-wand"></i> <div><strong>Business Setup Wizard</strong><span>6-Step Recommendation</span></div></a></li>
              <li><a href="#pricing" class="dropdown-item"><i class="ph-bold ph-calculator"></i> <div><strong>ROI &amp; Savings Calculator</strong><span>Traditional Lease vs V-DESK</span></div></a></li>
              <li><a href="javascript:void(0)" onclick="openDigitalKycModal()" class="dropdown-item"><i class="ph-bold ph-fingerprint"></i> <div><strong>Digital KYC Portal</strong><span>Self-Service Verification</span></div></a></li>
              <li><a href="javascript:void(0)" onclick="openCustomerPortal()" class="dropdown-item"><i class="ph-bold ph-user-circle"></i> <div><strong>Customer Portal</strong><span>Active Services &amp; Renewals</span></div></a></li>
            </ul>
          </li>'''

html = html.replace(old_nav_items, new_nav_items)

# 4. In Header Actions: Add quick trigger for Universal Search & Customer Portal
old_header_actions = '''        <button class="header-search-trigger" onclick="openCommandPalette()" aria-label="Quick Search">
          <i class="ph-bold ph-magnifying-glass"></i>
          <span class="search-label">Quick Search</span>
          <kbd class="search-kbd">⌘K</kbd>
        </button>

        <a href="https://wa.me/919876543210?text=Hi%20V-DESK" target="_blank" rel="noopener" class="header-whatsapp-btn" aria-label="Chat on WhatsApp">
          <i class="ph-bold ph-whatsapp-logo"></i>
        </a>

        <button class="btn btn--primary btn--header" onclick="openQuoteModal('Header CTA')">
          <i class="ph-bold ph-paper-plane-tilt"></i> Get Instant Quote
        </button>'''

new_header_actions = '''        <button class="header-search-trigger" onclick="openCommandPalette()" aria-label="Universal Search (Ctrl+K)">
          <i class="ph-bold ph-magnifying-glass"></i>
          <span class="search-label">Search (Ctrl+K)</span>
          <kbd class="search-kbd">⌘K</kbd>
        </button>

        <button class="header-portal-btn" onclick="openCustomerPortal()" aria-label="Client Portal" title="Self-Service Portal">
          <i class="ph-bold ph-user-circle"></i>
          <span>Portal</span>
        </button>

        <a href="https://wa.me/919876543210?text=Hi%20V-DESK%20Team,%20I%20am%20looking%20for%20business%20infrastructure" target="_blank" rel="noopener" class="header-whatsapp-btn" aria-label="Chat on WhatsApp" title="WhatsApp Concierge">
          <i class="ph-bold ph-whatsapp-logo"></i>
        </a>

        <button class="btn btn--primary btn--header" onclick="openQuoteModal('Header CTA')">
          <i class="ph-bold ph-paper-plane-tilt"></i> Get Quote
        </button>'''

html = html.replace(old_header_actions, new_header_actions)

# 5. Overhaul Hero Slide 1 with PRD v2.0 P0 Universal Hero Search
# Find heroSlide1 block and replace with the PRD v2.0 Universal Search hero
hero_pattern = r'<div class="hero-rmc__slide" id="heroSlide1">([\s\S]*?)(?=<div class="hero-rmc__slide" id="heroSlide2">)'

new_hero_slide1 = '''<div class="hero-rmc__slide hero-slide--v2" id="heroSlide1">
        <div class="hero-rmc__pill">
          <span class="pill-dot"></span>
          <span class="pill-text">BUSINESS INFRASTRUCTURE &amp; WORKSPACE PLATFORM</span>
          <span class="pill-badge">PRD v2.0</span>
        </div>

        <h1 class="hero-rmc__title">
          YOUR BUSINESS<br>
          <span class="highlight-gold">DESERVES A BETTER ADDRESS.</span>
        </h1>

        <p class="hero-rmc__desc">
          Flexible workspaces and business infrastructure built around your growth. Search a city, workspace or business requirement to begin.
        </p>

        <!-- ================================================================
             P0 — UNIVERSAL HERO SEARCH CONSOLE (PRD Sec 8, 9, 10, 11, 12, 13)
             ================================================================ -->
        <div class="hero-universal-search-container" id="heroUniversalSearch">
          <div class="universal-search-card">
            <div class="universal-search__top-row">
              <label for="universalHeroInput" class="universal-search__prompt">
                <i class="ph-bold ph-sparkle" style="color: var(--vd-gold-primary);"></i>
                <span>What are you looking for?</span>
              </label>
              <span class="universal-search__kbd-badge">
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
              </span>
            </div>

            <form class="universal-search__form" id="heroSearchForm" onsubmit="handleHeroUniversalSubmit(event)">
              <div class="universal-search__input-wrapper">
                <i class="ph-bold ph-magnifying-glass universal-search__lens"></i>
                <input 
                  type="text" 
                  id="universalHeroInput" 
                  class="universal-search__field" 
                  placeholder="Search a city, workspace or business requirement (e.g. Virtual Office in Mumbai, Office for 8 in Gurgaon)..." 
                  autocomplete="off" 
                  spellcheck="false"
                  oninput="handleHeroSearchInput(this.value)"
                  onfocus="handleHeroSearchFocus()"
                >
                <button type="button" class="universal-search__clear-btn" id="heroSearchClearBtn" onclick="clearHeroSearch()" style="display:none;" aria-label="Clear Search">
                  <i class="ph-bold ph-x"></i>
                </button>
              </div>
              <button type="submit" class="universal-search__action-btn" id="heroSearchActionBtn">
                <span>Search</span>
                <i class="ph-bold ph-arrow-right"></i>
              </button>
            </form>

            <!-- Real-Time Natural Language Intent Banner -->
            <div class="universal-search__intent-banner" id="heroIntentBanner" style="display: none;">
              <div class="intent-banner__left">
                <span class="intent-pulse"></span>
                <span class="intent-badge-label">AI Intent Parser:</span>
                <strong class="intent-parsed-text" id="heroIntentText">Intent: Virtual Office &bull; Location: Mumbai</strong>
              </div>
              <button type="button" class="intent-banner__btn" onclick="executeCurrentHeroIntent()">
                <span>View Filtered Results</span>
                <i class="ph-bold ph-arrow-circle-right"></i>
              </button>
            </div>

            <!-- Autocomplete & Suggestions Dropdown Panel -->
            <div class="universal-search__dropdown" id="heroSearchDropdown" style="display: none;">
              <div class="dropdown-columns">
                <div class="dropdown-col">
                  <div class="dropdown-col__title"><i class="ph-bold ph-fire"></i> Popular Searches</div>
                  <ul class="dropdown-list" id="heroPopularSearchesList">
                    <li onclick="runSuggestedQuery('Virtual Office in Mumbai')"><i class="ph-bold ph-buildings"></i> Virtual Office in Mumbai</li>
                    <li onclick="runSuggestedQuery('Coworking in Nashik')"><i class="ph-bold ph-laptop"></i> Coworking in Nashik</li>
                    <li onclick="runSuggestedQuery('Private Office in Gurgaon')"><i class="ph-bold ph-door"></i> Private Office in Gurgaon</li>
                    <li onclick="runSuggestedQuery('Meeting room for 10 people')"><i class="ph-bold ph-presentation"></i> Meeting room for 10 people</li>
                    <li onclick="runSuggestedQuery('GST registration')"><i class="ph-bold ph-certificate"></i> GST Registration</li>
                  </ul>
                </div>

                <div class="dropdown-col">
                  <div class="dropdown-col__title"><i class="ph-bold ph-map-pin"></i> Top Locations</div>
                  <ul class="dropdown-list" id="heroLocationsList">
                    <li onclick="runSuggestedQuery('Mumbai BKC')"><i class="ph-bold ph-map-pin-line"></i> Mumbai &mdash; BKC</li>
                    <li onclick="runSuggestedQuery('Mumbai Andheri')"><i class="ph-bold ph-map-pin-line"></i> Mumbai &mdash; Andheri</li>
                    <li onclick="runSuggestedQuery('Delhi Connaught Place')"><i class="ph-bold ph-map-pin-line"></i> Delhi &mdash; Connaught Place</li>
                    <li onclick="runSuggestedQuery('Bangalore Koramangala')"><i class="ph-bold ph-map-pin-line"></i> Bangalore &mdash; Koramangala</li>
                    <li onclick="runSuggestedQuery('Nashik College Road')"><i class="ph-bold ph-map-pin-line"></i> Nashik &mdash; College Road HQ</li>
                  </ul>
                </div>

                <div class="dropdown-col">
                  <div class="dropdown-col__title"><i class="ph-bold ph-squares-four"></i> Solutions &amp; Services</div>
                  <ul class="dropdown-list" id="heroSolutionsList">
                    <li onclick="runSuggestedQuery('Virtual Office')"><i class="ph-bold ph-buildings"></i> Virtual Office for GST</li>
                    <li onclick="runSuggestedQuery('Coworking Space')"><i class="ph-bold ph-laptop"></i> Dedicated Coworking</li>
                    <li onclick="runSuggestedQuery('Private Office')"><i class="ph-bold ph-door"></i> Private Executive Cabins</li>
                    <li onclick="runSuggestedQuery('Meeting Room')"><i class="ph-bold ph-presentation"></i> 4K Boardrooms &amp; Huddle</li>
                    <li onclick="runSuggestedQuery('Company Registration')"><i class="ph-bold ph-file-text"></i> Pvt Ltd / LLP Incorporation</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- POPULAR SEARCH CHIPS (PRD Sec 13) -->
            <div class="universal-search__chips-area">
              <div class="chips-subgroup">
                <span class="chips-caption"><i class="ph-bold ph-map-pin"></i> Locations:</span>
                <div class="chips-flex">
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Mumbai')">Mumbai</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Delhi')">Delhi</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Nashik')">Nashik</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Bangalore')">Bangalore</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Gurgaon')">Gurgaon</button>
                </div>
              </div>

              <div class="chips-subgroup">
                <span class="chips-caption"><i class="ph-bold ph-squares-four"></i> Solutions:</span>
                <div class="chips-flex">
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Virtual Office')">Virtual Office</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Coworking')">Coworking</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Private Office')">Private Office</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Meeting Rooms')">Meeting Rooms</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('GST')">GST</button>
                  <button type="button" class="hero-chip" onclick="quickChipSearch('Company Setup')">Company Setup</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Indicators Strip (PRD Sec 22) -->
        <div class="hero-white__trust-row" style="margin-top: 24px;">
          <div class="hero-trust-item">
            <i class="ph-bold ph-shield-check"></i>
            <div>
              <strong>100% Tax &amp; MCA Verified</strong>
              <span>Registered Deeds, NOC &amp; Bills</span>
            </div>
          </div>
          <div class="hero-trust-divider"></div>
          <div class="hero-trust-item">
            <i class="ph-bold ph-lightning"></i>
            <div>
              <strong>Same-Day Activation</strong>
              <span>Sub-24h Agreement Issuance</span>
            </div>
          </div>
          <div class="hero-trust-divider"></div>
          <div class="hero-trust-item">
            <i class="ph-bold ph-buildings"></i>
            <div>
              <strong>10+ Commercial Metros</strong>
              <span>50+ Grade-A Commercial Towers</span>
            </div>
          </div>
          <div class="hero-trust-divider"></div>
          <div class="hero-trust-item">
            <i class="ph-bold ph-user-check"></i>
            <div>
              <strong>Digital KYC &amp; Self-Service</strong>
              <span>Customer Portal &amp; Renewals</span>
            </div>
          </div>
        </div>

        <div class="hero-rmc__badges" style="margin-top: 18px;">
          <span class="slide-badge"><i class="ph-bold ph-seal-check"></i> 100% MCA Verified</span>
          <span class="slide-badge-dot">&middot;</span>
          <span class="slide-badge"><i class="ph-bold ph-lightning"></i> Same-Day Activation</span>
          <span class="slide-badge-dot">&middot;</span>
          <span class="slide-badge"><i class="ph-bold ph-buildings"></i> 50+ Grade-A Hubs</span>
          <span class="slide-badge-dot">&middot;</span>
          <span class="slide-badge"><i class="ph-bold ph-currency-inr"></i> Zero Brokerage</span>
        </div>
      </div>
      '''

html = re.sub(hero_pattern, new_hero_slide1, html, count=1)

print("Applied Hero Section update successfully!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
