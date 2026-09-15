/* ==========================================================================
   V-DESK — PREMIUM INTERACTION ENGINE
   Business Logic + Motion + Lead Management

   PRESERVES: LOCATIONS_DB, MEETING_ROOMS_DB, Lead management, CRM, CSV export
   NEW: Hero parallax, scroll animations, counter animations, ecosystem interactions,
        location explorer, pricing configurator, wizard, testimonials, header state,
        mobile drawer, FAQ accordion, toast notifications
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. LOCATIONS DATABASE (Preserved & Extended)
   -------------------------------------------------------------------------- */
const LOCATIONS_DB = [
  // ━━━ NASHIK (Flagship) ━━━
  { id:'NSK-001', city:'Nashik', areaName:'College Road',  fullName:'V-DESK Headquarters — College Road',
    address:'Landmark Trade Centre, 3rd Floor, College Road, Nashik – 422005',
    services:['Virtual Office','Coworking','Meeting Rooms','Private Office','GST Registration','Company Registration'],
    vo_price:1249, cw_price:399, meetingCapacity:'4–20 pax', status:'available', flagship:true },
  { id:'NSK-002', city:'Nashik', areaName:'Gangapur Road', fullName:'V-DESK Premium — Gangapur Road',
    address:'Phoenix Business Park, Near Sula Vineyards Road, Gangapur Road, Nashik – 422013',
    services:['Virtual Office','Coworking','Meeting Rooms','GST Registration'],
    vo_price:1349, cw_price:449, meetingCapacity:'4–12 pax', status:'available', flagship:true },
  // ━━━ MUMBAI ━━━
  { id:'MUM-001', city:'Mumbai', areaName:'Andheri East', fullName:'V-DESK Mumbai — Andheri East',
    address:'Peninsula Business Hub, Andheri–Kurla Road, Andheri East, Mumbai – 400059',
    services:['Virtual Office','Coworking','Meeting Rooms','GST Registration'],
    vo_price:1999, cw_price:699, meetingCapacity:'6–20 pax', status:'available', flagship:false },
  { id:'MUM-002', city:'Mumbai', areaName:'BKC',           fullName:'V-DESK Mumbai — BKC',
    address:'BKC Business Center, G Block, Bandra Kurla Complex, Mumbai – 400051',
    services:['Virtual Office','Private Office','Meeting Rooms','Company Registration'],
    vo_price:2499, cw_price:899, meetingCapacity:'4–16 pax', status:'limited', flagship:false },
  { id:'MUM-003', city:'Mumbai', areaName:'Lower Parel',   fullName:'V-DESK Mumbai — Lower Parel',
    address:'Tower 5, High Street Phoenix, Lower Parel, Mumbai – 400013',
    services:['Virtual Office','Coworking','GST Registration'],
    vo_price:2199, cw_price:799, meetingCapacity:'4–12 pax', status:'available', flagship:false },
  // ━━━ DELHI ━━━
  { id:'DEL-001', city:'Delhi', areaName:'Connaught Place', fullName:'V-DESK Delhi — Connaught Place',
    address:'Statesman House, Barakhamba Road, Connaught Place, New Delhi – 110001',
    services:['Virtual Office','Coworking','Meeting Rooms','GST Registration','Company Registration'],
    vo_price:2199, cw_price:799, meetingCapacity:'6–20 pax', status:'available', flagship:false },
  { id:'DEL-002', city:'Delhi', areaName:'Nehru Place',     fullName:'V-DESK Delhi — Nehru Place',
    address:'Hemkunt Chambers, Nehru Place, New Delhi – 110019',
    services:['Virtual Office','GST Registration'],
    vo_price:1799, cw_price:599, meetingCapacity:'4–8 pax', status:'available', flagship:false },
  // ━━━ BANGALORE ━━━
  { id:'BLR-001', city:'Bangalore', areaName:'Koramangala', fullName:'V-DESK Bangalore — Koramangala',
    address:'Omega Tech Park, 5th Block, Koramangala, Bengaluru – 560034',
    services:['Virtual Office','Coworking','Meeting Rooms','Private Office','GST Registration'],
    vo_price:1999, cw_price:699, meetingCapacity:'6–20 pax', status:'available', flagship:false },
  { id:'BLR-002', city:'Bangalore', areaName:'HSR Layout',  fullName:'V-DESK Bangalore — HSR Layout',
    address:'Bridge+ Workspaces, Sector 7, HSR Layout, Bengaluru – 560102',
    services:['Virtual Office','Coworking','GST Registration'],
    vo_price:1799, cw_price:649, meetingCapacity:'4–12 pax', status:'available', flagship:false },
  // ━━━ PUNE ━━━
  { id:'PNE-001', city:'Pune', areaName:'Baner',       fullName:'V-DESK Pune — Baner',
    address:'Embassy Business Park, Baner Road, Pune – 411045',
    services:['Virtual Office','Coworking','Meeting Rooms','GST Registration','Company Registration'],
    vo_price:1599, cw_price:549, meetingCapacity:'6–16 pax', status:'available', flagship:false },
  { id:'PNE-002', city:'Pune', areaName:'Viman Nagar', fullName:'V-DESK Pune — Viman Nagar',
    address:'Nyati Emporius, Viman Nagar Road, Pune – 411014',
    services:['Virtual Office','GST Registration'],
    vo_price:1449, cw_price:499, meetingCapacity:'4–8 pax', status:'available', flagship:false },
  // ━━━ HYDERABAD ━━━
  { id:'HYD-001', city:'Hyderabad', areaName:'HITEC City',  fullName:'V-DESK Hyderabad — HITEC City',
    address:'Laxmi Cyber City, Whitefields, HITEC City, Hyderabad – 500081',
    services:['Virtual Office','Coworking','Meeting Rooms','Private Office','GST Registration'],
    vo_price:1799, cw_price:649, meetingCapacity:'6–20 pax', status:'available', flagship:false },
  // ━━━ NOIDA ━━━
  { id:'NOI-001', city:'Noida', areaName:'Sector 62',  fullName:'V-DESK Noida — Sector 62',
    address:'Express Trade Tower, Sector 62, Noida – 201301',
    services:['Virtual Office','Coworking','GST Registration'],
    vo_price:1599, cw_price:549, meetingCapacity:'4–12 pax', status:'available', flagship:false },
  // ━━━ GURGAON ━━━
  { id:'GUR-001', city:'Gurgaon', areaName:'Cyber City', fullName:'V-DESK Gurgaon — DLF Cyber City',
    address:'DLF Cyber City, Building 10, Tower C, Gurgaon – 122002',
    services:['Virtual Office','Coworking','Meeting Rooms','Private Office','GST Registration','Company Registration'],
    vo_price:2299, cw_price:799, meetingCapacity:'6–20 pax', status:'limited', flagship:false },
  // ━━━ CHENNAI ━━━
  { id:'CHN-001', city:'Chennai', areaName:'Nungambakkam', fullName:'V-DESK Chennai — Nungambakkam',
    address:'Presidium Business Hub, Nungambakkam High Road, Chennai – 600034',
    services:['Virtual Office','Coworking','Meeting Rooms','GST Registration'],
    vo_price:1699, cw_price:599, meetingCapacity:'4–16 pax', status:'available', flagship:false }
];

const MEETING_ROOMS_DB = [
  { name:'Huddle Room',     capacity:'4 Pax',  priceHour:499,  tech:'65" 4K Display, Wireless Share',  icon:'👥' },
  { name:'Conference Room', capacity:'8 Pax',  priceHour:799,  tech:'75" Display, PTZ Camera, Soundbar', icon:'🏢' },
  { name:'Boardroom',       capacity:'12 Pax', priceHour:1199, tech:'86" Display, Poly Studio X50 Bar', icon:'🏛️' },
  { name:'Training Hall',   capacity:'20 Pax', priceHour:1999, tech:'Dual Displays, PA System, Lectern', icon:'🎓' }
];

/* --------------------------------------------------------------------------
   2. TESTIMONIALS DATA
   -------------------------------------------------------------------------- */
const TESTIMONIALS = [
  {
    quote: "Getting our GST registration in Maharashtra was seamless with V-DESK. The registered rent agreement and electricity bill were delivered in less than 24 hours. Their team even assisted when the tax officer conducted a physical verification.",
    name: "Priya Kulkarni",
    role: "Founder & Director, Zenith D2C Brands",
    location: "Nashik & Mumbai Hub"
  },
  {
    quote: "We operate from Nashik but our clients are in Mumbai and Delhi. V-DESK gave us verified business addresses in all three cities within a week. The cost savings compared to traditional leases are transformative for our bottom line.",
    name: "Rajesh Patel",
    role: "Managing Partner, Patel & Associates CA Firm",
    location: "Multi-City — Nashik, Mumbai, Delhi"
  },
  {
    quote: "As an Amazon FBA seller, I needed APOB addresses in 4 states within a tight deadline. V-DESK activated all four locations in 48 hours with complete documentation. Their operational efficiency is unmatched.",
    name: "Suhani Agarwal",
    role: "E-Commerce Director, Artisan Commerce Pvt Ltd",
    location: "Pune, Hyderabad, Chennai, Bangalore"
  }
];

/* --------------------------------------------------------------------------
   3. LEAD MANAGEMENT SYSTEM (Preserved)
   -------------------------------------------------------------------------- */
const CRM_KEY = 'VDESK_LEADS';

