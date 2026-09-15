import os
from build_page_framework import wrap_page, vo_configurator, meeting_rooms_section, gst_tracker_section, marketplace_section, locations_section, pricing_section, calculator_section, journey_section, wizard_section

# 1. VIRTUAL OFFICE PAGE
vo_body = f"""
<section class="section subpage-hero">
  <div class="container">
    <div class="subpage-hero__badge"><i class="ph-bold ph-shield-check"></i> 100% GST &amp; MCA Government Approval Guarantee</div>
    <h1 class="subpage-hero__title">PREMIER VIRTUAL OFFICE<br><span class="highlight-gold">FOR GST &amp; COMPANY SETUP</span></h1>
    <p class="subpage-hero__desc">Secure prestigious Grade-A commercial business addresses across 18+ Indian metros. Complete documentation within 24 hours including notarized rent agreement, owner NOC, and electricity bill.</p>
    <div class="subpage-hero__cta-group">
      <a href="#voConfigurator" class="btn btn--primary btn--lg"><i class="ph-bold ph-sliders"></i> Configure Setup Now &rarr;</a>
      <button type="button" class="btn btn--outline btn--lg" onclick="openDigitalKycModal()"><i class="ph-bold ph-fingerprint"></i> Start Digital KYC</button>
      <a href="#gstTrackerSection" class="btn btn--secondary btn--lg"><i class="ph-bold ph-check-square-offset"></i> Track GST Application</a>
    </div>
    <div class="subpage-hero__trust-strip">
      <div class="trust-item"><i class="ph-bold ph-check-circle"></i> <span>Zero Physical Inspection Rejections</span></div>
      <div class="trust-item"><i class="ph-bold ph-check-circle"></i> <span>Physical Name Board Included</span></div>
      <div class="trust-item"><i class="ph-bold ph-check-circle"></i> <span>Dedicated Mail Forwarding &amp; Alerts</span></div>
      <div class="trust-item"><i class="ph-bold ph-check-circle"></i> <span>Free Address Replacement Policy</span></div>
    </div>
  </div>
</section>

{vo_configurator}

{gst_tracker_section}

<section class="section vo-plans-comparison" id="plans">
  <div class="container">
    <div class="section__header section__header--center">
      <span class="section__eyebrow" style="color: var(--vd-teal-primary);"><i class="ph-bold ph-table"></i> Plan Architecture</span>
      <h2 class="section__title">TRANSPARENT VIRTUAL OFFICE<br><span class="highlight-gold">SUBSCRIPTION TIERS</span></h2>
      <p class="section__desc">Choose the exact level of commercial representation required for your current corporate lifecycle.</p>
    </div>
    <div class="pricing__grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 30px;">
      <!-- Silver Plan -->
      <div class="pricing-card">
        <div class="pricing-card__header">
          <span class="pricing-card__pill">Basic Identity</span>
          <h3 class="pricing-card__name">Mailing Address</h3>
          <p class="pricing-card__desc">For freelancers and remote teams requiring a prime mailing address and courier management.</p>
          <div class="pricing-card__price">
            <span class="currency">&#8377;</span><span class="amount">849</span><span class="period">/mo</span>
          </div>
        </div>
        <ul class="pricing-card__features">
          <li><i class="ph-bold ph-check"></i> Prestigious Commercial Hub Address</li>
          <li><i class="ph-bold ph-check"></i> Official Mail &amp; Courier Receiving</li>
          <li><i class="ph-bold ph-check"></i> WhatsApp Courier Photo Notifications</li>
          <li class="disabled"><i class="ph-bold ph-x"></i> GST Registration NOC</li>
          <li class="disabled"><i class="ph-bold ph-x"></i> Physical Name Board</li>
        </ul>
        <button class="btn btn--outline btn--block" onclick="openQuoteModal('Virtual Office - Mailing Plan')">Select Plan</button>
      </div>

      <!-- Gold Plan (Featured) -->
      <div class="pricing-card pricing-card--featured" style="border: 2px solid #C59239; position: relative;">
        <div class="badge-popular" style="position: absolute; top: -12px; right: 24px; background: #C59239; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">MOST POPULAR</div>
        <div class="pricing-card__header">
          <span class="pricing-card__pill">Tax Compliant</span>
          <h3 class="pricing-card__name">GST Registration Ready</h3>
          <p class="pricing-card__desc">100% compliant documentation for PPOB or APOB state GST registrations and officer visits.</p>
          <div class="pricing-card__price">
            <span class="currency">&#8377;</span><span class="amount">1,249</span><span class="period">/mo</span>
          </div>
        </div>
        <ul class="pricing-card__features">
          <li><i class="ph-bold ph-check"></i> Notarized Commercial Rent Agreement</li>
          <li><i class="ph-bold ph-check"></i> Landlord NOC &amp; Commercial Electricity Bill</li>
          <li><i class="ph-bold ph-check"></i> Prominent Physical Company Name Board</li>
          <li><i class="ph-bold ph-check"></i> Dedicated Desk Officer Physical Inspection Support</li>
          <li><i class="ph-bold ph-check"></i> 100% Rejection Protection Guarantee</li>
        </ul>
        <button class="btn btn--primary btn--block" onclick="openQuoteModal('Virtual Office - GST Plan')">Choose GST Plan</button>
      </div>

      <!-- Platinum Plan -->
      <div class="pricing-card">
        <div class="pricing-card__header">
          <span class="pricing-card__pill">Full Corporation</span>
          <h3 class="pricing-card__name">Enterprise All-Inclusive</h3>
          <p class="pricing-card__desc">Complete solution for multi-director Pvt Ltd companies, incorporating free meeting credits.</p>
          <div class="pricing-card__price">
            <span class="currency">&#8377;</span><span class="amount">1,999</span><span class="period">/mo</span>
          </div>
        </div>
        <ul class="pricing-card__features">
          <li><i class="ph-bold ph-check"></i> Everything in GST Plan</li>
          <li><i class="ph-bold ph-check"></i> MCA SPICe+ Compliant CIN Filing Proofs</li>
          <li><i class="ph-bold ph-check"></i> 10 Free Hours/Month 4K Boardroom Credits</li>
          <li><i class="ph-bold ph-check"></i> Dedicated Concierge &amp; Priority Dispatch</li>
          <li><i class="ph-bold ph-check"></i> Bank Account Verification Desk</li>
        </ul>
        <button class="btn btn--outline btn--block" onclick="openQuoteModal('Virtual Office - Enterprise Plan')">Get Enterprise</button>
      </div>
    </div>
  </div>
</section>
"""

