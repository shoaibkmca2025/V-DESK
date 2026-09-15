import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

# =========================================================================
# 1. NEW WHITE HERO SECTION MARKUP
# =========================================================================
white_hero_html = '''  <!-- ====================================================================
       SECTION 01 — SOPHISTICATED WHITE HERO SECTION
       Executive White Canvas with Deep Navy Authority & Gold Accents
       ==================================================================== -->
  <section class="hero-white" id="home">
    <div class="hero-white__bg">
      <div class="hero-white__cream-gradient"></div>
      <div class="hero-white__grid-pattern"></div>
    </div>

    <div class="container hero-white__container">
      <div class="hero-white__grid">
        
        <!-- Left: Editorial Typography & Conversion Engine -->
        <div class="hero-white__content">
          <div class="hero-white__pill">
            <span class="pill-dot"></span>
            <span class="pill-text">V-DESK WORKSPACE & CONSULTING LLP</span>
            <span class="pill-badge">GST & MCA Verified</span>
          </div>

          <h1 class="hero-white__headline">
            India's Trusted <span class="highlight-gold">Virtual Office</span> & Business <span class="highlight-gold">Solutions</span> Partner.
          </h1>

          <p class="hero-white__subtitle">
            Premium corporate addresses, on-demand meeting rooms, dedicated coworking, and complete business registration infrastructure across 10+ prime commercial hubs.
          </p>

          <div class="hero-white__ctas">
            <button class="btn btn--primary btn--lg" onclick="openQuoteModal('Hero Primary Quote')">
              <i class="ph-bold ph-paper-plane-tilt"></i> Get Instant Quote
            </button>
            <button class="btn btn--secondary btn--lg" onclick="openConsultationModal()">
              <i class="ph-bold ph-calendar-check"></i> Book Free Consultation
            </button>
            <a href="#locations" class="hero-white__link">
              <i class="ph-bold ph-map-pin"></i> View Locations <i class="ph-bold ph-arrow-right"></i>
            </a>
          </div>

          <!-- Trust Badges Strip -->
          <div class="hero-white__trust-row">
            <div class="hero-trust-item">
              <i class="ph-bold ph-shield-check"></i>
              <div>
                <strong>100% Verified</strong>
                <span>Tax & MCA NOC Guarantee</span>
              </div>
            </div>
            <div class="hero-trust-divider"></div>
            <div class="hero-trust-item">
              <i class="ph-bold ph-lightning"></i>
              <div>
                <strong>Same-Day</strong>
                <span>Activation & Agreements</span>
              </div>
            </div>
            <div class="hero-trust-divider"></div>
            <div class="hero-trust-item">
              <i class="ph-bold ph-buildings"></i>
              <div>
                <strong>10+ Cities</strong>
                <span>50+ Grade-A Hubs</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Premium Architectural Workspace Showcase -->
        <div class="hero-white__showcase">
          <div class="showcase-card">
            <div class="showcase-card__frame">
              <video 
                class="showcase-card__video" 
                src="assets/vdesk-hero-video.mp4" 
                autoplay 
                muted 
                loop 
                playsinline
                poster="assets/vdesk-logo.jpg"
              ></video>
              <div class="showcase-card__gradient-veil"></div>
              <div class="showcase-card__gold-edge"></div>
            </div>

            <!-- Floating Architectural Badge: Top Right -->
            <div class="floating-badge floating-badge--top">
              <div class="floating-badge__icon"><i class="ph-bold ph-check-circle"></i></div>
              <div class="floating-badge__text">
                <span class="badge-title">Zero Brokerage</span>
                <span class="badge-sub">Direct Grade-A Pricing</span>
              </div>
            </div>

            <!-- Floating Architectural Badge: Bottom Left -->
            <div class="floating-badge floating-badge--bottom">
              <div class="floating-badge__icon"><i class="ph-bold ph-users-three"></i></div>
              <div class="floating-badge__text">
                <span class="badge-title">10,000+ Founders</span>
                <span class="badge-sub">Incorporated & Scaled</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>'''