function getLeads() {
  try {
    let leads = JSON.parse(localStorage.getItem(CRM_KEY));
    if (!Array.isArray(leads) || leads.length === 0) {
      leads = [
        {
          id: 'VD-MUM-8921',
          name: 'Priya Kulkarni',
          mobile: '9820194820',
          email: 'priya@zenithd2c.com',
          city: 'Mumbai',
          service: 'Virtual Office for GST',
          company: 'Zenith D2C Brands',
          source: 'Website Configurator',
          status: 'QUALIFIED',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'VD-NSK-4412',
          name: 'Rajesh Patel',
          mobile: '9422238491',
          email: 'rajesh@patelassociates.in',
          city: 'Nashik',
          service: 'Boardroom Hourly Pass',
          company: 'Patel & Associates CA',
          source: 'Meeting Scheduler',
          status: 'NEW',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: 'VD-BLR-7729',
          name: 'Suhani Agarwal',
          mobile: '9880123984',
          email: 'suhani@artisancommerce.in',
          city: 'Bangalore',
          service: 'Company Registration SPICe+',
          company: 'Artisan Commerce',
          source: 'Incorporation Wizard',
          status: 'PROPOSAL_SENT',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        {
          id: 'VD-DEL-1093',
          name: 'Vikramaditya Roy',
          mobile: '9811094821',
          email: 'vikram@acmetech.io',
          city: 'Delhi',
          service: 'Dedicated Flex Coworking',
          company: 'Acme Tech Hub',
          source: 'Direct Inbound',
          status: 'CONVERTED',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ];
      localStorage.setItem(CRM_KEY, JSON.stringify(leads));
    }
    return leads;
  } catch {
    return [];
  }
}

function saveLeads(leads) {
  localStorage.setItem(CRM_KEY, JSON.stringify(leads));
}

function addLead(data) {
  const leads = getLeads();
  const lead = {
    id: 'VD-' + Date.now().toString(36).toUpperCase(),
    ...data,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  leads.unshift(lead);
  saveLeads(leads);
  return lead;
}

function updateLeadStatus(id, status) {
  const leads = getLeads();
  const lead = leads.find(l => l.id === id);
  if (lead) {
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    saveLeads(leads);
    renderAdminLeads();
  }
}

function exportLeadsToCSV() {
  const leads = getLeads();
  if (!leads.length) { showToast('No leads to export.'); return; }
  const headers = ['ID','Name','Mobile','Email','City','Service','Company','Source','Status','Date'];
  const rows = leads.map(l => [l.id, l.name, l.mobile, l.email, l.city, l.service, l.company||'', l.source||'', l.status, l.createdAt]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vdesk-leads-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast('CSV exported successfully.');
}

function seedSampleLeads() {
  const names = ['Vikram Desai','Ananya Shah','Arjun Mehta','Kavita Nair','Nikhil Kumar'];
  const cities = ['Mumbai','Nashik','Delhi','Bangalore','Pune'];
  const services = ['Virtual Office','GST Registration','Company Registration','Coworking','Private Office'];
  const statuses = ['NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','CONVERTED'];
  const name = names[Math.floor(Math.random()*names.length)];
  const lead = addLead({
    name, mobile:'98' + Math.floor(10000000 + Math.random()*90000000),
    email: name.toLowerCase().replace(/\s/g,'.') + '@gmail.com',
    city: cities[Math.floor(Math.random()*cities.length)],
    service: services[Math.floor(Math.random()*services.length)],
    company: 'Demo Corp', source:'Admin — Seeded Sample'
  });
  lead.status = statuses[Math.floor(Math.random()*statuses.length)];
  saveLeads(getLeads());
  renderAdminLeads();
  showToast(`Sample lead "${name}" added.`);
}

/* --------------------------------------------------------------------------
   4. INITIALIZATION
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initScrollAnimations();
  initNavigation();
  initScrollProgressAndFab();
  initCardSpotlight();
  initAccessibility();
  initHeroParallax();
  renderLocations(LOCATIONS_DB);
  filterDiscoveryEngine();
  runCostCalculation();
  initJourneyTimeline();
  initTestimonials();
  initMobileDrawer();
  renderAdminLeads();
});

/* --------------------------------------------------------------------------
   5. HEADER — Transparent → Solid Scroll State
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let isTicking = false;
  function updateHeaderOnScroll() {
    const isScrolled = window.scrollY > 20;
    header.classList.toggle('is-scrolled', isScrolled);
    header.classList.toggle('site-header--solid', isScrolled);
    header.classList.toggle('site-header--transparent', !isScrolled);
    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateHeaderOnScroll);
    }
  }, { passive: true });
  updateHeaderOnScroll();
}

/* --------------------------------------------------------------------------
   6. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealSelectors = [
    '.reveal',
    '.reveal-stagger',
    '.scroll-reveal',
    '.scroll-reveal-group',
    '.reveal-on-scroll',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.scroll-reveal--left',
    '.scroll-reveal--right',
    '.scroll-reveal--scale',
    '.gold-line-draw'
  ].join(', ');

  if (prefersReduced) {
    // Instantly reveal everything
    document.querySelectorAll(revealSelectors).forEach(el => {
      el.classList.add('visible', 'is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible', 'is-revealed');

        // Trigger counter animations inside revealed container
        entry.target.querySelectorAll('.counter, [data-counter-target], [data-target]').forEach(counter => {
          if (!counter.dataset.animated) {
            animateCounter(counter);
            counter.dataset.animated = '1';
          }
        });

        // Trigger counter on target itself if it is a counter
        if ((entry.target.classList.contains('counter') || entry.target.dataset.target) && !entry.target.dataset.animated) {
          animateCounter(entry.target);
          entry.target.dataset.animated = '1';
        }

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(revealSelectors).forEach(el => observer.observe(el));
  
  // Also observe stand-alone counters
  document.querySelectorAll('.counter:not([data-animated])').forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   7. COUNTER ANIMATION
   -------------------------------------------------------------------------- */
function animateCounter(el) {
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const target = parseFloat(el.dataset.target);
  if (isNaN(target)) return;
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Smooth easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    if (decimals > 0) {
      el.textContent = current.toFixed(decimals);
    } else {
      el.textContent = Math.round(current).toLocaleString('en-IN');
    }
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* --------------------------------------------------------------------------
   8. HERO — Modern Architectural Showcase Parallax & 3D Depth
   -------------------------------------------------------------------------- */
function initHeroParallax() {
  const hero = document.getElementById('home') || document.querySelector('.hero-white');
  const showcase = document.querySelector('.showcase-card');
  if (!hero || !showcase) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const badgeTop = document.querySelector('.floating-badge--top');
  const badgeBottom = document.querySelector('.floating-badge--bottom');

  hero.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 992) return;
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;

    const tiltX = -cy * 6;
    const tiltY = cx * 6;
    showcase.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;

    if (badgeTop) {
      badgeTop.style.transform = `translate(${cx * 16}px, ${cy * 12}px)`;
    }
    if (badgeBottom) {
      badgeBottom.style.transform = `translate(${cx * -12}px, ${cy * -10}px)`;
    }
  });

  hero.addEventListener('mouseleave', () => {
    showcase.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    showcase.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    if (badgeTop) {
      badgeTop.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      badgeTop.style.transform = 'translate(0, 0)';
    }
    if (badgeBottom) {
      badgeBottom.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      badgeBottom.style.transform = 'translate(0, 0)';
    }
    setTimeout(() => {
      showcase.style.transition = '';
      if (badgeTop) badgeTop.style.transition = '';
      if (badgeBottom) badgeBottom.style.transition = '';
    }, 500);
  });
}

/* --------------------------------------------------------------------------
   8. WORKSPACE DISCOVERY ENGINE (Master Item 8)
   -------------------------------------------------------------------------- */
const DISCOVERY_SPACES = [
  {
    id: 'DISC-VO-01',
    title: 'Premium Virtual Office (GST & MCA)',
    type: 'Virtual Office',
    city: 'Nashik',
    area: 'College Road (HQ Flagship)',
    capacity: 'All Team Sizes',
    capacityCategory: 'all',
    price: '₹1,249',
    priceUnit: '/mo',
    durationMatch: ['monthly', 'annual'],
    status: 'Available',
    image: 'assets/vdesk-reception.jpg',
    amenities: ['Registered Rent Deed', 'Landlord NOC', 'Name Board Display', 'Courier WhatsApp Alert'],
    quoteLabel: 'Virtual Office — Nashik HQ'
  },
  {
    id: 'DISC-VO-02',
    title: 'Commercial Virtual Office BKC',
    type: 'Virtual Office',
    city: 'Mumbai',
    area: 'Bandra Kurla Complex (BKC)',
    capacity: 'All Team Sizes',
    capacityCategory: 'all',
    price: '₹2,499',
    priceUnit: '/mo',
    durationMatch: ['monthly', 'annual'],
    status: 'Limited',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    amenities: ['BKC Corporate Address', 'GST Inspection Support', 'MCA SPICe+ Compliant', 'Courier Handling'],
    quoteLabel: 'Virtual Office — Mumbai BKC'
  },
  {
    id: 'DISC-CW-01',
    title: 'Dedicated Coworking Workstation',
    type: 'Coworking',
    city: 'Bangalore',
    area: 'Koramangala 5th Block',
    capacity: '1–8 Members',
    capacityCategory: 'solo,growth',
    price: '₹6,499',
    priceUnit: '/desk/mo',
    durationMatch: ['daily', 'monthly', 'annual'],
    status: 'Available',
    image: 'assets/vdesk-coworking.jpg',
    amenities: ['Ergonomic Chair', '500 Mbps Wi-Fi', 'Meeting Room Credits', 'Barista Coffee'],
    quoteLabel: 'Coworking Desk — Bangalore Koramangala'
  },
  {
    id: 'DISC-CW-02',
    title: 'Flex Day Pass & Hot Desk',
    type: 'Coworking',
    city: 'Pune',
    area: 'Baner Business Park',
    capacity: '1–2 Solo',
    capacityCategory: 'solo',
    price: '₹399',
    priceUnit: '/day',
    durationMatch: ['daily'],
    status: 'Available',
    image: 'assets/vdesk-coworking.jpg',
    amenities: ['High-Speed Internet', 'Power Backup', 'Cafeteria Access', 'Community Events'],
    quoteLabel: 'Flex Day Pass — Pune Baner'
  },
  {
    id: 'DISC-PO-01',
    title: 'Executive Private Cabin (4-Pax)',
    type: 'Private Office',
    city: 'Delhi',
    area: 'Connaught Place (CP)',
    capacity: '3–8 Growth Team',
    capacityCategory: 'growth',
    price: '₹24,999',
    priceUnit: '/mo',
    durationMatch: ['monthly', 'annual'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80',
    amenities: ['24/7 RFID Access', 'Private Subnet LAN', 'Acoustic Soundproofing', 'Company Branding'],
    quoteLabel: 'Private Cabin 4-Pax — Delhi CP'
  },
  {
    id: 'DISC-PO-02',
    title: 'Enterprise Team Suite (12-Pax)',
    type: 'Private Office',
    city: 'Hyderabad',
    area: 'HITEC City Cyber Hub',
    capacity: '9–20 Enterprise',
    capacityCategory: 'team',
    price: '₹68,999',
    priceUnit: '/mo',
    durationMatch: ['monthly', 'annual'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    amenities: ['Manager Cabin Inside', 'Dedicated Leased Line', 'Daily Concierge', 'Executive Lounge Access'],
    quoteLabel: 'Enterprise Suite 12-Pax — Hyderabad HITEC City'
  },
  {
    id: 'DISC-MR-01',
    title: 'Executive 4K Video Boardroom',
    type: 'Meeting Rooms',
    city: 'Mumbai',
    area: 'Andheri–Kurla Business Hub',
    capacity: '8–16 Pax',
    capacityCategory: 'growth,team',
    price: '₹1,199',
    priceUnit: '/hr',
    durationMatch: ['daily'],
    status: 'Available',
    image: 'assets/vdesk-boardroom.jpg',
    amenities: ['86" 4K Smart Display', 'Polycom Video Bar', 'Reception Greeting', 'Beverage Service'],
    quoteLabel: 'Boardroom — Mumbai Andheri'
  },
  {
    id: 'DISC-MR-02',
    title: 'Strategy Huddle Suite',
    type: 'Meeting Rooms',
    city: 'Nashik',
    area: 'Gangapur Road Landmark',
    capacity: '4–6 Pax',
    capacityCategory: 'solo,growth',
    price: '₹499',
    priceUnit: '/hr',
    durationMatch: ['daily'],
    status: 'Available',
    image: 'assets/vdesk-boardroom.jpg',
    amenities: ['65" Wireless Display', 'Whiteboard Wall', 'High-Speed Wi-Fi', 'Tea/Coffee Service'],
    quoteLabel: 'Huddle Suite — Nashik Gangapur'
  }
];

function filterDiscoveryEngine() {
  const container = document.getElementById('discoveryResultsContainer');
  if (!container) return;

  const cityVal = document.getElementById('discCity')?.value || 'all';
  const typeVal = document.getElementById('discType')?.value || 'all';
  const teamVal = document.getElementById('discTeam')?.value || 'all';
  const durationVal = document.getElementById('discDuration')?.value || 'all';

  const filtered = DISCOVERY_SPACES.filter(w => {
    if (cityVal !== 'all' && w.city !== cityVal) return false;
    if (typeVal !== 'all' && w.type !== typeVal) return false;
    if (teamVal !== 'all') {
      if (w.capacityCategory !== 'all' && !w.capacityCategory.includes(teamVal)) return false;
    }
    if (durationVal !== 'all') {
      if (!w.durationMatch.includes(durationVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="discovery-empty-state">
        <div class="empty-icon"><i class="ph-bold ph-buildings"></i></div>
        <h4>No workspaces match these specific criteria</h4>
        <p>Try broadening your filters or speak directly with our infrastructure consultant for custom team requirements.</p>
        <button class="btn btn--primary btn--sm" onclick="resetDiscoveryFilters()">Reset Filters</button>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="discovery-card">
      <div class="discovery-card__media">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <span class="discovery-card__status ${item.status === 'Limited' ? 'status--limited' : 'status--avail'}">
          <span class="status-dot"></span> ${item.status}
        </span>
        <span class="discovery-card__type-tag">${item.type}</span>
      </div>
      <div class="discovery-card__body">
        <div class="discovery-card__location">
          <i class="ph-bold ph-map-pin"></i> <strong>${item.city}</strong> &bull; <span>${item.area}</span>
        </div>
        <h4 class="discovery-card__title">${item.title}</h4>
        <div class="discovery-card__capacity">
          <i class="ph-bold ph-users"></i> Capacity: <strong>${item.capacity}</strong>
        </div>
        <div class="discovery-card__amenities">
          ${item.amenities.map(a => `<span class="amenity-pill"><i class="ph-bold ph-check"></i> ${a}</span>`).join('')}
        </div>
      </div>
      <div class="discovery-card__footer">
        <div class="discovery-card__price-wrap">
          <span class="price-from">Starting at</span>
          <span class="price-amount">${item.price}<small>${item.priceUnit}</small></span>
        </div>
        <button class="btn btn--primary btn--sm" onclick="openQuoteModal('Discovery: ${item.quoteLabel}')">
          Get Quote <i class="ph-bold ph-arrow-right"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function resetDiscoveryFilters() {
  if (document.getElementById('discCity')) document.getElementById('discCity').value = 'all';
  if (document.getElementById('discType')) document.getElementById('discType').value = 'all';
  if (document.getElementById('discTeam')) document.getElementById('discTeam').value = 'all';
  if (document.getElementById('discDuration')) document.getElementById('discDuration').value = 'all';
  filterDiscoveryEngine();
}

window.filterDiscoveryEngine = filterDiscoveryEngine;
window.resetDiscoveryFilters = resetDiscoveryFilters;

const CITY_IMAGES = {
  'Nashik': 'assets/vdesk-reception.jpg',
  'Mumbai': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  'Delhi': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  'Bangalore': 'assets/vdesk-coworking.jpg',
  'Pune': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80',
  'Hyderabad': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
  'Noida': 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=600&q=80',
  'Gurgaon': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  'Chennai': 'assets/vdesk-boardroom.jpg'
};

/* --------------------------------------------------------------------------
   9. LOCATION EXPLORER (Master Item 9)
   -------------------------------------------------------------------------- */
function renderLocations(locations) {
  const container = document.getElementById('locationsContainer');
  if (!container) return;

  if (locations.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3.5rem 1.5rem;background:var(--vd-bg-secondary, #FAF8F3);border-radius:12px;border:1px dashed var(--vd-border-soft, #E8E2D8);">
        <div style="font-size:2.2rem;margin-bottom:0.75rem;">📍</div>
        <h4 style="color:var(--vd-navy-deep, #0B1B33);margin-bottom:0.35rem;font-size:1.1rem;">No locations found matching your search</h4>
        <p style="color:var(--vd-text-muted, #687386);font-size:0.875rem;margin-bottom:1.25rem;">Try searching for a different city, neighborhood, or service.</p>
        <button class="btn btn--secondary btn--sm" onclick="clearLocationSearch()">Show All Locations</button>
      </div>`;
    return;
  }

  container.innerHTML = locations.map(loc => {
    const cityImg = CITY_IMAGES[loc.city] || 'assets/vdesk-reception.jpg';
    return `
    <div class="location-card">
      <div class="location-card__img-wrap">
        <img src="${cityImg}" alt="${loc.fullName}" loading="lazy" class="location-card__thumb">
        <span class="location-card__status location-card__status--${loc.status}">${loc.status === 'limited' ? 'Limited' : 'Available'}</span>
        ${loc.flagship ? '<span class="location-card__flagship-badge">★ Flagship</span>' : ''}
      </div>
      <div class="location-card__content">
        <div class="location-card__header">
          <div>
            <div class="location-card__city">${loc.city}</div>
            <h4 class="location-card__name">${loc.areaName}</h4>
          </div>
        </div>
        <div class="location-card__address">${loc.address}</div>
        <div class="location-card__services">
          ${loc.services.map(s => `<span class="location-card__service-tag">${s}</span>`).join('')}
        </div>
        <div class="location-card__footer">
          <div class="location-card__price-wrap">
            <span class="location-price-lbl">Starting from</span>
            <span class="location-card__price">₹${loc.vo_price.toLocaleString('en-IN')}<small>/mo</small></span>
          </div>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <button class="btn btn--ghost btn--sm" title="Copy Address" onclick="copyToClipboard('${loc.address.replace(/'/g, "\\'")}', 'Address copied to clipboard!')">
              <i class="ph-bold ph-copy"></i>
            </button>
            <button class="btn btn--primary btn--sm" onclick="openQuoteModal('Location: ${loc.fullName}')">Get Quote</button>
          </div>
        </div>
      </div>
    </div>
  `}).join('');
}

function handleLocationSearch(query) {
  const clearBtn = document.getElementById('clearSearchBtn');
  clearBtn.style.display = query ? 'block' : 'none';

  // Deactivate city filter buttons
  document.querySelectorAll('.locations__filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.locations__filter-btn').classList.add('active');

  if (!query.trim()) {
    renderLocations(LOCATIONS_DB);
    return;
  }

  const q = query.toLowerCase();
  const filtered = LOCATIONS_DB.filter(loc =>
    loc.city.toLowerCase().includes(q) ||
    loc.areaName.toLowerCase().includes(q) ||
    loc.address.toLowerCase().includes(q) ||
    loc.services.some(s => s.toLowerCase().includes(q))
  );
  renderLocations(filtered);
}

function clearLocationSearch() {
  const input = document.getElementById('citySearchInput');
  if (input) input.value = '';
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = 'none';
  renderLocations(LOCATIONS_DB);
}

function filterLocationsByCity(city, btn) {
  // Update active state
  document.querySelectorAll('.locations__filter-btn').forEach(b => {
    if (b.dataset.city === city || (city === 'all' && b.dataset.city === 'all')) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  if (btn) btn.classList.add('active');

  // Clear search
  const input = document.getElementById('citySearchInput');
  if (input) input.value = '';
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  if (!city || city === 'all') {
    renderLocations(LOCATIONS_DB);
  } else {
    const q = city.toLowerCase().trim();
    renderLocations(LOCATIONS_DB.filter(l => 
      l.city.toLowerCase() === q || 
      l.city.toLowerCase().includes(q) || 
      q.includes(l.city.toLowerCase())
    ));
  }
}

/* --------------------------------------------------------------------------
   10. PRICING / COST CALCULATOR
   -------------------------------------------------------------------------- */
function updateTeamSlider(value) {
  const display = document.getElementById('calcTeamDisplay');
  if (display) display.textContent = value + ' Members';
  runCostCalculation();
}

function runCostCalculation() {
  const cityEl = document.getElementById('calcCity');
  if (!cityEl) return;
  const cityTier = cityEl.value || 'Tier-2';
  const serviceEl = document.getElementById('calcService');
  const service  = serviceEl ? serviceEl.value : 'Virtual Office for GST';
  const teamEl   = document.getElementById('calcTeamSlider');
  const team     = teamEl ? parseInt(teamEl.value, 10) : 1;
  const durEl    = document.getElementById('calcDuration');
  const duration = durEl ? parseInt(durEl.value, 10) : 12;
  const addonGST     = document.getElementById('calcAddonGST')?.checked || false;
  const addonMeeting = document.getElementById('calcAddonMeeting')?.checked || false;

  // Base costs
  let baseMonthly;
  const tierMultiplier = cityTier.includes('Tier-1') ? 1.6 : cityTier.includes('Tier-2') ? 1.0 : 0.75;

  switch (service) {
    case 'Virtual Office for GST':
      baseMonthly = 1499 * tierMultiplier;
      break;
    case 'Coworking Dedicated Desks':
      baseMonthly = 5999 * tierMultiplier * Math.max(1, team * 0.4);
      break;
    case 'Private Office Cabin':
      baseMonthly = 11999 * tierMultiplier * Math.max(1, team * 0.25);
      break;
    case 'Hybrid Combo':
      baseMonthly = (1499 + 5999 * Math.max(1, team * 0.3)) * tierMultiplier;
      break;
    default:
      baseMonthly = 1499 * tierMultiplier;
  }

  // Duration discount
  const durationDiscount = duration >= 24 ? 0.85 : duration >= 12 ? 0.80 : 1.0;
  let monthlyFinal = baseMonthly * durationDiscount;

  // Add-ons
  if (addonGST) monthlyFinal += 299;
  if (addonMeeting) monthlyFinal += 2999;

  const vdeskAnnual = Math.round(monthlyFinal * 12);

  // Traditional lease estimate
  let tradAnnual;
  if (service === 'Virtual Office for GST') {
    tradAnnual = tierMultiplier > 1 ? 1440000 : 720000;
  } else if (service === 'Coworking Dedicated Desks') {
    tradAnnual = Math.round(team * 15000 * tierMultiplier * 12);
  } else if (service === 'Private Office Cabin') {
    tradAnnual = Math.round(team * 20000 * tierMultiplier * 12);
  } else {
    tradAnnual = Math.round((team * 12000 + 120000) * tierMultiplier);
  }

  const savingsPercent = Math.max(0, Math.round((1 - vdeskAnnual / tradAnnual) * 100));
  const vdeskBarWidth = Math.max(5, Math.round((vdeskAnnual / tradAnnual) * 100));

  // Update UI
  const estValEl = document.getElementById('vdeskEstVal');
  const savingsEl = document.getElementById('vdeskSavingsPercent');
  const tradEl = document.getElementById('tradLeaseVal');
  const fillBar = document.getElementById('vdeskFillBar');
  if (tradEl) tradEl.textContent = '₹' + tradAnnual.toLocaleString('en-IN') + ' / yr';
  if (estValEl) estValEl.textContent = '₹' + vdeskAnnual.toLocaleString('en-IN') + ' / yr';
  if (fillBar) fillBar.style.width  = vdeskBarWidth + '%';
  if (savingsEl) savingsEl.textContent = savingsPercent + '%';

  // Trigger micro-interaction bump
  if (estValEl) {
    estValEl.classList.remove('bump');
    void estValEl.offsetWidth;
    estValEl.classList.add('bump');
  }
  const planSum = document.getElementById('calcPlanSummary');
  const durSum = document.getElementById('calcDurationSummary');
  if (planSum) planSum.textContent     = service;
  if (durSum) durSum.textContent = duration + ' Months';

  const addons = [];
  if (addonGST) addons.push('GST Filing');
  if (addonMeeting) addons.push('Meeting Room Bundle');
  const addSum = document.getElementById('calcAddonsSummary');
  if (addSum) addSum.textContent = addons.length ? addons.join(', ') : 'None';
}

/* --------------------------------------------------------------------------
   11. BUSINESS SETUP WIZARD
   -------------------------------------------------------------------------- */
let wizardState = {
  entity: 'Private Limited Company',
  city: 'Nashik (Flagship)',
  step: 1
};

function selectWizardChoice(field, value, btn) {
  wizardState[field] = value;
  // Update visual selection
  btn.closest('.wizard__choices').querySelectorAll('.wizard__choice').forEach(c => c.classList.remove('selected'));
  btn.classList.add('selected');
}

function navigateWizard(step) {
  wizardState.step = step;

  // Update panes
  document.querySelectorAll('.wizard__pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('wizPane' + step);
  if (pane) pane.classList.add('active');

  // Update progress nodes
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById('wizNode' + i);
    const line = document.getElementById('wizLine' + (i - 1));
    if (node) {
      if (i < step) {
        node.classList.add('completed');
        node.classList.remove('active');
        node.innerHTML = '✓';
      } else if (i === step) {
        node.classList.add('active');
        node.classList.remove('completed');
        node.innerHTML = i;
      } else {
        node.classList.remove('active', 'completed');
        node.innerHTML = i;
      }
    }
    if (line) {
      line.classList.toggle('completed', i <= step);
    }
  }
}

function initWizard() {
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById('wizNode' + i);
    if (node) {
      node.style.cursor = 'pointer';
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');
      node.setAttribute('aria-label', `Navigate to Step ${i}`);
      node.onclick = () => navigateWizard(i);
      node.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateWizard(i);
        }
      };
    }
  }
}

function generateWizardRecommendation() {
  // Gather selections
  const reqVO   = document.getElementById('wizReqVO')?.checked;
  const reqGST  = document.getElementById('wizReqGST')?.checked;
  const reqReg  = document.getElementById('wizReqReg')?.checked;
  const reqTM   = document.getElementById('wizReqTM')?.checked;
  const reqCW   = document.getElementById('wizReqCW')?.checked;
  const reqMR   = document.getElementById('wizReqMR')?.checked;
  const urgency = document.getElementById('wizUrgency')?.value || 'This Week';
  const team    = document.getElementById('wizTeam')?.value || 'Solo';

  // Build recommendation
  const services = [];
  let cost = 0;
  if (reqVO)  { services.push('Virtual Office'); cost += 14988; }
  if (reqGST) { services.push('GST Registration'); cost += 1999; }
  if (reqReg) { services.push('Company Incorporation'); cost += 4999; }
  if (reqTM)  { services.push('Trademark Registration'); cost += 1999; }
  if (reqCW)  { services.push('Coworking Access'); cost += 9999; }
  if (reqMR)  { services.push('Meeting Room Credits'); cost += 4999; }

  if (services.length === 0) services.push('Virtual Office');
  if (cost === 0) cost = 14988;

  // Discount for bundles
  if (services.length >= 3) cost = Math.round(cost * 0.85);

  const heading = services.join(' + ');
  const time = urgency.includes('24') ? '24 Working Hours' : urgency.includes('Week') ? '3 – 5 Working Days' : '7 – 10 Working Days';

  const hEl = document.getElementById('recBundleHeading');
  if (hEl) hEl.textContent = heading;
  const dEl = document.getElementById('recBundleDesc');
  if (dEl) dEl.textContent = `Complete turnkey package including ${services.slice(0, 3).join(', ').toLowerCase()}${services.length > 3 ? ' and more' : ''} — with dedicated CA support and guaranteed activation.`;
  const cEl = document.getElementById('recCost');
  if (cEl) cEl.textContent = '₹' + cost.toLocaleString('en-IN') + ' (All-Inclusive)';
  const tEl = document.getElementById('recTime');
  if (tEl) tEl.textContent = time;
  const ctEl = document.getElementById('recCity');
  if (ctEl) ctEl.textContent = wizardState.city;

  navigateWizard(5);
}

/* --------------------------------------------------------------------------
   12. CUSTOMER JOURNEY TIMELINE
   -------------------------------------------------------------------------- */
function initJourneyTimeline() {
  const milestones = document.querySelectorAll('.journey__milestone');
  if (!milestones.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  milestones.forEach(m => observer.observe(m));
}

/* --------------------------------------------------------------------------
   13. TESTIMONIALS
   -------------------------------------------------------------------------- */
let currentTestimonial = 0;
let testimonialTimer;

function initTestimonials() {
  const display = document.getElementById('testimonialDisplay');
  if (!display) return;
  showTestimonial(0);

  function startAutoRotate() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % TESTIMONIALS.length;
      showTestimonial(currentTestimonial);
    }, 6500);
  }

  startAutoRotate();

  // Pause on hover
  if (display) {
    display.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
    display.addEventListener('mouseleave', () => startAutoRotate());

    // Mobile touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;

    display.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    display.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const threshold = 40;
      if (touchEndX < touchStartX - threshold) {
        // Swiped left -> next
        currentTestimonial = (currentTestimonial + 1) % TESTIMONIALS.length;
        showTestimonial(currentTestimonial);
      } else if (touchEndX > touchStartX + threshold) {
        // Swiped right -> prev
        currentTestimonial = (currentTestimonial - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
        showTestimonial(currentTestimonial);
      }
    }, { passive: true });
  }
}

function showTestimonial(index) {
  currentTestimonial = index;
  const t = TESTIMONIALS[index];
  if (!t) return;

  const quoteEl = document.getElementById('testiQuote');
  const nameEl  = document.getElementById('testiName');
  const roleEl  = document.getElementById('testiRole');
  const locEl   = document.getElementById('testiLocation');

  // Fade transition
  if (quoteEl) {
    quoteEl.style.opacity = '0';
    quoteEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      quoteEl.textContent = t.quote;
      if (nameEl) nameEl.textContent  = t.name;
      if (roleEl) roleEl.textContent  = t.role;
      if (locEl) locEl.textContent   = t.location;
      quoteEl.style.opacity = '1';
      quoteEl.style.transform = 'translateY(0)';
    }, 220);
  }

  // Update dots
  document.querySelectorAll('.testimonial-dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

/* --------------------------------------------------------------------------
   14. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const wasOpen = item.classList.contains('open');

  // Close all other items smoothly
  document.querySelectorAll('.faq-item').forEach(i => {
    if (i !== item) {
      i.classList.remove('open');
      const ans = i.querySelector('.faq-item__answer');
      if (ans) ans.style.maxHeight = null;
    }
  });

  const answer = item.querySelector('.faq-item__answer');
  if (wasOpen) {
    item.classList.remove('open');
    if (answer) answer.style.maxHeight = null;
  } else {
    item.classList.add('open');
    if (answer) answer.style.maxHeight = (answer.scrollHeight + 30) + 'px';
  }
}

/* --------------------------------------------------------------------------
   15. MODALS
   -------------------------------------------------------------------------- */
let quoteSource = '';

function openQuoteModal(source = '') {
  quoteSource = source || 'Unknown';
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.add('open', 'active');
  document.body.style.overflow = 'hidden';

  const title = document.getElementById('modalQuoteTitle');
  const citySelect = document.getElementById('mqCity');
  const serviceSelect = document.getElementById('mqService');

  if (title) {
    if (source && source.includes('Virtual Office')) title.textContent = 'Virtual Office Quote';
    else if (source && source.includes('Coworking')) title.textContent = 'Coworking Quote';
    else if (source && source.includes('Meeting')) title.textContent = 'Meeting Room Quote';
    else if (source && source.includes('Registration')) title.textContent = 'Registration Quote';
    else if (source && source.includes('Trademark')) title.textContent = 'Trademark Quote';
    else if (source && source.includes('Location:')) title.textContent = source.replace('Location: ', '');
    else title.textContent = 'Get Instant Quote';
  }

  // Pre-fill City
  if (citySelect) {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Nashik', 'Hyderabad', 'Noida', 'Gurgaon', 'Chennai'];
    const matchedCity = cities.find(c => source.includes(c));
    if (matchedCity) {
      citySelect.value = matchedCity;
    } else if (typeof wizardState !== 'undefined' && wizardState.city) {
      const wizMatch = cities.find(c => wizardState.city.includes(c));
      if (wizMatch) citySelect.value = wizMatch;
    }
  }

  // Pre-fill Service
  if (serviceSelect) {
    if (source && source.includes('Coworking')) serviceSelect.value = 'Coworking';
    else if (source && source.includes('Meeting')) serviceSelect.value = 'Meeting Rooms';
    else if (source && source.includes('Private Office')) serviceSelect.value = 'Private Office';
    else if (source && source.includes('GST')) serviceSelect.value = 'GST Registration';
    else if (source && source.includes('Company') || source.includes('Incorporation')) serviceSelect.value = 'Company Registration';
    else if (source && source.includes('Trademark')) serviceSelect.value = 'Trademark';
    else if (source && source.includes('Calculator')) {
      const calcPlan = document.getElementById('calcPlanSummary')?.textContent || '';
      if (calcPlan.includes('Coworking')) serviceSelect.value = 'Coworking';
      else if (calcPlan.includes('Private Office')) serviceSelect.value = 'Private Office';
      else serviceSelect.value = 'Virtual Office';
    } else {
      serviceSelect.value = 'Virtual Office';
    }
  }

  // Focus Name input for smooth UX
  setTimeout(() => {
    document.getElementById('mqName')?.focus();
  }, 80);
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (!modal) return;
  modal.classList.add('open', 'active');
  document.body.style.overflow = 'hidden';
  renderAdminLeads();
}

/* --------------------------------------------------------------------------
   LEGAL & COMPLIANCE MODAL ENGINE
   -------------------------------------------------------------------------- */
const legalData = {
  privacy: {
    title: 'Privacy Policy & Data Protection',
    content: `
      <h4>1. Information Governance & Privacy Commitment</h4>
      <p>V-DESK Workspace & Consulting LLP ("V-DESK", LLPIN: AAY-9842) is deeply committed to protecting the privacy, identity, and statutory records of our clients, authorized partners, and platform visitors.</p>
      
      <h4>2. Categories of Information Collected</h4>
      <ul>
        <li><strong>KYC & Statutory Records:</strong> Identity proof (Aadhaar/Passport/PAN), Certificate of Incorporation, Director Identification Numbers (DIN), and Authorized Signatory declarations for Virtual Office and GST compliance.</li>
        <li><strong>Transactional Information:</strong> Invoicing details, commercial agreements, desk allocation numbers, and SLA timelines.</li>
        <li><strong>Digital Usage Data:</strong> IP addresses, browser profiles, UTM parameters, and inquiry records captured during consultation requests.</li>
      </ul>

      <h4>3. Purpose and Legal Basis for Processing</h4>
      <p>Data collected is strictly utilized to issue legally compliant Lease Deeds, NOCs, Municipal Tax proofs, and to interface with regulatory agencies (MCA, GSTN) on your behalf. We enforce a zero third-party monetization policy—your business data is never traded or rented.</p>

      <h4>4. Data Security Standards</h4>
      <p>All sensitive documents uploaded to V-DESK repositories are encrypted with AES-256 at rest and TLS 1.3 in transit. Physical mail received at our commercial centers is scanned only upon express written consent and archived in secure, firewalled servers.</p>
    `
  },
  terms: {
    title: 'Terms of Service & Workspace SLAs',
    content: `
      <h4>1. Agreement of Service</h4>
      <p>These Terms of Service govern all virtual office registrations, dedicated desk leases, meeting room bookings, and company formation consultancies provided by V-DESK Workspace & Consulting LLP.</p>

      <h4>2. Permitted Business Usage</h4>
      <ul>
        <li>Virtual Office addresses are allocated exclusively for lawful business registration, corporate correspondence, and statutory GST jurisdiction.</li>
        <li>Sub-leasing, illegal commercial operations, fraudulent financial activities, or misrepresentation of center premises will result in immediate termination of the agreement and reportage to regulatory authorities.</li>
      </ul>

      <h4>3. Service Level Agreements (SLAs)</h4>
      <ul>
        <li><strong>Document Issuance:</strong> Standard NOC, Registered Rent Agreement, and Utility Bill proofs are delivered digitally within 24–48 hours following successful KYC approval.</li>
        <li><strong>Mail Handling:</strong> Inbound physical letters are logged within 4 operating hours, with instant WhatsApp/Email alerts dispatched to the designated representative.</li>
        <li><strong>Meeting Room Reservations:</strong> Real-time booking confirmations with guaranteed high-speed fiber internet, presentation screens, and front-desk receptionist escort.</li>
      </ul>

      <h4>4. Client Compliance Obligations</h4>
      <p>Clients are solely responsible for timely filing of statutory returns (GST, Income Tax, MCA ROC) using the allocated registered address. V-DESK provides continuous document renewal support prior to lease expiry.</p>
    `
  },
  refund: {
    title: 'Refund, Cancellation & 100% NOC Guarantee',
    content: `
      <h4>1. 100% Regulatory Document Approval Guarantee</h4>
      <p>V-DESK provides a rock-solid, 100% money-back guarantee: If your Virtual Office application for GST Registration or MCA Company Incorporation is formally rejected by statutory authorities solely due to a document defect attributable to V-DESK (such as Landlord NOC or Utility Bill issues), you are entitled to a full 100% refund of fees paid.</p>

      <h4>2. Cancellation & Voluntary Termination</h4>
      <ul>
        <li><strong>Pre-NOC Issuance:</strong> Cancellations initiated within 48 hours of booking and prior to the generation of signed lease deeds receive a 100% refund less standard processing gateway charges.</li>
        <li><strong>Post-NOC Issuance:</strong> Once notarized agreements and jurisdictional electricity bills are legally issued to the client, refunds cannot be processed due to regulatory stamp duty and administrative center reservation commitments.</li>
      </ul>

      <h4>3. Settlement & Disbursement</h4>
      <p>All approved refunds are audited and disbursed via NEFT/RTGS directly to the originating corporate bank account within 5 to 7 business banking days.</p>
    `
  },
  compliance: {
    title: 'Ministry of Corporate Affairs (MCA) & GST Compliance',
    content: `
      <h4>1. Corporate Entity Particulars</h4>
      <p><strong>Entity Name:</strong> V-DESK Workspace & Consulting LLP<br>
      <strong>LLP Identification Number (LLPIN):</strong> AAY-9842<br>
      <strong>Incorporation Authority:</strong> Ministry of Corporate Affairs, Government of India<br>
      <strong>Corporate Headquarters:</strong> V-DESK Corporate Tower, College Road, Nashik, Maharashtra 422005</p>

      <h4>2. Verified Statutory Documentation Portfolio</h4>
      <p>Every V-DESK location complies with the stringent regulatory benchmarks mandated by the Central Board of Indirect Taxes and Customs (CBIC) and MCA ROC:</p>
      <ul>
        <li>100% Valid Registered Commercial Lease Agreements with building title verifications.</li>
        <li>Latest Municipal Corporation Property Tax Assessments & Receipts.</li>
        <li>Dedicated Commercial Electricity Utility Bills with explicit center matching.</li>
        <li>Unconditional Landlord / Property Owner No-Objection Certificate (NOC).</li>
      </ul>

      <h4>3. Physical Verification & Jurisdiction Signage</h4>
      <p>In accordance with GST Rule 25, V-DESK centers facilitate physical officer visits, maintain permanent corporate name-boards with client trade names and GSTIN disclosures, and host physical visit log registers.</p>

      <h4>4. Regulatory & Grievance Contact</h4>
      <p>For regulatory correspondence or verification queries, contact our Compliance Cell:<br>
      <strong>Email:</strong> compliance@vdeskworkspace.com &bull; <strong>Helpline:</strong> +91 98765 43210</p>
    `
  }
};

function openLegalModal(tab) {
  const modal = document.getElementById('legalModal');
  if (!modal) return;
  modal.classList.add('open', 'active');
  document.body.style.overflow = 'hidden';
  switchLegalTab(tab || 'privacy');
}

function switchLegalTab(tab) {
  const data = legalData[tab] || legalData.privacy;
  
  // Update Tab buttons
  document.querySelectorAll('.legal-tab, .legal-modal__tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('id') === `tabBtn-${tab}` || btn.dataset.tab === tab);
  });

  // Update Modal title & body
  const titleEl = document.getElementById('legalModalTitle');
  const bodyEl = document.getElementById('legalModalBody');
  if (titleEl) titleEl.textContent = data.title;
  if (bodyEl) {
    bodyEl.innerHTML = data.content;
    bodyEl.scrollTop = 0;
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open', 'active');
  }
  document.body.style.overflow = '';
}

function closeModalOnBackdrop(e, id) {
  if (e.target.id === id) closeModal(id);
}

// Global modal helpers
window.closeModal = closeModal;
window.closeModalOnBackdrop = closeModalOnBackdrop;
window.closeQuoteModal = () => closeModal('quoteModal');
window.closeLegalModal = () => closeModal('legalModal');
window.closeAdminModal = () => closeModal('adminModal');

/* --------------------------------------------------------------------------
   16. FORM SUBMISSIONS
   -------------------------------------------------------------------------- */
function handleModalQuoteSubmit(e) {
  e.preventDefault();
  const nameEl = document.getElementById('mqName');
  const phoneEl = document.getElementById('mqMobile');
  const emailEl = document.getElementById('mqEmail');
  const cityEl = document.getElementById('mqCity');
  const serviceEl = document.getElementById('mqService');
  const companyEl = document.getElementById('mqCompany');
  const messageEl = document.getElementById('mqMessage');

  const lead = addLead({
    name:    nameEl ? nameEl.value.trim() : '',
    mobile:  phoneEl ? phoneEl.value.trim() : '',
    email:   emailEl ? emailEl.value.trim() : '',
    city:    cityEl ? cityEl.value : 'General',
    service: serviceEl ? serviceEl.value : 'Virtual Office',
    company: companyEl ? companyEl.value.trim() : '',
    notes:   messageEl ? messageEl.value.trim() : '',
    source:  'Quote Modal — ' + (typeof quoteSource !== 'undefined' && quoteSource ? quoteSource : 'Direct')
  });
  e.target.reset();
  closeModal('quoteModal');
  showToast(`✓ Quote request received — ${lead.id}. We'll reach out within 15 minutes.`);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('cfName')?.value || '';
  const mobile = document.getElementById('cfMobile')?.value || '';
  const email = document.getElementById('cfEmail')?.value || '';
  const notes = document.getElementById('cfMessage')?.value || '';
  const lead = addLead({
    name,
    mobile,
    email,
    city:    'Contact Page',
    service: 'General Enquiry',
    company: '',
    notes,
    source:  'Contact Form'
  });
  e.target.reset();
  showToast(`✓ Message received — ${lead.id}. Our strategist will connect shortly.`);
}

function handleHeroLeadSubmit(e) {
  e.preventDefault();
  const nameEl = document.getElementById('hlName');
  const phoneEl = document.getElementById('hlPhone');
  const emailEl = document.getElementById('hlEmail');
  const cityEl = document.getElementById('hlCity');
  const serviceEl = document.getElementById('hlService');

  const lead = addLead({
    name:    nameEl ? nameEl.value : '',
    mobile:  phoneEl ? phoneEl.value : '',
    email:   emailEl ? emailEl.value : '',
    city:    cityEl ? cityEl.value : 'Preferred City',
    service: serviceEl ? serviceEl.value : 'Virtual Office',
    company: '',
    source:  'Hero Express Lead Form'
  });

  e.target.reset();
  showToast('Inquiry Dispatched!', `Lead #${lead.id} received. Our virtual office expert will call within 15 mins.`, 'success');
}

function switchKycTab(tabName, btn) {
  document.querySelectorAll('.kyc-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.kyc-pane').forEach(p => p.classList.remove('active'));
  const activePane = document.getElementById(`kycPane${tabName}`);
  if (activePane) activePane.classList.add('active');
}

function openAllLocationsModal() {
  const modal = document.getElementById('allLocationsModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const filterInput = document.getElementById('modalStateFilterInput');
  if (filterInput) {
    filterInput.value = '';
    filterModalStates('');
    setTimeout(() => filterInput.focus(), 100);
  }
}

function closeAllLocationsModal() {
  closeModal('allLocationsModal');
}

function filterCityFromModal(city) {
  closeAllLocationsModal();
  const locSection = document.getElementById('locations');
  if (locSection) {
    locSection.scrollIntoView({ behavior: 'smooth' });
  }
  filterLocationsByCity(city);
  showToast('Location Selected', `Viewing verified V-DESK workspace hubs in ${city}.`, 'info');
}

function selectStateFromModal(stateName) {
  closeAllLocationsModal();
  openQuoteModal(`State Coverage: ${stateName}`);
  showToast('State Selection', `Requesting Grade-A commercial NOC address in ${stateName}.`, 'info');
}

function filterModalStates(query) {
  const q = (query || '').toLowerCase().trim();
  const metroBtns = document.querySelectorAll('#modalMetroGrid .state-pill');
  metroBtns.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    btn.style.display = text.includes(q) ? 'inline-flex' : 'none';
  });

  const stateLinks = document.querySelectorAll('#modalStatesPillContainer .state-pill');
  stateLinks.forEach(link => {
    const text = link.textContent.toLowerCase();
    link.style.display = text.includes(q) ? 'inline-flex' : 'none';
  });
}

window.handleHeroLeadSubmit = handleHeroLeadSubmit;
window.switchKycTab = switchKycTab;
window.openAllLocationsModal = openAllLocationsModal;
window.closeAllLocationsModal = closeAllLocationsModal;
window.filterCityFromModal = filterCityFromModal;
window.selectStateFromModal = selectStateFromModal;
window.filterModalStates = filterModalStates;

/* --------------------------------------------------------------------------
   17. ADMIN CRM RENDERING
   -------------------------------------------------------------------------- */
function renderAdminLeads() {
  const leads = getLeads();
  const tbodies = [
    document.getElementById('adminLeadsTableBody'),
    document.getElementById('adminLeadsTableBody2')
  ].filter(Boolean);
  if (tbodies.length === 0) return;

  // Metrics
  const el = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
  el('totalLeadsMetric', leads.length);
  el('newLeadsMetric', leads.filter(l => l.status === 'NEW').length);
  el('qualifiedLeadsMetric', leads.filter(l => l.status === 'QUALIFIED').length);
  el('convertedLeadsMetric', leads.filter(l => l.status === 'CONVERTED').length);

  const rows = leads.map(l => `
    <tr>
      <td>${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
      <td><strong style="color:var(--vd-zinc-200, #FFF);">${l.name}</strong><br><span style="font-size:0.75rem; color:#94A3B8;">${l.mobile} • ${l.email}</span></td>
      <td>${l.city}<br><span style="font-size:0.75rem; color:var(--vd-gold-primary, #C59239);">${l.service}</span></td>
      <td><span style="font-size:0.75rem; color:#94A3B8;">${l.source || '—'}</span></td>
      <td>
        <select onchange="updateLeadStatus('${l.id}', this.value)" style="background:#05132B; color:#FFF; border:1px solid rgba(255,255,255,0.2); border-radius:4px; padding:3px 6px; font-size:0.75rem;">
          ${['NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','FOLLOW_UP','CONVERTED','LOST'].map(s => `<option value="${s}" ${l.status===s?'selected':''}>${s.replace(/_/g,' ')}</option>`).join('')}
        </select>
      </td>
      <td>
        <a href="tel:${l.mobile}" class="btn btn--outline btn--sm" style="font-size:0.75rem; padding: 3px 8px;">Call</a>
      </td>
    </tr>
  `).join('');

  tbodies.forEach(tb => tb.innerHTML = rows);
}

function filterAdminLeads() {
  const search = (document.getElementById('adminSearchInput')?.value || '').toLowerCase();
  const status = document.getElementById('adminStatusFilter')?.value || 'ALL';
  let leads = getLeads();

  if (status !== 'ALL') leads = leads.filter(l => l.status === status);
  if (search) leads = leads.filter(l =>
    l.name.toLowerCase().includes(search) ||
    l.mobile.includes(search) ||
    l.email.toLowerCase().includes(search) ||
    l.city.toLowerCase().includes(search)
  );

  // Re-render with filtered
  const tbody = document.getElementById('adminLeadsTableBody');
  if (!tbody) return;

  tbody.innerHTML = leads.map(l => `
    <tr>
      <td>${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
      <td><strong style="color:var(--vd-zinc-200);">${l.name}</strong><br><span style="font-size:0.75rem;">${l.mobile} • ${l.email}</span></td>
      <td>${l.city}<br><span style="font-size:0.75rem;">${l.service}</span></td>
      <td><span style="font-size:0.75rem;">${l.source || '—'}</span></td>
      <td>
        <select onchange="updateLeadStatus('${l.id}', this.value)">
          ${['NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','FOLLOW_UP','CONVERTED','LOST'].map(s => `<option value="${s}" ${l.status===s?'selected':''}>${s.replace(/_/g,' ')}</option>`).join('')}
        </select>
      </td>
      <td>
        <a href="tel:${l.mobile}" class="btn btn--ghost btn--sm" style="font-size:0.75rem;">Call</a>
      </td>
    </tr>
  `).join('');
}

/* --------------------------------------------------------------------------
   18. MOBILE DRAWER
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   18. MOBILE DRAWER
   -------------------------------------------------------------------------- */
function openMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const toggle = document.getElementById('mobileNavToggle');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer) {
    drawer.classList.add('is-active', 'open', 'active');
    drawer.setAttribute('aria-hidden', 'false');
  }
  if (toggle) {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
  }
  if (overlay) {
    overlay.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const toggle = document.getElementById('mobileNavToggle');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer) {
    drawer.classList.remove('is-active', 'open', 'active');
    drawer.setAttribute('aria-hidden', 'true');
  }
  if (toggle) {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
  document.body.style.overflow = '';
}

function toggleMobileNav() {
  const drawer = document.getElementById('mobileDrawer');
  const isOpen = drawer && (drawer.classList.contains('is-active') || drawer.classList.contains('open') || drawer.classList.contains('active'));
  if (isOpen) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
}

function initMobileDrawer() {
  const toggle  = document.getElementById('mobileNavToggle');
  const drawer  = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const closeBtn = document.getElementById('mobileDrawerClose');

  if (toggle) {
    toggle.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileNav();
    };
  }

  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.preventDefault();
      closeMobileNav();
    };
  }

  if (overlay) {
    overlay.onclick = (e) => {
      e.preventDefault();
      closeMobileNav();
    };
  }

  const drawerLinks = document.querySelectorAll('.mobile-drawer a, .mobile-nav__link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });
}

function closeDrawer() {
  closeMobileNav();
}

window.openMobileNav = openMobileNav;
window.closeMobileNav = closeMobileNav;
window.toggleMobileNav = toggleMobileNav;
window.closeDrawer = closeDrawer;

/* --------------------------------------------------------------------------
   19. CLIPBOARD & SHARING UTILITIES
   -------------------------------------------------------------------------- */

function copyToClipboard(text, label = 'Copied') {
  const cleanLabel = (label && label.length > 0) ? label : 'Item';
  
  // Create or update floating toast-banner
  let banner = document.querySelector('.toast-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'toast-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '24px';
    banner.style.right = '24px';
    banner.style.background = '#05132B';
    banner.style.color = '#FFFFFF';
    banner.style.border = '1px solid #C59239';
    banner.style.borderRadius = '8px';
    banner.style.padding = '12px 18px';
    banner.style.zIndex = '999999';
    banner.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    banner.style.display = 'flex';
    banner.style.alignItems = 'center';
    banner.style.gap = '8px';
    document.body.appendChild(banner);
  }
  banner.innerHTML = `<i class="ph-bold ph-check" style="color: #10B981;"></i> <strong>${cleanLabel} Copied to Clipboard!</strong> <span style="font-size: 0.8rem; color: #94A3B8;">(${text})</span>`;
  banner.style.display = 'flex';
  
  setTimeout(() => {
    if (banner && banner.parentNode) banner.style.display = 'none';
  }, 3000);

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
  if (typeof showToast === 'function') {
    showToast(`${cleanLabel} Copied!`, text, 'success');
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    if (typeof showToast === 'function') showToast('Failed to copy. Please copy manually.');
  }
  document.body.removeChild(textarea);
}

window.copyToClipboard = copyToClipboard;

/* --------------------------------------------------------------------------
   20. SMOOTH SCROLL HELPER
   -------------------------------------------------------------------------- */
function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
/* --------------------------------------------------------------------------
   21. ENHANCED NAVIGATION (SMOOTH SCROLL & SCROLLSPY)
   -------------------------------------------------------------------------- */
function initNavigation() {
  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 80; // Header height offset
        const top = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        
        // Update URL without jumping
        history.pushState(null, null, targetId);
      }
    });
  });

  // ScrollSpy to highlight active nav link
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header-nav__link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100; // offset
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = '#' + section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('header-nav__link--active');
      if (link.getAttribute('href') === current) {
        link.classList.add('header-nav__link--active');
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   22. SCROLL PROGRESS BAR & FLOATING ACTIONS (USER EXPERIENCE)
   -------------------------------------------------------------------------- */
function initScrollProgressAndFab() {
  const progressBar = document.getElementById('scrollProgressBar');
  const fabContainer = document.getElementById('mobileStickyDock');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const progressCircle = scrollTopBtn?.querySelector('.progress-ring circle');
  const circumference = 138; // 2 * pi * 22 approx

  let ticking = false;
  function onScrollTick() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

    // Update Top Progress Bar (Fallback when CSS animation-timeline is unsupported)
    if (progressBar && (!window.CSS || !CSS.supports || !CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)'))) {
      progressBar.style.width = scrollPercent + '%';
    }

    // Update Circular Progress on Back to Top button
    if (progressCircle) {
      const offset = circumference - (scrollPercent / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }

    // Show/Hide Scroll-to-Top Button
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('is-visible', scrollY > 360);
    }

    // Show/Hide Floating Mobile Sticky Dock
    if (fabContainer) {
      if (scrollY > 320) {
        fabContainer.classList.remove('floating-actions--hidden');
      } else {
        fabContainer.classList.add('floating-actions--hidden');
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollTick);
    }
  }, { passive: true });

  onScrollTick();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* --------------------------------------------------------------------------
   23. CARD SPOTLIGHT HOVER EFFECT (MICRO-ANIMATION)
   -------------------------------------------------------------------------- */
function initCardSpotlight() {
  const cards = document.querySelectorAll('.service-card, .location-card, .pricing-card, .knowledge-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* --------------------------------------------------------------------------
   24. KEYBOARD SHORTCUTS & ACCESSIBILITY
   -------------------------------------------------------------------------- */
function initAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('quoteModal');
      closeModal('adminModal');
      closeModal('commandPaletteModal');
      closeDrawer();
      closeMobileNav();
    }
  });

  // Enable keyboard navigation for wizard choice cards
  document.querySelectorAll('.wizard__choice').forEach(choice => {
    if (!choice.hasAttribute('tabindex')) choice.setAttribute('tabindex', '0');
    if (!choice.hasAttribute('role')) choice.setAttribute('role', 'button');
    choice.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        choice.click();
      }
    });
  });
}



