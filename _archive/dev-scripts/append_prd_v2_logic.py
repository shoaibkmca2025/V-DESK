# -*- coding: utf-8 -*-
"""
Script to append PRD Version 2.0 interaction logic to app.js
"""

prd_v2_js = """
/* ==========================================================================
   PRD VERSION 2.0 — BUSINESS INFRASTRUCTURE & WORKSPACE PLATFORM ENGINE
   Universal Search + NLP Intent + Faceted Explorer + Configurator + Booking +
   Customer Portal + Digital KYC + Quote Engine + Payment + Centralized Admin
   ========================================================================== */

// ─── 1. EXTENDED WORKSPACE & INVENTORY DATABASE (PRD Sec 30 - 32, 53 - 54) ───
const WORKSPACES_MARKETPLACE_DB = [
  {
    id: 'WS-MUM-01',
    centreId: 'MUM-002',
    name: 'Executive Private Suite (8 Pax)',
    type: 'Private Office',
    city: 'Mumbai',
    locality: 'BKC',
    address: 'BKC Business Center, G Block, Bandra Kurla Complex, Mumbai',
    capacity: 8,
    priceMonth: 48000,
    priceHour: 1499,
    status: 'available',
    amenities: ['Wi-Fi', 'Parking', 'Reception', 'Pantry', 'Conference Room', '24/7 Access', 'CCTV', 'Power Backup', 'GST Suitable'],
    image: 'assets/vdesk-boardroom.jpg',
    rating: 4.9,
    reviews: 142
  },
  {
    id: 'WS-MUM-02',
    centreId: 'MUM-001',
    name: 'Dedicated Flex Coworking Desk',
    type: 'Coworking',
    city: 'Mumbai',
    locality: 'Andheri East',
    address: 'Peninsula Business Hub, Andheri–Kurla Road, Mumbai',
    capacity: 1,
    priceMonth: 7999,
    priceHour: 199,
    status: 'available',
    amenities: ['Wi-Fi', 'Pantry', 'Reception', 'Power Backup', 'CCTV', 'GST Suitable'],
    image: 'assets/vdesk-coworking.jpg',
    rating: 4.8,
    reviews: 98
  },
  {
    id: 'WS-NSK-01',
    centreId: 'NSK-001',
    name: 'Flagship 4K Boardroom (12 Pax)',
    type: 'Meeting Rooms',
    city: 'Nashik',
    locality: 'College Road',
    address: 'Landmark Trade Centre, 3rd Floor, College Road, Nashik',
    capacity: 12,
    priceMonth: 25000,
    priceHour: 1199,
    status: 'available',
    amenities: ['Wi-Fi', 'Parking', 'Reception', 'Conference Room', 'Power Backup', 'CCTV'],
    image: 'assets/vdesk-reception.jpg',
    rating: 5.0,
    reviews: 210
  },
  {
    id: 'WS-GUR-01',
    centreId: 'GUR-001',
    name: 'Cyber City Team Cabin (8 Pax)',
    type: 'Private Office',
    city: 'Gurgaon',
    locality: 'DLF Cyber City',
    address: 'DLF Cyber City, Building 10, Tower C, Gurgaon',
    capacity: 8,
    priceMonth: 52000,
    priceHour: 1699,
    status: 'available',
    amenities: ['Wi-Fi', 'Parking', 'Reception', 'Pantry', 'Conference Room', '24/7 Access', 'CCTV', 'Power Backup', 'GST Suitable'],
    image: 'assets/vdesk-coworking.jpg',
    rating: 4.9,
    reviews: 118
  },
  {
    id: 'WS-BLR-01',
    centreId: 'BLR-001',
    name: 'Koramangala Dedicated Pod (4 Pax)',
    type: 'Private Office',
    city: 'Bangalore',
    locality: 'Koramangala',
    address: 'Omega Tech Park, 5th Block, Koramangala, Bengaluru',
    capacity: 4,
    priceMonth: 24000,
    priceHour: 899,
    status: 'available',
    amenities: ['Wi-Fi', 'Reception', 'Pantry', 'Power Backup', 'CCTV', 'GST Suitable'],
    image: 'assets/vdesk-reception.jpg',
    rating: 4.8,
    reviews: 84
  },
  {
    id: 'WS-DEL-01',
    centreId: 'DEL-001',
    name: 'Connaught Place Meeting Room (10 Pax)',
    type: 'Meeting Rooms',
    city: 'Delhi',
    locality: 'Connaught Place',
    address: 'Statesman House, Barakhamba Road, Connaught Place, New Delhi',
    capacity: 10,
    priceMonth: 28000,
    priceHour: 999,
    status: 'available',
    amenities: ['Wi-Fi', 'Reception', 'Conference Room', 'Power Backup', 'CCTV'],
    image: 'assets/vdesk-boardroom.jpg',
    rating: 4.9,
    reviews: 165
  }
];

// ─── 2. TELEMETRY & ANALYTICS LOGGER (PRD Sec 17, 59) ───────────────────────
const TELEMETRY_KEY = 'VDESK_TELEMETRY_LOG';

function getTelemetryEvents() {
  try { return JSON.parse(localStorage.getItem(TELEMETRY_KEY)) || []; }
  catch { return []; }
}

function trackSearchEvent(eventType, payload = {}) {
  const events = getTelemetryEvents();
  const event = {
    id: 'EVT-' + Date.now().toString(36),
    type: eventType,
    data: payload,
    device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
    timestamp: new Date().toISOString()
  };
  events.unshift(event);
  if (events.length > 200) events.pop(); // Keep last 200 events
  try { localStorage.setItem(TELEMETRY_KEY, JSON.stringify(events)); } catch (e) {}
  console.log('[V-DESK Telemetry]', eventType, payload);
}

// ─── 3. NATURAL LANGUAGE SEARCH INTENT PARSER (PRD Sec 10) ──────────────────
function parseSearchIntent(query) {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase().trim();

  let intent = 'General Discovery';
  let location = null;
  let locality = null;
  let capacity = null;
  let service = null;

  // City matching
  const cities = ['mumbai', 'delhi', 'bangalore', 'nashik', 'pune', 'hyderabad', 'gurgaon', 'noida', 'chennai', 'kolkata'];
  for (const c of cities) {
    if (q.includes(c)) {
      location = c.charAt(0).toUpperCase() + c.slice(1);
      if (location === 'Delhi' || location === 'Gurgaon' || location === 'Noida') {
        // Can also normalize to NCR if needed
      }
      break;
    }
  }

  // Locality matching
  const localities = {
    'bkc': 'Bandra Kurla Complex (BKC)',
    'andheri': 'Andheri East',
    'lower parel': 'Lower Parel',
    'connaught place': 'Connaught Place',
    'cp': 'Connaught Place',
    'koramangala': 'Koramangala',
    'hsr': 'HSR Layout',
    'college road': 'College Road',
    'gangapur road': 'Gangapur Road',
    'baner': 'Baner',
    'viman nagar': 'Viman Nagar',
    'cyber city': 'DLF Cyber City',
    'hitec': 'HITEC City'
  };

  for (const [key, val] of Object.entries(localities)) {
    if (q.includes(key)) {
      locality = val;
      break;
    }
  }

  // Capacity extraction: e.g. "for 8 people", "8 people", "10 pax", "seats 6", "for 4"
  const capMatch = q.match(/(?:for|seats|capacity of)?\s*(\d+)\s*(?:people|pax|seats|persons|members)?/);
  if (capMatch && parseInt(capMatch[1], 10) > 0) {
    const num = parseInt(capMatch[1], 10);
    // If user explicitly typed a number between 1 and 200
    if (num <= 200 && (q.includes('people') || q.includes('pax') || q.includes('seats') || q.includes('office for') || q.includes('room for'))) {
      capacity = num;
    }
  }

  // Intent classification
  if (q.includes('virtual office') || q.includes('business address') || q.includes('mailing address') || q.includes('apob') || q.includes('ppob')) {
    intent = 'Virtual Office';
  } else if (q.includes('meeting room') || q.includes('boardroom') || q.includes('conference') || q.includes('huddle')) {
    intent = 'Meeting Room';
  } else if (q.includes('private office') || q.includes('cabin') || (capacity && capacity >= 4) || q.includes('team office')) {
    intent = 'Private Office';
  } else if (q.includes('coworking') || q.includes('desk') || q.includes('shared office')) {
    intent = 'Coworking';
  } else if (q.includes('gst') || q.includes('tax')) {
    intent = 'Business Service';
    service = 'GST Registration';
  } else if (q.includes('company') || q.includes('incorporation') || q.includes('pvt ltd') || q.includes('llp') || q.includes('opc')) {
    intent = 'Business Service';
    service = 'Company Registration';
  } else if (location) {
    intent = 'Location Hub Explorer';
  }

  return {
    rawQuery: query,
    intent,
    location,
    locality,
    capacity,
    service,
    summary: `${intent}${location ? ' • ' + location : ''}${locality ? ' (' + locality + ')' : ''}${capacity ? ' • ' + capacity + ' Pax' : ''}${service ? ' • ' + service : ''}`
  };
}

// ─── 4. UNIVERSAL HERO SEARCH CONTROLLER (PRD Sec 8 - 14) ────────────────────
let currentParsedIntent = null;

function handleHeroSearchInput(val) {
  const clearBtn = document.getElementById('heroSearchClearBtn');
  const banner = document.getElementById('heroIntentBanner');
  const intentText = document.getElementById('heroIntentText');
  const dropdown = document.getElementById('heroSearchDropdown');

  if (clearBtn) {
    clearBtn.style.display = val.length > 0 ? 'flex' : 'none';
  }

  if (!val.trim()) {
    if (banner) banner.style.display = 'none';
    if (dropdown) dropdown.style.display = 'none';
    currentParsedIntent = null;
    return;
  }

  // Track search query telemetry
  trackSearchEvent('search_query', { query: val });

  // Run NLP Intent recognition
  const parsed = parseSearchIntent(val);
  currentParsedIntent = parsed;

  if (parsed && banner && intentText) {
    intentText.textContent = `Intent: ${parsed.summary}`;
    banner.style.display = 'flex';
  }

  // Filter dropdown items if visible
  if (dropdown) {
    dropdown.style.display = 'block';
  }
}

function handleHeroSearchFocus() {
  const input = document.getElementById('universalHeroInput');
  const dropdown = document.getElementById('heroSearchDropdown');
  if (dropdown) {
    dropdown.style.display = 'block';
  }
  trackSearchEvent('search_opened');
}

function clearHeroSearch() {
  const input = document.getElementById('universalHeroInput');
  const clearBtn = document.getElementById('heroSearchClearBtn');
  const banner = document.getElementById('heroIntentBanner');
  const dropdown = document.getElementById('heroSearchDropdown');

  if (input) {
    input.value = '';
    input.focus();
  }
  if (clearBtn) clearBtn.style.display = 'none';
  if (banner) banner.style.display = 'none';
  if (dropdown) dropdown.style.display = 'none';
  currentParsedIntent = null;
}

// Close dropdown on outside click
document.addEventListener('click', function(e) {
  const container = document.getElementById('heroUniversalSearch');
  const dropdown = document.getElementById('heroSearchDropdown');
  if (dropdown && container && !container.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

function quickChipSearch(term) {
  const input = document.getElementById('universalHeroInput');
  if (input) {
    input.value = term;
    handleHeroSearchInput(term);
  }
  trackSearchEvent('search_suggestion_selected', { term });
  executeSearchQuery(term);
}

function runSuggestedQuery(term) {
  const input = document.getElementById('universalHeroInput');
  if (input) {
    input.value = term;
    handleHeroSearchInput(term);
  }
  const dropdown = document.getElementById('heroSearchDropdown');
  if (dropdown) dropdown.style.display = 'none';
  trackSearchEvent('search_suggestion_selected', { term });
  executeSearchQuery(term);
}

function handleHeroUniversalSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('universalHeroInput');
  const val = input ? input.value.trim() : '';
  if (!val) {
    showToast('Please enter a requirement', 'Type a city, workspace, or business service', 'info');
    return;
  }
  executeSearchQuery(val);
}

function executeCurrentHeroIntent() {
  if (currentParsedIntent) {
    executeSearchQuery(currentParsedIntent.rawQuery);
  }
}

function executeSearchQuery(query) {
  trackSearchEvent('search_submitted', { query });
  const parsed = parseSearchIntent(query);
  openUniversalSearchResults(query, parsed);
}

// ─── 5. UNIVERSAL SEARCH RESULTS MODAL & FACETED EXPLORER (PRD Sec 14 - 16) ───
let activeExplorerFilters = {
  city: 'all',
  type: 'all',
  capacity: 'all',
  maxPrice: 15000,
  sort: 'recommended',
  amenities: { gst: true, wifi: false, parking: false, meeting: false, access247: false }
};

function openUniversalSearchResults(query, parsed) {
  const modal = document.getElementById('universalSearchResultsModal');
  const title = document.getElementById('searchResultsModalTitle');
  const intentParsed = document.getElementById('explorerIntentParsed');
  const citySelect = document.getElementById('filterCity');
  const typeSelect = document.getElementById('filterType');

  if (!modal) return;

  if (title) title.textContent = `Search Results for "${query}"`;
  if (intentParsed) {
    intentParsed.textContent = parsed ? parsed.summary : query;
  }

  // Auto-apply filters based on NLP intent
  if (parsed) {
    if (parsed.location && citySelect) {
      citySelect.value = parsed.location;
      activeExplorerFilters.city = parsed.location;
    } else if (citySelect) {
      citySelect.value = 'all';
      activeExplorerFilters.city = 'all';
    }

    if (parsed.intent && parsed.intent !== 'General Discovery' && typeSelect) {
      typeSelect.value = parsed.intent;
      activeExplorerFilters.type = parsed.intent;
    } else if (typeSelect) {
      typeSelect.value = 'all';
      activeExplorerFilters.type = 'all';
    }

    if (parsed.capacity) {
      if (parsed.capacity <= 1) activeExplorerFilters.capacity = '1';
      else if (parsed.capacity <= 5) activeExplorerFilters.capacity = '2-5';
      else if (parsed.capacity <= 10) activeExplorerFilters.capacity = '6-10';
      else if (parsed.capacity <= 25) activeExplorerFilters.capacity = '11-25';
      else activeExplorerFilters.capacity = '25+';
    }
  }

  renderExplorerResults();
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function filterExplorerResults() {
  const citySelect = document.getElementById('filterCity');
  const typeSelect = document.getElementById('filterType');
  const sortSelect = document.getElementById('filterSort');

  if (citySelect) activeExplorerFilters.city = citySelect.value;
  if (typeSelect) activeExplorerFilters.type = typeSelect.value;
  if (sortSelect) activeExplorerFilters.sort = sortSelect.value;

  trackSearchEvent('search_filter_used', activeExplorerFilters);
  renderExplorerResults();
}

function setExplorerCapacity(btn, cap) {
  activeExplorerFilters.capacity = cap;
  document.querySelectorAll('.filter-capacity-pills .cap-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterExplorerResults();
}

function updateExplorerPriceFilter(val) {
  activeExplorerFilters.maxPrice = parseInt(val, 10);
  const display = document.getElementById('filterPriceDisplay');
  if (display) display.textContent = `₹${parseInt(val, 10).toLocaleString('en-IN')}`;
  filterExplorerResults();
}

function resetExplorerFilters() {
  activeExplorerFilters = {
    city: 'all',
    type: 'all',
    capacity: 'all',
    maxPrice: 15000,
    sort: 'recommended',
    amenities: { gst: true, wifi: false, parking: false, meeting: false, access247: false }
  };

  const citySelect = document.getElementById('filterCity');
  const typeSelect = document.getElementById('filterType');
  const sortSelect = document.getElementById('filterSort');
  const priceRange = document.getElementById('filterPriceRange');
  const priceDisplay = document.getElementById('filterPriceDisplay');

  if (citySelect) citySelect.value = 'all';
  if (typeSelect) typeSelect.value = 'all';
  if (sortSelect) sortSelect.value = 'recommended';
  if (priceRange) priceRange.value = 15000;
  if (priceDisplay) priceDisplay.textContent = '₹15,000';

  document.querySelectorAll('.filter-capacity-pills .cap-pill').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  renderExplorerResults();
}

function renderExplorerResults() {
  const grid = document.getElementById('explorerResultsGrid');
  const zeroCard = document.getElementById('zeroResultsCard');
  const countEl = document.getElementById('explorerResultCount');
  if (!grid) return;

  // Combine LOCATIONS_DB (Virtual Office items) and WORKSPACES_MARKETPLACE_DB
  let combinedItems = [];

  LOCATIONS_DB.forEach(loc => {
    combinedItems.push({
      id: loc.id,
      name: loc.fullName,
      type: 'Virtual Office',
      city: loc.city,
      locality: loc.areaName,
      address: loc.address,
      capacity: 10,
      priceMonth: loc.vo_price,
      status: loc.status,
      services: loc.services,
      flagship: loc.flagship,
      rating: 4.9,
      reviews: 160 + (loc.vo_price % 70)
    });
  });

  WORKSPACES_MARKETPLACE_DB.forEach(ws => {
    combinedItems.push({
      id: ws.id,
      name: ws.name,
      type: ws.type,
      city: ws.city,
      locality: ws.locality,
      address: ws.address,
      capacity: ws.capacity,
      priceMonth: ws.priceMonth,
      status: ws.status,
      services: ws.amenities,
      flagship: false,
      rating: ws.rating,
      reviews: ws.reviews
    });
  });

  // Filter matching
  let filtered = combinedItems.filter(item => {
    // City match
    if (activeExplorerFilters.city !== 'all') {
      if (item.city.toLowerCase() !== activeExplorerFilters.city.toLowerCase()) return false;
    }

    // Type match
    if (activeExplorerFilters.type !== 'all') {
      if (item.type.toLowerCase() !== activeExplorerFilters.type.toLowerCase()) return false;
    }

    // Capacity match
    if (activeExplorerFilters.capacity !== 'all') {
      if (activeExplorerFilters.capacity === '1' && item.capacity !== 1) return false;
      if (activeExplorerFilters.capacity === '2-5' && (item.capacity < 2 || item.capacity > 5)) return false;
      if (activeExplorerFilters.capacity === '6-10' && (item.capacity < 6 || item.capacity > 10)) return false;
      if (activeExplorerFilters.capacity === '11-25' && (item.capacity < 11 || item.capacity > 25)) return false;
      if (activeExplorerFilters.capacity === '25+' && item.capacity < 25) return false;
    }

    // Price match
    if (item.priceMonth > activeExplorerFilters.maxPrice) return false;

    return true;
  });

  // Sorting
  if (activeExplorerFilters.sort === 'price-asc') {
    filtered.sort((a, b) => a.priceMonth - b.priceMonth);
  } else if (activeExplorerFilters.sort === 'price-desc') {
    filtered.sort((a, b) => b.priceMonth - a.priceMonth);
  } else if (activeExplorerFilters.sort === 'capacity') {
    filtered.sort((a, b) => b.capacity - a.capacity);
  }

  // Update count & zero-result experience (PRD Sec 16)
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} Available Location${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (zeroCard) zeroCard.style.display = 'block';
    trackSearchEvent('search_no_results', activeExplorerFilters);
    return;
  }

  if (zeroCard) zeroCard.style.display = 'none';

  grid.innerHTML = filtered.map(item => {
    const bgImage = item.type === 'Meeting Rooms' 
      ? 'assets/vdesk-boardroom.jpg' 
      : (item.type === 'Coworking' ? 'assets/vdesk-coworking.jpg' : 'assets/vdesk-reception.jpg');

    return `
      <div class="explorer-card">
        <div class="explorer-card__image" style="background-image: linear-gradient(180deg, rgba(5,19,43,0.2) 0%, rgba(5,19,43,0.7) 100%), url('${bgImage}');">
          <span class="badge ${item.status === 'available' ? 'badge--success' : 'badge--warning'}">
            ${item.status === 'available' ? '● Verified Available' : '● High Demand'}
          </span>
          <span style="font-size: 0.75rem; color: #fff; background: rgba(0,0,0,0.6); padding: 2px 8px; border-radius: 4px;">
            ★ ${item.rating} (${item.reviews})
          </span>
        </div>
        <div class="explorer-card__body">
          <div class="explorer-card__city">${item.city} &bull; ${item.locality}</div>
          <h4 class="explorer-card__title">${item.name}</h4>
          <p class="explorer-card__address">${item.address}</p>
          <div class="explorer-card__tags">
            <span class="explorer-tag"><i class="ph-bold ph-shield-check"></i> GST / MCA Ready</span>
            <span class="explorer-tag"><i class="ph-bold ph-users"></i> Up to ${item.capacity} Pax</span>
            <span class="explorer-tag"><i class="ph-bold ph-lightning"></i> 24h SLA</span>
          </div>
          <div class="explorer-card__footer">
            <div class="explorer-card__price">
              <strong>₹${item.priceMonth.toLocaleString('en-IN')}</strong><small>/month</small>
            </div>
            <button class="btn btn--primary btn--sm" onclick="handleExplorerCardAction('${item.id}', '${item.type}')">
              ${item.type === 'Meeting Rooms' ? 'Book Room' : 'Configure Setup'} &rarr;
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleExplorerCardAction(itemId, type) {
  closeModal('universalSearchResultsModal');
  if (type === 'Meeting Rooms') {
    openMeetingBookingModal();
  } else {
    scrollToSection('#voConfigurator');
  }
}

// ─── 6. VIRTUAL OFFICE SETUP CONFIGURATOR CONTROLLER (PRD Sec 24 - 29) ────────
let voConfigState = {
  city: 'Nashik',
  centreId: 'NSK-001',
  purpose: 'GST Registration',
  tenure: 'annual',
  basePrice: 1249,
  addons: {
    gst: true,
    incorporation: false,
    mail: true,
    meetingCredits: false
  }
};

const CITY_PRICING_MULTIPLIERS = {
  'Nashik': { mult: 1.0, adj: 0, label: 'Nashik HQ' },
  'Pune': { mult: 1.15, adj: 200, label: 'Pune Metros' },
  'Mumbai': { mult: 1.6, adj: 750, label: 'Mumbai MMR Grade-A' },
  'Delhi': { mult: 1.45, adj: 550, label: 'Delhi Connaught Place' },
  'Bangalore': { mult: 1.4, adj: 500, label: 'Bangalore Koramangala' },
  'Hyderabad': { mult: 1.25, adj: 350, label: 'Hyderabad HITEC City' },
  'Gurgaon': { mult: 1.5, adj: 650, label: 'Gurgaon DLF Cyber City' },
  'Noida': { mult: 1.2, adj: 250, label: 'Noida Sector 62' }
};

function handleVoCityChange(city) {
  voConfigState.city = city;
  const centreSelect = document.getElementById('voCentreSelect');
  if (!centreSelect) return;

  const matches = LOCATIONS_DB.filter(l => l.city.toLowerCase() === city.toLowerCase());
  if (matches.length > 0) {
    centreSelect.innerHTML = matches.map(m => `<option value="${m.id}">${m.fullName}</option>`).join('');
    voConfigState.centreId = matches[0].id;
    voConfigState.basePrice = matches[0].vo_price;
  }
  updateVoDynamicPrice();
}

function handleVoCentreChange(centreId) {
  voConfigState.centreId = centreId;
  const loc = LOCATIONS_DB.find(l => l.id === centreId);
  if (loc) {
    voConfigState.basePrice = loc.vo_price;
  }
  updateVoDynamicPrice();
}

function selectVoPurpose(btn, purpose) {
  voConfigState.purpose = purpose;
  document.querySelectorAll('.vo-purpose-grid .vo-purpose-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const sub = document.getElementById('voSummarySubtitle');
  if (sub) sub.textContent = `Configured for ${purpose} & Commercial Compliance`;
  updateVoDynamicPrice();
}

function setVoTenure(tenure) {
  voConfigState.tenure = tenure;
  const mBtn = document.getElementById('voTenureMonthly');
  const aBtn = document.getElementById('voTenureAnnual');
  if (mBtn && aBtn) {
    mBtn.classList.toggle('active', tenure === 'monthly');
    aBtn.classList.toggle('active', tenure === 'annual');
  }
  updateVoDynamicPrice();
}

function updateVoDynamicPrice() {
  const gstAddon = document.getElementById('voAddonGst');
  const incAddon = document.getElementById('voAddonIncorporation');
  const mailAddon = document.getElementById('voAddonMail');
  const meetAddon = document.getElementById('voAddonMeetingCredits');

  voConfigState.addons.gst = gstAddon ? gstAddon.checked : true;
  voConfigState.addons.incorporation = incAddon ? incAddon.checked : false;
  voConfigState.addons.mail = mailAddon ? mailAddon.checked : true;
  voConfigState.addons.meetingCredits = meetAddon ? meetAddon.checked : false;

  const cityData = CITY_PRICING_MULTIPLIERS[voConfigState.city] || { mult: 1.0, adj: 0, label: 'Standard Rate' };
  
  // Calculate monthly recurring add-ons
  let monthlyAddons = 0;
  if (voConfigState.addons.gst) monthlyAddons += 350;
  if (voConfigState.addons.mail) monthlyAddons += 299;
  if (voConfigState.addons.meetingCredits) monthlyAddons += 999;

  let oneTimeAddon = 0;
  if (voConfigState.addons.incorporation) oneTimeAddon += 2999;

  const basePricePerMonth = voConfigState.basePrice;
  const locationAdj = cityData.adj;
  const effectiveMonthly = basePricePerMonth + locationAdj + monthlyAddons;

  const isAnnual = voConfigState.tenure === 'annual';
  const months = isAnnual ? 12 : 1;

  let subtotal = (effectiveMonthly * months) + oneTimeAddon;
  let discount = isAnnual ? Math.round(subtotal * 0.20) : 0;
  let discountedSubtotal = subtotal - discount;
  let taxes = Math.round(discountedSubtotal * 0.18);
  let finalTotal = discountedSubtotal + taxes;

  // Update UI Elements
  const titleEl = document.getElementById('voSummaryTitle');
  const calcBaseEl = document.getElementById('voCalcBase');
  const calcLocEl = document.getElementById('voCalcLocationAdj');
  const calcAddonsEl = document.getElementById('voCalcAddons');
  const discountRow = document.getElementById('voDiscountRow');
  const calcDiscountEl = document.getElementById('voCalcDiscount');
  const calcTaxesEl = document.getElementById('voCalcTaxes');
  const calcTotalEl = document.getElementById('voCalcTotal');
  const calcPeriodEl = document.getElementById('voCalcPeriod');

  if (titleEl) titleEl.textContent = `${voConfigState.city} Setup`;
  if (calcBaseEl) calcBaseEl.textContent = `₹${basePricePerMonth.toLocaleString('en-IN')} / mo`;
  if (calcLocEl) calcLocEl.textContent = locationAdj > 0 ? `+₹${locationAdj} / mo (${cityData.label})` : `Included (${cityData.label})`;
  if (calcAddonsEl) calcAddonsEl.textContent = `₹${monthlyAddons.toLocaleString('en-IN')} / mo${oneTimeAddon > 0 ? ' + ₹' + oneTimeAddon + ' (one-time)' : ''}`;
  
  if (discountRow) discountRow.style.display = isAnnual ? 'flex' : 'none';
  if (calcDiscountEl) calcDiscountEl.textContent = `-₹${discount.toLocaleString('en-IN')}`;
  if (calcTaxesEl) calcTaxesEl.textContent = `₹${taxes.toLocaleString('en-IN')}`;
  if (calcTotalEl) calcTotalEl.textContent = `₹${finalTotal.toLocaleString('en-IN')}`;
  if (calcPeriodEl) calcPeriodEl.textContent = isAnnual ? 'for 12 Months (All-Inclusive)' : 'for 1 Month (All-Inclusive)';
}

function proceedVoToKyc() {
  openDigitalKycModal();
  showToast('Package Configured', `Ready for KYC verification for ${voConfigState.city} Virtual Office.`, 'info');
}

function generateVoFormalQuote() {
  openQuoteProposalModal({
    product: `${voConfigState.city} Virtual Office Platform`,
    purpose: voConfigState.purpose,
    tenure: voConfigState.tenure === 'annual' ? '12 Months' : '1 Month',
    rateMonth: voConfigState.basePrice
  });
}

// ─── 7. MEETING ROOM SCHEDULER CONTROLLER (PRD Sec 34 - 35) ──────────────────
let activeRoomBooking = {
  hub: 'Nashik HQ — College Road',
  room: 'Conference Room (8 Pax)',
  rateHour: 799,
  date: 'Today',
  slot: '02:00 PM - 04:00 PM',
  duration: 2,
  attendees: 6,
  totalAmount: 1885,
  state: 'available' // available -> hold -> confirmed
};

let holdCountdownTimer = null;

function handleMrCityChange(hubId) {
  const select = document.getElementById('mrCitySelect');
  if (select) {
    activeRoomBooking.hub = select.options[select.selectedIndex].text;
  }
  calculateMrPrice();
}

function calculateMrPrice() {
  const roomSelect = document.getElementById('mrRoomTypeSelect');
  const durationSelect = document.getElementById('mrDurationSelect');
  const timeSelect = document.getElementById('mrTimeSlotSelect');
  const dateInput = document.getElementById('mrDateInput');
  const attendeesInput = document.getElementById('mrAttendeesInput');

  if (roomSelect) {
    activeRoomBooking.room = roomSelect.value;
    activeRoomBooking.rateHour = parseInt(roomSelect.options[roomSelect.selectedIndex].getAttribute('data-rate'), 10) || 799;
  }

  if (durationSelect) activeRoomBooking.duration = parseInt(durationSelect.value, 10) || 2;
  if (timeSelect) activeRoomBooking.slot = timeSelect.value;
  if (dateInput && dateInput.value) activeRoomBooking.date = dateInput.value;
  if (attendeesInput) activeRoomBooking.attendees = parseInt(attendeesInput.value, 10) || 6;

  let hourlyRate = activeRoomBooking.rateHour;
  let duration = activeRoomBooking.duration;
  let discountMult = duration >= 8 ? 0.8 : (duration >= 4 ? 0.9 : 1.0);

  let rawSubtotal = hourlyRate * duration * discountMult;
  let totalWithGst = Math.round(rawSubtotal * 1.18);
  activeRoomBooking.totalAmount = totalWithGst;

  const rateCalcEl = document.getElementById('mrRateCalc');
  const finalCostEl = document.getElementById('mrFinalCost');

  if (rateCalcEl) rateCalcEl.textContent = `${duration} Hour${duration > 1 ? 's' : ''} × ₹${hourlyRate}/hr`;
  if (finalCostEl) finalCostEl.innerHTML = `₹${totalWithGst.toLocaleString('en-IN')} <small>(incl. 18% GST)</small>`;
}

function openMeetingBookingModal() {
  calculateMrPrice();
  const modal = document.getElementById('meetingRoomBookingModal');
  if (!modal) return;

  const roomEl = document.getElementById('rbSelectedRoom');
  const hubEl = document.getElementById('rbSelectedHub');
  const slotEl = document.getElementById('rbSelectedSlot');
  const priceEl = document.getElementById('rbTotalPrice');

  if (roomEl) roomEl.textContent = activeRoomBooking.room;
  if (hubEl) hubEl.textContent = activeRoomBooking.hub;
  if (slotEl) slotEl.innerHTML = `<i class="ph-bold ph-clock"></i> ${activeRoomBooking.date}, ${activeRoomBooking.slot} (${activeRoomBooking.duration}h)`;
  if (priceEl) priceEl.textContent = `₹${activeRoomBooking.totalAmount.toLocaleString('en-IN')}`;

  // Reset to Step 1
  setBookingStep(1);
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function setBookingStep(step) {
  const s1 = document.getElementById('roomBookingStepSummary');
  const s2 = document.getElementById('roomBookingStepHold');
  const s3 = document.getElementById('roomBookingStepConfirmed');

  if (s1) s1.style.display = step === 1 ? 'block' : 'none';
  if (s2) s2.style.display = step === 2 ? 'block' : 'none';
  if (s3) s3.style.display = step === 3 ? 'block' : 'none';

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`bStep${i}`);
    if (el) {
      el.classList.toggle('active', i === step);
      el.classList.toggle('completed', i < step);
    }
  }
}

function handleRoomBookingHold(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('rbName')?.value || 'Guest User';
  const company = document.getElementById('rbCompany')?.value || 'Acme Enterprises';
  const mobile = document.getElementById('rbMobile')?.value || '9876543210';
  const email = document.getElementById('rbEmail')?.value || 'user@company.com';

  activeRoomBooking.customer = { name, company, mobile, email };
  activeRoomBooking.state = 'hold';

  setBookingStep(2);
  startHoldCountdown();
  showToast('Slot Held for 10 Minutes', 'Complete payment to confirm reservation.', 'info');
}

function startHoldCountdown() {
  let seconds = 599; // 10 minutes
  const timerEl = document.getElementById('holdTimerCountdown');
  if (holdCountdownTimer) clearInterval(holdCountdownTimer);

  holdCountdownTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(holdCountdownTimer);
      cancelRoomBookingHold();
      showToast('Hold Expired', 'The room slot has been released.', 'error');
      return;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (timerEl) {
      timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

function cancelRoomBookingHold() {
  if (holdCountdownTimer) clearInterval(holdCountdownTimer);
  activeRoomBooking.state = 'available';
  setBookingStep(1);
}

function triggerBookingCheckout() {
  if (holdCountdownTimer) clearInterval(holdCountdownTimer);
  closeModal('meetingRoomBookingModal');
  openCheckoutModal({
    item: `${activeRoomBooking.room} Reservation`,
    hub: activeRoomBooking.hub,
    amount: activeRoomBooking.totalAmount,
    onSuccess: () => {
      // Re-open confirmed pass
      openConfirmedBookingPass();
    }
  });
}

function openConfirmedBookingPass() {
  const modal = document.getElementById('meetingRoomBookingModal');
  if (!modal) return;

  const bookingId = 'BK-' + Date.now().toString(36).toUpperCase();
  const passId = document.getElementById('passBookingId');
  const passRoom = document.getElementById('passRoomName');
  const passCentre = document.getElementById('passCentreName');
  const passHost = document.getElementById('passHostName');
  const passSlot = document.getElementById('passSlotTime');
  const passPax = document.getElementById('passPax');

  if (passId) passId.textContent = bookingId;
  if (passRoom) passRoom.textContent = activeRoomBooking.room;
  if (passCentre) passCentre.textContent = activeRoomBooking.hub;
  if (passHost) passHost.textContent = activeRoomBooking.customer?.name || 'Authorized Guest';
  if (passSlot) passSlot.textContent = `${activeRoomBooking.date} • ${activeRoomBooking.slot}`;
  if (passPax) passPax.textContent = `${activeRoomBooking.attendees} Pax`;

  setBookingStep(3);
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

// ─── 8. GST PLATFORM & APPLICATION STATUS TRACKER (PRD Sec 37) ────────────────
function lookupGstTrackerStatus() {
  const input = document.getElementById('gstTrackerInput');
  const ref = input ? input.value.trim() : '';
  if (!ref) {
    showToast('Enter ARN or Ref', 'Please input a valid Government ARN or V-DESK Ref', 'info');
    return;
  }

  showToast('Fetching Telemetry...', `Verifying jurisdictional status for ${ref}`, 'info');
  setTimeout(() => {
    showToast('Status Updated', 'Scrutiny in progress: Ward 4B Officer Review', 'success');
  }, 600);
}

function openGstTrackerModal() {
  scrollToSection('#gstTrackerSection');
}

// ─── 9. COMPANY REGISTRATION PLATFORM (PRD Sec 36) ───────────────────────────
let selectedCompanyEntity = 'Pvt Ltd';

function openCompanyRegModal() {
  const modal = document.getElementById('companyRegModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function selectCompanyEntity(card, entity) {
  selectedCompanyEntity = entity;
  document.querySelectorAll('.entity-picker-grid .entity-card').forEach(c => c.classList.remove('active'));
  if (card) card.classList.add('active');
}

function proceedEntityToQuote() {
  closeModal('companyRegModal');
  openQuoteProposalModal({
    product: `${selectedCompanyEntity} Incorporation & Legal Package`,
    purpose: 'START: MCA SPICe+ Company Formation',
    tenure: 'Fast-Track (5-7 Days)',
    rateMonth: 4999
  });
}

// ─── 10. DYNAMIC QUOTE ENGINE & DIGITAL PROPOSALS (PRD Sec 41) ────────────────
function openQuoteProposalModal(customData = {}) {
  const modal = document.getElementById('quoteProposalModal');
  if (!modal) return;

  const quoteId = 'VDQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const qIdEl = document.getElementById('propQuoteId');
  const qDateEl = document.getElementById('propDate');
  const qClientName = document.getElementById('propClientName');
  const qClientComp = document.getElementById('propClientCompany');

  if (qIdEl) qIdEl.textContent = quoteId;
  if (qDateEl) qDateEl.textContent = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  
  if (customData.name && qClientName) qClientName.textContent = customData.name;
  if (customData.company && qClientComp) qClientComp.textContent = customData.company;

  modal.classList.add('active');
  document.body.classList.add('modal-open');
  trackSearchEvent('quote_started', { quoteId });
}

function copyQuoteLink() {
  const qId = document.getElementById('propQuoteId')?.textContent || 'VDQ-2026';
  const url = `${window.location.origin}/#quote?ref=${qId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Quote Link Copied!', 'Shareable digital proposal URL copied to clipboard.', 'success');
  });
}

function proceedQuoteToPayment() {
  closeModal('quoteProposalModal');
  openCheckoutModal({
    item: 'Official V-DESK Infrastructure Setup',
    amount: 21499
  });
}

// ─── 11. DIGITAL KYC & DOCUMENT MANAGEMENT CENTER (PRD Sec 46 - 47) ───────────
function openDigitalKycModal() {
  const modal = document.getElementById('digitalKycModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    trackSearchEvent('kyc_started');
  }
}

function simulateKycDocUpload(input, docType) {
  if (input && input.files && input.files[0]) {
    const fileName = input.files[0].name;
    showToast('Document Uploaded', `${docType} (${fileName}) received securely.`, 'success');
    trackSearchEvent('document_uploaded', { docType, fileName });
  }
}

function submitKycApplication() {
  const consent = document.getElementById('kycConsentCheckbox')?.checked;
  if (!consent) {
    showToast('Consent Required', 'Please confirm statutory verification consent', 'info');
    return;
  }

  showToast('KYC Application Submitted', 'Compliance team will verify documents within 4 working hours.', 'success');
  closeModal('digitalKycModal');
  trackSearchEvent('kyc_submitted');
}

// ─── 12. UNIFIED PAYMENT & CHECKOUT SYSTEM (PRD Sec 48) ──────────────────────
let activeCheckoutData = null;

function openCheckoutModal(data = {}) {
  activeCheckoutData = data;
  const modal = document.getElementById('paymentCheckoutModal');
  if (!modal) return;

  const prodEl = document.getElementById('chkProductName');
  const subEl = document.getElementById('chkSubtotal');
  const gstEl = document.getElementById('chkGst');
  const totEl = document.getElementById('chkTotal');

  const amount = data.amount || 21499;
  const base = Math.round(amount / 1.18);
  const gst = amount - base;

  if (prodEl) prodEl.textContent = data.item || 'Virtual Office Package';
  if (subEl) subEl.textContent = `₹${base.toLocaleString('en-IN')}`;
  if (gstEl) gstEl.textContent = `₹${gst.toLocaleString('en-IN')}`;
  if (totEl) totEl.textContent = `₹${amount.toLocaleString('en-IN')}`;

  switchPayMethod('upi');
  modal.classList.add('active');
  document.body.classList.add('modal-open');
  trackSearchEvent('checkout_started', { amount });
}

function switchPayMethod(method) {
  const upi = document.getElementById('payMethodUpi');
  const card = document.getElementById('payMethodCard');
  const nb = document.getElementById('payMethodNetbanking');

  if (upi) upi.style.display = method === 'upi' ? 'block' : 'none';
  if (card) card.style.display = method === 'card' ? 'block' : 'none';
  if (nb) nb.style.display = method === 'netbanking' ? 'block' : 'none';

  document.querySelectorAll('.checkout-tabs .pay-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && method === 'upi') || (i === 1 && method === 'card') || (i === 2 && method === 'netbanking'));
  });
}

function simulatePaymentProcessing(methodLabel) {
  showToast('Processing Payment...', `Verifying transaction via ${methodLabel}`, 'info');

  setTimeout(() => {
    closeModal('paymentCheckoutModal');
    showToast('Payment Successful! ✓', 'Tax Invoice & Agreement dispatched to your email.', 'success');
    trackSearchEvent('payment_success', { method: methodLabel, amount: activeCheckoutData?.amount });

    if (activeCheckoutData && typeof activeCheckoutData.onSuccess === 'function') {
      activeCheckoutData.onSuccess();
    }
  }, 1200);
}

// ─── 13. SELF-SERVICE CUSTOMER PORTAL CONTROLLER (PRD Sec 45 & 49) ────────────
function openCustomerPortal() {
  const modal = document.getElementById('customerPortalModal');
  if (!modal) return;

  switchPortalTab('activeServices');
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function switchPortalTab(tab) {
  document.querySelectorAll('.portal-tabs .portal-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(tab)) {
      btn.classList.add('active');
    }
  });

  const content = document.getElementById('portalTabContent');
  if (!content) return;

  if (tab === 'activeServices') {
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <span class="badge badge--success" style="margin-bottom: 8px;">● Subscription Active</span>
              <h4 style="font-size: 1.25rem; margin: 4px 0; color: var(--vd-navy-deep);">Mumbai — Bandra Kurla Complex (BKC)</h4>
              <p style="color: #64748B; font-size: 0.84rem; margin: 0;">BKC Business Center, G Block, BKC, Mumbai &bull; Plan: Virtual Office for GST</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.76rem; color: #64748B; display: block;">Renewal Due:</span>
              <strong style="color: var(--vd-navy-deep); font-size: 1.05rem;">12 Mar 2027</strong>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; background: #F8FAFC; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <div><strong>GST Status:</strong> <span style="color: #10B981; font-weight: 600;">Verified (27AAY...Z1)</span></div>
            <div><strong>Mail Forwarding:</strong> <span>Active (3 pieces forwarded)</span></div>
            <div><strong>Meeting Credits:</strong> <span>5 Hours Remaining</span></div>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn--outline btn--sm" onclick="showToast('Document Downloaded', 'Registered Commercial Rent Agreement downloaded.', 'success')"><i class="ph-bold ph-download-simple"></i> Download Rent Agreement</button>
            <button class="btn btn--outline btn--sm" onclick="showToast('Document Downloaded', 'Owner NOC copy downloaded.', 'success')"><i class="ph-bold ph-download-simple"></i> Download Owner NOC</button>
            <button class="btn btn--outline btn--sm" onclick="showToast('Document Downloaded', 'Recent Electricity Bill copy downloaded.', 'success')"><i class="ph-bold ph-download-simple"></i> Download Electricity Bill</button>
            <button class="btn btn--primary btn--sm" onclick="openMeetingBookingModal()"><i class="ph-bold ph-presentation"></i> Book Meeting Room</button>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'bookings') {
    content.innerHTML = `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-calendar-check"></i> Upcoming Workspaces &amp; Rooms</h4>
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="badge badge--success">Confirmed</span>
            <h5 style="margin: 4px 0; font-size: 1rem;">Executive Conference Room (8 Pax)</h5>
            <span style="font-size: 0.8rem; color: #64748B;">Mumbai BKC Centre &bull; Tomorrow, 02:00 PM &ndash; 04:00 PM</span>
          </div>
          <button class="btn btn--outline btn--sm" onclick="showToast('Pass Displayed', 'Pass code: BK-2026-9812', 'info')"><i class="ph-bold ph-qr-code"></i> View Pass</button>
        </div>
      </div>
    `;
  } else if (tab === 'documents') {
    content.innerHTML = `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-files"></i> Verified Business Documents</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8FAFC; border-radius: 10px;">
            <span><i class="ph-bold ph-file-text" style="color: var(--vd-gold-primary);"></i> Certificate of Incorporation (CIN: U74999MH2024PTC123456)</span>
            <span style="color: #10B981; font-weight: 600; font-size: 0.84rem;">Verified &bull; Approved</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8FAFC; border-radius: 10px;">
            <span><i class="ph-bold ph-file-text" style="color: var(--vd-gold-primary);"></i> Director PAN &amp; Aadhaar Card</span>
            <span style="color: #10B981; font-weight: 600; font-size: 0.84rem;">Verified &bull; Approved</span>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'invoices') {
    content.innerHTML = `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-receipt"></i> Billing &amp; Tax Invoices</h4>
        <table class="proposal-table">
          <thead>
            <tr><th>Invoice #</th><th>Date</th><th>Service</th><th>Amount</th><th>Receipt</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>INV-2026-0812</strong></td>
              <td>12 Mar 2026</td>
              <td>Annual Virtual Office BKC</td>
              <td>₹21,499</td>
              <td><button class="btn btn--outline btn--sm" onclick="showToast('Invoice Downloaded', 'Tax invoice PDF downloaded.', 'success')"><i class="ph-bold ph-download-simple"></i> PDF</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === 'renewals') {
    content.innerHTML = `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 8px;"><i class="ph-bold ph-arrows-clockwise"></i> 1-Click Subscription Renewal</h4>
        <p style="color: #64748B; font-size: 0.88rem; margin-bottom: 20px;">Renew your Mumbai BKC agreement early to lock in your preferential base rate and maintain continuous GST compliance without inspection risks.</p>
        <button class="btn btn--primary" onclick="openCheckoutModal({ item: 'Renewal: Mumbai BKC Virtual Office (12 Months)', amount: 19999 })">
          <i class="ph-bold ph-arrows-clockwise"></i> Renew Now (Save Additional 10%) &rarr;
        </button>
      </div>
    `;
  } else if (tab === 'support') {
    content.innerHTML = `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-headset"></i> Dedicated Concierge Desk</h4>
        <p style="color: #64748B; font-size: 0.84rem; margin-bottom: 16px;">Assigned Executive: <strong>Adv. Rahul Deshmukh</strong> &bull; Direct Helpline: +91 98765 43210</p>
        <button class="btn btn--primary" onclick="window.open('https://wa.me/919876543210?text=Hi%20Rahul,%20I%20need%20support%20for%20my%20V-DESK%20account%20VD-AC-8921', '_blank')">
          <i class="ph-bold ph-whatsapp-logo"></i> Connect on WhatsApp
        </button>
      </div>
    `;
  }
}

// ─── 14. CENTRALIZED ADMIN SUITE & LEAD PIPELINE (PRD Sec 42 - 44, 52 - 56) ───
let activeAdminTab = 'dashboard';

function openAdminSuite(tab = 'dashboard') {
  const modal = document.getElementById('adminSuiteModal');
  if (!modal) return;

  switchAdminTab(tab);
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function switchAdminTab(tab) {
  activeAdminTab = tab;
  document.querySelectorAll('.admin-nav-tabs .admin-tab').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(tab)) {
      btn.classList.add('active');
    }
  });

  const body = document.getElementById('adminTabBody');
  if (!body) return;

  const leads = getLeads();

  if (tab === 'dashboard') {
    body.innerHTML = `
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">Total Leads</span>
          <strong class="admin-kpi-val">${leads.length}</strong>
          <span class="admin-kpi-trend">↑ 18% vs last month</span>
        </div>
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">Conversion Rate</span>
          <strong class="admin-kpi-val">28.4%</strong>
          <span class="admin-kpi-trend">Industry Avg: 12%</span>
        </div>
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">Active Virtual Offices</span>
          <strong class="admin-kpi-val">1,482</strong>
          <span class="admin-kpi-trend">Across 10 Metros</span>
        </div>
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">MRR (Infrastructure)</span>
          <strong class="admin-kpi-val">₹38.4L</strong>
          <span class="admin-kpi-trend">98.2% Renewal Rate</span>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px;">
        <h4 style="margin-top: 0; color: var(--vd-gold-primary);"><i class="ph-bold ph-lightning"></i> Recent Operational Activity</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; line-height: 2;">
          <li>✓ New KYC dossier submitted for <strong>Zenith D2C Brands (Mumbai BKC)</strong> &bull; 10m ago</li>
          <li>✓ Boardroom reserved at <strong>Nashik Headquarters (8 Pax)</strong> &bull; 25m ago</li>
          <li>✓ GST NOC generated for <strong>Patel &amp; Associates (Delhi CP)</strong> &bull; 1h ago</li>
          <li>✓ Annual renewal processed for <strong>Artisan Commerce (Bangalore)</strong> &bull; 2h ago</li>
        </ul>
      </div>
    `;
  } else if (tab === 'pipeline') {
    // 5-stage Kanban pipeline (PRD Sec 42)
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON'];

    body.innerHTML = `
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <h4 style="margin: 0; color: #fff;">Pipeline Stages: NEW → CONTACTED → QUALIFIED → PROPOSAL → WON</h4>
        <button class="btn btn--outline btn--sm" onclick="exportLeadsToCSV()"><i class="ph-bold ph-download-simple"></i> Export CSV</button>
      </div>

      <div class="admin-pipeline-kanban">
        ${stages.map(stg => {
          const matching = leads.filter(l => (l.status || 'NEW') === stg);
          return `
            <div class="kanban-col">
              <div class="kanban-col-header">
                <span>${stg}</span>
                <span class="kanban-col-count">${matching.length}</span>
              </div>
              <div class="kanban-cards-stack">
                ${matching.map(l => {
                  const score = calculateLeadScore(l);
                  return `
                    <div class="kanban-card" onclick="advanceLeadStatus('${l.id}')">
                      <div class="kanban-card-top">
                        <strong>${l.name || 'Unnamed'}</strong>
                        <span class="lead-score-pill ${score >= 70 ? 'high' : 'med'}">${score} pts</span>
                      </div>
                      <div style="font-size: 0.76rem; color: rgba(255,255,255,0.7);">${l.company || 'Enterprise'} &bull; ${l.city || 'Pan-India'}</div>
                      <div style="font-size: 0.72rem; color: var(--vd-gold-primary); margin-top: 4px;">${l.plan || l.service || 'Virtual Office'}</div>
                      <div style="font-size: 0.68rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Click to advance stage &rarr;</div>
                    </div>
                  `;
                }).join('')}
                ${matching.length === 0 ? '<div style="font-size: 0.76rem; color: rgba(255,255,255,0.4); text-align: center; padding: 20px;">No leads</div>' : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (tab === 'customers') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">Active Customer Accounts</h4>
      <table class="proposal-table" style="background: rgba(255,255,255,0.03); color: #fff;">
        <thead>
          <tr><th>Client</th><th>Entity</th><th>City</th><th>Plan</th><th>Next Renewal</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Zenith D2C Brands</td>
            <td>Pvt Ltd</td>
            <td>Mumbai (BKC)</td>
            <td>Virtual Office + GST</td>
            <td>12 Mar 2027</td>
            <td><span style="color:#10B981;">Active</span></td>
          </tr>
          <tr>
            <td>Patel &amp; Associates</td>
            <td>CA Firm</td>
            <td>Delhi (CP)</td>
            <td>Multi-City Suite</td>
            <td>28 Oct 2026</td>
            <td><span style="color:#10B981;">Active</span></td>
          </tr>
          <tr>
            <td>Artisan Commerce</td>
            <td>Pvt Ltd</td>
            <td>Bangalore</td>
            <td>APOB Hub</td>
            <td>05 Jun 2027</td>
            <td><span style="color:#10B981;">Active</span></td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (tab === 'inventory') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Commercial Centres &amp; Workspace Inventory</h4>
        <button class="btn btn--primary btn--sm" onclick="showToast('Inventory Manager', 'Ready to add new Grade-A commercial centre.', 'info')">+ Add Centre</button>
      </div>
      <table class="proposal-table" style="background: rgba(255,255,255,0.03); color: #fff;">
        <thead>
          <tr><th>Code</th><th>Centre Name</th><th>City</th><th>VO Rate</th><th>Desks</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${LOCATIONS_DB.map(l => `
            <tr>
              <td><code>${l.id}</code></td>
              <td><strong>${l.fullName}</strong></td>
              <td>${l.city}</td>
              <td>₹${l.vo_price}/mo</td>
              <td>${l.meetingCapacity}</td>
              <td><span style="color:#10B981;">● Online</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (tab === 'pricing') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">Dynamic Pricing Rules Engine (PRD Sec 55)</h4>
      <p style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Formula: Base Price + Location Multiplier + Add-Ons - Discounts + Statutory Taxes (18% GST)</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="background: rgba(255,255,255,0.04); padding: 18px; border-radius: 12px;">
          <h5 style="color: var(--vd-gold-primary); margin-top: 0;">City Multipliers</h5>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.84rem; line-height: 2;">
            <li>Mumbai MMR: <strong>+₹750/mo</strong></li>
            <li>Delhi NCR: <strong>+₹550/mo</strong></li>
            <li>Bangalore Tech: <strong>+₹500/mo</strong></li>
            <li>Nashik Flagship: <strong>Base Rate (₹0 adjustment)</strong></li>
          </ul>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 18px; border-radius: 12px;">
          <h5 style="color: var(--vd-gold-primary); margin-top: 0;">Statutory Add-On Rules</h5>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.84rem; line-height: 2;">
            <li>Dedicated GST Compliance NOC: <strong>+₹350/mo</strong></li>
            <li>Mail Forwarding Concierge: <strong>+₹299/mo</strong></li>
            <li>Incorporation Fast-Track: <strong>+₹2,999 one-time</strong></li>
            <li>Annual Tenure Discount: <strong>20% Off Gross</strong></li>
          </ul>
        </div>
      </div>
    `;
  } else if (tab === 'kyc') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">Compliance &amp; KYC Verification Desk (PRD Sec 46 - 47)</h4>
      <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Acme Technologies Pvt Ltd (CIN: U74999MH2026PTC9812)</strong>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Director: Vikramaditya Roy &bull; PAN, Aadhaar, Bank Proof Uploaded</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--primary btn--sm" onclick="showToast('KYC Approved ✓', 'Dossier approved. Notarized rent agreement queued for dispatch.', 'success')">Approve Dossier</button>
            <button class="btn btn--outline btn--sm" onclick="showToast('Clarification Sent', 'Requested re-upload of electricity bill.', 'info')">Query / Reject</button>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'cms') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">CMS &amp; Universal Search Configuration (PRD Sec 20)</h4>
      <div style="background: rgba(255,255,255,0.04); padding: 18px; border-radius: 12px;">
        <h5 style="color: var(--vd-gold-primary); margin-top: 0;">Configured Popular Search Chips</h5>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <span class="hero-chip">Mumbai</span>
          <span class="hero-chip">Delhi</span>
          <span class="hero-chip">Nashik</span>
          <span class="hero-chip">Bangalore</span>
          <span class="hero-chip">Virtual Office</span>
          <span class="hero-chip">Coworking</span>
          <span class="hero-chip">Private Office</span>
          <span class="hero-chip">GST</span>
        </div>
        <button class="btn btn--primary btn--sm" onclick="showToast('CMS Updated', 'Search controls and chips synchronized.', 'success')">Save Configuration</button>
      </div>
    `;
  } else if (tab === 'telemetry') {
    const events = getTelemetryEvents();
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Real-Time Search Telemetry &amp; Event Stream (PRD Sec 17)</h4>
        <button class="btn btn--outline btn--sm" onclick="switchAdminTab('telemetry')"><i class="ph-bold ph-arrows-clockwise"></i> Refresh</button>
      </div>
      <div style="background: #000; border-radius: 10px; padding: 16px; font-family: monospace; font-size: 0.8rem; max-height: 480px; overflow-y: auto;">
        ${events.length === 0 ? '<div style="color: #64748B;">No telemetry events recorded yet. Perform searches to see live log.</div>' : ''}
        ${events.map(e => `
          <div style="margin-bottom: 8px; border-bottom: 1px solid #1E293B; padding-bottom: 4px;">
            <span style="color: #10B981;">[${new Date(e.timestamp).toLocaleTimeString()}]</span>
            <strong style="color: var(--vd-gold-primary); margin: 0 8px;">${e.type}</strong>
            <span style="color: #94A3B8;">(${e.device})</span>
            <span style="color: #E2E8F0; margin-left: 8px;">${JSON.stringify(e.data)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function calculateLeadScore(lead) {
  let score = 40; // Base score
  if (lead.phone) score += 20;
  if (lead.email && !lead.email.includes('gmail') && !lead.email.includes('yahoo')) score += 15; // Corporate email
  if (lead.company) score += 10;
  if (lead.status === 'QUALIFIED') score += 15;
  return Math.min(100, score);
}

function advanceLeadStatus(leadId) {
  const leads = getLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  const order = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON'];
  const curIdx = order.indexOf(lead.status || 'NEW');
  const nextIdx = (curIdx + 1) % order.length;
  lead.status = order[nextIdx];
  saveLeads(leads);

  showToast('Lead Status Advanced', `${lead.name || 'Lead'} moved to ${lead.status}`, 'success');
  switchAdminTab('pipeline');
}

// ─── 15. NATIVE MOBILE BOTTOM NAVIGATION ROUTER (PRD Sec 64) ──────────────────
function switchMobileNav(tab) {
  document.querySelectorAll('.mobile-app-bottom-dock .mobile-dock-btn').forEach(b => {
    b.classList.remove('active');
    if (b.getAttribute('onclick')?.includes(tab)) b.classList.add('active');
  });

  if (tab === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tab === 'search') {
    const input = document.getElementById('universalHeroInput');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
    } else {
      openCommandPalette();
    }
  } else if (tab === 'bookings') {
    openMeetingBookingModal();
  } else if (tab === 'services') {
    scrollToSection('#voConfigurator');
  } else if (tab === 'account') {
    openCustomerPortal();
  }
}

// Ensure initLatestFeatures connects newly added DOM elements
const origInitLatestFeatures = window.initLatestFeatures;
window.initLatestFeatures = function() {
  if (typeof origInitLatestFeatures === 'function') {
    origInitLatestFeatures();
  }

  // Auto-init Configurator
  const citySelect = document.getElementById('voCitySelect');
  if (citySelect) {
    handleVoCityChange(citySelect.value);
  }
  calculateMrPrice();
};
"""

with open('app.js', 'a', encoding='utf-8') as f:
    f.write('\n\n' + prd_v2_js)

print("Appended PRD Version 2.0 interaction logic to app.js successfully!")