with open('virtual-office.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Virtual Office for GST Registration & Company Incorporation | V-DESK",
        meta_desc="100% tax and MCA compliant virtual offices across 18+ Indian cities. Complete documentation in 24 hours including notarized rent agreement, NOC, and bill.",
        active_nav="virtual-office",
        body_content=vo_body
    ))
print("Created: virtual-office.html")

# 2. COWORKING SPACES PAGE
coworking_body = f"""
<section class="section subpage-hero">
  <div class="container">
    <div class="subpage-hero__badge"><i class="ph-bold ph-laptop"></i> Flexible Workspaces Across 50+ Grade-A Hubs</div>
    <h1 class="subpage-hero__title">COWORKING SPACES &amp;<br><span class="highlight-gold">PRIVATE EXECUTIVE CABINS</span></h1>
    <p class="subpage-hero__desc">From flexible day passes for solo founders to soundproof 20-seat team suites. Enterprise 500 Mbps Wi-Fi, ergonomic seating, unlimited coffee, and instant booking.</p>
    <div class="subpage-hero__cta-group">
      <button type="button" class="btn btn--primary btn--lg" onclick="openCommandPalette()"><i class="ph-bold ph-magnifying-glass"></i> Search Nearby Desks &rarr;</button>
      <a href="#marketplace" class="btn btn--outline btn--lg"><i class="ph-bold ph-buildings"></i> Browse Commercial Centres</a>
    </div>
  </div>
</section>

<div id="marketplace">
{marketplace_section}
</div>

<section class="section amenities-showcase" style="background: #F8FAFC; padding: 70px 0;">
  <div class="container">
    <div class="section__header section__header--center">
      <span class="section__eyebrow" style="color: var(--vd-teal-primary);"><i class="ph-bold ph-star"></i> Enterprise Calibre</span>
      <h2 class="section__title">WORK IN AN ENVIRONMENT<br><span class="highlight-gold">ENGINEERED FOR FOCUS</span></h2>
      <p class="section__desc">Everything you and your team need to execute without operational distraction.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 35px;">
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;">
        <i class="ph-bold ph-wifi-high" style="font-size: 2rem; color: #081D40; margin-bottom: 12px; display: block;"></i>
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">500 Mbps Dual-Fiber Wi-Fi</h4>
        <p style="font-size: 0.88rem; color: #64748B;">Redundant enterprise internet pipelines with seamless roaming and private corporate VLAN options.</p>
      </div>
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;">
        <i class="ph-bold ph-armchair" style="font-size: 2rem; color: #C59239; margin-bottom: 12px; display: block;"></i>
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">Ergonomic Workstations</h4>
        <p style="font-size: 0.88rem; color: #64748B;">Lumbar-support high-mesh chairs, anti-glare task lighting, and spacious oak-finish executive desks.</p>
      </div>
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;">
        <i class="ph-bold ph-coffee" style="font-size: 2rem; color: #081D40; margin-bottom: 12px; display: block;"></i>
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">Artisan Barista Lounge</h4>
        <p style="font-size: 0.88rem; color: #64748B;">Fresh bean-to-cup espresso, assorted herbal teas, infused water, and pantry dining spaces.</p>
      </div>
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;">
        <i class="ph-bold ph-lock-key" style="font-size: 2rem; color: #10B981; margin-bottom: 12px; display: block;"></i>
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">Biometric &amp; RFID Access</h4>
        <p style="font-size: 0.88rem; color: #64748B;">Secure 24/7 keycard entry for dedicated members with CCTV coverage across all common aisles.</p>
      </div>
    </div>
  </div>
</section>
"""