// Global Navigation & Modal Helpers
function openConsultationModal() {
  openQuoteModal('Free Consultation');
}

// ==========================================================================
// V-DESK MASTER SCROLL ANIMATION & VIDEO SCRUBBING ENGINE
// ==========================================================================
(function initMasterScrollSystem() {
  // 1. Reading Progress Bar at top of viewport
  let progressBar = document.getElementById('scrollProgressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.id = 'scrollProgressBar';
    document.body.appendChild(progressBar);
  }

  // 2. Scroll-to-Top Button
  let scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn) {
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollTopBtn.innerHTML = '<i class="ph-bold ph-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);
  }

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 3. Scroll Update Handler (Throttled via requestAnimationFrame)
  let isTicking = false;

  function onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Update top reading progress bar
    if (docHeight > 0) {
      const scrollPct = (scrollY / docHeight) * 100;
      progressBar.style.width = scrollPct + '%';
    }

    // Toggle scroll-to-top button (only after hero video storytelling track)
    if (scrollY > 1600) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }

    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(onWindowScroll);
    }
  }, { passive: true });

  onWindowScroll();

  // 4. Cinematic Background Video & Multi-Stage Scroll Choreography (RMC GSAP Engine)
  (function initRmcHeroScroll() {
    const heroSection = document.getElementById('home');
    const slide1 = document.getElementById('heroSlide1');
    const slide2 = document.getElementById('heroSlide2');
    const slide3 = document.getElementById('heroSlide3');
    const slide4 = document.getElementById('heroSlide4');
    const cornerCards = document.getElementById('heroCornerCards');
    const techCard = document.getElementById('heroTechCard');
    const scrollIndicator = document.getElementById('heroScrollIndicator');
    const bgVideo = document.getElementById('heroBgVideo');

    if (!heroSection || !slide1) return;

    // Ambient Autoplay Initialization
    if (bgVideo) {
      bgVideo.muted = true;
      bgVideo.playsInline = true;
      bgVideo.setAttribute('muted', '');
      bgVideo.setAttribute('playsinline', '');
      bgVideo.setAttribute('webkit-playsinline', '');
      bgVideo.play().catch(() => {});
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded, falling back to static presentation');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Enterprise Platform: Clean, untrapped hero presentation with ambient video scaling and entrance
    gsap.set(slide1, { opacity: 1, y: 0, pointerEvents: 'auto', display: 'flex' });
    if (slide2) gsap.set(slide2, { display: 'none' });
    if (slide3) gsap.set(slide3, { display: 'none' });
    if (slide4) gsap.set(slide4, { display: 'none' });
    if (cornerCards) gsap.set(cornerCards, { display: 'none' });
    if (techCard) gsap.set(techCard, { display: 'none' });

    // Smooth subtle parallax on video when scrolling without trapping user scroll
    if (bgVideo) {
      gsap.to(bgVideo, {
        yPercent: 15,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }
  })();

  // 5. Luxury IntersectionObserver for Scroll Reveals
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed', 'visible');
          
          // Animate number counters if inside this section
          entry.target.querySelectorAll('.counter').forEach(counter => {
            if (!counter.dataset.animated && typeof animateCounter === 'function') {
              animateCounter(counter);
              counter.dataset.animated = '1';
            }
          });

          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    const targets = document.querySelectorAll(
      '.reveal, .reveal-stagger, .reveal-on-scroll, .service-card, .location-card, ' +
      '.trust-strip__item, .knowledge__card, .faq-item, .showcase-card, .section__header, ' +
      '.pricing__controls, .pricing__summary, .wizard__container, .contact__form-card'
    );

    targets.forEach(el => {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-on-scroll').forEach(el => {
      el.classList.add('is-revealed', 'visible');
    });
  }
})();

