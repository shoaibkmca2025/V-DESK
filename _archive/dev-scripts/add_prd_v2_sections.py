# -*- coding: utf-8 -*-
"""
Direct script to insert PRD v2.0 sections and modals into index.html
"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Initial HTML length:", len(html))

# ============================================================================
# 1. ADD VIRTUAL OFFICE PLATFORM & CONFIGURATOR (PRD Sec 24 - 29)
# ============================================================================
vo_configurator_html = """
  <!-- ====================================================================
       SECTION: VIRTUAL OFFICE PLATFORM & INTERACTIVE SETUP CONFIGURATOR
       PRD Version 2.0 (Sections 24, 25, 26, 27, 28, 29)
       User Journey: Location -> Centre -> Purpose -> Configure -> Pricing -> KYC -> Payment -> Activation
       ==================================================================== -->
  <section class="section vo-platform-section" id="voConfigurator">
    <div class="container">
      <div class="section__header section__header--center reveal">
        <span class="section__eyebrow" style="color: var(--vd-teal-primary);"><i class="ph-bold ph-sliders"></i> Modular Business Infrastructure</span>
        <h2 class="section__title">CONFIGURE YOUR<br><span class="highlight-gold">VIRTUAL OFFICE SETUP</span></h2>
        <p class="section__desc">Select your business purpose, grade-A location, and customized add-on services. Real-time dynamic pricing with instant KYC onboarding.</p>
      </div>

      <!-- 8-Step User Journey Visual Stepper (PRD Sec 24) -->
      <div class="vo-journey-stepper reveal">
        <div class="vo-step-item active">
          <div class="vo-step-num">1</div>
          <span class="vo-step-label">Location</span>
        </div>
        <div class="vo-step-line"></div>
        <div class="vo-step-item active">
          <div class="vo-step-num">2</div>
          <span class="vo-step-label">Centre</span>
        </div>
        <div class="vo-step-line"></div>
        <div class="vo-step-item active">
          <div class="vo-step-num">3</div>
          <span class="vo-step-label">Purpose</span>
        </div>
        <div class="vo-step-line"></div>
        <div class="vo-step-item active">
          <div class="vo-step-num">4</div>
          <span class="vo-step-label">Configure</span>
        </div>
        <div class="vo-step-line"></div>
        <div class="vo-step-item">
          <div class="vo-step-num">5</div>
          <span class="vo-step-label">Pricing</span>
        </div>
        <div class="vo-step-line"></div>
        <div class="vo-step-item">
          <div class="vo-step-num">6</div>
          <span class="vo-step-label">KYC</span>
        </div>
        <div class="vo-step-line"></div>
        <div class="vo-step-item">
          <div class="vo-step-num">7</div>
          <span class="vo-step-label">Payment</span>
        </div>
        <div class="vo-step-line"></div>
        <div class="vo-step-item">
          <div class="vo-step-num">8</div>
          <span class="vo-step-label">Activation</span>
        </div>
      </div>

      <div class="vo-config-grid reveal">
        <!-- Left: Configuration Controls -->
        <div class="vo-config-controls">
          <!-- Step 1 & 2: City & Centre Selection (PRD Sec 25, 26) -->
          <div class="vo-card-box">
            <h3 class="vo-box-title"><i class="ph-bold ph-map-pin"></i> 1. Select City &amp; Commercial Centre</h3>
            <div class="vo-input-row">
              <div class="form-field">
                <label class="form-label" for="voCitySelect">Target City</label>
                <select id="voCitySelect" class="form-select" onchange="handleVoCityChange(this.value)">
                  <option value="Mumbai">Mumbai (BKC, Andheri, Lower Parel)</option>
                  <option value="Delhi">Delhi NCR (Connaught Place, Cyber City)</option>
                  <option value="Bangalore">Bangalore (Koramangala, HSR Layout)</option>
                  <option value="Nashik" selected>Nashik (College Road Flagship HQ)</option>
                  <option value="Pune">Pune (Baner, Viman Nagar)</option>
                  <option value="Hyderabad">Hyderabad (HITEC City, Madhapur)</option>
                  <option value="Gurgaon">Gurgaon (DLF Cyber City)</option>
                  <option value="Noida">Noida (Sector 62)</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label" for="voCentreSelect">Commercial Centre / Building</label>
                <select id="voCentreSelect" class="form-select" onchange="handleVoCentreChange(this.value)">
                  <option value="NSK-001">V-DESK Headquarters — College Road (Flagship)</option>
                  <option value="NSK-002">Phoenix Business Park — Gangapur Road</option>
                </select>
              </div>
            </div>

            <div class="vo-centre-meta-banner" id="voCentreMetaBanner">
              <div class="centre-meta-left">
                <span class="centre-meta-badge"><i class="ph-bold ph-seal-check"></i> Grade-A Verified</span>
                <span class="centre-meta-badge"><i class="ph-bold ph-certificate"></i> 100% GST &amp; MCA Suitable</span>
              </div>
              <div class="centre-meta-right">
                <span class="centre-sla"><i class="ph-bold ph-lightning"></i> 24h Document SLA</span>
              </div>
            </div>
          </div>

          <!-- Step 3: Purpose Selection (PRD Sec 28) -->
          <div class="vo-card-box">
            <h3 class="vo-box-title"><i class="ph-bold ph-target"></i> 2. What are you using this address for?</h3>
            <div class="vo-purpose-grid" id="voPurposeGrid">
              <button type="button" class="vo-purpose-btn active" data-purpose="GST Registration" onclick="selectVoPurpose(this, 'GST Registration')">
                <i class="ph-bold ph-certificate"></i>
                <div class="purpose-btn-info">
                  <strong>GST Registration</strong>
                  <span>PPOB / Multi-state APOB</span>
                </div>
              </button>

              <button type="button" class="vo-purpose-btn" data-purpose="Business Address" onclick="selectVoPurpose(this, 'Business Address')">
                <i class="ph-bold ph-buildings"></i>
                <div class="purpose-btn-info">
                  <strong>Business Address</strong>
                  <span>Prime Commercial Location</span>
                </div>
              </button>

              <button type="button" class="vo-purpose-btn" data-purpose="Company Registration" onclick="selectVoPurpose(this, 'Company Registration')">
                <i class="ph-bold ph-file-text"></i>
                <div class="purpose-btn-info">
                  <strong>Company Registration</strong>
                  <span>MCA SPICe+ &amp; CIN Filing</span>
                </div>
              </button>

              <button type="button" class="vo-purpose-btn" data-purpose="E-commerce" onclick="selectVoPurpose(this, 'E-commerce')">
                <i class="ph-bold ph-shopping-cart"></i>
                <div class="purpose-btn-info">
                  <strong>E-commerce Hub</strong>
                  <span>Amazon FBA / Flipkart Hub</span>
                </div>
              </button>

              <button type="button" class="vo-purpose-btn" data-purpose="Branch / Expansion" onclick="selectVoPurpose(this, 'Branch / Expansion')">
                <i class="ph-bold ph-arrows-out-cardinal"></i>
                <div class="purpose-btn-info">
                  <strong>Branch / Expansion</strong>
                  <span>New State Satellite Office</span>
                </div>
              </button>

              <button type="button" class="vo-purpose-btn" data-purpose="Mail & Correspondence" onclick="selectVoPurpose(this, 'Mail & Correspondence')">
                <i class="ph-bold ph-envelope"></i>
                <div class="purpose-btn-info">
                  <strong>Mail &amp; Correspondence</strong>
                  <span>Digital Scan &amp; Forwarding</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 4: Add-Ons Configuration Checklist (PRD Sec 29) -->
          <div class="vo-card-box">
            <h3 class="vo-box-title"><i class="ph-bold ph-check-square"></i> 3. Select Setup Components (Add-Ons)</h3>
            <div class="vo-addons-list">
              <label class="vo-addon-item">
                <input type="checkbox" id="voAddonBase" checked disabled>
                <div class="addon-info">
                  <strong>Commercial Business Address &amp; Lease Agreement</strong>
                  <span>Includes registered rent agreement, electricity bill, and owner NOC for filing</span>
                </div>
                <div class="addon-price" id="voAddonBasePrice">&#8377;1,249<small>/mo</small></div>
              </label>

              <label class="vo-addon-item">
                <input type="checkbox" id="voAddonGst" checked onchange="updateVoDynamicPrice()">
                <div class="addon-info">
                  <strong>Dedicated GST Compliance &amp; Officer Desk Support</strong>
                  <span>NOC verification, physical board signage, and inspection attendance</span>
                </div>
                <div class="addon-price">+&#8377;350<small>/mo</small></div>
              </label>

              <label class="vo-addon-item">
                <input type="checkbox" id="voAddonIncorporation" onchange="updateVoDynamicPrice()">
                <div class="addon-info">
                  <strong>Company Incorporation Fast-Track (MCA SPICe+)</strong>
                  <span>Name reservation, DIN, PAN, TAN, MOA/AOA &amp; Certificate of Incorporation</span>
                </div>
                <div class="addon-price">+&#8377;2,999<small> (One-time)</small></div>
              </label>

              <label class="vo-addon-item">
                <input type="checkbox" id="voAddonMail" checked onchange="updateVoDynamicPrice()">
                <div class="addon-info">
                  <strong>Physical Mail &amp; Courier Concierge</strong>
                  <span>Daily mail logging, envelope scans on WhatsApp, and monthly courier forwarding</span>
                </div>
                <div class="addon-price">+&#8377;299<small>/mo</small></div>
              </label>

              <label class="vo-addon-item">
                <input type="checkbox" id="voAddonMeetingCredits" onchange="updateVoDynamicPrice()">
                <div class="addon-info">
                  <strong>Monthly 4K Meeting Room Credits (5 Hours/mo)</strong>
                  <span>High-speed Wi-Fi, 65" 4K presentation display, tea/coffee service</span>
                </div>
                <div class="addon-price">+&#8377;999<small>/mo</small></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Right: Dynamic Price & Checkout Panel (PRD Sec 29, 55) -->
        <div class="vo-config-summary">
          <div class="vo-summary-card">
            <div class="summary-header">
              <span class="summary-tag"><i class="ph-bold ph-receipt"></i> YOUR BUSINESS SETUP</span>
              <h4 class="summary-title" id="voSummaryTitle">Nashik Flagship Setup</h4>
              <p class="summary-sub" id="voSummarySubtitle">Configured for GST Registration &amp; Commercial Compliance</p>
            </div>

            <!-- Tenure Selector -->
            <div class="vo-tenure-toggle">
              <button type="button" class="vo-tenure-btn" id="voTenureMonthly" onclick="setVoTenure('monthly')">Monthly</button>
              <button type="button" class="vo-tenure-btn active" id="voTenureAnnual" onclick="setVoTenure('annual')">Annual (Save 20%)</button>
            </div>

            <!-- Itemized Pricing Calculation (PRD Sec 55) -->
            <div class="vo-breakdown-table">
              <div class="breakdown-row">
                <span>Base Business Address:</span>
                <strong id="voCalcBase">&#8377;1,249 / mo</strong>
              </div>
              <div class="breakdown-row">
                <span>Location Adjustment:</span>
                <strong id="voCalcLocationAdj">&#8377;0 (Nashik HQ)</strong>
              </div>
              <div class="breakdown-row">
                <span>Selected Add-Ons:</span>
                <strong id="voCalcAddons">&#8377;649 / mo</strong>
              </div>
              <div class="breakdown-row" id="voDiscountRow">
                <span style="color: var(--vd-gold-primary);">Annual Discount (20% Off):</span>
                <strong style="color: var(--vd-gold-primary);" id="voCalcDiscount">-&#8377;4,555</strong>
              </div>
              <div class="breakdown-row">
                <span>GST (18% Applicable):</span>
                <strong id="voCalcTaxes">&#8377;3,279</strong>
              </div>
              <div class="breakdown-divider"></div>
              <div class="breakdown-row breakdown-row--total">
                <span>Estimated Total:</span>
                <div class="total-wrap">
                  <span class="total-amount" id="voCalcTotal">&#8377;21,499</span>
                  <span class="total-period" id="voCalcPeriod">for 12 Months (All-Inclusive)</span>
                </div>
              </div>
            </div>

            <!-- Action CTAs -->
            <div class="vo-summary-actions">
              <button type="button" class="btn btn--primary btn--block btn--lg" onclick="proceedVoToKyc()">
                <i class="ph-bold ph-fingerprint"></i> Continue to Digital KYC &rarr;
              </button>

              <button type="button" class="btn btn--secondary btn--block" onclick="generateVoFormalQuote()">
                <i class="ph-bold ph-file-pdf"></i> Generate Official Quote PDF
              </button>

              <a href="https://wa.me/919876543210?text=Hi%20V-DESK%20Team,%20I%20have%20configured%20a%20Virtual%20Office%20setup%20and%20need%20custom%20assistance" target="_blank" rel="noopener" class="vo-whatsapp-cta">
                <i class="ph-bold ph-whatsapp-logo"></i> Consult Specialist on WhatsApp
              </a>
            </div>

            <div class="vo-guarantee-note">
              <i class="ph-bold ph-shield-check"></i>
              <span><strong>100% Approval Guarantee:</strong> If your GST or MCA filing is rejected due to premises documentation, 100% refund is processed with zero deductions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