with open('coworking-spaces.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Coworking Spaces, Hot Desks & Private Executive Cabins | V-DESK",
        meta_desc="Discover flexible coworking desks and soundproof private cabins across 50+ Grade-A towers in Mumbai, Delhi, Bangalore, Pune and Nashik.",
        active_nav="coworking",
        body_content=coworking_body
    ))
print("Created: coworking-spaces.html")

# 3. MEETING ROOMS PAGE
mr_body = f"""
<section class="section subpage-hero">
  <div class="container">
    <div class="subpage-hero__badge"><i class="ph-bold ph-presentation"></i> On-Demand Hourly &amp; Daily State Machine</div>
    <h1 class="subpage-hero__title">RESERVE 4K MEETING ROOMS<br><span class="highlight-gold">&amp; EXECUTIVE BOARDROOMS</span></h1>
    <p class="subpage-hero__desc">Host client pitches, shareholder reviews, and collaborative team sprints in soundproof executive boardrooms equipped with Zoom/Teams wireless 4K presentation displays.</p>
    <div class="subpage-hero__cta-group">
      <button type="button" class="btn btn--primary btn--lg" onclick="openMeetingBookingModal()"><i class="ph-bold ph-calendar-plus"></i> Instant Booking Pass &rarr;</button>
      <a href="#scheduler" class="btn btn--outline btn--lg"><i class="ph-bold ph-clock"></i> Check Live Availability</a>
    </div>
  </div>
</section>

<div id="scheduler">
{meeting_rooms_section}
</div>

<section class="section room-specs" style="background: #05132B; color: #FFFFFF; padding: 75px 0;">
  <div class="container">
    <div class="section__header section__header--center">
      <span class="section__eyebrow" style="color: #C59239;"><i class="ph-bold ph-monitor"></i> Audio-Visual Excellence</span>
      <h2 class="section__title" style="color: #FFFFFF;">HIGH-CALIBRE HARDWARE<br><span class="highlight-gold">STANDARD IN EVERY SUITE</span></h2>
      <p class="section__desc" style="color: #94A3B8;">Leave technical glitches behind with enterprise video conferencing calibrated for hybrid meetings.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 35px;">
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;">
        <h4 style="color: #C59239; font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">4K Ultra HD Display</h4>
        <p style="color: #CBD5E1; font-size: 0.88rem;">65-inch to 85-inch Samsung commercial panels with AirPlay, Google Cast, and HDMI wireless dongles.</p>
      </div>
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;">
        <h4 style="color: #C59239; font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">Beamforming Mic Array</h4>
        <p style="color: #CBD5E1; font-size: 0.88rem;">Echo-canceling ceiling microphones capturing voice crisply from any seat without background noise.</p>
      </div>
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;">
        <h4 style="color: #C59239; font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">360° AI Smart Camera</h4>
        <p style="color: #CBD5E1; font-size: 0.88rem;">Intelligent active speaker framing automatically focuses on whoever is talking in the room.</p>
      </div>
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;">
        <h4 style="color: #C59239; font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">Acoustic Soundproofing</h4>
        <p style="color: #CBD5E1; font-size: 0.88rem;">Double-glazed acoustic glass partitions ensuring complete boardroom confidentiality.</p>
      </div>
    </div>
  </div>
</section>
"""