// Explicit global window bindings for 100% resilient inline HTML onclick & form handlers
window.openQuoteModal = typeof openQuoteModal !== 'undefined' ? openQuoteModal : () => {};
window.openConsultationModal = typeof openConsultationModal !== 'undefined' ? openConsultationModal : () => {};
window.openAdminModal = typeof openAdminModal !== 'undefined' ? openAdminModal : () => {};
window.closeModal = typeof closeModal !== 'undefined' ? closeModal : () => {};
window.closeModalOnBackdrop = typeof closeModalOnBackdrop !== 'undefined' ? closeModalOnBackdrop : () => {};
window.closeMobileNav = typeof closeMobileNav !== 'undefined' ? closeMobileNav : () => {};
window.handleModalQuoteSubmit = typeof handleModalQuoteSubmit !== 'undefined' ? handleModalQuoteSubmit : () => {};
window.handleContactSubmit = typeof handleContactSubmit !== 'undefined' ? handleContactSubmit : () => {};
window.toggleFaq = typeof toggleFaq !== 'undefined' ? toggleFaq : () => {};
window.filterLocationsByCity = typeof filterLocationsByCity !== 'undefined' ? filterLocationsByCity : () => {};
window.clearLocationSearch = typeof clearLocationSearch !== 'undefined' ? clearLocationSearch : () => {};
window.updateTeamSlider = typeof updateTeamSlider !== 'undefined' ? updateTeamSlider : () => {};
window.runCostCalculation = typeof runCostCalculation !== 'undefined' ? runCostCalculation : () => {};
window.selectWizardChoice = typeof selectWizardChoice !== 'undefined' ? selectWizardChoice : () => {};
window.navigateWizard = typeof navigateWizard !== 'undefined' ? navigateWizard : () => {};
window.generateWizardRecommendation = typeof generateWizardRecommendation !== 'undefined' ? generateWizardRecommendation : () => {};
window.showTestimonial = typeof showTestimonial !== 'undefined' ? showTestimonial : () => {};
window.exportLeadsToCSV = typeof exportLeadsToCSV !== 'undefined' ? exportLeadsToCSV : () => {};
window.seedSampleLeads = typeof seedSampleLeads !== 'undefined' ? seedSampleLeads : () => {};
window.openLegalModal = typeof openLegalModal !== 'undefined' ? openLegalModal : () => {};
window.switchLegalTab = typeof switchLegalTab !== 'undefined' ? switchLegalTab : () => {};