# =========================================================================
# 2. MASTER WHITE THEME CSS OVERHAUL
# =========================================================================
master_white_css = '''/* ==========================================================================
   V-DESK WORKSPACE & CONSULTING LLP — MASTER WHITE THEME
   EXACT PALETTE IMPLEMENTATION
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CORE PALETTE & DESIGN SYSTEM TOKENS
   -------------------------------------------------------------------------- */
:root {
  /* Exact Specified Palette */
  --vd-bg-primary: #FFFFFF;     /* White (65–75% Dominant Canvas) */
  --vd-bg-secondary: #FAF8F3;   /* Secondary Background */
  --vd-cream-soft: #F5EFE3;     /* Soft Cream (5–10% Supporting Warmth) */
  --vd-navy-deep: #0B2348;      /* Deep Navy (15–20% Brand/Authority) */
  --vd-navy-dark: #071A36;      /* Dark Navy */
  --vd-gold-primary: #C8922E;   /* Primary Gold (5–8% Premium Accent) */
  --vd-gold-light: #D9B56A;     /* Light Gold */
  --vd-text-body: #26344A;      /* Body Text */
  --vd-border-soft: #E8E2D8;    /* Soft Border */
  --vd-text-muted: #687386;     /* Muted Text */

  /* Aliases for Existing Components */
  --vd-black: #0B2348;
  --vd-white: #FFFFFF;
  --vd-accent: #C8922E;
  --vd-accent-hover: #D9B56A;
  --vd-accent-glow: rgba(200, 146, 46, 0.25);
  --vd-slate: #FAF8F3;
  --vd-slate-light: #F5EFE3;

  /* Typography */
  --font-display: 'Cinzel', 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Layout */
  --container-max: 1320px;
  --header-height: 80px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-subtle: 0 4px 20px rgba(11, 35, 72, 0.05);
  --shadow-card: 0 8px 30px rgba(11, 35, 72, 0.06);
  --shadow-hover: 0 16px 40px rgba(11, 35, 72, 0.1);
  --shadow-gold: 0 0 20px rgba(200, 146, 46, 0.2);

  /* Transitions */
  --transition-fast: 200ms ease;
  --transition-smooth: 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* --------------------------------------------------------------------------
   2. GLOBAL RESETS & FOUNDATION
   -------------------------------------------------------------------------- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--vd-text-body);
  background-color: var(--vd-bg-primary);
  scroll-behavior: smooth;
  scroll-padding-top: var(--header-height);
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
  background-color: var(--vd-bg-primary);
  color: var(--vd-text-body);
  line-height: 1.6;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 24px;
}

/* Typography Hierarchy */
h1, h2, h3, h4, h5, h6 {
  color: var(--vd-navy-deep);
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.2;
}

p {
  color: var(--vd-text-body);
}

a {
  color: var(--vd-navy-deep);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--vd-gold-primary);
}

.text-gold {
  color: var(--vd-gold-primary) !important;
}

.highlight-gold {
  color: var(--vd-gold-primary);
  font-weight: 700;
}

/* --------------------------------------------------------------------------
   3. BUTTON SYSTEM (STRICT SPECIFICATION)
   -------------------------------------------------------------------------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 22px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-smooth);
  white-space: nowrap;
}

/* Primary Button: Navy background + White text. Hover: Gold background + Navy text */
.btn--primary, .btn--gold {
  background-color: var(--vd-navy-deep) !important;
  color: #FFFFFF !important;
  border-color: var(--vd-navy-deep) !important;
  box-shadow: 0 4px 14px rgba(11, 35, 72, 0.15) !important;
}

.btn--primary:hover, .btn--gold:hover {
  background-color: var(--vd-gold-primary) !important;
  color: var(--vd-navy-deep) !important;
  border-color: var(--vd-gold-primary) !important;
  box-shadow: 0 6px 20px rgba(200, 146, 46, 0.3) !important;
  transform: translateY(-2px);
}

/* Secondary Button: White background + Navy border + Navy text. Hover: Navy background + White text */
.btn--secondary, .btn--outline {
  background-color: #FFFFFF !important;
  color: var(--vd-navy-deep) !important;
  border-color: var(--vd-navy-deep) !important;
}

.btn--secondary:hover, .btn--outline:hover {
  background-color: var(--vd-navy-deep) !important;
  color: #FFFFFF !important;
  border-color: var(--vd-navy-deep) !important;
  transform: translateY(-2px);
}

.btn--sm {
  padding: 8px 16px;
  font-size: 0.82rem;
  border-radius: var(--radius-sm);
}

.btn--lg {
  padding: 14px 28px;
  font-size: 0.98rem;
  font-weight: 700;
  border-radius: var(--radius-md);
}

.btn--full {
  width: 100%;
}

.btn--text {
  background: transparent;
  color: var(--vd-navy-deep);
  font-weight: 600;
  padding: 8px 14px;
}

.btn--text:hover {
  color: var(--vd-gold-primary);
  transform: translateX(4px);
}

/* --------------------------------------------------------------------------
   4. TOP UTILITY ANNOUNCEMENT BAR
   -------------------------------------------------------------------------- */
.top-utility-bar {
  background-color: var(--vd-bg-secondary);
  border-bottom: 1px solid var(--vd-border-soft);
  font-size: 0.78rem;
  color: var(--vd-text-muted);
  padding: 7px 0;
  position: relative;
  z-index: 101;
}

.top-utility-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background-color: rgba(200, 146, 46, 0.12);
  color: var(--vd-gold-primary);
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(200, 146, 46, 0.3);
  letter-spacing: 0.02em;
}

.utility-text {
  color: var(--vd-text-body);
  font-weight: 500;
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
  color: var(--vd-navy-deep);
  font-weight: 600;
}

.top-utility-link:hover {
  color: var(--vd-gold-primary);
}

.top-utility-btn {
  background: #FFFFFF;
  border: 1px solid var(--vd-border-soft);
  color: var(--vd-navy-deep);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all var(--transition-fast);
}

.top-utility-btn:hover {
  border-color: var(--vd-gold-primary);
  color: var(--vd-gold-primary);
}

/* --------------------------------------------------------------------------
   5. CLEAN WHITE NAVIGATION BAR
   -------------------------------------------------------------------------- */
.site-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--vd-bg-primary);
  border-bottom: 1px solid var(--vd-border-soft);
  z-index: 100;
  transition: all var(--transition-smooth);
}

.site-header.is-scrolled {
  background-color: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(11, 35, 72, 0.06);
  border-bottom: 1px solid rgba(200, 146, 46, 0.25); /* Extremely thin gold accent line */
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

/* Brand Logo (Original Identity on Clean White Canvas) */
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo__emblem-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: #FFFFFF;
  border: 1.5px solid var(--vd-border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  box-shadow: var(--shadow-subtle);
  transition: all var(--transition-smooth);
}

.header-logo:hover .header-logo__emblem-wrap {
  border-color: var(--vd-gold-primary);
  box-shadow: 0 4px 16px rgba(200, 146, 46, 0.25);
}

.header-logo__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.header-logo__text {
  display: flex;
  flex-direction: column;
}

.header-logo__brand {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vd-navy-deep);
  letter-spacing: 0.06em;
  line-height: 1.05;
}

.header-logo__brand .brand-desk {
  color: var(--vd-gold-primary);
}

.header-logo__tagline {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--vd-text-muted);
  font-weight: 600;
  margin-top: 2px;
}

/* Navigation Links (Deep Navy, Gold Active Indicator) */
.header-nav__list {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
}

.header-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  color: var(--vd-navy-deep);
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  position: relative;
  transition: all var(--transition-fast);
}

.header-nav__link:hover {
  color: var(--vd-gold-primary);
  background-color: var(--vd-bg-secondary);
}

.header-nav__link.active {
  color: var(--vd-gold-primary);
}

.header-nav__link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background-color: var(--vd-gold-primary);
  border-radius: var(--radius-full);
}

/* Dropdown Menu for Workspaces */
.header-nav__item {
  position: relative;
}

.header-nav__item--has-dropdown:hover .header-nav__dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.header-nav__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 280px;
  background-color: #FFFFFF;
  border: 1px solid var(--vd-border-soft);
  border-radius: var(--radius-md);
  padding: 8px;
  list-style: none;
  margin-top: 6px;
  box-shadow: var(--shadow-hover);
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: all var(--transition-smooth);
  z-index: 110;
}

.dropdown-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--vd-text-body);
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--vd-bg-secondary);
}

.dropdown-item i {
  font-size: 1.25rem;
  color: var(--vd-gold-primary);
  margin-top: 2px;
}

.dropdown-item strong {
  display: block;
  font-size: 0.88rem;
  color: var(--vd-navy-deep);
}

.dropdown-item span {
  display: block;
  font-size: 0.72rem;
  color: var(--vd-text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Mobile Nav Toggle */
.mobile-nav-toggle {
  display: none;
  background: #FFFFFF;
  border: 1px solid var(--vd-border-soft);
  border-radius: var(--radius-sm);
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
  background: var(--vd-navy-deep);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

/* --------------------------------------------------------------------------
   6. SOPHISTICATED WHITE HERO SECTION
   -------------------------------------------------------------------------- */
.hero-white {
  position: relative;
  background-color: var(--vd-bg-primary);
  padding: 70px 0 90px;
  overflow: hidden;
}

.hero-white__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-white__cream-gradient {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  background: radial-gradient(ellipse at top right, rgba(245, 239, 227, 0.7) 0%, rgba(250, 248, 243, 0.3) 50%, transparent 80%);
}

.hero-white__grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(232, 226, 216, 0.4) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(232, 226, 216, 0.4) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 75%);
}

.hero-white__grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 2;
}

/* Hero Content */
.hero-white__pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: var(--vd-bg-secondary);
  border: 1px solid var(--vd-border-soft);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  margin-bottom: 24px;
  box-shadow: var(--shadow-subtle);
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--vd-gold-primary);
}

.pill-text {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vd-navy-deep);
}

.pill-badge {
  background-color: rgba(200, 146, 46, 0.12);
  color: var(--vd-gold-primary);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.hero-white__headline {
  font-size: clamp(2.5rem, 4.4vw, 3.8rem);
  font-weight: 800;
  line-height: 1.14;
  color: var(--vd-navy-deep);
  margin-bottom: 22px;
  letter-spacing: -0.01em;
}

.hero-white__subtitle {
  font-size: clamp(1.05rem, 1.3vw, 1.2rem);
  line-height: 1.65;
  color: var(--vd-text-body);
  margin-bottom: 36px;
  max-width: 580px;
}

.hero-white__ctas {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-white__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vd-navy-deep);
  font-weight: 700;
  font-size: 0.92rem;
}

.hero-white__link:hover {
  color: var(--vd-gold-primary);
}

/* Hero Trust Row */
.hero-white__trust-row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--vd-border-soft);
}

.hero-trust-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-trust-item i {
  font-size: 1.6rem;
  color: var(--vd-gold-primary);
}

.hero-trust-item strong {
  display: block;
  font-size: 0.88rem;
  color: var(--vd-navy-deep);
}

.hero-trust-item span {
  display: block;
  font-size: 0.72rem;
  color: var(--vd-text-muted);
}

.hero-trust-divider {
  width: 1px;
  height: 32px;
  background-color: var(--vd-border-soft);
}

/* Hero Showcase Frame */
.hero-white__showcase {
  position: relative;
}

.showcase-card {
  position: relative;
}

.showcase-card__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3.2;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--vd-bg-secondary);
  border: 1px solid var(--vd-border-soft);
  box-shadow: var(--shadow-hover);
}

.showcase-card__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.showcase-card__gradient-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 65%, rgba(11, 35, 72, 0.4) 100%);
  pointer-events: none;
}

.showcase-card__gold-edge {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--vd-gold-primary), var(--vd-gold-light));
}

/* Floating Badges */
.floating-badge {
  position: absolute;
  background-color: #FFFFFF;
  border: 1px solid var(--vd-border-soft);
  padding: 10px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-card);
  z-index: 10;
  transition: transform var(--transition-smooth);
}

.floating-badge:hover {
  transform: translateY(-2px);
  border-color: var(--vd-gold-primary);
}

.floating-badge--top {
  top: -20px;
  right: -20px;
}

.floating-badge--bottom {
  bottom: -20px;
  left: -20px;
}

.floating-badge__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(200, 146, 46, 0.12);
  color: var(--vd-gold-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.badge-title {
  display: block;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vd-navy-deep);
}

.badge-sub {
  display: block;
  font-size: 0.72rem;
  color: var(--vd-text-muted);
}

/* --------------------------------------------------------------------------
   7. SECTION DESIGN & CARDS (WHITE AS DOMINANT CANVAS)
   -------------------------------------------------------------------------- */
section {
  background-color: var(--vd-bg-primary);
  padding: 90px 0;
  position: relative;
}

/* Supporting Cream Sections */
.section--cream,
.testimonials-section,
.about-section,
#testimonials,
#knowledge {
  background-color: var(--vd-bg-secondary) !important;
}

.section__header {
  margin-bottom: 50px;
}

.section__header--center {
  text-align: center;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
}

.section__kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vd-gold-primary);
  margin-bottom: 12px;
}

.section__title {
  font-size: clamp(2rem, 3.2vw, 2.75rem);
  color: var(--vd-navy-deep);
  margin-bottom: 16px;
}

.section__desc {
  font-size: 1.05rem;
  color: var(--vd-text-muted);
  line-height: 1.65;
}

/* Universal Card Architecture */
.card, 
.service-card, 
.pricing__summary, 
.wizard__container, 
.knowledge__card, 
.faq-item,
.contact__form-card {
  background-color: #FFFFFF !important;
  border: 1px solid var(--vd-border-soft) !important;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-subtle);
  transition: all var(--transition-smooth);
}

.card:hover, 
.service-card:hover, 
.knowledge__card:hover {
  transform: translateY(-4px);
  border-color: var(--vd-gold-primary) !important;
  box-shadow: var(--shadow-hover);
}

/* Service Cards */
.service-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.service-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: var(--vd-bg-secondary);
}

.service-card__body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.service-card__title {
  font-size: 1.25rem;
  color: var(--vd-navy-deep);
  margin-bottom: 10px;
}

.service-card__desc {
  font-size: 0.9rem;
  color: var(--vd-text-muted);
  margin-bottom: 18px;
}

.service-card__features {
  list-style: none;
  margin-bottom: 24px;
  flex: 1;
}

.service-card__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--vd-text-body);
  margin-bottom: 8px;
}

.service-card__feature i {
  color: var(--vd-gold-primary);
}

.service-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  border-top: 1px solid var(--vd-border-soft);
}

.service-card__price-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vd-navy-deep);
}

.service-card__price-sub {
  font-size: 0.72rem;
  color: var(--vd-text-muted);
}

/* Trust Strip */
.trust-strip {
  background-color: var(--vd-bg-secondary);
  border-top: 1px solid var(--vd-border-soft);
  border-bottom: 1px solid var(--vd-border-soft);
  padding: 40px 0;
}

.trust-strip__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.trust-strip__item {
  background-color: #FFFFFF;
  border: 1px solid var(--vd-border-soft);
  padding: 20px;
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-subtle);
  transition: all var(--transition-smooth);
}

.trust-strip__item:hover {
  border-color: var(--vd-gold-primary);
  transform: translateY(-2px);
}

.trust-strip__value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--vd-navy-deep);
  font-family: var(--font-display);
}

.trust-strip__value .accent {
  color: var(--vd-gold-primary);
}

.trust-strip__label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vd-navy-deep);
  margin-top: 4px;
}

.trust-strip__sub {
  font-size: 0.75rem;
  color: var(--vd-text-muted);
}

/* --------------------------------------------------------------------------
   8. INTERACTIVE FEATURES (CALCULATOR, WIZARD & FORMS)
   -------------------------------------------------------------------------- */
.pricing__controls,
.pricing__summary,
.wizard__container,
.contact__form-card {
  background-color: #FFFFFF !important;
  border: 1px solid var(--vd-border-soft) !important;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-subtle);
}

input, select, textarea {
  background-color: #FFFFFF !important;
  border: 1px solid var(--vd-border-soft) !important;
  color: var(--vd-text-body) !important;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  transition: border-color var(--transition-fast);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--vd-navy-deep) !important;
  box-shadow: 0 0 0 3px rgba(11, 35, 72, 0.08);
}

/* FAQ Accordion */
.faq-item {
  border: 1px solid var(--vd-border-soft) !important;
  margin-bottom: 12px;
  border-radius: var(--radius-md) !important;
  overflow: hidden;
  background-color: #FFFFFF !important;
}

.faq-item.open {
  border-color: var(--vd-gold-primary) !important;
  background-color: var(--vd-bg-secondary) !important;
}

.faq-item__question {
  padding: 18px 22px;
  color: var(--vd-navy-deep) !important;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.faq-item__answer {
  padding: 0 22px 18px;
  color: var(--vd-text-body);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* --------------------------------------------------------------------------
   9. DEEP NAVY CONTRAST & FOOTER (15-20% AUTHORITY)
   -------------------------------------------------------------------------- */
.final-cta-section {
  background-color: var(--vd-navy-deep) !important;
  color: #FFFFFF;
  padding: 80px 0;
  text-align: center;
  position: relative;
}

.final-cta-section h2 {
  color: #FFFFFF !important;
  font-size: clamp(2rem, 3.5vw, 3rem);
  margin-bottom: 16px;
}

.final-cta-section p {
  color: var(--vd-cream-soft) !important;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 36px;
}

.final-cta-section .btn--primary {
  background-color: var(--vd-gold-primary) !important;
  color: var(--vd-navy-deep) !important;
  border-color: var(--vd-gold-primary) !important;
}

.final-cta-section .btn--primary:hover {
  background-color: #FFFFFF !important;
  color: var(--vd-navy-deep) !important;
}

/* Deep Navy Footer */
.site-footer {
  background-color: var(--vd-navy-deep) !important;
  color: var(--vd-cream-soft) !important;
  border-top: 3px solid var(--vd-gold-primary);
  padding: 80px 0 30px;
}

.site-footer h4,
.footer__col-title {
  color: #FFFFFF !important;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.footer-logo__brand {
  color: #FFFFFF !important;
}

.footer-logo__brand .brand-desk {
  color: var(--vd-gold-light) !important;
}

.footer-logo__tagline {
  color: var(--vd-gold-primary) !important;
}

.site-footer a {
  color: rgba(245, 239, 227, 0.75) !important;
}

.site-footer a:hover {
  color: var(--vd-gold-light) !important;
}

.footer__brand-desc,
.footer__llp,
.footer__bottom {
  color: rgba(245, 239, 227, 0.6) !important;
}

.footer__bottom {
  border-top: 1px solid rgba(232, 226, 216, 0.15);
  padding-top: 24px;
  margin-top: 50px;
}

/* --------------------------------------------------------------------------
   10. MODALS & POPUPS (CLEAN WHITE)
   -------------------------------------------------------------------------- */
.modal-overlay,
.modal {
  background-color: rgba(7, 26, 54, 0.6) !important;
  backdrop-filter: blur(8px);
}

.modal__dialog,
.modal-content {
  background-color: #FFFFFF !important;
  border: 1px solid var(--vd-border-soft) !important;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(7, 26, 54, 0.25);
  color: var(--vd-text-body);
}

.modal__header {
  border-bottom: 1px solid var(--vd-border-soft);
  padding: 20px 24px;
}

.modal__title {
  color: var(--vd-navy-deep) !important;
  font-size: 1.3rem;
}

.modal__close {
  color: var(--vd-text-muted);
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal__close:hover {
  color: var(--vd-gold-primary);
}

/* --------------------------------------------------------------------------
   11. RESPONSIVE MEDIA QUERIES
   -------------------------------------------------------------------------- */
@media (max-width: 992px) {
  .hero-white__grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .header-nav {
    display: none;
  }
  .mobile-nav-toggle {
    display: flex;
  }
}

@media (max-width: 576px) {
  .hero-white {
    padding: 40px 0 60px;
  }
  .hero-white__trust-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .hero-trust-divider {
    display: none;
  }
  .hero-white__ctas {
    flex-direction: column;
    align-items: stretch;
  }
}
'''