"""

pos_solution_finder = html.find('<section class="section solution-finder" id="solutionFinder">')
if pos_solution_finder != -1 and 'id="voConfigurator"' not in html:
    html = html[:pos_solution_finder] + vo_configurator_html + '\n' + html[pos_solution_finder:]
    print("Inserted VO Configurator successfully!")

# ============================================================================
# 2. ADD MEETING ROOM BOOKING SECTION & GST APPLICATION TRACKER
# ============================================================================
mr_and_gst_html = """
  <!-- ====================================================================
       SECTION: MEETING ROOM SCHEDULER & BOOKING ENGINE
       PRD Version 2.0 (Sections 34 & 35: Booking States Engine)
       ==================================================================== -->
  <section class="section meeting-rooms-section" id="meetingRoomsSection">
    <div class="container">
      <div class="section__header section__header--center reveal">
        <span class="section__eyebrow" style="color: var(--vd-teal-primary);"><i class="ph-bold ph-presentation"></i> On-Demand Workspaces</span>
        <h2 class="section__title">RESERVE 4K MEETING ROOMS<br><span class="highlight-gold">&amp; EXECUTIVE BOARDROOMS</span></h2>
        <p class="section__desc">Select location, room calibre, date, and time slot. Instant availability check and state-machine booking confirmation.</p>
      </div>

      <div class="meeting-scheduler-box reveal">
        <div class="scheduler-form-grid">
          <div class="form-field">
            <label class="form-label" for="mrCitySelect"><i class="ph-bold ph-map-pin"></i> City / Hub</label>
            <select id="mrCitySelect" class="form-select" onchange="handleMrCityChange(this.value)">
              <option value="NSK-001">Nashik HQ — College Road</option>
              <option value="MUM-002">Mumbai — Bandra Kurla Complex (BKC)</option>
              <option value="DEL-001">Delhi — Connaught Place</option>
              <option value="BLR-001">Bangalore — Koramangala Tech Park</option>
              <option value="PNE-001">Pune — Baner Business Park</option>
              <option value="GUR-001">Gurgaon — DLF Cyber City</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label" for="mrRoomTypeSelect"><i class="ph-bold ph-door"></i> Room Category</label>
            <select id="mrRoomTypeSelect" class="form-select" onchange="calculateMrPrice()">
              <option value="Huddle Room" data-rate="499">Huddle Room (4 Pax) — &#8377;499/hr</option>
              <option value="Conference Room" data-rate="799" selected>Conference Room (8 Pax) — &#8377;799/hr</option>
              <option value="Boardroom" data-rate="1199">Executive Boardroom (12 Pax) — &#8377;1,199/hr</option>
              <option value="Training Hall" data-rate="1999">Training Hall (20 Pax) — &#8377;1,999/hr</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label" for="mrDateInput"><i class="ph-bold ph-calendar"></i> Date</label>
            <input type="date" id="mrDateInput" class="form-input" onchange="calculateMrPrice()">
          </div>

          <div class="form-field">
            <label class="form-label" for="mrTimeSlotSelect"><i class="ph-bold ph-clock"></i> Preferred Slot</label>
            <select id="mrTimeSlotSelect" class="form-select" onchange="calculateMrPrice()">
              <option value="09:00 AM - 11:00 AM">09:00 AM &ndash; 11:00 AM (Morning Slot)</option>
              <option value="11:30 AM - 01:30 PM">11:30 AM &ndash; 01:30 PM (Mid-Day Slot)</option>
              <option value="02:00 PM - 04:00 PM" selected>02:00 PM &ndash; 04:00 PM (Afternoon Slot)</option>
              <option value="04:30 PM - 06:30 PM">04:30 PM &ndash; 06:30 PM (Evening Slot)</option>
              <option value="07:00 PM - 09:00 PM">07:00 PM &ndash; 09:00 PM (Late Slot)</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label" for="mrDurationSelect"><i class="ph-bold ph-hourglass"></i> Duration</label>
            <select id="mrDurationSelect" class="form-select" onchange="calculateMrPrice()">
              <option value="1">1 Hour</option>
              <option value="2" selected>2 Hours (Standard Meeting)</option>
              <option value="4">4 Hours (Half Day &mdash; 10% Off)</option>
              <option value="8">8 Hours (Full Day &mdash; 20% Off)</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label" for="mrAttendeesInput"><i class="ph-bold ph-users"></i> Attendees</label>
            <input type="number" id="mrAttendeesInput" class="form-input" value="6" min="1" max="25" onchange="calculateMrPrice()">
          </div>
        </div>

        <!-- Meeting Price & Availability State Ticker -->
        <div class="mr-state-ticker">
          <div class="mr-state-badge available">
            <span class="state-dot"></span>
            <strong>Status: Available for Instant Hold</strong>
          </div>
          <div class="mr-pricing-tally">
            <span class="mr-rate-calc" id="mrRateCalc">2 Hours &times; &#8377;799/hr</span>
            <span class="mr-final-cost" id="mrFinalCost">&#8377;1,885 <small>(incl. 18% GST)</small></span>
          </div>
          <button type="button" class="btn btn--primary btn--lg" onclick="openMeetingBookingModal()">
            <i class="ph-bold ph-ticket"></i> Proceed to Reserve Room &rarr;
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================================================================
       SECTION: GST & APPLICATION STATUS TRACKING PLATFORM
       PRD Version 2.0 (Section 37: Track Documents Verified -> Submitted -> ARN -> Officer Review -> Completed)
       ==================================================================== -->
  <section class="section gst-tracker-section" id="gstTrackerSection">
    <div class="container">
      <div class="section__header section__header--center reveal">
        <span class="section__eyebrow" style="color: var(--vd-teal-primary);"><i class="ph-bold ph-magnifying-glass"></i> Live Compliance Telemetry</span>
        <h2 class="section__title">REAL-TIME APPLICATION<br><span class="highlight-gold">&amp; GST STATUS TRACKER</span></h2>
        <p class="section__desc">Enter your V-DESK Application Ref or Government ARN to view verified live processing milestones.</p>
      </div>

      <div class="tracker-console reveal">
        <div class="tracker-input-row">
          <div class="tracker-input-wrap">
            <i class="ph-bold ph-barcode tracker-icon"></i>
            <input type="text" id="gstTrackerInput" class="tracker-input" placeholder="Enter ARN or App Ref (e.g. AA270326019284Z or VD-MUM-8921)..." value="AA270326019284Z">
          </div>
          <button type="button" class="btn btn--primary tracker-btn" onclick="lookupGstTrackerStatus()">
            <i class="ph-bold ph-arrow-counter-clockwise"></i> Track Status
          </button>
        </div>

        <!-- Live Step Tracker Bar (PRD Sec 37) -->
        <div class="gst-stepper" id="gstStepperDisplay">
          <div class="gst-step completed">
            <div class="gst-step-circle"><i class="ph-bold ph-check"></i></div>
            <div class="gst-step-label">Documents Verified</div>
            <div class="gst-step-date">10 Mar 2026</div>
          </div>
          <div class="gst-step-line completed"></div>

          <div class="gst-step completed">
            <div class="gst-step-circle"><i class="ph-bold ph-check"></i></div>
            <div class="gst-step-label">Application Submitted</div>
            <div class="gst-step-date">11 Mar 2026</div>
          </div>
          <div class="gst-step-line completed"></div>

          <div class="gst-step completed">
            <div class="gst-step-circle"><i class="ph-bold ph-check"></i></div>
            <div class="gst-step-label">ARN Generated</div>
            <div class="gst-step-date">11 Mar 2026 &bull; 04:15 PM</div>
          </div>
          <div class="gst-step-line in-progress"></div>

          <div class="gst-step active">
            <div class="gst-step-circle"><i class="ph-bold ph-hourglass-high"></i></div>
            <div class="gst-step-label">Officer Review</div>
            <div class="gst-step-date">In Progress &bull; Ward 4</div>
          </div>
          <div class="gst-step-line"></div>

          <div class="gst-step pending">
            <div class="gst-step-circle">5</div>
            <div class="gst-step-label">Registration Completed</div>
            <div class="gst-step-date">Expected 14 Mar</div>
          </div>
        </div>

        <div class="tracker-detail-banner" id="gstTrackerDetailBanner">
          <div class="tracker-badge-pill"><i class="ph-bold ph-shield-check"></i> V-DESK Compliance Desk</div>
          <div class="tracker-message">
            <strong>Current Stage: Officer Scrutiny (Ward 4B, Mumbai MMR)</strong>
            <span>Our legal representative is coordinating with the jurisdictional tax officer. Rent agreement and electricity NOC verified. No physical inspection query raised.</span>
          </div>
          <button type="button" class="btn btn--outline btn--sm" onclick="openConsultationModal('GST ARN Expedite Assistance')">
            <i class="ph-bold ph-headset"></i> Request Expedite
          </button>
        </div>
      </div>
    </div>
  </section>