with open('meeting-rooms.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="On-Demand 4K Meeting Rooms & Executive Boardrooms | V-DESK",
        meta_desc="Reserve executive conference rooms and boardrooms with 10-minute hold lock, 4K displays, and instant digital booking passes across India.",
        active_nav="meeting-rooms",
        body_content=mr_body
    ))
print("Created: meeting-rooms.html")

# 4. LOCATIONS PAGE
locations_body = f"""
<section class="section subpage-hero">
  <div class="container">
    <div class="subpage-hero__badge"><i class="ph-bold ph-globe-hemisphere-east"></i> National Commercial Real Estate Footprint</div>
    <h1 class="subpage-hero__title">50+ GRADE-A COMMERCIAL TOWERS<br><span class="highlight-gold">ACROSS 18+ INDIAN METROS</span></h1>
    <p class="subpage-hero__desc">CBIC and MCA verified commercial hubs situated in India's most prestigious Central Business Districts (CBDs) and IT corridors.</p>
    <div class="subpage-hero__cta-group">
      <button type="button" class="btn btn--primary btn--lg" onclick="openAllLocationsModal()"><i class="ph-bold ph-map-pin"></i> View All 28 States Directory &rarr;</button>
      <button type="button" class="btn btn--outline btn--lg" onclick="openQuoteModal('Schedule In-Person Centre Tour')"><i class="ph-bold ph-calendar"></i> Book In-Person Hub Tour</button>
    </div>
  </div>
</section>

{locations_section}
"""

with open('locations.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Pan-India Commercial Hubs & Grade-A Towers Directory | V-DESK",
        meta_desc="Explore verified Grade-A commercial addresses across Mumbai BKC, Delhi CP, Bangalore Koramangala, Nashik HQ, Pune, Gurgaon and Hyderabad.",
        active_nav="locations",
        body_content=locations_body
    ))
print("Created: locations.html")

# 5. PRICING PAGE
pricing_body = f"""
<section class="section subpage-hero">
  <div class="container">
    <div class="subpage-hero__badge"><i class="ph-bold ph-percent"></i> Zero Brokerage &bull; Zero Hidden Costs</div>
    <h1 class="subpage-hero__title">TRANSPARENT COMMERCIAL PRICING<br><span class="highlight-gold">&amp; OPERATIONAL SAVINGS CALCULATOR</span></h1>
    <p class="subpage-hero__desc">Discover how companies slash operational overhead by up to 88% compared to traditional 3-year commercial leases with lock-ins.</p>
  </div>
</section>

{pricing_section}

{calculator_section}
"""

with open('pricing.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Transparent Pricing, Plans & Operational ROI Calculator | V-DESK",
        meta_desc="Compare Virtual Office, Coworking, and Private Office pricing plans. Calculate operational savings vs traditional commercial leases.",
        active_nav="pricing",
        body_content=pricing_body
    ))
print("Created: pricing.html")

# 6. COMPANY REGISTRATION & ADVISORY PAGE
company_reg_body = f"""
<section class="section subpage-hero">
  <div class="container">
    <div class="subpage-hero__badge"><i class="ph-bold ph-certificate"></i> Government SPICe+ &amp; MCA Filing Suite</div>
    <h1 class="subpage-hero__title">INCORPORATE YOUR COMPANY<br><span class="highlight-gold">WITH CERTIFIED CA/CS EXPERTS</span></h1>
    <p class="subpage-hero__desc">Complete company formation with DIN, DSC, PAN, TAN, MoA, AoA, and registered commercial office address under one sovereign SLA.</p>
    <div class="subpage-hero__cta-group">
      <button type="button" class="btn btn--primary btn--lg" onclick="openCompanyRegModal()"><i class="ph-bold ph-rocket-launch"></i> Launch Incorporation Wizard &rarr;</button>
      <button type="button" class="btn btn--outline btn--lg" onclick="openQuoteModal('Trademark Search & Filing')"><i class="ph-bold ph-trademark"></i> Trademark Registration</button>
    </div>
  </div>
</section>

{journey_section}

{wizard_section}
"""