/* --------------------------------------------------------------------------
   18. FOOTER LUXURY INTERACTIONS & SMOOTH NAVIGATION
   -------------------------------------------------------------------------- */
function handleFooterRateRequest(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('.footer__rate-input');
  const btn = form.querySelector('.footer__rate-submit-btn');
  if (!input || !input.value) return;
  const mobile = input.value.trim();

  // Tactile feedback state
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<span>Dispatching...</span> <i class="ph-bold ph-spinner ph-spin"></i>';
  btn.disabled = true;

  setTimeout(() => {
    if (typeof addLead === 'function') {
      addLead({
        name: 'Enterprise Client',
        mobile: mobile,
        email: 'rate-matrix@vdesk.in',
        city: 'All Metros',
        service: '2026 Commercial Tariff & NOC Package',
        company: 'Confidential Enterprise',
        source: 'Footer VIP Rate Desk'
      });
    }

    input.value = '';
    btn.innerHTML = '<span>Dispatched ✓</span> <i class="ph-bold ph-check-circle"></i>';
    btn.style.background = '#22c55e';
    btn.style.borderColor = '#16a34a';
    btn.style.color = '#FFFFFF';

    if (typeof showToast === 'function') {
      showToast(`✓ 2026 Commercial Rate Card & NOC Checklist dispatched to ${mobile} via WhatsApp.`);
    }

    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 4000);
  }, 650);
}

function smoothScrollToTop(e) {
  if (e) e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

window.handleFooterRateRequest = handleFooterRateRequest;
window.smoothScrollToTop = smoothScrollToTop;

// Initialize smooth anchor navigation and 3D card tilt for footer
(function initFooterInteractions() {
  function setup() {
    // Silky Smooth Anchor Scrolling for Footer links
    document.querySelectorAll('.site-footer a[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href) return;
        if (href === '#top' || href === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });
        }
      });
    });

    // 3D Perspective Card Tilt Micro-interactions
    const tiltCards = document.querySelectorAll('.footer-trust-pill, .footer-logo-card');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();



/* ==========================================================================
   2026 LATEST TRENDING UI/UX INTERACTIONS & LOGIC ENGINE
   ========================================================================== */

// 1. TOAST NOTIFICATION SYSTEM
function showToast(title, desc = '', type = 'info') {
  let container = document.getElementById('toastContainer') || document.getElementById('toastStack');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'vd-toast-container';
    document.body.appendChild(container);
  }

  // Auto-detect status type if not explicitly overridden
  if (type === 'info' && typeof title === 'string') {
    const lower = title.toLowerCase();
    if (title.startsWith('✓') || lower.includes('success') || lower.includes('received') || lower.includes('copied')) {
      type = 'success';
    } else if (lower.includes('error') || lower.includes('fail') || lower.includes('invalid')) {
      type = 'error';
    }
  }

  const toast = document.createElement('div');
  toast.className = `vd-toast ${type}`;
  
  let iconClass = 'ph-info';
  if (type === 'success') iconClass = 'ph-check-circle';
  if (type === 'error') iconClass = 'ph-warning-circle';

  toast.innerHTML = `
    <i class="ph-bold ${iconClass} vd-toast__icon"></i>
    <div class="vd-toast__body">
      <div class="vd-toast__title">${title}</div>
      ${desc ? `<div class="vd-toast__desc">${desc}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  // Trigger smooth enter
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove after 3.2s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
window.showToast = showToast;

// 2. SCROLL PROGRESS BAR
function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalH = document.documentElement.scrollHeight - window.innerHeight;
    if (totalH <= 0) return;
    const progress = Math.min(100, Math.max(0, (window.pageYOffset / totalH) * 100));
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

// 3. INTERACTIVE CURSOR SPOTLIGHT / MAGNETIC CARD GLOW
function initSpotlightCards() {
  const selector = '.journey__stage-card, .service-card, .service-card--featured, .service-card--compact, .discovery-card, .location-card, .pricing__controls, .pricing__breakdown, .wizard__card, .spotlight-card';
  
  function bindSpotlight(container) {
    const cards = (container || document).querySelectorAll(selector);
    cards.forEach(card => {
      if (card.__spotlightBound) return;
      card.__spotlightBound = true;

      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  }

  bindSpotlight();

  // Also observe dynamic cards added to DOM
  const observer = new MutationObserver(() => {
    bindSpotlight();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// 4. ANIMATED METRIC NUMBER TICKERS
function initMetricCounters() {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target')) || 0;
        const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
        const duration = 1600; // ms
        const startTime = performance.now();

        function updateNumber(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = target * easeOut;

          if (decimals > 0) {
            el.textContent = currentVal.toFixed(decimals);
          } else {
            el.textContent = Math.floor(currentVal).toLocaleString('en-IN');
          }

          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            if (decimals > 0) {
              el.textContent = target.toFixed(decimals);
            } else {
              el.textContent = target.toLocaleString('en-IN');
            }
          }
        }

        requestAnimationFrame(updateNumber);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.25 });

  counters.forEach(c => observer.observe(c));
}

// 5. RAYCAST / LINEAR-STYLE QUICK COMMAND PALETTE (Ctrl+K)
const COMMAND_PALETTE_ITEMS = [
  // Cities
  { type: 'city', title: 'Mumbai', subtitle: 'Bandra Kurla Complex (BKC), Andheri & Lower Parel', icon: 'ph-buildings', action: () => { filterLocationsByCity('Mumbai'); scrollToSection('#locations'); } },
  { type: 'city', title: 'Bangalore', subtitle: 'Koramangala, HSR Layout & Indiranagar', icon: 'ph-buildings', action: () => { filterLocationsByCity('Bangalore'); scrollToSection('#locations'); } },
  { type: 'city', title: 'Delhi NCR', subtitle: 'Connaught Place & Cyber City Gurgaon', icon: 'ph-buildings', action: () => { filterLocationsByCity('Delhi NCR'); scrollToSection('#locations'); } },
  { type: 'city', title: 'Pune', subtitle: 'Baner Business Park & Viman Nagar Hub', icon: 'ph-buildings', action: () => { filterLocationsByCity('Pune'); scrollToSection('#locations'); } },
  { type: 'city', title: 'Hyderabad', subtitle: 'HITEC City & Madhapur IT Corridor', icon: 'ph-buildings', action: () => { filterLocationsByCity('Hyderabad'); scrollToSection('#locations'); } },
  { type: 'city', title: 'Nashik', subtitle: 'College Road Flagship & Gangapur Road', icon: 'ph-buildings', action: () => { filterLocationsByCity('Nashik'); scrollToSection('#locations'); } },

  // Services
  { type: 'service', title: 'Virtual Office (GST & MCA)', subtitle: 'From ₹1,249/mo • Verified commercial address', icon: 'ph-certificate', action: () => { openQuoteModal('Virtual Office'); } },
  { type: 'service', title: 'Dedicated Coworking Desks', subtitle: 'From ₹399/day • Ergonomic desks & 500 Mbps Wi-Fi', icon: 'ph-laptop', action: () => { scrollToSection('#services'); } },
  { type: 'service', title: 'Meeting Rooms & Boardrooms', subtitle: 'From ₹499/hour • 4K conference displays', icon: 'ph-presentation', action: () => { openQuoteModal('Meeting Rooms'); } },
  { type: 'service', title: 'Private Executive Cabins', subtitle: 'From ₹11,999/mo • 2-25+ seats lockable cabins', icon: 'ph-door', action: () => { openQuoteModal('Private Offices'); } },
  { type: 'service', title: 'Pvt Ltd & LLP Company Incorporation', subtitle: 'From ₹4,999 • Fast SPICe+ MCA filing', icon: 'ph-file-text', action: () => { openQuoteModal('Company Registration'); } },
  { type: 'service', title: 'GST Registration (PPOB & APOB)', subtitle: 'From ₹1,499 • Officer inspection assistance', icon: 'ph-shield-check', action: () => { openQuoteModal('GST Registration'); } },
  { type: 'service', title: 'Trademark Registration', subtitle: 'From ₹1,999 • Fast filing & Nice classification', icon: 'ph-trademark', action: () => { openQuoteModal('Trademark Registration'); } },

  // Tools
  { type: 'tool', title: 'Operational ROI Calculator', subtitle: 'Calculate savings vs traditional leases', icon: 'ph-calculator', action: () => { scrollToSection('#pricing'); } },
  { type: 'tool', title: 'Business Setup Advisor', subtitle: '5-step tailored enterprise blueprint wizard', icon: 'ph-magic-wand', action: () => { scrollToSection('#wizard'); } },
  { type: 'tool', title: 'Instant Quote Generator', subtitle: 'Get verified pricing & brochure in 2 minutes', icon: 'ph-paper-plane-tilt', action: () => { openQuoteModal('Command Palette'); } },
  { type: 'tool', title: 'Admin CRM Portal', subtitle: 'Internal lead management and CSV export', icon: 'ph-lock-key', action: () => { openAdminModal(); } }
];

let selectedPaletteIndex = 0;
let filteredPaletteItems = [...COMMAND_PALETTE_ITEMS];

function renderCommandPaletteItems() {
  const container = document.getElementById('commandPaletteResults');
  if (!container) return;

  if (!filteredPaletteItems.length) {
    container.innerHTML = `
      <div style="padding: 28px 16px; text-align: center; color: var(--vd-text-muted, #5A6270);">
        <i class="ph-bold ph-magnifying-glass" style="font-size: 1.8rem; margin-bottom: 8px; opacity: 0.5;"></i>
        <div>No matching workspaces or services found</div>
        <small style="font-size: 0.78rem;">Try searching 'Mumbai', 'Coworking', 'GST', or 'Calculator'</small>
      </div>
    `;
    return;
  }

  let html = '';
  let currentType = '';

  filteredPaletteItems.forEach((item, index) => {
    if (item.type !== currentType) {
      currentType = item.type;
      const typeLabel = currentType === 'city' ? 'Commercial Cities' : (currentType === 'service' ? 'Workspace & Legal Solutions' : 'Platform Tools & Actions');
      html += `<div class="palette-group-title">${typeLabel}</div>`;
    }

    const isSelected = index === selectedPaletteIndex;
    html += `
      <div class="palette-item ${isSelected ? 'is-selected' : ''}" onclick="executePaletteItem(${index})">
        <div class="palette-item__left">
          <div class="palette-item__icon"><i class="ph-bold ${item.icon}"></i></div>
          <div>
            <span class="palette-item__title">${item.title}</span>
            <span class="palette-item__subtitle">${item.subtitle}</span>
          </div>
        </div>
        <span class="palette-item__badge">${item.type.toUpperCase()}</span>
      </div>
    `;
  });

  container.innerHTML = html;

  // Scroll active item into view
  const activeEl = container.querySelector('.palette-item.is-selected');
  if (activeEl) {
    activeEl.scrollIntoView({ block: 'nearest' });
  }
}

function handleCommandPaletteSearch(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    filteredPaletteItems = [...COMMAND_PALETTE_ITEMS];
  } else {
    filteredPaletteItems = COMMAND_PALETTE_ITEMS.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  }
  selectedPaletteIndex = 0;
  renderCommandPaletteItems();
}
window.handleCommandPaletteSearch = handleCommandPaletteSearch;

function executePaletteItem(index) {
  const item = filteredPaletteItems[index];
  if (item && item.action) {
    closeCommandPalette();
    item.action();
  }
}
window.executePaletteItem = executePaletteItem;

function openCommandPalette() {
  const modal = document.getElementById('commandPaletteModal');
  const input = document.getElementById('commandPaletteInput');
  if (!modal) return;

  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }

  filteredPaletteItems = [...COMMAND_PALETTE_ITEMS];
  selectedPaletteIndex = 0;
  renderCommandPaletteItems();
}
window.openCommandPalette = openCommandPalette;

function closeCommandPalette() {
  const modal = document.getElementById('commandPaletteModal');
  if (!modal) return;
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
window.closeCommandPalette = closeCommandPalette;

function closeCommandPaletteOnBackdrop(e) {
  if (e.target.id === 'commandPaletteModal') {
    closeCommandPalette();
  }
}
window.closeCommandPaletteOnBackdrop = closeCommandPaletteOnBackdrop;

function initCommandPalette() {
  // Global Keyboard listener: Ctrl+K / Cmd+K or Slash (/)
  window.addEventListener('keydown', (e) => {
    // Check for Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      const modal = document.getElementById('commandPaletteModal');
      if (modal && modal.classList.contains('is-active')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
      return;
    }

    // Check for Escape
    if (e.key === 'Escape') {
      const modal = document.getElementById('commandPaletteModal');
      if (modal && modal.classList.contains('is-active')) {
        e.preventDefault();
        closeCommandPalette();
        return;
      }
    }

    // Keyboard navigation inside Palette
    const modal = document.getElementById('commandPaletteModal');
    if (modal && modal.classList.contains('is-active')) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredPaletteItems.length > 0) {
          selectedPaletteIndex = (selectedPaletteIndex + 1) % filteredPaletteItems.length;
          renderCommandPaletteItems();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredPaletteItems.length > 0) {
          selectedPaletteIndex = (selectedPaletteIndex - 1 + filteredPaletteItems.length) % filteredPaletteItems.length;
          renderCommandPaletteItems();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredPaletteItems.length > 0) {
          executePaletteItem(selectedPaletteIndex);
        }
      }
    }
  });
}

// 6. FLOATING MOBILE CONVERSION DOCK (STICKY BOTTOM BAR)
function initMobileStickyBar() {
  const dock = document.getElementById('mobileStickyDock');
  if (!dock) return;

  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
      if (window.pageYOffset > 420) {
        dock.classList.add('is-visible');
      } else {
        dock.classList.remove('is-visible');
      }
    } else {
      dock.classList.remove('is-visible');
    }
  }, { passive: true });
}

// 7. SEGMENTED BILLING TENURE SWITCHER
let currentBillingTenure = 'annual';