"""

pos_wizard = html.find('<section class="section wizard" id="wizard">')
if pos_wizard != -1 and 'id="meetingRoomsSection"' not in html:
    html = html[:pos_wizard] + mr_and_gst_html + '\n' + html[pos_wizard:]
    print("Inserted Meeting Rooms & GST Tracker successfully!")

# ============================================================================
# 3. ADD PRD v2.0 INTERACTIVE MODALS
# ============================================================================
modals_html = """
  <!-- ====================================================================
       PRD v2.0 MODAL: UNIVERSAL SEARCH RESULTS & FACETED EXPLORER (PRD Sec 15 & 16)
       ==================================================================== -->
  <div class="modal-overlay" id="universalSearchResultsModal" onclick="closeModalOnBackdrop(event, 'universalSearchResultsModal')" aria-hidden="true">
    <div class="modal-card modal-card--full-explorer" role="dialog" aria-modal="true">
      <div class="modal-card__header">
        <div class="explorer-header-left">
          <span class="explorer-badge"><i class="ph-bold ph-magnifying-glass"></i> V-DESK Universal Search Engine</span>
          <h3 class="modal-card__title" id="searchResultsModalTitle">Search Results for "Virtual Office in Mumbai"</h3>
        </div>
        <button class="modal-card__close" onclick="closeModal('universalSearchResultsModal')">&times;</button>
      </div>

      <!-- Real-Time Intent Notification Strip -->
      <div class="explorer-intent-strip" id="explorerIntentStrip">
        <div class="intent-strip__content">
          <i class="ph-bold ph-lightning" style="color: var(--vd-gold-primary);"></i>
          <span><strong>Detected Intent:</strong> <span id="explorerIntentParsed">Virtual Office &bull; Location: Mumbai &bull; Grade-A Hubs</span></span>
        </div>
        <div class="intent-strip__count" id="explorerResultCount">Showing 3 Available Locations</div>
      </div>

      <div class="explorer-layout">
        <!-- Sidebar Faceted Filters (PRD Sec 15) -->
        <aside class="explorer-filter-sidebar">
          <div class="filter-sidebar__header">
            <h4><i class="ph-bold ph-faders"></i> Faceted Filters</h4>
            <button type="button" class="filter-reset-btn" onclick="resetExplorerFilters()">Reset</button>
          </div>

          <div class="filter-group">
            <label class="filter-group__title">City / Region</label>
            <select id="filterCity" class="form-select filter-select" onchange="filterExplorerResults()">
              <option value="all">All Cities (Pan-India)</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Nashik">Nashik (HQ)</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Noida">Noida</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-group__title">Workspace Type</label>
            <select id="filterType" class="form-select filter-select" onchange="filterExplorerResults()">
              <option value="all">All Solutions</option>
              <option value="Virtual Office">Virtual Office (GST/MCA)</option>
              <option value="Coworking">Coworking Flex Desks</option>
              <option value="Private Office">Private Executive Cabins</option>
              <option value="Meeting Rooms">Meeting Rooms &amp; Boardrooms</option>
              <option value="Company Registration">Company Registration</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-group__title">Capacity</label>
            <div class="filter-capacity-pills">
              <button type="button" class="cap-pill active" onclick="setExplorerCapacity(this, 'all')">Any</button>
              <button type="button" class="cap-pill" onclick="setExplorerCapacity(this, '1')">1</button>
              <button type="button" class="cap-pill" onclick="setExplorerCapacity(this, '2-5')">2&ndash;5</button>
              <button type="button" class="cap-pill" onclick="setExplorerCapacity(this, '6-10')">6&ndash;10</button>
              <button type="button" class="cap-pill" onclick="setExplorerCapacity(this, '11-25')">11&ndash;25</button>
              <button type="button" class="cap-pill" onclick="setExplorerCapacity(this, '25+')">25+</button>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-group__title">Maximum Budget / Month</label>
            <input type="range" id="filterPriceRange" min="500" max="15000" step="500" value="15000" class="filter-range" oninput="updateExplorerPriceFilter(this.value)">
            <div class="filter-price-readout">Up to <strong id="filterPriceDisplay">&#8377;15,000</strong>/mo</div>
          </div>

          <div class="filter-group">
            <label class="filter-group__title">Key Amenities</label>
            <label class="filter-checkbox"><input type="checkbox" id="filterAmenityGst" onchange="filterExplorerResults()" checked> GST Suitable &amp; NOC</label>
            <label class="filter-checkbox"><input type="checkbox" id="filterAmenityWifi" onchange="filterExplorerResults()"> High-Speed Wi-Fi</label>
            <label class="filter-checkbox"><input type="checkbox" id="filterAmenityParking" onchange="filterExplorerResults()"> Reserved Parking</label>
            <label class="filter-checkbox"><input type="checkbox" id="filterAmenityMeeting" onchange="filterExplorerResults()"> 4K Meeting Room</label>
            <label class="filter-checkbox"><input type="checkbox" id="filterAmenity247" onchange="filterExplorerResults()"> 24/7 Access</label>
          </div>

          <div class="filter-group">
            <label class="filter-group__title">Sort By</label>
            <select id="filterSort" class="form-select filter-select" onchange="filterExplorerResults()">
              <option value="recommended">Recommended &amp; Flagship</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="capacity">Highest Capacity</option>
            </select>
          </div>
        </aside>

        <!-- Results Grid & Zero-Result Fallback (PRD Sec 15 & 16) -->
        <main class="explorer-results-main">
          <div class="explorer-results-grid" id="explorerResultsGrid">
            <!-- Dynamically populated by app.js renderExplorerResults() -->
          </div>

          <!-- Zero-Result Experience (PRD Sec 16) -->
          <div class="zero-results-card" id="zeroResultsCard" style="display: none;">
            <div class="zero-results-icon"><i class="ph-bold ph-magnifying-glass"></i></div>
            <h4 class="zero-results-title">We couldn't find an exact match.</h4>
            <p class="zero-results-desc">We don't currently list an off-the-shelf hub matching all your exact parameters, but our operations network covers 100+ micro-markets across India.</p>
            
            <div class="zero-results-recommendations">
              <h5>Recommended Alternatives:</h5>
              <div class="zero-rec-tags">
                <button type="button" class="zero-tag" onclick="quickChipSearch('Mumbai')"><i class="ph-bold ph-map-pin"></i> Mumbai (MMR Hubs)</button>
                <button type="button" class="zero-tag" onclick="quickChipSearch('Nashik')"><i class="ph-bold ph-buildings"></i> Nashik Headquarters</button>
                <button type="button" class="zero-tag" onclick="quickChipSearch('Virtual Office')"><i class="ph-bold ph-certificate"></i> Pan-India Virtual Office</button>
              </div>
            </div>

            <div class="zero-results-cta-box">
              <span>Need a custom solution tailored to your exact team size or city?</span>
              <button type="button" class="btn btn--primary" onclick="closeModal('universalSearchResultsModal'); openConsultationModal('Custom Search Sourcing')">
                <i class="ph-bold ph-headset"></i> Talk to a V-DESK Expert
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 MODAL: MEETING ROOM BOOKING STATE MACHINE (PRD Sec 34 & 35)
       ==================================================================== -->
  <div class="modal-overlay" id="meetingRoomBookingModal" onclick="closeModalOnBackdrop(event, 'meetingRoomBookingModal')" aria-hidden="true">
    <div class="modal-card modal-card--room-booking" role="dialog" aria-modal="true">
      <div class="modal-card__header">
        <div class="legal-modal__title-wrap">
          <span class="legal-modal__badge"><i class="ph-bold ph-presentation"></i> On-Demand Reservation</span>
          <h3 class="modal-card__title">Reserve Executive Meeting Room</h3>
        </div>
        <button class="modal-card__close" onclick="closeModal('meetingRoomBookingModal')">&times;</button>
      </div>

      <!-- State Flow Indicator (PRD Sec 35) -->
      <div class="booking-state-stepper" id="bookingStateStepper">
        <div class="state-step active" id="bStep1"><span>1</span> Availability</div>
        <div class="state-step-arrow">&rarr;</div>
        <div class="state-step" id="bStep2"><span>2</span> Room Hold</div>
        <div class="state-step-arrow">&rarr;</div>
        <div class="state-step" id="bStep3"><span>3</span> Payment</div>
        <div class="state-step-arrow">&rarr;</div>
        <div class="state-step" id="bStep4"><span>4</span> Confirmed</div>
      </div>

      <div class="room-booking-body" id="roomBookingBody">
        <!-- Step 1: Summary & Contact Details -->
        <div id="roomBookingStepSummary">
          <div class="room-summary-banner">
            <div class="room-summary-meta">
              <strong id="rbSelectedRoom">Executive Conference Room (8 Pax)</strong>
              <span id="rbSelectedHub">V-DESK HQ &mdash; College Road, Nashik</span>
              <div class="rb-slot-pill" id="rbSelectedSlot"><i class="ph-bold ph-clock"></i> Today, 02:00 PM &ndash; 04:00 PM (2 Hours)</div>
            </div>
            <div class="room-summary-price">
              <span class="price-val" id="rbTotalPrice">&#8377;1,885</span>
              <span class="price-gst">Includes 18% GST</span>
            </div>
          </div>

          <form id="roomBookingUserForm" onsubmit="handleRoomBookingHold(event)" style="margin-top: 18px;">
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="rbName">Full Name *</label>
                <input type="text" id="rbName" class="form-input" placeholder="e.g. Vikramaditya Roy" required>
              </div>
              <div class="form-field">
                <label class="form-label" for="rbCompany">Company / Organization *</label>
                <input type="text" id="rbCompany" class="form-input" placeholder="e.g. Acme Innovations" required>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="rbMobile">WhatsApp / Mobile No. *</label>
                <input type="tel" id="rbMobile" class="form-input" placeholder="10-digit mobile number" pattern="[0-9]{10}" required>
              </div>
              <div class="form-field">
                <label class="form-label" for="rbEmail">Business Email *</label>
                <input type="email" id="rbEmail" class="form-input" placeholder="name@company.com" required>
              </div>
            </div>

            <div class="room-amenities-check">
              <span><i class="ph-bold ph-wifi-high"></i> High-Speed Wi-Fi (300 Mbps)</span>
              <span><i class="ph-bold ph-monitor"></i> 4K Presentation Display</span>
              <span><i class="ph-bold ph-coffee"></i> Executive Coffee/Tea</span>
              <span><i class="ph-bold ph-chalkboard"></i> Glass Whiteboard</span>
            </div>

            <div style="margin-top: 20px; display: flex; gap: 12px;">
              <button type="submit" class="btn btn--primary btn--block btn--lg">
                <i class="ph-bold ph-lock-key"></i> Lock Slot &amp; Proceed to Pay &rarr;
              </button>
            </div>
          </form>
        </div>

        <!-- Step 2: Room Hold & Payment Pending -->
        <div id="roomBookingStepHold" style="display: none;">
          <div class="hold-timer-card">
            <div class="hold-timer-circle">
              <span id="holdTimerCountdown">09:59</span>
              <small>Hold Active</small>
            </div>
            <h4>Your Room Slot is Temporarily Locked</h4>
            <p>We have placed a 10-minute hold on this room to prevent double-booking while you complete payment.</p>
          </div>

          <div style="margin-top: 20px;">
            <button type="button" class="btn btn--primary btn--block btn--lg" onclick="triggerBookingCheckout()">
              <i class="ph-bold ph-credit-card"></i> Pay Now (&#8377;1,885) &rarr;
            </button>
            <button type="button" class="btn btn--outline btn--block" style="margin-top: 8px;" onclick="cancelRoomBookingHold()">
              Release Slot
            </button>
          </div>
        </div>

        <!-- Step 3: Confirmed Pass -->
        <div id="roomBookingStepConfirmed" style="display: none;">
          <div class="booking-confirmation-pass">
            <div class="pass-header">
              <span class="pass-status"><i class="ph-bold ph-check-circle"></i> BOOKING CONFIRMED</span>
              <span class="pass-code" id="passBookingId">BK-2026-9812</span>
            </div>
            <div class="pass-body">
              <h4 id="passRoomName">Executive Conference Room (8 Pax)</h4>
              <p id="passCentreName">V-DESK Headquarters &mdash; College Road, Nashik</p>
              <div class="pass-grid">
                <div><strong>Host:</strong> <span id="passHostName">Vikramaditya Roy</span></div>
                <div><strong>Date &amp; Time:</strong> <span id="passSlotTime">18 Sep &bull; 02:00 PM</span></div>
                <div><strong>Attendees:</strong> <span id="passPax">6 Pax</span></div>
                <div><strong>Wi-Fi Passcode:</strong> <code>VDESK-VIP-2026</code></div>
              </div>
            </div>
            <div class="pass-actions">
              <button type="button" class="btn btn--secondary btn--sm" onclick="window.print()"><i class="ph-bold ph-printer"></i> Print Pass</button>
              <button type="button" class="btn btn--primary btn--sm" onclick="closeModal('meetingRoomBookingModal'); showToast('Booking Pass Saved', 'Sent to your WhatsApp & Email', 'success');"><i class="ph-bold ph-check"></i> Done</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 MODAL: SELF-SERVICE CUSTOMER PORTAL (PRD Sec 45 & 49)
       ==================================================================== -->
  <div class="modal-overlay" id="customerPortalModal" onclick="closeModalOnBackdrop(event, 'customerPortalModal')" aria-hidden="true">
    <div class="modal-card modal-card--customer-portal" role="dialog" aria-modal="true">
      <div class="portal-header">
        <div class="portal-user-badge">
          <div class="user-avatar"><i class="ph-bold ph-buildings"></i></div>
          <div class="user-info">
            <h3 class="user-company" id="portalCompanyName">Zenith D2C Brands Pvt Ltd</h3>
            <span class="user-director">Director: Priya Kulkarni &bull; Account: <strong>VD-AC-8921</strong></span>
          </div>
        </div>
        <button class="modal-card__close" onclick="closeModal('customerPortalModal')">&times;</button>
      </div>

      <!-- Portal Tabs -->
      <div class="portal-tabs">
        <button type="button" class="portal-tab-btn active" onclick="switchPortalTab('activeServices')"><i class="ph-bold ph-check-circle"></i> Active Services</button>
        <button type="button" class="portal-tab-btn" onclick="switchPortalTab('bookings')"><i class="ph-bold ph-presentation"></i> Bookings</button>
        <button type="button" class="portal-tab-btn" onclick="switchPortalTab('documents')"><i class="ph-bold ph-files"></i> Documents &amp; KYC</button>
        <button type="button" class="portal-tab-btn" onclick="switchPortalTab('invoices')"><i class="ph-bold ph-receipt"></i> Invoices</button>
        <button type="button" class="portal-tab-btn" onclick="switchPortalTab('renewals')"><i class="ph-bold ph-arrows-clockwise"></i> Renewals</button>
        <button type="button" class="portal-tab-btn" onclick="switchPortalTab('support')"><i class="ph-bold ph-headset"></i> Support Desk</button>
      </div>

      <div class="portal-tab-content" id="portalTabContent">
        <!-- Rendered dynamically by app.js renderCustomerPortal() -->
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 MODAL: DIGITAL KYC & DOCUMENT MANAGEMENT CENTER (PRD Sec 46 & 47)
       ==================================================================== -->
  <div class="modal-overlay" id="digitalKycModal" onclick="closeModalOnBackdrop(event, 'digitalKycModal')" aria-hidden="true">
    <div class="modal-card modal-card--kyc" role="dialog" aria-modal="true">
      <div class="modal-card__header">
        <div class="legal-modal__title-wrap">
          <span class="legal-modal__badge"><i class="ph-bold ph-shield-check"></i> Paperless Verification</span>
          <h3 class="modal-card__title">Digital KYC &amp; Verification Desk</h3>
        </div>
        <button class="modal-card__close" onclick="closeModal('digitalKycModal')">&times;</button>
      </div>

      <p class="modal-card__subtitle">Mandatory compliance under CGST Act 2017 &amp; MCA SPICe+ rules. Documents are encrypted and verified within 4 hours.</p>

      <div class="kyc-doc-uploader">
        <!-- Document Check Items -->
        <div class="kyc-doc-list">
          <div class="kyc-doc-row">
            <div class="doc-icon"><i class="ph-bold ph-identification-card"></i></div>
            <div class="doc-details">
              <strong>1. Company / Signatory PAN Card *</strong>
              <span>Government issued PAN card (Clear color scan)</span>
            </div>
            <div class="doc-action">
              <label class="doc-upload-btn">
                <input type="file" onchange="simulateKycDocUpload(this, 'PAN Card')">
                <i class="ph-bold ph-upload-simple"></i> Upload
              </label>
              <span class="doc-status uploaded" id="kycStatusPAN"><i class="ph-bold ph-check"></i> Uploaded</span>
            </div>
          </div>

          <div class="kyc-doc-row">
            <div class="doc-icon"><i class="ph-bold ph-address-book"></i></div>
            <div class="doc-details">
              <strong>2. Aadhaar / Passport of Director *</strong>
              <span>Front &amp; Back address proof with masked UIDAI</span>
            </div>
            <div class="doc-action">
              <label class="doc-upload-btn">
                <input type="file" onchange="simulateKycDocUpload(this, 'Aadhaar Card')">
                <i class="ph-bold ph-upload-simple"></i> Upload
              </label>
              <span class="doc-status uploaded" id="kycStatusAadhaar"><i class="ph-bold ph-check"></i> Uploaded</span>
            </div>
          </div>

          <div class="kyc-doc-row">
            <div class="doc-icon"><i class="ph-bold ph-buildings"></i></div>
            <div class="doc-details">
              <strong>3. Certificate of Incorporation / Partnership Deed</strong>
              <span>MCA CIN or Registered LLP agreement (Optional for Sole Prop)</span>
            </div>
            <div class="doc-action">
              <label class="doc-upload-btn">
                <input type="file" onchange="simulateKycDocUpload(this, 'COI')">
                <i class="ph-bold ph-upload-simple"></i> Upload
              </label>
              <span class="doc-status pending" id="kycStatusCOI">Pending Upload</span>
            </div>
          </div>

          <div class="kyc-doc-row">
            <div class="doc-icon"><i class="ph-bold ph-bank"></i></div>
            <div class="doc-details">
              <strong>4. Bank Proof / Cancelled Cheque</strong>
              <span>Bank statement showing company name or director name</span>
            </div>
            <div class="doc-action">
              <label class="doc-upload-btn">
                <input type="file" onchange="simulateKycDocUpload(this, 'Bank Proof')">
                <i class="ph-bold ph-upload-simple"></i> Upload
              </label>
              <span class="doc-status uploaded" id="kycStatusBank"><i class="ph-bold ph-check"></i> Uploaded</span>
            </div>
          </div>
        </div>

        <!-- Simulated OTP Verification Step (PRD Sec 47) -->
        <div class="kyc-otp-box">
          <div class="otp-header">
            <i class="ph-bold ph-fingerprint"></i>
            <span>Director Aadhaar / Mobile OTP Verification</span>
          </div>
          <div class="otp-inputs">
            <input type="text" maxlength="1" class="otp-digit" value="4">
            <input type="text" maxlength="1" class="otp-digit" value="8">
            <input type="text" maxlength="1" class="otp-digit" value="2">
            <input type="text" maxlength="1" class="otp-digit" value="1">
            <span class="otp-verified-badge"><i class="ph-bold ph-check-circle"></i> Mobile Verified (+91 98*** **210)</span>
          </div>
        </div>

        <!-- Consent & Declaration -->
        <label class="kyc-consent-label">
          <input type="checkbox" id="kycConsentCheckbox" checked>
          <span>I hereby give consent to V-DESK Workspace &amp; Consulting LLP to verify identity documents for registered lease deed preparation and statutory GST/MCA filing.</span>
        </label>

        <div class="kyc-actions">
          <button type="button" class="btn btn--primary btn--block btn--lg" onclick="submitKycApplication()">
            <i class="ph-bold ph-paper-plane-tilt"></i> Submit Complete KYC Dossier &rarr;
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 MODAL: DYNAMIC QUOTE ENGINE & DIGITAL PROPOSALS (PRD Sec 41)
       ==================================================================== -->
  <div class="modal-overlay" id="quoteProposalModal" onclick="closeModalOnBackdrop(event, 'quoteProposalModal')" aria-hidden="true">
    <div class="modal-card modal-card--proposal" role="dialog" aria-modal="true">
      <div class="modal-card__header">
        <div class="legal-modal__title-wrap">
          <span class="legal-modal__badge"><i class="ph-bold ph-file-text"></i> Formal Quotation</span>
          <h3 class="modal-card__title">Official Commercial Proposal</h3>
        </div>
        <button class="modal-card__close" onclick="closeModal('quoteProposalModal')">&times;</button>
      </div>

      <div class="proposal-document" id="proposalDocContent">
        <div class="proposal-header">
          <div class="proposal-brand">
            <img src="assets/vdesk-logo.svg" alt="V-DESK" style="height: 38px;">
            <div class="proposal-legal">V-DESK Workspace &amp; Consulting LLP &bull; LLPIN: AAY-9842</div>
          </div>
          <div class="proposal-meta-card">
            <div><strong>Quote Ref:</strong> <span id="propQuoteId">VDQ-2026-8941</span></div>
            <div><strong>Date:</strong> <span id="propDate">12 Sep 2026</span></div>
            <div><strong>Validity:</strong> <span>15 Days</span></div>
            <div><strong>Status:</strong> <span class="badge-status-proposal" id="propStatus">ACTIVE / SENT</span></div>
          </div>
        </div>

        <div class="proposal-client-row">
          <div>
            <span class="sub-label">Prepared For:</span>
            <strong id="propClientName">Vikramaditya Roy</strong>
            <span id="propClientCompany">Acme Innovations Pvt Ltd</span>
            <span id="propClientContact">+91 98765 43210 &bull; contact@acme.com</span>
          </div>
          <div>
            <span class="sub-label">Designated Centre:</span>
            <strong id="propLocation">V-DESK Headquarters &mdash; College Road</strong>
            <span>Nashik, Maharashtra &ndash; 422005</span>
            <span>Commercial Office Premises</span>
          </div>
        </div>

        <table class="proposal-table">
          <thead>
            <tr>
              <th>Description / Service Package</th>
              <th>Tenure</th>
              <th>Rate / Mo</th>
              <th style="text-align: right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody id="propTableBody">
            <tr>
              <td>
                <strong>Commercial Business Address &amp; NOC</strong><br>
                <small>Registered rent agreement, electricity bill, and owner NOC for GST/MCA</small>
              </td>
              <td>12 Months</td>
              <td>&#8377;1,249</td>
              <td style="text-align: right;">&#8377;14,988</td>
            </tr>
            <tr>
              <td>
                <strong>Dedicated GST Support &amp; Officer Visit Attendance</strong><br>
                <small>Physical board signage, documentation response, and verification</small>
              </td>
              <td>12 Months</td>
              <td>&#8377;350</td>
              <td style="text-align: right;">&#8377;4,200</td>
            </tr>
            <tr>
              <td>
                <strong>Physical Mail &amp; Courier Forwarding Concierge</strong><br>
                <small>Daily mail logging and digital envelope scans</small>
              </td>
              <td>12 Months</td>
              <td>&#8377;299</td>
              <td style="text-align: right;">&#8377;3,588</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right;">Subtotal:</td>
              <td style="text-align: right;" id="propSubtotal">&#8377;22,776</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; color: var(--vd-gold-primary);">Annual Discount (20% Off):</td>
              <td style="text-align: right; color: var(--vd-gold-primary);" id="propDiscount">-&#8377;4,555</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;">Applicable GST (18%):</td>
              <td style="text-align: right;" id="propGst">&#8377;3,279</td>
            </tr>
            <tr class="grand-total-row">
              <td colspan="3" style="text-align: right;"><strong>Total Payable:</strong></td>
              <td style="text-align: right;"><strong id="propTotal">&#8377;21,499</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="proposal-terms">
          <strong>Key Terms &amp; Compliance Notes:</strong>
          <ul>
            <li>Deliverables include notarized rent agreement, electricity bill copy, and owner NOC issued within 24 working hours of KYC clearance.</li>
            <li>100% money-back guarantee in case of rejection by tax authority due to address documentation defect.</li>
            <li>Assigned Solutions Specialist: <strong>Adv. Rahul Deshmukh</strong> (+91 98765 43210 &bull; rahul@vdeskworkspace.com)</li>
          </ul>
        </div>

        <div class="proposal-actions">
          <button type="button" class="btn btn--outline" onclick="copyQuoteLink()"><i class="ph-bold ph-link"></i> Copy Share Link</button>
          <button type="button" class="btn btn--secondary" onclick="window.print()"><i class="ph-bold ph-printer"></i> Print / PDF</button>
          <button type="button" class="btn btn--primary" onclick="proceedQuoteToPayment()"><i class="ph-bold ph-credit-card"></i> Accept &amp; Pay Online &rarr;</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 MODAL: UNIFIED PAYMENT & CHECKOUT SYSTEM (PRD Sec 48)
       ==================================================================== -->
  <div class="modal-overlay" id="paymentCheckoutModal" onclick="closeModalOnBackdrop(event, 'paymentCheckoutModal')" aria-hidden="true">
    <div class="modal-card modal-card--checkout" role="dialog" aria-modal="true">
      <div class="modal-card__header">
        <div class="legal-modal__title-wrap">
          <span class="legal-modal__badge"><i class="ph-bold ph-lock-key"></i> 256-Bit Encrypted Gateway</span>
          <h3 class="modal-card__title">Checkout &amp; Instant Activation</h3>
        </div>
        <button class="modal-card__close" onclick="closeModal('paymentCheckoutModal')">&times;</button>
      </div>

      <div class="checkout-layout">
        <div class="checkout-methods">
          <div class="checkout-tabs">
            <button type="button" class="pay-tab active" onclick="switchPayMethod('upi')"><i class="ph-bold ph-qr-code"></i> UPI / QR</button>
            <button type="button" class="pay-tab" onclick="switchPayMethod('card')"><i class="ph-bold ph-credit-card"></i> Card</button>
            <button type="button" class="pay-tab" onclick="switchPayMethod('netbanking')"><i class="ph-bold ph-bank"></i> Net Banking</button>
          </div>

          <!-- UPI Form -->
          <div class="pay-body" id="payMethodUpi">
            <div class="upi-qr-box">
              <div class="qr-placeholder">
                <i class="ph-bold ph-qr-code qr-big-icon"></i>
                <span>Scan with Google Pay, PhonePe, Paytm or BHIM</span>
              </div>
              <div class="upi-id-row">
                <span>Or enter UPI VPA ID:</span>
                <div class="upi-input-flex">
                  <input type="text" class="form-input" placeholder="username@okhdfcbank" id="upiVpaInput">
                  <button type="button" class="btn btn--primary btn--sm" onclick="simulatePaymentProcessing('UPI ID')">Pay Now</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Form -->
          <div class="pay-body" id="payMethodCard" style="display: none;">
            <div class="form-field">
              <label class="form-label">Card Number</label>
              <input type="text" class="form-input" placeholder="4532 •••• •••• 8921" maxlength="19">
            </div>
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label">Expiry MM/YY</label>
                <input type="text" class="form-input" placeholder="12/28" maxlength="5">
              </div>
              <div class="form-field">
                <label class="form-label">CVV</label>
                <input type="password" class="form-input" placeholder="•••" maxlength="3">
              </div>
            </div>
            <button type="button" class="btn btn--primary btn--block btn--lg" style="margin-top: 10px;" onclick="simulatePaymentProcessing('Card')">
              Pay Securely &rarr;
            </button>
          </div>

          <!-- Net Banking -->
          <div class="pay-body" id="payMethodNetbanking" style="display: none;">
            <label class="form-label">Select Bank</label>
            <div class="bank-grid">
              <button type="button" class="bank-pill" onclick="simulatePaymentProcessing('HDFC Bank')">HDFC Bank</button>
              <button type="button" class="bank-pill" onclick="simulatePaymentProcessing('ICICI Bank')">ICICI Bank</button>
              <button type="button" class="bank-pill" onclick="simulatePaymentProcessing('SBI')">State Bank of India</button>
              <button type="button" class="bank-pill" onclick="simulatePaymentProcessing('Axis Bank')">Axis Bank</button>
            </div>
          </div>
        </div>

        <div class="checkout-summary-box">
          <h4>Order Summary</h4>
          <div class="checkout-summary-row">
            <span id="chkProductName">Virtual Office Package</span>
            <strong id="chkSubtotal">&#8377;18,220</strong>
          </div>
          <div class="checkout-summary-row">
            <span>GST (18%):</span>
            <strong id="chkGst">&#8377;3,279</strong>
          </div>
          <div class="checkout-summary-divider"></div>
          <div class="checkout-summary-row checkout-summary-row--total">
            <span>Payable Amount:</span>
            <strong id="chkTotal">&#8377;21,499</strong>
          </div>
          <div class="checkout-trust-badge">
            <i class="ph-bold ph-shield-check"></i>
            <span>Tax Invoice issued instantly upon confirmation</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 MODAL: COMPANY REGISTRATION WIZARD (PRD Sec 36)
       ==================================================================== -->
  <div class="modal-overlay" id="companyRegModal" onclick="closeModalOnBackdrop(event, 'companyRegModal')" aria-hidden="true">
    <div class="modal-card modal-card--wide" role="dialog" aria-modal="true">
      <div class="modal-card__header">
        <div class="legal-modal__title-wrap">
          <span class="legal-modal__badge"><i class="ph-bold ph-file-text"></i> START Foundation</span>
          <h3 class="modal-card__title">Company Incorporation Platform</h3>
        </div>
        <button class="modal-card__close" onclick="closeModal('companyRegModal')">&times;</button>
      </div>

      <div class="entity-picker-grid">
        <div class="entity-card active" onclick="selectCompanyEntity(this, 'Pvt Ltd')">
          <div class="entity-badge">Most Popular</div>
          <h4>Private Limited Company</h4>
          <p>For high-growth startups seeking equity investment, ESOP pools, and limited liability.</p>
          <div class="entity-price">&#8377;4,999 <small>+ Govt Fees</small></div>
        </div>

        <div class="entity-card" onclick="selectCompanyEntity(this, 'LLP')">
          <div class="entity-badge">Low Compliance</div>
          <h4>Limited Liability Partnership (LLP)</h4>
          <p>Best for consulting, service agencies, professional firms, and multi-partner ventures.</p>
          <div class="entity-price">&#8377;3,999 <small>+ Govt Fees</small></div>
        </div>

        <div class="entity-card" onclick="selectCompanyEntity(this, 'OPC')">
          <div class="entity-badge">Solo Founder</div>
          <h4>One Person Company (OPC)</h4>
          <p>100% corporate identity and protection for single founders with zero co-founder requirement.</p>
          <div class="entity-price">&#8377;4,499 <small>+ Govt Fees</small></div>
        </div>

        <div class="entity-card" onclick="selectCompanyEntity(this, 'Section 8')">
          <div class="entity-badge">Non-Profit</div>
          <h4>Section 8 Foundation</h4>
          <p>For NGOs, trusts, research consortiums, and social impact enterprises.</p>
          <div class="entity-price">&#8377;7,999 <small>+ Govt Fees</small></div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
        <button type="button" class="btn btn--outline" onclick="closeModal('companyRegModal')">Cancel</button>
        <button type="button" class="btn btn--primary" onclick="proceedEntityToQuote()">
          <span>Proceed with Selected Entity &rarr;</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 UPGRADED CENTRALIZED ADMIN SUITE (PRD Sec 42-44, 52-56)
       ==================================================================== -->
  <div class="modal-overlay" id="adminSuiteModal" onclick="closeModalOnBackdrop(event, 'adminSuiteModal')" aria-hidden="true">
    <div class="modal-card modal-card--full-admin" role="dialog" aria-modal="true">
      <div class="admin-top-bar">
        <div class="admin-top-brand">
          <i class="ph-bold ph-gear-six" style="color: var(--vd-gold-primary); font-size: 1.4rem;"></i>
          <div>
            <h3 style="margin: 0; font-size: 1.25rem; color: #fff;">V-DESK Centralized Operations &amp; CRM Platform</h3>
            <span style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">PRD Version 2.0 Management Console &bull; Role: Super Admin</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn--outline btn--sm" onclick="seedSampleLeads()"><i class="ph-bold ph-arrows-clockwise"></i> Reset Demo Data</button>
          <button class="modal-card__close" onclick="closeModal('adminSuiteModal')" style="color: #fff;">&times;</button>
        </div>
      </div>

      <!-- Admin Navigation Tabs (PRD Sec 52) -->
      <div class="admin-nav-tabs">
        <button type="button" class="admin-tab active" onclick="switchAdminTab('dashboard')"><i class="ph-bold ph-gauge"></i> Executive Dashboard</button>
        <button type="button" class="admin-tab" onclick="switchAdminTab('pipeline')"><i class="ph-bold ph-kanban"></i> Leads Pipeline (CRM)</button>
        <button type="button" class="admin-tab" onclick="switchAdminTab('customers')"><i class="ph-bold ph-users"></i> Customers</button>
        <button type="button" class="admin-tab" onclick="switchAdminTab('inventory')"><i class="ph-bold ph-buildings"></i> Locations &amp; Inventory</button>
        <button type="button" class="admin-tab" onclick="switchAdminTab('pricing')"><i class="ph-bold ph-currency-inr"></i> Pricing Rules Engine</button>
        <button type="button" class="admin-tab" onclick="switchAdminTab('kyc')"><i class="ph-bold ph-fingerprint"></i> KYC Verification Desk</button>
        <button type="button" class="admin-tab" onclick="switchAdminTab('cms')"><i class="ph-bold ph-browser"></i> CMS &amp; Search Controls</button>
        <button type="button" class="admin-tab" onclick="switchAdminTab('telemetry')"><i class="ph-bold ph-chart-line-up"></i> Search Analytics</button>
      </div>

      <div class="admin-tab-body" id="adminTabBody" style="padding: 24px; max-height: calc(88vh - 120px); overflow-y: auto;">
        <!-- Rendered dynamically by app.js renderAdminSuiteTab() -->
      </div>
    </div>
  </div>

  <!-- ====================================================================
       PRD v2.0 NATIVE MOBILE BOTTOM NAVIGATION DOCK (PRD Sec 64)
       Bottom navigation: Home | Search | Bookings | Services | Account
       ==================================================================== -->
  <nav class="mobile-app-bottom-dock" aria-label="Mobile Navigation">
    <button type="button" class="mobile-dock-btn active" onclick="switchMobileNav('home')">
      <i class="ph-bold ph-house"></i>
      <span>Home</span>
    </button>
    <button type="button" class="mobile-dock-btn" onclick="switchMobileNav('search')">
      <i class="ph-bold ph-magnifying-glass"></i>
      <span>Search</span>
    </button>
    <button type="button" class="mobile-dock-btn" onclick="switchMobileNav('bookings')">
      <i class="ph-bold ph-presentation"></i>
      <span>Bookings</span>
    </button>
    <button type="button" class="mobile-dock-btn" onclick="switchMobileNav('services')">
      <i class="ph-bold ph-squares-four"></i>
      <span>Services</span>
    </button>
    <button type="button" class="mobile-dock-btn" onclick="switchMobileNav('account')">
      <i class="ph-bold ph-user-circle"></i>
      <span>Account</span>
    </button>
  </nav>
"""

pos_body_close = html.rfind('</body>')
if pos_body_close != -1 and 'id="universalSearchResultsModal"' not in html:
    html = html[:pos_body_close] + modals_html + '\n' + html[pos_body_close:]
    print("Inserted PRD v2.0 Modals & Mobile Dock successfully!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved updated index.html successfully! Final length:", len(html))