with open('company-registration.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Company Incorporation, MCA SPICe+ & Corporate Compliance | V-DESK",
        meta_desc="Incorporate your Private Limited Company, LLP, or One Person Company with complete MCA, DIN, PAN, TAN, and registered office address.",
        active_nav="company-reg",
        body_content=company_reg_body
    ))
print("Created: company-registration.html")

# 7. CLIENT PORTAL STANDALONE PAGE
portal_body = f"""
<section class="section portal-page-wrap" style="background: #F1F5F9; min-height: 80vh; padding: 50px 0;">
  <div class="container">
    <!-- Standalone Client Portal Header -->
    <div style="background: #081D40; color: #fff; padding: 24px 30px; border-radius: 16px 16px 0 0; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #C59239;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(197, 146, 57, 0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #C59239;">
          <i class="ph-bold ph-buildings"></i>
        </div>
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #FFFFFF; margin: 0;">Zenith D2C Brands Pvt Ltd</h2>
          <span style="font-size: 0.85rem; color: #CBD5E1;">Director: Priya Kulkarni &bull; Account ID: <strong style="color: #C59239;">VD-AC-8921</strong></span>
        </div>
      </div>
      <div>
        <span class="portal-badge" style="background: #10B981; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">
          <i class="ph-bold ph-shield-check"></i> Account Verified
        </span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="background: #05132B; display: flex; overflow-x: auto; padding: 0 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <button class="portal-nav-tab active" style="padding: 14px 20px; color: #C59239; border-bottom: 2px solid #C59239; background: none; border-top: none; border-left: none; border-right: none; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="ph-bold ph-check-circle"></i> Active Services
      </button>
      <button class="portal-nav-tab" style="padding: 14px 20px; color: #94A3B8; background: none; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="ph-bold ph-presentation"></i> Bookings
      </button>
      <button class="portal-nav-tab" style="padding: 14px 20px; color: #94A3B8; background: none; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="ph-bold ph-file-text"></i> Documents &amp; KYC
      </button>
      <button class="portal-nav-tab" style="padding: 14px 20px; color: #94A3B8; background: none; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="ph-bold ph-receipt"></i> Invoices
      </button>
      <button class="portal-nav-tab" style="padding: 14px 20px; color: #94A3B8; background: none; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="ph-bold ph-arrows-clockwise"></i> Renewals
      </button>
    </div>

    <!-- Portal Body Content -->
    <div style="background: #FFFFFF; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
      <!-- Active Service Overview Card -->
      <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 24px; background: #FAFDFB;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
              <strong style="color: #10B981; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Subscription Active</strong>
            </div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: #081D40; margin: 0 0 4px 0;">Mumbai &mdash; Bandra Kurla Complex (BKC)</h3>
            <p style="font-size: 0.88rem; color: #64748B; margin: 0;">BKC Business Center, G Block, BKC, Mumbai &bull; Plan: Virtual Office for GST</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.8rem; color: #64748B; display: block;">Renewal Due:</span>
            <strong style="font-size: 1.1rem; color: #081D40;">12 Mar 2027</strong>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0; padding: 16px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px;">
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; display: block;">GST Status</span>
            <strong style="color: #10B981; font-size: 0.95rem;">Verified (27AAY...Z1)</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; display: block;">Mail Forwarding</span>
            <strong style="color: #081D40; font-size: 0.95rem;">Active (3 pieces forwarded)</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; display: block;">Meeting Credits</span>
            <strong style="color: #C59239; font-size: 0.95rem;">5 Hours Remaining</strong>
          </div>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn--primary btn--sm" onclick="alert('Downloading Notarized Rent Agreement PDF...')"><i class="ph-bold ph-download-simple"></i> Download Rent Agreement</button>
          <button class="btn btn--outline btn--sm" onclick="alert('Downloading Landlord NOC PDF...')"><i class="ph-bold ph-download-simple"></i> Download Owner NOC</button>
          <button class="btn btn--outline btn--sm" onclick="alert('Downloading Commercial Electricity Bill Copy...')"><i class="ph-bold ph-download-simple"></i> Download Electricity Bill</button>
          <button class="btn btn--secondary btn--sm" onclick="openMeetingBookingModal()"><i class="ph-bold ph-presentation"></i> Book Meeting Room</button>
        </div>
      </div>
    </div>
  </div>
</section>
"""