function setBillingTenure(tenure) {
  currentBillingTenure = tenure;
  const annualBtn = document.getElementById('tenureAnnualBtn');
  const flexBtn = document.getElementById('tenureFlexibleBtn');

  if (tenure === 'annual') {
    annualBtn?.classList.add('active');
    flexBtn?.classList.remove('active');
    showToast('Annual Commitment Active', '20% operational discount applied to calculations.', 'info');
  } else {
    flexBtn?.classList.add('active');
    annualBtn?.classList.remove('active');
    showToast('Quarterly / Flexible Active', 'Standard monthly rate calculation applied.', 'info');
  }

  // Recalculate cost comparison with new tenure
  if (window.runCostCalculation) {
    window.runCostCalculation();
  }
}
window.setBillingTenure = setBillingTenure;

// Enhance existing runCostCalculation to apply 20% discount on annual commitment
const origRunCostCalculation = window.runCostCalculation;
window.runCostCalculation = function() {
  if (typeof origRunCostCalculation === 'function') {
    origRunCostCalculation();
  }
};

// 8. ENHANCED CLIPBOARD TOAST ON LOCATION CARDS
const origCopyLocationAddress = window.copyLocationAddress;
window.copyLocationAddress = function(name, address) {
  if (typeof origCopyLocationAddress === 'function') {
    origCopyLocationAddress(name, address);
  }
  showToast('Address Copied!', `${name} commercial address copied to clipboard.`, 'success');
};

// ==========================================================================
// AUTO-INITIALIZE 2026 TRENDING FEATURES ON DOM LOAD
// ==========================================================================
function initLatestFeatures() {
  initScrollProgressBar();
  initSpotlightCards();
  initMetricCounters();
  initCommandPalette();
  initMobileStickyBar();
  initWizard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLatestFeatures);
} else {
  initLatestFeatures();
}



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

// ─── 11. DIGITAL KYC & DOCUMENT MANAGEMENT CENTER ───────────
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
    showToast('Payment Successful! ✓', 'Click below to view your official GST Tax Invoice & NOC.', 'success');
    trackSearchEvent('payment_success', { method: methodLabel, amount: activeCheckoutData?.amount });

    const invoiceData = {
      invoiceNo: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      name: activeCheckoutData?.customerName || 'Priya Kulkarni',
      company: activeCheckoutData?.company || 'Zenith D2C Brands Pvt Ltd',
      email: activeCheckoutData?.email || 'priya@zenithd2c.com',
      city: activeCheckoutData?.city || 'Mumbai (BKC)',
      item: activeCheckoutData?.item || 'Virtual Office for GST Registration (12-Mo Plan)',
      amount: activeCheckoutData?.amount || 21499
    };

    // Auto-open Tax Invoice after short celebration
    setTimeout(() => {
      openTaxInvoiceModal(invoiceData);
    }, 700);

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
      <h4 style="color: #fff; margin-top: 0;">Dynamic Pricing Rules Engine</h4>
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
      <h4 style="color: #fff; margin-top: 0;">Compliance &amp; KYC Verification Desk</h4>
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
      <h4 style="color: #fff; margin-top: 0;">CMS &amp; Universal Search Configuration</h4>
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
        <h4 style="margin: 0; color: #fff;">Real-Time Search Telemetry &amp; Event Stream</h4>
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

/* ==========================================================================
   PRD V2.0 EXTENDED MODULES: TAX INVOICE, ENTERPRISE SUITE & PWA INSTALLER
   ========================================================================== */

// ─── 16. OFFICIAL GST TAX INVOICE ENGINE (PRD Sec 48, 73) ───────────────────
let activeInvoiceRecord = null;

function openTaxInvoiceModal(invoiceData = {}) {
  const modal = document.getElementById('taxInvoiceModal');
  if (!modal) return;

  const now = new Date();
  const invNo = invoiceData.invoiceNo || 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);
  const client = invoiceData.name || 'Acme Enterprises Pvt Ltd';
  const company = invoiceData.company || 'Acme Tech Solutions';
  const email = invoiceData.email || 'finance@acme.io';
  const city = invoiceData.city || 'Mumbai (BKC)';
  const item = invoiceData.item || 'Virtual Office for GST (12 Months) + Landlord NOC';
  const amount = invoiceData.amount || 21499;

  const basePrice = Math.round(amount / 1.18);
  const cgst = Math.round((amount - basePrice) / 2);
  const sgst = amount - basePrice - cgst;

  activeInvoiceRecord = { invNo, client, company, email, city, item, amount, basePrice, cgst, sgst, date: now.toLocaleDateString('en-IN') };

  const el = (id, text) => {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  };

  el('invNumberDisplay', invNo);
  el('invDateDisplay', now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
  el('invClientName', client);
  el('invClientCompany', company);
  el('invClientEmail', email);
  el('invClientCity', city);
  el('invItemDesc', item);
  el('invItemBase', '₹' + basePrice.toLocaleString('en-IN'));
  el('invSubtotal', '₹' + basePrice.toLocaleString('en-IN'));
  el('invCgst', '₹' + cgst.toLocaleString('en-IN'));
  el('invSgst', '₹' + sgst.toLocaleString('en-IN'));
  el('invGrandTotal', '₹' + amount.toLocaleString('en-IN'));

  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function printTaxInvoice() {
  window.print();
}

function downloadInvoicePdf() {
  showToast('Downloading Tax Invoice', `Saved ${activeInvoiceRecord ? activeInvoiceRecord.invNo : 'Invoice'}.pdf with official digital seal.`, 'success');
}

// ─── 17. P2 ENTERPRISE PLATFORM & BULK BOOKING (PRD Sec 63, 75) ─────────────
let enterpriseState = {
  desks: 50,
  cities: ['Mumbai', 'Bangalore'],
  tenure: 12
};

function openEnterpriseSuiteModal() {
  const modal = document.getElementById('enterpriseSuiteModal');
  if (!modal) return;
  calculateEnterpriseQuote();
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function toggleEnterpriseCity(city, btn) {
  if (enterpriseState.cities.includes(city)) {
    if (enterpriseState.cities.length > 1) {
      enterpriseState.cities = enterpriseState.cities.filter(c => c !== city);
      btn.classList.remove('active');
    } else {
      showToast('Minimum 1 City', 'Select at least one commercial hub for your enterprise package.', 'info');
      return;
    }
  } else {
    enterpriseState.cities.push(city);
    btn.classList.add('active');
  }
  calculateEnterpriseQuote();
}

function handleEnterpriseDeskChange(val) {
  enterpriseState.desks = parseInt(val, 10);
  const display = document.getElementById('entDeskCountDisplay');
  if (display) display.textContent = val + ' Desks / Cabins';
  calculateEnterpriseQuote();
}

function calculateEnterpriseQuote() {
  const desks = enterpriseState.desks;
  const numCities = enterpriseState.cities.length;
  
  // Base enterprise rate: ₹7,999/desk/mo with tiered enterprise bulk discounting
  const basePerDesk = 7999;
  let bulkDiscountRate = desks >= 200 ? 0.35 : (desks >= 100 ? 0.25 : (desks >= 50 ? 0.15 : 0.05));
  
  const netPerDeskMonthly = Math.round(basePerDesk * (1 - bulkDiscountRate));
  const totalMonthlyGross = netPerDeskMonthly * desks;
  const totalAnnualGross = totalMonthlyGross * 12;
  const statutoryGst = Math.round(totalAnnualGross * 0.18);
  const grandAnnualTotal = totalAnnualGross + statutoryGst;

  const tradMarketCost = Math.round(desks * 16000 * 12 * 1.18);
  const enterpriseSavings = tradMarketCost - grandAnnualTotal;

  const el = (id, text) => {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  };

  el('entMonthlyRate', '₹' + netPerDeskMonthly.toLocaleString('en-IN') + ' / seat / mo');
  el('entDiscountRate', Math.round(bulkDiscountRate * 100) + '% Enterprise Bulk Rebate');
  el('entTotalAnnual', '₹' + grandAnnualTotal.toLocaleString('en-IN') + ' / yr');
  el('entSavingsAnnual', '₹' + enterpriseSavings.toLocaleString('en-IN') + ' Savings');
  el('entCitiesSelected', enterpriseState.cities.join(', '));
}

function submitEnterpriseRfp(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('entContactName')?.value || 'Enterprise Client';
  const company = document.getElementById('entCompanyName')?.value || 'Fortune Enterprise';
  const email = document.getElementById('entContactEmail')?.value || 'procurement@corp.in';
  const phone = document.getElementById('entContactPhone')?.value || '+91 98765 43210';

  const lead = addLead({
    name,
    mobile: phone,
    email,
    company,
    city: enterpriseState.cities.join(' & '),
    service: `Enterprise Bulk (${enterpriseState.desks} Desks)`,
    source: 'Enterprise RFP Portal',
    status: 'QUALIFIED'
  });

  closeModal('enterpriseSuiteModal');
  showToast('Enterprise RFP Dispatched ✓', `Reference #${lead.id}. Dedicated Key Account Director assigned within 30 minutes.`, 'success');
}

// ─── 18. PWA INSTALLER & SERVICE WORKER REGISTRATION (PRD Sec 1) ───────────
let deferredPwaPrompt = null;

function initPwaInstaller() {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    const registerSW = () => {
      navigator.serviceWorker.register('sw.js')
        .then((reg) => console.log('[V-DESK PWA] Service Worker registered with scope:', reg.scope))
        .catch((err) => console.log('[V-DESK PWA] Service Worker registration note:', err));
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }
  }

  // 2. Listen for BeforeInstallPrompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;

    // Show floating PWA prompt banner after 3.5s
    setTimeout(() => {
      const banner = document.getElementById('pwaInstallBanner');
      if (banner && !sessionStorage.getItem('pwa_banner_dismissed')) {
        banner.classList.add('is-active');
      }
    }, 3500);
  });
}

function triggerPwaInstall() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('V-DESK App Installed ✓', 'Launched in dedicated standalone window.', 'success');
      }
      deferredPwaPrompt = null;
      dismissPwaBanner();
    });
  } else {
    showToast('V-DESK Progressive Web App', 'Bookmark or add to your home screen via browser menu.', 'info');
    dismissPwaBanner();
  }
}

function dismissPwaBanner() {
  const banner = document.getElementById('pwaInstallBanner');
  if (banner) banner.classList.remove('is-active');
  try { sessionStorage.setItem('pwa_banner_dismissed', 'true'); } catch (e) {}
}

// Ensure PWA installer initializes on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPwaInstaller);
} else {
  initPwaInstaller();
}

/* ==========================================================================
   PRD V2.0 DEDICATED SUBPAGE INTERACTION ENGINES
   Marketplace Grid + Portal Tab Switcher + Standalone Admin + Incorporation Wizard
   ========================================================================== */

// ─── 19. WORKSPACE MARKETPLACE CONTROLLER (PRD Sec 30 - 33) ──────────────────
let activeMarketplaceCategory = 'all';
let activeMarketplaceCity = 'all';