# =========================================================================
# APPLY UPDATES TO BOTH WORKSPACES
# =========================================================================
for d in [desktop_dir, scratch_dir]:
    if not os.path.exists(d):
        continue

    # 1. Update index.html Hero Section & Logo references
    html_file = os.path.join(d, "index.html")
    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace the hero section (video-hero-scroll-container or old hero)
    pattern = r'<section[^>]*class="[^"]*(?:video-hero-scroll-container|hero)[^"]*"[^>]*>.*?</section>'
    m_hero = re.search(pattern, html, re.DOTALL)
    if m_hero:
        html = html[:m_hero.start()] + white_hero_html + html[m_hero.end():]
        print(f"Replaced hero section in {html_file}")
    else:
        print(f"Could not locate hero section in {html_file}")

    # Ensure Logo references use assets/vdesk-logo.jpg or assets/vdesk-emblem-bright-white.png
    html = re.sub(
        r'<img\s+src="assets/vdesk-[^"]+"\s+alt="V-DESK[^"]*" class="header-logo__img">',
        r'<img src="assets/vdesk-logo.jpg" alt="V-DESK Official Logo" class="header-logo__img">',
        html
    )
    html = re.sub(
        r'<img\s+src="assets/vdesk-[^"]+"\s+alt="V-DESK"[^>]*class="mobile-drawer__logo"[^>]*>',
        r'<img src="assets/vdesk-logo.jpg" alt="V-DESK" class="mobile-drawer__logo">',
        html
    )

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Saved {html_file}")

    # 2. Overhaul styles.css with Master White Theme
    css_file = os.path.join(d, "styles.css")
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()

    # Prepend or replace with master white theme
    if 'V-DESK WORKSPACE & CONSULTING LLP — MASTER WHITE THEME' in css:
        m_css = re.search(r'/\* =+ \s* V-DESK WORKSPACE & CONSULTING LLP — MASTER WHITE THEME.*?(?=(/\* =+ \s* END MASTER WHITE THEME|$))', css, re.DOTALL)
        if m_css:
            css = css[:m_css.start()] + master_white_css + "\n/* ==========================================================================\n   END MASTER WHITE THEME\n   ========================================================================== */\n" + css[m_css.end():]
        else:
            css = master_white_css + "\n" + css
    else:
        css = master_white_css + "\n" + css

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)
    print(f"Saved {css_file}")

print("Master White Theme redesign applied successfully across both workspaces.")
