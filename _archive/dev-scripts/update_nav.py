import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

# 1. Update index.html
def update_html(dir_path):
    html_file = os.path.join(dir_path, "index.html")
    if not os.path.exists(html_file):
        print(f"File not found: {html_file}")
        return
    with open(html_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Define modern, complete, 10-item navigation header
    new_header = '''  <!-- TOP ANNOUNCEMENT & DIRECT CONTACT UTILITY BAR -->
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
      <a href="#home" class="header-logo" aria-label="V-DESK Home">
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
            <a href="#home" class="header-nav__link active">Home</a>
          </li>
          
          <!-- WORKSPACE SERVICES MEGA/DROPDOWN -->
          <li class="header-nav__item header-nav__item--has-dropdown">
            <a href="#services" class="header-nav__link">Workspaces <i class="ph-bold ph-caret-down"></i></a>
            <ul class="header-nav__dropdown">
              <li><a href="#virtual-office" class="dropdown-item"><i class="ph-bold ph-buildings"></i> <div><strong>Virtual Office</strong><span>GST & Business Registration</span></div></a></li>
              <li><a href="#coworking" class="dropdown-item"><i class="ph-bold ph-laptop"></i> <div><strong>Coworking Spaces</strong><span>Dedicated & Flex Desks</span></div></a></li>
              <li><a href="#meeting-rooms" class="dropdown-item"><i class="ph-bold ph-presentation"></i> <div><strong>Meeting Rooms</strong><span>Hourly & Daily Bookings</span></div></a></li>
              <li><a href="#private-cabins" class="dropdown-item"><i class="ph-bold ph-door"></i> <div><strong>Private Cabins</strong><span>Secure Executive Cabins</span></div></a></li>
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
        <button class="btn btn--gold btn--sm header-btn-quote" onclick="openQuoteModal()">
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
            <li><a href="#home" class="mobile-nav__link active"><i class="ph-bold ph-house"></i> Home</a></li>
            <li class="mobile-nav__heading">Workspaces & Solutions</li>
            <li><a href="#virtual-office" class="mobile-nav__link"><i class="ph-bold ph-buildings"></i> Virtual Office</a></li>
            <li><a href="#coworking" class="mobile-nav__link"><i class="ph-bold ph-laptop"></i> Coworking Spaces</a></li>
            <li><a href="#meeting-rooms" class="mobile-nav__link"><i class="ph-bold ph-presentation"></i> Meeting Rooms</a></li>
            <li><a href="#private-cabins" class="mobile-nav__link"><i class="ph-bold ph-door"></i> Private Cabins</a></li>
            <li class="mobile-nav__heading">Corporate Services</li>
            <li><a href="#wizard" class="mobile-nav__link"><i class="ph-bold ph-file-text"></i> Business Registration</a></li>
            <li><a href="#pricing" class="mobile-nav__link"><i class="ph-bold ph-tag"></i> Pricing Plans</a></li>
            <li><a href="#locations" class="mobile-nav__link"><i class="ph-bold ph-map-pin"></i> Locations (10+ Cities)</a></li>
            <li><a href="#knowledge" class="mobile-nav__link"><i class="ph-bold ph-book-open"></i> Resources & Blog</a></li>
            <li><a href="#contact" class="mobile-nav__link"><i class="ph-bold ph-envelope"></i> Contact Us</a></li>
          </ul>
        </nav>

        <div class="mobile-drawer__ctas">
          <button class="btn btn--gold btn--full" onclick="openQuoteModal(); closeMobileNav();">
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
  </div>'''

    # Match existing header and mobile-drawer
    pattern = r'<!-- TOP ANNOUNCEMENT.*?<!-- MOBILE SLIDE-IN DRAWER.*?</div>\s*</div>\s*</div>'
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        content = content[:match.start()] + new_header + content[match.end():]
        print(f"Replaced header in {html_file} via regex match.")
    else:
        # Fallback: match <header ... </header> and mobile-drawer
        hdr_pat = r'<header class="site-header".*?</header>'
        m_hdr = re.search(hdr_pat, content, flags=re.DOTALL)
        if m_hdr:
            drawer_pat = r'<div class="mobile-drawer".*?</div>\s*</div>\s*</div>'
            m_drw = re.search(drawer_pat, content, flags=re.DOTALL)
            if m_drw and m_drw.start() > m_hdr.end():
                content = content[:m_hdr.start()] + new_header + content[m_drw.end():]
                print(f"Replaced header and drawer in {html_file} via separate search.")
            else:
                content = content[:m_hdr.start()] + new_header + content[m_hdr.end():]
                print(f"Replaced header only in {html_file}.")

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {html_file} successfully.")

# 2. Update styles.css
def update_css(dir_path):
    css_file = os.path.join(dir_path, "styles.css")
    if not os.path.exists(css_file):
        print(f"File not found: {css_file}")
        return
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()

    nav_css_block = '''
/* ==========================================================================
   V-DESK EXECUTIVE NAVBAR & UTILITY BAR (STRICT BRAND THEME)
   ========================================================================== */

/* Top Utility Bar */
.top-utility-bar {
  background: #040e20;
  border-bottom: 1px solid rgba(197, 146, 57, 0.15);
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
  padding: 6px 0;
  position: relative;
  z-index: 101;
}

.top-utility-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}

.top-utility-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.utility-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(197, 146, 57, 0.15);
  color: #c59239;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid rgba(197, 146, 57, 0.3);
  letter-spacing: 0.02em;
}

.utility-text {
  color: rgba(255, 255, 255, 0.65);
}

.top-utility-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.top-utility-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.top-utility-link:hover {
  color: #c59239;
}

.top-utility-link.whatsapp-link {
  color: #25d366;
}

.top-utility-link.whatsapp-link:hover {
  color: #3bf17e;
}

.top-utility-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.top-utility-btn:hover {
  border-color: #c59239;
  color: #c59239;
  background: rgba(197, 146, 57, 0.08);
}

/* Site Header Main Navigation */
.site-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(6, 21, 47, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(197, 146, 57, 0.18);
  z-index: 100;
  transition: all 0.3s ease;
}

.site-header.is-scrolled {
  background: rgba(4, 14, 32, 0.98);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-bottom-color: rgba(197, 146, 57, 0.3);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1320px;
  margin: 0 auto;
  padding: 12px 24px;
  gap: 20px;
}

/* Brand Logo with Official Emblem */
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
}

.header-logo__emblem-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #0b1a30;
  border: 1.5px solid #c59239;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(197, 146, 57, 0.2);
}

.header-logo__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.header-logo__text {
  display: flex;
  flex-direction: column;
}

.header-logo__brand {
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #ffffff;
  line-height: 1.1;
  text-transform: uppercase;
  background: linear-gradient(135deg, #ffffff 40%, #e2b96e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-logo__tagline {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #c59239;
  font-weight: 600;
}

/* Nav Menu */
.header-nav {
  display: flex;
  align-items: center;
}

.header-nav__list {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.header-nav__item {
  position: relative;
}

.header-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.88rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.header-nav__link:hover,
.header-nav__link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.header-nav__link i {
  font-size: 0.75rem;
  color: #c59239;
  transition: transform 0.2s ease;
}

/* Dropdown Menu for Workspaces */
.header-nav__item--has-dropdown:hover .header-nav__dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.header-nav__item--has-dropdown:hover .header-nav__link i {
  transform: rotate(180deg);
}

.header-nav__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 280px;
  background: #081d40;
  border: 1px solid rgba(197, 146, 57, 0.25);
  border-radius: 12px;
  padding: 8px;
  list-style: none;
  margin-top: 8px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 110;
}

.dropdown-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #ffffff;
}

.dropdown-item i {
  font-size: 1.25rem;
  color: #c59239;
  margin-top: 2px;
}

.dropdown-item strong {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
}

.dropdown-item span {
  display: block;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.dropdown-item:hover {
  background: rgba(197, 146, 57, 0.12);
}

.dropdown-item:hover strong {
  color: #c59239;
}

/* Header CTAs */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn--gold {
  background: linear-gradient(135deg, #d4a348 0%, #c59239 100%);
  color: #06152f !important;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 14px rgba(197, 146, 57, 0.35);
  transition: all 0.25s ease;
}

.btn--gold:hover {
  background: linear-gradient(135deg, #e2b96e 0%, #d4a348 100%);
  box-shadow: 0 6px 20px rgba(197, 146, 57, 0.5);
  transform: translateY(-1px);
}

.btn--outline {
  background: transparent;
  color: #ffffff !important;
  border: 1px solid rgba(197, 146, 57, 0.4);
  font-weight: 600;
  transition: all 0.25s ease;
}

.btn--outline:hover {
  background: rgba(197, 146, 57, 0.12);
  border-color: #c59239;
  color: #c59239 !important;
}

.btn--sm {
  padding: 8px 16px;
  font-size: 0.84rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* Hamburger Toggle */
.mobile-nav-toggle {
  display: none;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
}

.hamburger-bar {
  display: block;
  width: 22px;
  height: 2px;
  background: #ffffff;
  transition: all 0.3s ease;
  border-radius: 2px;
}

/* Mobile Slide-in Drawer */
.mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 999;
  visibility: hidden;
  transition: visibility 0.3s ease;
}

.mobile-drawer.is-active {
  visibility: visible;
}

.mobile-drawer__overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 8, 20, 0.7);
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-drawer.is-active .mobile-drawer__overlay {
  opacity: 1;
}

.mobile-drawer__panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 85%;
  max-width: 380px;
  height: 100%;
  background: #06152f;
  border-left: 1px solid rgba(197, 146, 57, 0.25);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
}

.mobile-drawer.is-active .mobile-drawer__panel {
  transform: translateX(0);
}

.mobile-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mobile-drawer__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-drawer__logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #c59239;
  object-fit: cover;
}

.mobile-drawer__brand-text strong {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  color: #ffffff;
  letter-spacing: 0.05em;
}

.mobile-drawer__brand-text small {
  display: block;
  font-size: 0.65rem;
  color: #c59239;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.mobile-drawer__close {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
}

.mobile-drawer__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mobile-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-nav__heading {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #c59239;
  padding: 12px 10px 4px;
  font-weight: 700;
}

.mobile-nav__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-nav__link:hover,
.mobile-nav__link.active {
  background: rgba(197, 146, 57, 0.12);
  color: #ffffff;
}

.mobile-nav__link i {
  font-size: 1.1rem;
  color: #c59239;
}

.mobile-drawer__ctas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.btn--full {
  width: 100%;
  justify-content: center;
}

.mobile-drawer__quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 8px;
}

.btn--glass {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.82rem;
}

/* Responsive Breakpoints */
@media (max-width: 1140px) {
  .header-nav {
    display: none;
  }
  .mobile-nav-toggle {
    display: flex;
  }
  .header-btn-consultation {
    display: none;
  }
}

@media (max-width: 768px) {
  .top-utility-left .utility-text {
    display: none;
  }
  .header-btn-quote {
    padding: 6px 12px;
    font-size: 0.78rem;
  }
}
'''

    # Check if top-utility-bar is already present, if so replace or append
    if '.top-utility-bar' in css:
        pattern = r'/\* =+ \s* V-DESK EXECUTIVE NAVBAR.*?(?=(/\* =+|$))'
        m = re.search(pattern, css, flags=re.DOTALL)
        if m:
            css = css[:m.start()] + nav_css_block + css[m.end():]
            print(f"Replaced existing navbar CSS in {css_file}")
        else:
            css += "\n" + nav_css_block
            print(f"Appended navbar CSS to {css_file}")
    else:
        css += "\n" + nav_css_block
        print(f"Appended navbar CSS to {css_file}")

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)
    print(f"Updated {css_file} successfully.")

# Run updates for both Desktop and Scratch directory
update_html(desktop_dir)
update_css(desktop_dir)

update_html(scratch_dir)
update_css(scratch_dir)
print("All navbar updates applied successfully.")