with open('portal.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Client Self-Service Portal & Document Vault | V-DESK",
        meta_desc="Manage active virtual office subscriptions, download signed agreements, review mail scans, and monitor boardroom credits.",
        active_nav="portal",
        body_content=portal_body
    ))
print("Created: portal.html")

# 8. ADMIN CRM PAGE
admin_body = f"""
<section class="section admin-page-wrap" style="background: #05132B; color: #FFFFFF; min-height: 85vh; padding: 40px 0;">
  <div class="container">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 18px; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="padding: 4px 10px; background: #C59239; color: #000; border-radius: 4px; font-size: 0.75rem; font-weight: 800;">ADMIN</span>
          <h1 style="font-size: 1.5rem; font-weight: 800; color: #FFFFFF; margin: 0;">V-DESK Centralized Operations &amp; CRM Platform</h1>
        </div>
        <p style="font-size: 0.85rem; color: #94A3B8; margin: 4px 0 0 0;">PRD Version 2.0 Management Console &bull; Role: Super Admin</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn--secondary btn--sm" onclick="seedSampleLeads()"><i class="ph-bold ph-arrows-clockwise"></i> Reset Demo Data</button>
        <button class="btn btn--primary btn--sm" onclick="exportLeadsToCSV()"><i class="ph-bold ph-download-simple"></i> Export CSV</button>
      </div>
    </div>

    <!-- Admin KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
        <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Total Active Clients</span>
        <strong style="font-size: 1.8rem; font-weight: 800; color: #10B981; display: block; margin-top: 4px;">1,482</strong>
        <small style="color: #64748B;">Across 10 Metros</small>
      </div>
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
        <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Inquiry Conversion</span>
        <strong style="font-size: 1.8rem; font-weight: 800; color: #C59239; display: block; margin-top: 4px;">28.4%</strong>
        <small style="color: #64748B;">Industry Avg: 12%</small>
      </div>
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
        <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Monthly Recurring</span>
        <strong style="font-size: 1.8rem; font-weight: 800; color: #38BDF8; display: block; margin-top: 4px;">&#8377;38.4L</strong>
        <small style="color: #64748B;">98.2% Renewal Rate</small>
      </div>
      <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
        <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">KYC Pending Review</span>
        <strong style="font-size: 1.8rem; font-weight: 800; color: #F59E0B; display: block; margin-top: 4px;" id="kycPendingCount">4</strong>
        <small style="color: #64748B;">Avg SLA: 2.1 Hours</small>
      </div>
    </div>

    <!-- Leads Pipeline Table -->
    <div style="background: #081D40; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #FFFFFF; margin: 0;"><i class="ph-bold ph-funnel"></i> Live Lead Inquiries</h3>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="adminSearchInput2" class="form-input" placeholder="Search leads..." style="background: #05132B; color: #fff; border-color: #334155; padding: 6px 12px;" oninput="filterAdminLeads()">
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>City</th>
              <th>Service</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="adminLeadsTableBody2">
            <!-- Rendered by app.js -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
"""

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Centralized Operations & CRM Management Suite | V-DESK Admin",
        meta_desc="Operations management console for V-DESK super admins. Monitor lead pipelines, KYC approval queues, and inventory.",
        active_nav="admin",
        body_content=admin_body
    ))
print("Created: admin.html")

