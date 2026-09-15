import re

html_path = r"C:\Users\ASUS\Desktop\V-DESK-Workspace\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

hdr_idx = html.find('<header class="site-header')
if hdr_idx == -1:
    hdr_idx = html.find('<header')

hero_comment = '<!-- ====================================================================\n       SECTION 01'
hero_idx = html.find(hero_comment)
if hero_idx == -1:
    hero_idx = html.find('SECTION 01')
    # find comment preceding
    hero_idx = html.rfind('<!--', 0, hero_idx)

print(f"Header start: {hdr_idx}, Hero section start: {hero_idx}")

new_navbar_markup = '''<!-- TOP ANNOUNCEMENT & DIRECT CONTACT UTILITY BAR -->
  <div class="top-utility-bar">
    <div class="container top-utility-container">
      <div class="top-utility-left">
        <span class="utility-badge"><i class="ph-bold ph-shield-check"></i> GST & MCA Compliant</span>
        <span class="utility-text">India's Premier Virtual Office & Business Solutions Network</span>
      </div>
      <div class="top-utility-right">
        <a href="tel:+919876543210" class="top-utility-link"><i class="ph-bold ph-phone-call"></i> +91 98765 43210</a>
        <a href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20assistance" target="_blank" rel="noopener" class="top-utility-link whatsapp-link"><i class="ph-bold ph-whatsapp-logo"></i> WhatsApp</a>
        <button class="top-utility-btn" onclick="openAdminModal()"><i class="ph-bold ph-lock-key"></i> Admin CRM</button>
      </div>
    </div>
  </div>

  <!-- SITE HEADER / NAVBAR -->
  <header class="site-header" id="siteHeader">
    <div class="container header-container">
      <!-- BRAND LOGO -->
      <a href="#top" class="header-logo" aria-label="V-DESK Home">
        <div class="header-logo__emblem-wrap">
          <img src="assets/vdesk-logo.jpg" alt="V-DESK Official Logo" class="header-logo__img" onerror="this.style.display='none'">
        </div>
        <div class="header-logo__text">
          <span class="header-logo__brand">V-DESK</span>
          <span class="header-logo__tagline">Workspace & Consulting</span>
        </div>
      </a>

      <!-- DESKTOP PRIMARY NAVIGATION (10 Required Items) -->
      <nav class="header-nav" id="desktopNav" aria-label="Main Navigation">
        <ul class="header-nav__list">
          <li class="header-nav__item">
            <a href="#top" class="header-nav__link active">Home</a>
          </li>
          
          <!-- WORKSPACES DROPDOWN (Virtual Office, Coworking Spaces, Meeting Rooms, Private Cabins) -->
          <li class="header-nav__item header-nav__item--has-dropdown">
            <a href="#services" class="header-nav__link">Workspaces <i class="ph-bold ph-caret-down"></i></a>
            <ul class="header-nav__dropdown">
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>Virtual Office</strong><span>GST & Business Registration</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-laptop"></i> <div><strong>Coworking Spaces</strong><span>Dedicated & Flex Desks</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-presentation"></i> <div><strong>Meeting Rooms</strong><span>Hourly & Daily Bookings</span></div></a></li>
              <li><a href="#services" class="dropdown-item"><i class="ph-bold ph-door"></i> <div><strong>Private Cabins</strong><span>Secure Executive Cabins</span></div></a></li>
            </ul>
          </li>

          <li class="header-nav__item">
            <a href="#wizard" class="header-nav__link">Business Registration</a>
          </li>
          <li class="header-nav__item">
            <a href="#pricing" class="header-nav__link">Pricing</a>
          </li>
          <li class="header-nav__item">
            <a href="#locations" class="header-nav__link">Locations</a>
          </li>
          <li class="header-nav__item">
            <a href="#knowledge" class="header-nav__link">Resources / Blog</a>
          </li>
          <li class="header-nav__item">
            <a href="#contact" class="header-nav__link">Contact Us</a>
          </li>
        </ul>
      </nav>

      <!-- HEADER ACTIONS -->
      <div class="header-actions">
        <button class="btn btn--outline btn--sm header-btn-consultation" onclick="openConsultationModal()">
          <i class="ph-bold ph-calendar-check"></i> Book Consultation
        </button>
        <button class="btn btn--gold btn--sm header-btn-quote" onclick="openQuoteModal('Navbar Header')">
          <i class="ph-bold ph-paper-plane-tilt"></i> Get Instant Quote
        </button>
        <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle Navigation Menu" aria-expanded="false">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>
      </div>
    </div>
  </header>

  <!-- MOBILE SLIDE-IN DRAWER -->
  <div class="mobile-drawer" id="mobileDrawer" aria-hidden="true">
    <div class="mobile-drawer__overlay" id="mobileDrawerOverlay"></div>
    <div class="mobile-drawer__panel">
      <div class="mobile-drawer__header">
        <div class="mobile-drawer__brand">
          <img src="assets/vdesk-logo.jpg" alt="V-DESK" class="mobile-drawer__logo" onerror="this.style.display='none'">
          <div class="mobile-drawer__brand-text">
            <strong>V-DESK</strong>
            <small>Workspace & Consulting</small>
          </div>
        </div>
        <button class="mobile-drawer__close" id="mobileDrawerClose" aria-label="Close Navigation Menu">
          <i class="ph-bold ph-x"></i>
        </button>
      </div>

      <div class="mobile-drawer__body">
        <nav class="mobile-nav" aria-label="Mobile Navigation">
          <ul class="mobile-nav__list">
            <li><a href="#top" class="mobile-nav__link active"><i class="ph-bold ph-house"></i> Home</a></li>
            <li class="mobile-nav__heading">Workspaces & Solutions</li>
            <li><a href="#services" class="mobile-nav__link"><i class="ph-bold ph-buildings"></i> Virtual Office</a></li>
            <li><a href="#services" class="mobile-nav__link"><i class="ph-bold ph-laptop"></i> Coworking Spaces</a></li>
            <li><a href="#services" class="mobile-nav__link"><i class="ph-bold ph-presentation"></i> Meeting Rooms</a></li>
            <li><a href="#services" class="mobile-nav__link"><i class="ph-bold ph-door"></i> Private Cabins</a></li>
            <li class="mobile-nav__heading">Corporate Services</li>
            <li><a href="#wizard" class="mobile-nav__link"><i class="ph-bold ph-file-text"></i> Business Registration</a></li>
            <li><a href="#pricing" class="mobile-nav__link"><i class="ph-bold ph-tag"></i> Pricing Plans</a></li>
            <li><a href="#locations" class="mobile-nav__link"><i class="ph-bold ph-map-pin"></i> Locations (10+ Cities)</a></li>
            <li><a href="#knowledge" class="mobile-nav__link"><i class="ph-bold ph-book-open"></i> Resources & Blog</a></li>
            <li><a href="#contact" class="mobile-nav__link"><i class="ph-bold ph-envelope"></i> Contact Us</a></li>
          </ul>
        </nav>

        <div class="mobile-drawer__ctas">
          <button class="btn btn--gold btn--full" onclick="openQuoteModal('Mobile Drawer'); closeMobileNav();">
            <i class="ph-bold ph-paper-plane-tilt"></i> Get Instant Quote
          </button>
          <button class="btn btn--outline btn--full" onclick="openConsultationModal(); closeMobileNav();">
            <i class="ph-bold ph-calendar-check"></i> Book Free Consultation
          </button>
          <div class="mobile-drawer__quick-links">
            <a href="tel:+919876543210" class="btn btn--glass btn--sm"><i class="ph-bold ph-phone-call"></i> Call Us</a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener" class="btn btn--glass btn--sm"><i class="ph-bold ph-whatsapp-logo"></i> WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  '''

# Replace slice
updated_html = html[:hdr_idx] + new_navbar_markup + html[hero_idx:]

with open(html_path, "w", encoding="utf-8") as f:
    f.write(updated_html)

print("Desktop index.html updated successfully!")