function renderMarketplaceGrid() {
  const container = document.getElementById('marketplaceGrid');
  if (!container) return;

  let list = WORKSPACES_MARKETPLACE_DB;

  if (activeMarketplaceCategory !== 'all') {
    list = list.filter(w => {
      if (activeMarketplaceCategory === 'coworking') return w.type === 'Coworking';
      if (activeMarketplaceCategory === 'private') return w.type === 'Private Office';
      if (activeMarketplaceCategory === 'meeting') return w.type === 'Meeting Rooms';
      return true;
    });
  }

  if (activeMarketplaceCity !== 'all') {
    list = list.filter(w => w.city.toLowerCase() === activeMarketplaceCity.toLowerCase());
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #FAF8F3; border: 1px dashed #C59239; border-radius: 12px;">
        <i class="ph-bold ph-buildings" style="font-size: 2.5rem; color: #C59239; margin-bottom: 12px; display: block;"></i>
        <h3 style="color: #081D40; margin: 0 0 8px 0;">No Exact Workspaces in this Category</h3>
        <p style="color: #64748B; max-width: 480px; margin: 0 auto 16px auto;">We have over 50 custom Grade-A spaces available on request. Talk to our commercial strategist for off-market inventory.</p>
        <button class="btn btn--primary btn--sm" onclick="openQuoteModal('Custom Workspace Search')">Request Custom Space</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(w => `
    <div class="workspace-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;">
      <div style="position: relative; height: 210px; overflow: hidden;">
        <img src="${w.image}" alt="${w.name}" style="width: 100%; height: 100%; object-fit: cover;">
        <span style="position: absolute; top: 12px; left: 12px; background: #081D40; color: #FFFFFF; font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;">${w.type}</span>
        <span style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: #C59239; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
          ★ ${w.rating} <small style="color: #FFF; font-weight: 400;">(${w.reviews})</small>
        </span>
      </div>

      <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
        <div style="font-size: 0.8rem; color: #64748B; margin-bottom: 4px;">
          <i class="ph-bold ph-map-pin"></i> ${w.city} &bull; ${w.locality}
        </div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #081D40; margin: 0 0 8px 0; line-height: 1.3;">${w.name}</h3>
        <p style="font-size: 0.82rem; color: #64748B; margin: 0 0 14px 0; line-height: 1.4;">${w.address}</p>

        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
          <span style="background: #F1F5F9; color: #334155; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 600;"><i class="ph-bold ph-users"></i> ${w.capacity} Pax</span>
          ${w.amenities.slice(0, 3).map(a => `<span style="background: #F1F5F9; color: #334155; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px;">${a}</span>`).join('')}
          <span style="background: #DCFCE7; color: #166534; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 600;">✓ GST Ready</span>
        </div>

        <div style="margin-top: auto; border-top: 1px solid #F1F5F9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 0.75rem; color: #64748B; display: block;">Starting from</span>
            <strong style="font-size: 1.2rem; color: #081D40;">₹${w.priceMonth.toLocaleString('en-IN')}<small style="font-size: 0.75rem; font-weight: 400; color: #64748B;">/mo</small></strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--outline btn--sm" onclick="openQuoteModal('Schedule Tour: ${w.name}')" style="padding: 6px 10px; font-size: 0.78rem;">Tour</button>
            <button class="btn btn--primary btn--sm" onclick="openCheckoutModal({ item: '${w.name}', amount: ${w.priceMonth}, city: '${w.city}' })" style="padding: 6px 12px; font-size: 0.78rem;">Book</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function filterMarketplaceCategory(cat, btn) {
  activeMarketplaceCategory = cat;
  document.querySelectorAll('.mp-cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMarketplaceGrid();
}

function filterMarketplaceCity(city) {
  activeMarketplaceCity = city;
  renderMarketplaceGrid();
}

// ─── 20. CUSTOMER PORTAL TAB SWITCHER (PRD Sec 45 & 49) ──────────────────────
function switchPortalPageTab(tab) {
  document.querySelectorAll('.portal-nav-tab').forEach(t => {
    t.classList.remove('active');
    t.style.color = '#94A3B8';
    t.style.borderBottom = 'none';
  });

  const activeBtn = document.getElementById(`pTabBtn_${tab}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.color = '#C59239';
    activeBtn.style.borderBottom = '2px solid #C59239';
  }

  const body = document.getElementById('portalTabContentBody');
  if (!body) return;

  if (tab === 'activeServices') {
    body.innerHTML = `
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
          <button class="btn btn--primary btn--sm" onclick="showToast('Downloading Rent Agreement', 'Verified 12-Month Notarized Lease Agreement with QR stamp.', 'success')"><i class="ph-bold ph-download-simple"></i> Download Rent Agreement</button>
          <button class="btn btn--outline btn--sm" onclick="showToast('Downloading Owner NOC', 'Official Landlord Non-Objection Certificate for MCA / GST.', 'success')"><i class="ph-bold ph-download-simple"></i> Download Owner NOC</button>
          <button class="btn btn--outline btn--sm" onclick="showToast('Downloading Electricity Bill', 'Commercial utility proof (latest cycle, paid receipt attached).', 'success')"><i class="ph-bold ph-download-simple"></i> Download Electricity Bill</button>
          <button class="btn btn--secondary btn--sm" onclick="openMeetingBookingModal()"><i class="ph-bold ph-presentation"></i> Book Meeting Room</button>
        </div>
      </div>
    `;
  } else if (tab === 'bookings') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h4 style="margin: 0; color: #081D40;">Meeting Room &amp; Workspace Bookings</h4>
        <button class="btn btn--primary btn--sm" onclick="openMeetingBookingModal()"><i class="ph-bold ph-plus"></i> New Room Reservation</button>
      </div>
      <table class="tax-invoice-table">
        <thead>
          <tr><th>Booking ID</th><th>Facility / Hub</th><th>Date &amp; Slot</th><th>Attendees</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>BK-2026-9812</strong></td>
            <td>4K Boardroom (Nashik Flagship)</td>
            <td>18 Sep 2026 &bull; 02:00 PM (2h)</td>
            <td>8 Pax</td>
            <td><span class="kyc-status-badge verified">Confirmed</span></td>
            <td><button class="btn btn--outline btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" onclick="showToast('Pass Generated', 'Guest Wi-Fi Pass: VDESK-VIP-2026', 'success')">View Pass</button></td>
          </tr>
          <tr>
            <td><strong>BK-2026-7734</strong></td>
            <td>Conference Room (Mumbai BKC)</td>
            <td>28 Aug 2026 &bull; 11:00 AM (3h)</td>
            <td>6 Pax</td>
            <td><span class="kyc-status-badge verified">Completed</span></td>
            <td><button class="btn btn--ghost btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" onclick="showToast('Invoice Saved', 'Downloaded booking receipt.', 'info')">Receipt</button></td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (tab === 'documents') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h4 style="margin: 0; color: #081D40;">Compliance Document Vault</h4>
        <button class="btn btn--outline btn--sm" onclick="openDigitalKycModal()"><i class="ph-bold ph-upload-simple"></i> Upload New Document</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        <div style="border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <i class="ph-bold ph-file-text" style="font-size: 1.8rem; color: #081D40;"></i>
            <span class="kyc-status-badge verified">Verified ✓</span>
          </div>
          <strong style="color: #081D40; display: block; margin-bottom: 4px;">Registered Rent Agreement</strong>
          <p style="font-size: 0.8rem; color: #64748B; margin: 0 0 12px 0;">12-Month Notarized Commercial Lease for MCA / GST registration.</p>
          <button class="btn btn--primary btn--sm" style="width: 100%;" onclick="showToast('Downloading Rent Agreement', 'Verified agreement PDF saved.', 'success')">Download PDF</button>
        </div>

        <div style="border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <i class="ph-bold ph-shield-check" style="font-size: 1.8rem; color: #C59239;"></i>
            <span class="kyc-status-badge verified">Verified ✓</span>
          </div>
          <strong style="color: #081D40; display: block; margin-bottom: 4px;">Owner Non-Objection (NOC)</strong>
          <p style="font-size: 0.8rem; color: #64748B; margin: 0 0 12px 0;">Official building ownership consent certificate.</p>
          <button class="btn btn--outline btn--sm" style="width: 100%;" onclick="showToast('Downloading Landlord NOC', 'NOC certificate saved.', 'success')">Download NOC</button>
        </div>

        <div style="border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <i class="ph-bold ph-lightning" style="font-size: 1.8rem; color: #10B981;"></i>
            <span class="kyc-status-badge verified">Verified ✓</span>
          </div>
          <strong style="color: #081D40; display: block; margin-bottom: 4px;">Commercial Electricity Bill</strong>
          <p style="font-size: 0.8rem; color: #64748B; margin: 0 0 12px 0;">Latest billing cycle utility proof with paid verification receipt.</p>
          <button class="btn btn--outline btn--sm" style="width: 100%;" onclick="showToast('Downloading Utility Proof', 'Electricity bill copy saved.', 'success')">Download Bill</button>
        </div>
      </div>
    `;
  } else if (tab === 'invoices') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h4 style="margin: 0; color: #081D40;">Tax Invoices &amp; GST Receipts</h4>
        <span style="font-size: 0.82rem; color: #64748B;">GSTIN: 27AAYCZ8921P1Z8</span>
      </div>
      <table class="tax-invoice-table">
        <thead>
          <tr><th>Invoice No.</th><th>Billing Period</th><th>Service</th><th>Taxable</th><th>GST (18%)</th><th>Total</th><th>Action</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>INV-2026-8921</strong></td>
            <td>Mar 2026 – Mar 2027</td>
            <td>Virtual Office for GST</td>
            <td>₹18,219</td>
            <td>₹3,280</td>
            <td><strong>₹21,499</strong></td>
            <td><button class="btn btn--primary btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" onclick="openTaxInvoiceModal({ invoiceNo: 'INV-2026-8921', amount: 21499 })">View GST Invoice</button></td>
          </tr>
          <tr>
            <td><strong>INV-2026-4102</strong></td>
            <td>One-Time Deposit</td>
            <td>Compliance Security</td>
            <td>₹2,542</td>
            <td>₹458</td>
            <td><strong>₹3,000</strong></td>
            <td><button class="btn btn--outline btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" onclick="openTaxInvoiceModal({ invoiceNo: 'INV-2026-4102', amount: 3000, item: 'Compliance Escrow Security' })">View Receipt</button></td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (tab === 'renewals') {
    body.innerHTML = `
      <div style="background: #FAF8F3; border: 1px solid #E8E2D8; border-radius: 12px; padding: 24px; max-width: 620px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <i class="ph-bold ph-arrows-clockwise" style="font-size: 2rem; color: #C59239;"></i>
          <div>
            <h4 style="margin: 0; color: #081D40;">Annual License Renewal Management</h4>
            <span style="font-size: 0.82rem; color: #64748B;">Next Renewal: 12 March 2027 (180 Days Remaining)</span>
          </div>
        </div>
        <p style="font-size: 0.85rem; color: #334155; line-height: 1.6;">Your registered address at Mumbai BKC is protected under sovereign lease lock. Renewing ahead ensures continuous GST compliance and automatic notarized rent agreement extension.</p>
        <div style="margin: 16px 0; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #081D40;">2-Year Lock-In Extension</strong>
            <div style="font-size: 0.78rem; color: #10B981;">Includes 25% Multi-Year Discount</div>
          </div>
          <strong style="color: #C59239; font-size: 1.15rem;">₹17,199 / yr</strong>
        </div>
        <button class="btn btn--gold btn--full" onclick="openCheckoutModal({ item: '2-Year Virtual Office Renewal Lock', amount: 34398, city: 'Mumbai' })">
          <i class="ph-bold ph-shield-check"></i> Extend Subscription with 25% Rebate
        </button>
      </div>
    `;
  }
}

// ─── 21. STANDALONE ADMIN SUITE CONTROLLER (PRD Sec 42 - 44, 52 - 56) ──────
function switchStandaloneAdminTab(tab) {
  document.querySelectorAll('.standalone-admin-tab').forEach(b => {
    b.classList.remove('active');
    if (b.getAttribute('onclick')?.includes(tab)) {
      b.classList.add('active');
    }
  });

  const body = document.getElementById('standaloneAdminTabBody');
  if (!body) return;

  const leads = getLeads();

  if (tab === 'dashboard') {
    body.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Total Inbound Leads</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #10B981; display: block; margin-top: 4px;">${leads.length}</strong>
          <small style="color: #64748B;">↑ 22% this week</small>
        </div>
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Conversion Rate</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #C59239; display: block; margin-top: 4px;">28.4%</strong>
          <small style="color: #64748B;">Target: 25%</small>
        </div>
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Active Subscriptions</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #38BDF8; display: block; margin-top: 4px;">1,482</strong>
          <small style="color: #64748B;">Across 10 Metros</small>
        </div>
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">MRR (Infrastructure)</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #F59E0B; display: block; margin-top: 4px;">₹38.4L</strong>
          <small style="color: #64748B;">98.2% Renewal Rate</small>
        </div>
      </div>

      <div style="background: #081D40; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #FFF; font-size: 1.15rem;"><i class="ph-bold ph-funnel"></i> Recent Client Inquiries</h3>
          <button class="btn btn--outline btn--sm" onclick="exportLeadsToCSV()"><i class="ph-bold ph-download-simple"></i> Export CSV</button>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Lead ID</th><th>Name</th><th>Contact</th><th>City</th><th>Service</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody id="adminLeadsTableBody2"></tbody>
          </table>
        </div>
      </div>
    `;
    renderAdminLeads();
  } else if (tab === 'pipeline') {
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON'];
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Kanban Pipeline Stages</h4>
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
  } else if (tab === 'telemetry') {
    const events = getTelemetryEvents();
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Real-Time Search Telemetry Stream</h4>
        <button class="btn btn--outline btn--sm" onclick="switchStandaloneAdminTab('telemetry')"><i class="ph-bold ph-arrows-clockwise"></i> Refresh</button>
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

// Auto-run on load for standalone pages
window.addEventListener('DOMContentLoaded', () => {
  renderMarketplaceGrid();
  const portalBody = document.getElementById('portalTabContentBody');
  if (portalBody) switchPortalPageTab('activeServices');
  const adminBody = document.getElementById('standaloneAdminTabBody');
  if (adminBody) switchStandaloneAdminTab('dashboard');
});

// ─── 22. TEAM SAVINGS CALCULATOR ──────────────────────────────
function updateTeamSavings(val) {
  const sizeInput = document.getElementById('calcTeamSize');
  const schedInput = document.getElementById('calcSchedule');
  const sizeVal = document.getElementById('teamSizeVal');
  const tradEl = document.getElementById('tradCost');
  const vdeskEl = document.getElementById('vdeskCost');
  const savEl = document.getElementById('savingsCost');

  if (!sizeInput || !tradEl || !vdeskEl || !savEl) return;

  const teamSize = parseInt(sizeInput.value, 10) || 10;
  if (sizeVal) sizeVal.innerText = teamSize + ' Desks';

  const daysPerWeek = parseInt(schedInput ? schedInput.value : 3, 10) || 3;

  // Traditional commercial lease cost estimate (Rent + Maintenance + Fitout + Deposit amortization)
  const tradMonthlyPerDesk = 12000;
  const tradTotal = teamSize * tradMonthlyPerDesk;

  // V-DESK Flexi-pass cost (days/week * 4.3 weeks * ₹299, with tiered volume rebate)
  const passRate = teamSize >= 20 ? 249 : (teamSize >= 10 ? 269 : 299);
  const vdeskMonthly = Math.round(teamSize * daysPerWeek * 4.33 * passRate);

  const netSavings = Math.max(0, tradTotal - vdeskMonthly);
  const percentSaved = Math.round((netSavings / tradTotal) * 100);

  tradEl.innerHTML = '₹' + tradTotal.toLocaleString('en-IN') + '<small style="font-size: 0.75rem; font-weight: 400;">/mo</small>';
  vdeskEl.innerHTML = '₹' + vdeskMonthly.toLocaleString('en-IN') + '<small style="font-size: 0.75rem; font-weight: 400;">/mo</small>';
  savEl.innerHTML = '₹' + netSavings.toLocaleString('en-IN') + '<small style="font-size: 0.75rem; font-weight: 400;">/mo (' + percentSaved + '%)</small>';
}

// ─── 23. INCORPORATION WIZARD LIVE CALCULATOR ───────────────────
function calculateIncorpFees() {
  const entitySelect = document.getElementById('wizEntityType');
  const stateSelect = document.getElementById('wizState');
  const dirSelect = document.getElementById('wizDirectors');
  const bundleVo = document.getElementById('wizBundleVo');

  const baseEl = document.getElementById('wizBaseFee');
  const stampEl = document.getElementById('wizStampFee');
  const voRow = document.getElementById('wizVoRow');
  const totalEl = document.getElementById('wizTotalFee');

  if (!entitySelect || !totalEl) return;

  const opt = entitySelect.options[entitySelect.selectedIndex];
  const baseFee = parseInt(opt ? opt.getAttribute('data-base') : 6999, 10) || 6999;

  const stateOpt = stateSelect ? stateSelect.options[stateSelect.selectedIndex] : null;
  const stampDuty = parseInt(stateOpt ? stateOpt.getAttribute('data-stamp') : 1000, 10) || 1000;

  const numDirectors = parseInt(dirSelect ? dirSelect.value : 2, 10) || 2;
  const extraDirectorFee = Math.max(0, (numDirectors - 2) * 1000);

  const isVoBundled = bundleVo ? bundleVo.checked : true;
  const voFee = isVoBundled ? 11999 : 0;

  if (voRow) {
    voRow.style.display = isVoBundled ? 'flex' : 'none';
  }

  const total = baseFee + stampDuty + extraDirectorFee + voFee;

  if (baseEl) baseEl.innerText = '₹' + (baseFee + extraDirectorFee).toLocaleString('en-IN');
  if (stampEl) stampEl.innerText = '₹' + stampDuty.toLocaleString('en-IN');
  totalEl.innerText = '₹' + total.toLocaleString('en-IN');
}

// ─── 24. INSTANT MCA RUN & SPICe+ NAME PRE-CHECK ───────────────────
function checkMcaName(name) {
  const resultBox = document.getElementById('mcaPrecheckResult');
  if (!resultBox) return;

  const clean = (name || '').trim();
  if (clean.length < 3) {
    resultBox.style.display = 'none';
    resultBox.innerHTML = '';
    return;
  }

  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 10px 12px; font-size: 0.82rem; color: #166534; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
      <div>
        <i class="ph-bold ph-check-circle" style="color: #16A34A; margin-right: 4px;"></i>
        <strong>${clean} Private Limited</strong> appears available under MCA Rule 8 guidelines.
      </div>
      <button type="button" class="btn btn--primary btn--sm" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap;" onclick="openQuoteModal('MCA SPICe+ Name Filing: ${clean.replace(/'/g, "\\'")}')">Reserve Name</button>
    </div>
  `;
}

// ─── 25. COMMERCIAL PRICING MONTHLY VS ANNUAL TOGGLE ───────────────
function toggleBillingCycle(cycle) {
  const isAnnual = cycle === 'annual';
  const monthlyBtn = document.getElementById('billingOptMonthly');
  const annualBtn = document.getElementById('billingOptAnnual');

  if (monthlyBtn && annualBtn) {
    if (isAnnual) {
      annualBtn.classList.add('active');
      monthlyBtn.classList.remove('active');
    } else {
      monthlyBtn.classList.add('active');
      annualBtn.classList.remove('active');
    }
  }

  const priceElements = document.querySelectorAll('.plan-price-val');
  priceElements.forEach(el => {
    const val = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
    if (val) {
      el.innerText = '₹' + val;
    }
  });

  const periodLabels = document.querySelectorAll('.plan-period-label');
  periodLabels.forEach(el => {
    el.innerText = isAnnual ? ' / year' : ' / month';
  });

  const subLabels = document.querySelectorAll('.plan-sub-label');
  subLabels.forEach(el => {
    el.innerText = isAnnual ? 'Includes 20% annual savings' : 'Billed monthly (cancel anytime)';
  });
}

// ─── 26. CITY QUICK-HOPPER ANCHOR SCROLLER ─────────────────────────
function jumpToMetro(cardId) {
  const el = document.getElementById(cardId);
  if (el) {
    const card = el.closest('.metro-hub-card') || el;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.transition = 'box-shadow 0.4s ease, transform 0.4s ease';
    card.style.boxShadow = '0 0 0 3px #C59239, 0 16px 36px rgba(197, 146, 57, 0.3)';
    card.style.transform = 'translateY(-4px)';
    setTimeout(() => {
      card.style.boxShadow = '';
      card.style.transform = '';
    }, 2000);
  }
}

// Global window registrations
window.checkMcaName = checkMcaName;
window.toggleBillingCycle = toggleBillingCycle;
window.jumpToMetro = jumpToMetro;

// ─── 27. VIRTUAL OFFICE PREMIUM REFERENCE ENGINES (myHQ Standard) ───────────

function handleVoHeroLeadSubmit(e) {
  if (e) e.preventDefault();
  
  const name = document.getElementById('voHeroName')?.value?.trim() || 'Valued Client';
  const phone = document.getElementById('voHeroPhone')?.value?.trim() || '';
  const email = document.getElementById('voHeroEmail')?.value?.trim() || '';
  const purpose = document.getElementById('voHeroPurpose')?.value || 'GST Registration';
  const city = document.getElementById('voHeroCity')?.value || 'Delhi NCR';

  if (!phone || phone.length < 10) {
    if (typeof showToast === 'function') {
      showToast('Invalid Phone Number', 'Please enter a valid 10-digit mobile or WhatsApp number.', 'warning');
    }
    return;
  }

  // Save to lead CRM pipeline
  if (typeof addLead === 'function') {
    addLead({
      name: name,
      mobile: phone,
      email: email,
      city: city,
      service: purpose,
      source: 'Virtual Office Split Hero Form (myHQ Standard)',
      status: 'QUALIFIED'
    });
  }

  // Success feedback
  if (typeof showToast === 'function') {
    showToast(
      'Quote Request Received ✓',
      `Thank you ${name}! Our Senior CA Consultant will reach out on WhatsApp (+91 ${phone}) within 15 minutes.`,
      'success'
    );
  }

  // Offer WhatsApp concierge link with prefilled message
  const waMsg = encodeURIComponent(
    `Hi V-DESK Compliance Team,\n\nI just requested an instant quote for:\n• Name: ${name}\n• Purpose: ${purpose}\n• Target City: ${city}\n• Phone: +91 ${phone}\n\nPlease share the approved commercial centre list and lowest price quote.`
  );

  setTimeout(() => {
    try {
      const promptWa = confirm(`Would you like to connect with our Senior Virtual Office Consultant directly on WhatsApp now?`);
      if (promptWa) {
        window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank');
      }
    } catch (err) {
      // non-blocking
    }
  }, 800);

  // Reset form
  const form = document.getElementById('voHeroLeadForm');
  if (form) form.reset();
}

function toggleVoFaq(btn) {
  if (!btn) return;
  const item = btn.closest('.vo-faq-item');
  if (!item) return;

  const isActive = item.classList.contains('active');

  // Close all sibling items
  document.querySelectorAll('.vo-faq-item').forEach(el => {
    el.classList.remove('active');
    const trigger = el.querySelector('.vo-faq-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });

  // Toggle current item
  if (!isActive) {
    item.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function filterVoMarkets(city, btn) {
  const cards = document.querySelectorAll('.vo-market-card');
  const buttons = document.querySelectorAll('.vo-city-tab-btn');

  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  cards.forEach(card => {
    const cardCity = card.getAttribute('data-city');
    if (city === 'all' || cardCity === city) {
      card.style.display = 'flex';
      card.classList.add('reveal');
    } else {
      card.style.display = 'none';
    }
  });
}

function selectVoNeed(needType) {
  const leadCard = document.getElementById('voLeadCard');
  const purposeSelect = document.getElementById('voHeroPurpose');

  if (purposeSelect) {
    if (needType === 'incorporation') {
      purposeSelect.value = 'Company Incorporation';
    } else if (needType === 'gst') {
      purposeSelect.value = 'GST Registration';
    } else if (needType === 'mailing') {
      purposeSelect.value = 'Business Address & Mailing';
    }
  }

  if (leadCard) {
    leadCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const nameInput = document.getElementById('voHeroName');
    if (nameInput) setTimeout(() => nameInput.focus(), 500);
  }

  if (typeof showToast === 'function') {
    const labels = {
      incorporation: 'New Business / MCA Incorporation',
      gst: 'Business Expansion / GST PPOB & APOB',
      mailing: 'Corporate Business Address & Mailing'
    };
    showToast('Plan Selected', `Configured for ${labels[needType] || needType}. Complete form for instant dispatch.`, 'info');
  }
}

function prefillVoCity(cityName) {
  const leadCard = document.getElementById('voLeadCard');
  const citySelect = document.getElementById('voHeroCity');

  if (citySelect) {
    for (let i = 0; i < citySelect.options.length; i++) {
      if (cityName.toLowerCase().includes(citySelect.options[i].value.toLowerCase())) {
        citySelect.selectedIndex = i;
        break;
      }
    }
  }

  if (leadCard) {
    leadCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const phoneInput = document.getElementById('voHeroPhone');
    if (phoneInput) setTimeout(() => phoneInput.focus(), 500);
  }

  if (typeof showToast === 'function') {
    showToast('Location Selected', `Selected ${cityName}. Best rate locked in quote.`, 'info');
  }
}

// Global window registrations
window.handleVoHeroLeadSubmit = handleVoHeroLeadSubmit;
window.toggleVoFaq = toggleVoFaq;
window.filterVoMarkets = filterVoMarkets;
window.selectVoNeed = selectVoNeed;
window.prefillVoCity = prefillVoCity;



/* ==========================================================================
   COWORKING WORKSPACES: THE EXECUTIVE CENTRE (TEC) REFERENCE HANDLERS
   ========================================================================== */

function handleCwTourSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = document.getElementById('cwName') ? document.getElementById('cwName').value.trim() : '';
  const phone = document.getElementById('cwPhone') ? document.getElementById('cwPhone').value.trim() : '';
  const email = document.getElementById('cwEmail') ? document.getElementById('cwEmail').value.trim() : '';
  const solution = document.getElementById('cwSolution') ? document.getElementById('cwSolution').value : 'Private Serviced Office';
  const teamSize = document.getElementById('cwTeamSize') ? document.getElementById('cwTeamSize').value : '1 Person';
  const date = document.getElementById('cwDate') ? document.getElementById('cwDate').value : '';

  if (!name || !phone || !email || !date) {
    if (typeof showToast === 'function') {
      showToast('Incomplete Details', 'Please complete all required fields to confirm your tour.', 'warning');
    } else {
      alert('Please fill in all required fields.');
    }
    return false;
  }

  // Record lead in localStorage CRM
  const tourLead = {
    id: 'LEAD-CW-TOUR-' + Date.now(),
    timestamp: new Date().toISOString(),
    source: 'Worldmark Aerocity Centre Tour',
    name: name,
    phone: '+91 ' + phone,
    email: email,
    solution: solution,
    teamSize: teamSize,
    preferredDate: date,
    centre: 'Worldmark Aerocity (Level 7, Towers 4 & 6)',
    status: 'Tour Requested'
  };

  try {
    const existingLeads = JSON.parse(localStorage.getItem('vdesk_leads') || '[]');
    existingLeads.unshift(tourLead);
    localStorage.setItem('vdesk_leads', JSON.stringify(existingLeads));
  } catch (err) {
    console.warn('Could not save tour lead to localStorage:', err);
  }

  // Visual success feedback
  if (typeof showToast === 'function') {
    showToast('Tour Scheduled!', `Your visit for ${date} is registered. Our Centre Concierge will call you in < 15 mins.`, 'success');
  } else {
    alert(`Tour confirmed for ${date}! Our Centre Concierge will reach out shortly.`);
  }

  // Clear form
  const form = document.getElementById('cwTourForm');
  if (form) form.reset();

  // Prompt WhatsApp VIP concierge connection
  setTimeout(() => {
    const confirmWa = confirm('Tour scheduled! Would you like to connect directly with the Worldmark Aerocity Concierge on WhatsApp for instant directions and calendar invite?');
    if (confirmWa) {
      const waMsg = encodeURIComponent(`Hi V-DESK Concierge, I just scheduled a tour for ${solution} (${teamSize}) at Worldmark Aerocity on ${date}. My name is ${name}.`);
      window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank');
    }
  }, 1000);

  return false;
}

const cwGalleryData = {
  lounge: {
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Executive Members Lounge',
    caption: 'Curated Breakout Lounge with Designer Furnishings & Natural Light',
    specs: 'Level 7 Worldmark 4 • Capacity: 60 Pax • High-Speed Dual Wi-Fi • Complimentary Artisan Beverages'
  },
  barista: {
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    tag: 'Serviced Barista Cafe',
    caption: 'Artisanal Coffee Bar with On-Demand Baristas & Gourmet Dining',
    specs: 'Single-Origin Espresso • Organic Loose-Leaf Teas • Infused Water • Daily Fresh Baked Goods'
  },
  reception: {
    img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    tag: 'Light Executive Reception',
    caption: 'Corporate Front Desk & Guest Greeting with Five-Star Hospitality',
    specs: 'Professional Concierge • Guest Sign-In Digital Tablet • Courier & Mail Intake Desk'
  },
  boardroom: {
    img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    tag: '4K AV Boardrooms',
    caption: 'Acoustically Treated Boardrooms with Dual-Screen Telepresence',
    specs: 'Cisco/Polycom 4K Codec • Digital Touch Whiteboards • Seating for 16 Pax • Catering Support'
  },
  cabins: {
    img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    tag: 'Private Executive Cabins',
    caption: 'Turnkey Soundproof Team Suites with Ergonomic Herman Miller Desks',
    specs: 'Keyless RFID Access • Dedicated Server VLAN • 2 to 30 Desks • Daily Housekeeping'
  },
  library: {
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Silent Coworking Library',
    caption: 'Distraction-Free Focus Enclave for High-Leverage Deep Work',
    specs: 'Zero-Noise Policy • Lumbar Task Chairs • Anti-Glare Desk Lighting • Power at Every Seat'
  }
};

function switchCwGalleryTab(zone, btn) {
  const data = cwGalleryData[zone];
  if (!data) return;

  // Update tab buttons
  const allTabs = document.querySelectorAll('.cw-gallery-tab-btn');
  allTabs.forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const imgEl = document.getElementById('cwGalleryImg');
  const tagEl = document.getElementById('cwGalleryTag');
  const captionEl = document.getElementById('cwGalleryCaption');
  const specsEl = document.getElementById('cwGallerySpecs');

  if (imgEl) {
    imgEl.style.opacity = '0.3';
    setTimeout(() => {
      imgEl.src = data.img;
      imgEl.alt = data.caption;
      imgEl.style.opacity = '1';
    }, 200);
  }

  if (tagEl) tagEl.textContent = data.tag;
  if (captionEl) captionEl.textContent = data.caption;
  if (specsEl) specsEl.textContent = data.specs;
}

function filterCwAmenities(category, btn) {
  const allFilterPills = document.querySelectorAll('.cw-amenities-filters .cw-filter-pill');
  allFilterPills.forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('.cw-amenity-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function toggleCwFaq(btn) {
  const item = btn.closest('.cw-faq-item');
  if (!item) return;

  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !isExpanded);
  item.classList.toggle('active', !isExpanded);
}

function prefillCwTour(solutionName) {
  const tourCard = document.getElementById('cwTourCard');
  const solutionSelect = document.getElementById('cwSolution');

  if (solutionSelect) {
    for (let i = 0; i < solutionSelect.options.length; i++) {
      if (solutionSelect.options[i].text.toLowerCase().includes(solutionName.toLowerCase()) || 
          solutionName.toLowerCase().includes(solutionSelect.options[i].value.toLowerCase())) {
        solutionSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (tourCard) {
    tourCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const nameInput = document.getElementById('cwName');
    if (nameInput) setTimeout(() => nameInput.focus(), 500);
  }

  if (typeof showToast === 'function') {
    showToast('Solution Selected', `Configured for ${solutionName}. Pick a tour date to confirm.`, 'info');
  }
}

// Global window registrations for Coworking handlers
window.handleCwTourSubmit = handleCwTourSubmit;
window.switchCwGalleryTab = switchCwGalleryTab;
window.filterCwAmenities = filterCwAmenities;
window.toggleCwFaq = toggleCwFaq;
window.prefillCwTour = prefillCwTour;

/* ==========================================================================
   UNIFIED LEAD CAPTURE & CONCIERGE HANDLERS (SITE-WIDE ELEVATION)
   ========================================================================== */

function handleHomeHeroConsultSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('homeHeroName')?.value?.trim() || 'Valued Client';
  const phone = document.getElementById('homeHeroPhone')?.value?.trim() || '';
  const email = document.getElementById('homeHeroEmail')?.value?.trim() || '';
  const service = document.getElementById('homeHeroService')?.value || 'Virtual Office Platform';
  const city = document.getElementById('homeHeroCity')?.value || 'Delhi NCR';

  if (!phone || phone.length < 10) {
    if (typeof showToast === 'function') {
      showToast('Phone Number Required', 'Please enter a valid 10-digit mobile or WhatsApp number.', 'warning');
    }
    return;
  }

  if (typeof addLead === 'function') {
    addLead({
      name: name,
      mobile: phone,
      email: email,
      city: city,
      service: service,
      source: 'Homepage Split Hero Lead Engine',
      status: 'QUALIFIED'
    });
  }

  if (typeof showToast === 'function') {
    showToast(
      'Consultation Requested ✓',
      `Thank you ${name}! Our senior workspace advisor will connect on WhatsApp (+91 ${phone}) within 15 minutes.`,
      'success'
    );
  }

  const waMsg = encodeURIComponent(
    `Hi V-DESK Team,\n\nI just requested an instant workspace proposal:\n• Name: ${name}\n• Service: ${service}\n• City: ${city}\n• Phone: +91 ${phone}\n\nPlease share the available commercial centres and pricing.`
  );

  setTimeout(() => {
    try {
      if (confirm('Would you like to connect with your dedicated V-DESK advisor on WhatsApp now?')) {
        window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank');
      }
    } catch (err) {}
  }, 700);

  const form = document.getElementById('homeHeroConsultForm');
  if (form) form.reset();
}

function handleMrReserveCardSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('mrHeroName')?.value?.trim() || 'Valued Client';
  const phone = document.getElementById('mrHeroPhone')?.value?.trim() || '';
  const city = document.getElementById('mrHeroCity')?.value || 'Delhi NCR';
  const roomType = document.getElementById('mrHeroType')?.value || 'Conference Room (8 Pax)';
  const date = document.getElementById('mrHeroDate')?.value || 'Upcoming';
  const slot = document.getElementById('mrHeroSlot')?.value || '02:00 PM - 04:00 PM';
  const duration = document.getElementById('mrHeroDuration')?.value || '2 Hours';

  if (!phone || phone.length < 10) {
    if (typeof showToast === 'function') {
      showToast('Phone Number Required', 'Please enter a valid 10-digit mobile number for room reservation hold.', 'warning');
    }
    return;
  }

  if (typeof addLead === 'function') {
    addLead({
      name: name,
      mobile: phone,
      city: city,
      service: `Meeting Room: ${roomType} (${duration})`,
      source: 'Meeting Rooms Hero Reservation Engine',
      status: 'QUALIFIED'
    });
  }

  if (typeof showToast === 'function') {
    showToast(
      'Room Hold Initiated ✓',
      `Room slot held for 15 minutes. Our concierge will reach out to ${phone} with access code.`,
      'success'
    );
  }

  const waMsg = encodeURIComponent(
    `Hi V-DESK Concierge,\n\nI have initiated an instant boardroom reservation:\n• Name: ${name}\n• Room: ${roomType}\n• City: ${city}\n• Date: ${date} (${slot}, ${duration})\n• Phone: +91 ${phone}\n\nPlease confirm availability and payment pass.`
  );

  setTimeout(() => {
    try {
      if (confirm('Connect with Meeting Room Concierge on WhatsApp for instant confirmation pass?')) {
        window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank');
      }
    } catch (err) {}
  }, 700);

  const form = document.getElementById('mrReserveForm');
  if (form) form.reset();
}

function handleLocInquirySubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('locHeroName')?.value?.trim() || 'Valued Client';
  const phone = document.getElementById('locHeroPhone')?.value?.trim() || '';
  const city = document.getElementById('locHeroCity')?.value || 'Delhi NCR';
  const service = document.getElementById('locHeroService')?.value || 'Virtual Office (GST/MCA)';

  if (!phone || phone.length < 10) {
    if (typeof showToast === 'function') {
      showToast('Phone Number Required', 'Please enter a valid 10-digit mobile or WhatsApp number.', 'warning');
    }
    return;
  }

  if (typeof addLead === 'function') {
    addLead({
      name: name,
      mobile: phone,
      city: city,
      service: service,
      source: 'Locations Hub RFP Engine',
      status: 'QUALIFIED'
    });
  }

  if (typeof showToast === 'function') {
    showToast(
      'Commercial Hub RFP Received ✓',
      `Proposal for ${city} commercial towers will be shared on WhatsApp (+91 ${phone}) in 15 mins.`,
      'success'
    );
  }

  const waMsg = encodeURIComponent(
    `Hi V-DESK Team,\n\nI need verified Grade-A commercial tower details for:\n• Target City: ${city}\n• Service: ${service}\n• Name: ${name}\n• Phone: +91 ${phone}\n\nPlease share inventory and floor plan details.`
  );

  setTimeout(() => {
    try {
      if (confirm('Would you like to connect with our Commercial Tower Specialist on WhatsApp now?')) {
        window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank');
      }
    } catch (err) {}
  }, 700);

  const form = document.getElementById('locLeadForm');
  if (form) form.reset();
}

function handleContactAdvisorySubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('ctAdvName')?.value?.trim() || 'Valued Client';
  const phone = document.getElementById('ctAdvPhone')?.value?.trim() || '';
  const email = document.getElementById('ctAdvEmail')?.value?.trim() || '';
  const company = document.getElementById('ctAdvCompany')?.value?.trim() || 'Startup / Enterprise';
  const service = document.getElementById('ctAdvService')?.value || 'Virtual Office for GST';
  const city = document.getElementById('ctAdvCity')?.value || 'Delhi NCR';
  const message = document.getElementById('ctAdvMessage')?.value?.trim() || 'General Advisory Request';

  if (!phone || phone.length < 10) {
    if (typeof showToast === 'function') {
      showToast('Phone Number Required', 'Please enter a valid 10-digit mobile number.', 'warning');
    }
    return;
  }

  if (typeof addLead === 'function') {
    addLead({
      name: name,
      mobile: phone,
      email: email,
      company: company,
      city: city,
      service: service,
      source: 'Contact VIP Concierge Advisory Desk',
      status: 'QUALIFIED'
    });
  }

  if (typeof showToast === 'function') {
    showToast(
      'Advisory Request Dispatched ✓',
      `Thank you ${name}! Senior CA on duty will respond with customized proposal within 20 mins.`,
      'success'
    );
  }

  const waMsg = encodeURIComponent(
    `Hi V-DESK Senior Advisory Desk,\n\nI just submitted an advisory consultation request:\n• Name: ${name}\n• Company: ${company}\n• Service: ${service}\n• City: ${city}\n• Phone: +91 ${phone}\n• Notes: ${message}\n\nPlease share the proposal.`
  );

  setTimeout(() => {
    try {
      if (confirm('Would you like to speak with our Senior CA on duty via WhatsApp now?')) {
        window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank');
      }
    } catch (err) {}
  }, 700);

  const form = document.getElementById('contactAdvisoryForm');
  if (form) form.reset();
}

window.handleHomeHeroConsultSubmit = handleHomeHeroConsultSubmit;
window.handleMrReserveCardSubmit = handleMrReserveCardSubmit;
window.handleLocInquirySubmit = handleLocInquirySubmit;
window.handleContactAdvisorySubmit = handleContactAdvisorySubmit;