# 9. CONTACT PAGE
contact_body = f"""
<section class="section subpage-hero">
  <div class="container">
    <div class="subpage-hero__badge"><i class="ph-bold ph-headset"></i> Dedicated Enterprise Concierge</div>
    <h1 class="subpage-hero__title">LET'S BUILD YOUR<br><span class="highlight-gold">COMMERCIAL INFRASTRUCTURE</span></h1>
    <p class="subpage-hero__desc">Speak with our certified corporate workspace advisors in Mumbai, Delhi, Bangalore, or at our Nashik Headquarters.</p>
  </div>
</section>

<section class="section contact-section" style="padding: 60px 0; background: #F8FAFC;">
  <div class="container">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px;">
      <!-- Contact Cards -->
      <div>
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 28px; margin-bottom: 20px;">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <i class="ph-bold ph-buildings" style="font-size: 1.8rem; color: #081D40;"></i>
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 700; color: #081D40; margin: 0 0 6px 0;">Corporate Headquarters</h4>
              <p style="font-size: 0.88rem; color: #64748B; margin: 0; line-height: 1.5;">
                V-DESK Workspace &amp; Consulting LLP<br>
                Landmark Trade Centre, 3rd Floor, College Road,<br>
                Nashik, Maharashtra &mdash; 422005
              </p>
            </div>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 28px; margin-bottom: 20px;">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <i class="ph-bold ph-phone-call" style="font-size: 1.8rem; color: #C59239;"></i>
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 700; color: #081D40; margin: 0 0 6px 0;">Direct Hotline &amp; WhatsApp</h4>
              <p style="font-size: 0.88rem; color: #64748B; margin: 0; line-height: 1.5;">
                Sales Desk: +91 98765 43210<br>
                Support Desk: +91 98765 43211<br>
                Instant WhatsApp: 2-Minute First Response
              </p>
            </div>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 28px;">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <i class="ph-bold ph-envelope" style="font-size: 1.8rem; color: #10B981;"></i>
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 700; color: #081D40; margin: 0 0 6px 0;">Official Email Correspondence</h4>
              <p style="font-size: 0.88rem; color: #64748B; margin: 0; line-height: 1.5;">
                Inquiries: sales@vdesk.in<br>
                Compliance &amp; NOC: compliance@vdesk.in<br>
                Partner &amp; CA Desk: partners@vdesk.in
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Inquiry Form -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
        <h3 style="font-size: 1.3rem; font-weight: 700; color: #081D40; margin-bottom: 8px;">Request Callback &amp; Instant Quote</h3>
        <p style="font-size: 0.88rem; color: #64748B; margin-bottom: 20px;">Fill out this short form to connect with our senior corporate infrastructure specialist.</p>
        
        <form onsubmit="handleQuoteSubmit(event)">
          <div class="form-row-2">
            <div class="form-field">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-input" placeholder="e.g. Vikramaditya Roy" required>
            </div>
            <div class="form-field">
              <label class="form-label">Phone / WhatsApp *</label>
              <input type="tel" class="form-input" placeholder="10-digit number" pattern="[0-9]{10}" required>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-field">
              <label class="form-label">Business Email *</label>
              <input type="email" class="form-input" placeholder="name@company.com" required>
            </div>
            <div class="form-field">
              <label class="form-label">Target City *</label>
              <select class="form-select">
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Nashik">Nashik (HQ)</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Other">Other Metro</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">Service Required</label>
            <select class="form-select">
              <option value="Virtual Office">Virtual Office for GST</option>
              <option value="Coworking">Coworking Desks / Cabins</option>
              <option value="Meeting Rooms">Meeting Rooms &amp; Boardrooms</option>
              <option value="Company Registration">Company Incorporation (MCA)</option>
              <option value="CA Partnership">CA / Broker Partnership</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Requirements / Timeline</label>
            <textarea class="form-textarea" rows="3" placeholder="Tell us about your team size, GST state needs, or timeline..."></textarea>
          </div>
          <button type="submit" class="btn btn--primary btn--block btn--lg" style="margin-top: 10px;">
            Submit Request &rarr;
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
"""

with open('contact.html', 'w', encoding='utf-8') as f:
    f.write(wrap_page(
        title="Contact V-DESK | Headquarters, Commercial Hubs & Expert Advisory",
        meta_desc="Get in touch with V-DESK for virtual office setups, coworking desks, meeting room reservations, and company incorporation.",
        active_nav="contact",
        body_content=contact_body
    ))
print("Created: contact.html")

print("All 9 dedicated standalone pages generated successfully!")
