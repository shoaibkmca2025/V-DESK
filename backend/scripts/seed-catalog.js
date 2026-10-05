/**
 * Seed script — Catalog module
 *
 * Converts the canonical frontend data (frontend/src/data/locations.js + workspaces.js + cities.js)
 * into the backend DB format (paise, refs, etc.) and upserts into MongoDB.
 *
 * Usage (from repo root):
 *   node --env-file-if-exists=backend/.env backend/scripts/seed-catalog.js
 *   node --env-file-if-exists=backend/.env backend/scripts/seed-catalog.js --memory   # in-memory Mongo
 *
 * Safe to re-run (upserts on `ref`). Existing records are updated; nothing is deleted.
 */
import mongoose from 'mongoose';

// ── Inline seed data (mirrors frontend/src/data — source of truth until the API is the source) ──

const CITIES_SEED = [
  {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    tier: 'Tier-1',
    tagline: 'Financial capital of India',
    localities: ['BKC', 'Andheri East', 'Lower Parel', 'Powai', 'Thane'],
  },
  {
    slug: 'delhi',
    name: 'Delhi',
    state: 'Delhi NCR',
    tier: 'Tier-1',
    tagline: 'National capital & policy hub',
    localities: ['Connaught Place', 'Nehru Place', 'Aerocity', 'Saket'],
  },
  {
    slug: 'gurgaon',
    name: 'Gurgaon',
    state: 'Haryana',
    tier: 'Tier-1',
    tagline: 'Corporate & Fortune-500 corridor',
    localities: ['DLF Cyber City', 'Golf Course Road', 'Sohna Road'],
  },
  {
    slug: 'noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    tier: 'Tier-2',
    tagline: 'IT & manufacturing gateway',
    localities: ['Sector 62', 'Sector 18', 'Sector 125'],
  },
  {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    tier: 'Tier-1',
    tagline: 'Startup capital of India',
    localities: ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield'],
  },
  {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    tier: 'Tier-2',
    tagline: 'IT, auto & education hub',
    localities: ['Baner', 'Viman Nagar', 'Hinjewadi', 'Kharadi'],
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    tier: 'Tier-1',
    tagline: 'Pharma & technology corridor',
    localities: ['HITEC City', 'Madhapur', 'Gachibowli'],
  },
  {
    slug: 'nashik',
    name: 'Nashik',
    state: 'Maharashtra',
    tier: 'Tier-2',
    tagline: 'V-DESK flagship headquarters',
    localities: ['College Road', 'Gangapur Road', 'Nashik Road'],
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    tier: 'Tier-1',
    tagline: 'Manufacturing & SaaS hub',
    localities: ['Nungambakkam', 'OMR', 'Guindy'],
  },
];

// Centres from frontend/src/data/locations.js
// vo_price and cw_price were rupees; converted to paise (* 100) — rules.md §13
const CENTRES_SEED = [
  // Nashik
  {
    ref: 'CTR-NSK-001',
    cityRef: 'CITY-NSK',
    city: 'Nashik',
    areaName: 'College Road',
    fullName: 'V-DESK Headquarters — College Road',
    address: 'Landmark Trade Centre, 3rd Floor, College Road, Nashik – 422005',
    services: [
      'Virtual Office',
      'Coworking',
      'Meeting Rooms',
      'Private Office',
      'GST Registration',
      'Company Registration',
    ],
    vo_price_paise: 124900,
    cw_price_paise: 39900,
    meetingCapacity: '4–20 pax',
    status: 'available',
    flagship: true,
  },
  {
    ref: 'CTR-NSK-002',
    cityRef: 'CITY-NSK',
    city: 'Nashik',
    areaName: 'Gangapur Road',
    fullName: 'V-DESK Premium — Gangapur Road',
    address: 'Phoenix Business Park, Near Sula Vineyards Road, Gangapur Road, Nashik – 422013',
    services: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'GST Registration'],
    vo_price_paise: 134900,
    cw_price_paise: 44900,
    meetingCapacity: '4–12 pax',
    status: 'available',
    flagship: true,
  },
  // Mumbai
  {
    ref: 'CTR-MUM-001',
    cityRef: 'CITY-MUM',
    city: 'Mumbai',
    areaName: 'Andheri East',
    fullName: 'V-DESK Mumbai — Andheri East',
    address: 'Peninsula Business Hub, Andheri–Kurla Road, Andheri East, Mumbai – 400059',
    services: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'GST Registration'],
    vo_price_paise: 199900,
    cw_price_paise: 69900,
    meetingCapacity: '6–20 pax',
    status: 'available',
    flagship: false,
  },
  {
    ref: 'CTR-MUM-002',
    cityRef: 'CITY-MUM',
    city: 'Mumbai',
    areaName: 'BKC',
    fullName: 'V-DESK Mumbai — BKC',
    address: 'BKC Business Center, G Block, Bandra Kurla Complex, Mumbai – 400051',
    services: ['Virtual Office', 'Private Office', 'Meeting Rooms', 'Company Registration'],
    vo_price_paise: 249900,
    cw_price_paise: 89900,
    meetingCapacity: '4–16 pax',
    status: 'limited',
    flagship: false,
  },
  {
    ref: 'CTR-MUM-003',
    cityRef: 'CITY-MUM',
    city: 'Mumbai',
    areaName: 'Lower Parel',
    fullName: 'V-DESK Mumbai — Lower Parel',
    address: 'Tower 5, High Street Phoenix, Lower Parel, Mumbai – 400013',
    services: ['Virtual Office', 'Coworking', 'GST Registration'],
    vo_price_paise: 219900,
    cw_price_paise: 79900,
    meetingCapacity: '4–12 pax',
    status: 'available',
    flagship: false,
  },
  // Delhi
  {
    ref: 'CTR-DEL-001',
    cityRef: 'CITY-DEL',
    city: 'Delhi',
    areaName: 'Connaught Place',
    fullName: 'V-DESK Delhi — Connaught Place',
    address: 'Statesman House, Barakhamba Road, Connaught Place, New Delhi – 110001',
    services: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'GST Registration', 'Company Registration'],
    vo_price_paise: 219900,
    cw_price_paise: 79900,
    meetingCapacity: '6–20 pax',
    status: 'available',
    flagship: false,
  },
  {
    ref: 'CTR-DEL-002',
    cityRef: 'CITY-DEL',
    city: 'Delhi',
    areaName: 'Nehru Place',
    fullName: 'V-DESK Delhi — Nehru Place',
    address: 'Hemkunt Chambers, Nehru Place, New Delhi – 110019',
    services: ['Virtual Office', 'GST Registration'],
    vo_price_paise: 179900,
    cw_price_paise: 59900,
    meetingCapacity: '4–8 pax',
    status: 'available',
    flagship: false,
  },
  // Bangalore
  {
    ref: 'CTR-BLR-001',
    cityRef: 'CITY-BLR',
    city: 'Bangalore',
    areaName: 'Koramangala',
    fullName: 'V-DESK Bangalore — Koramangala',
    address: 'Omega Tech Park, 5th Block, Koramangala, Bengaluru – 560034',
    services: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'Private Office', 'GST Registration'],
    vo_price_paise: 199900,
    cw_price_paise: 69900,
    meetingCapacity: '6–20 pax',
    status: 'available',
    flagship: false,
  },
  {
    ref: 'CTR-BLR-002',
    cityRef: 'CITY-BLR',
    city: 'Bangalore',
    areaName: 'HSR Layout',
    fullName: 'V-DESK Bangalore — HSR Layout',
    address: 'Bridge+ Workspaces, Sector 7, HSR Layout, Bengaluru – 560102',
    services: ['Virtual Office', 'Coworking', 'GST Registration'],
    vo_price_paise: 179900,
    cw_price_paise: 64900,
    meetingCapacity: '4–12 pax',
    status: 'available',
    flagship: false,
  },
  // Pune
  {
    ref: 'CTR-PNE-001',
    cityRef: 'CITY-PNE',
    city: 'Pune',
    areaName: 'Baner',
    fullName: 'V-DESK Pune — Baner',
    address: 'Embassy Business Park, Baner Road, Pune – 411045',
    services: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'GST Registration', 'Company Registration'],
    vo_price_paise: 159900,
    cw_price_paise: 54900,
    meetingCapacity: '6–16 pax',
    status: 'available',
    flagship: false,
  },
  {
    ref: 'CTR-PNE-002',
    cityRef: 'CITY-PNE',
    city: 'Pune',
    areaName: 'Viman Nagar',
    fullName: 'V-DESK Pune — Viman Nagar',
    address: 'Nyati Emporius, Viman Nagar Road, Pune – 411014',
    services: ['Virtual Office', 'GST Registration'],
    vo_price_paise: 144900,
    cw_price_paise: 49900,
    meetingCapacity: '4–8 pax',
    status: 'available',
    flagship: false,
  },
  // Hyderabad
  {
    ref: 'CTR-HYD-001',
    cityRef: 'CITY-HYD',
    city: 'Hyderabad',
    areaName: 'HITEC City',
    fullName: 'V-DESK Hyderabad — HITEC City',
    address: 'Laxmi Cyber City, Whitefields, HITEC City, Hyderabad – 500081',
    services: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'Private Office', 'GST Registration'],
    vo_price_paise: 179900,
    cw_price_paise: 64900,
    meetingCapacity: '6–20 pax',
    status: 'available',
    flagship: false,
  },
  // Noida
  {
    ref: 'CTR-NOI-001',
    cityRef: 'CITY-NOI',
    city: 'Noida',
    areaName: 'Sector 62',
    fullName: 'V-DESK Noida — Sector 62',
    address: 'Express Trade Tower, Sector 62, Noida – 201301',
    services: ['Virtual Office', 'Coworking', 'GST Registration'],
    vo_price_paise: 159900,
    cw_price_paise: 54900,
    meetingCapacity: '4–12 pax',
    status: 'available',
    flagship: false,
  },
  // Gurgaon
  {
    ref: 'CTR-GUR-001',
    cityRef: 'CITY-GUR',
    city: 'Gurgaon',
    areaName: 'Cyber City',
    fullName: 'V-DESK Gurgaon — DLF Cyber City',
    address: 'DLF Cyber City, Building 10, Tower C, Gurgaon – 122002',
    services: [
      'Virtual Office',
      'Coworking',
      'Meeting Rooms',
      'Private Office',
      'GST Registration',
      'Company Registration',
    ],
    vo_price_paise: 229900,
    cw_price_paise: 79900,
    meetingCapacity: '6–20 pax',
    status: 'limited',
    flagship: false,
  },
  // Chennai
  {
    ref: 'CTR-CHN-001',
    cityRef: 'CITY-CHN',
    city: 'Chennai',
    areaName: 'Nungambakkam',
    fullName: 'V-DESK Chennai — Nungambakkam',
    address: 'Presidium Business Hub, Nungambakkam High Road, Chennai – 600034',
    services: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'GST Registration'],
    vo_price_paise: 169900,
    cw_price_paise: 59900,
    meetingCapacity: '4–16 pax',
    status: 'available',
    flagship: false,
  },
];

// Workspaces from frontend/src/data/workspaces.js
// priceMonth and priceHour were rupees; converted to paise (* 100)
const WORKSPACES_SEED = [
  {
    ref: 'WS-MUM-001',
    centreRef: 'CTR-MUM-002',
    city: 'Mumbai',
    locality: 'BKC',
    name: 'Executive Private Suite (8 Pax)',
    type: 'Private Office',
    capacity: 8,
    price_month_paise: 4800000,
    price_hour_paise: 149900,
    amenities: [
      'Wi-Fi',
      'Parking',
      'Reception',
      'Pantry',
      'Conference Room',
      '24/7 Access',
      'CCTV',
      'Power Backup',
      'GST Suitable',
    ],
    status: 'available',
    rating: 4.9,
    reviews: 142,
  },
  {
    ref: 'WS-MUM-002',
    centreRef: 'CTR-MUM-001',
    city: 'Mumbai',
    locality: 'Andheri East',
    name: 'Dedicated Flex Coworking Desk',
    type: 'Coworking',
    capacity: 1,
    price_month_paise: 799900,
    price_hour_paise: 19900,
    amenities: ['Wi-Fi', 'Pantry', 'Reception', 'Power Backup', 'CCTV', 'GST Suitable'],
    status: 'available',
    rating: 4.8,
    reviews: 98,
  },
  {
    ref: 'WS-NSK-001',
    centreRef: 'CTR-NSK-001',
    city: 'Nashik',
    locality: 'College Road',
    name: 'Flagship 4K Boardroom (12 Pax)',
    type: 'Meeting Rooms',
    capacity: 12,
    price_month_paise: 2500000,
    price_hour_paise: 119900,
    amenities: ['Wi-Fi', 'Parking', 'Reception', 'Conference Room', 'Power Backup', 'CCTV'],
    status: 'available',
    rating: 5.0,
    reviews: 210,
  },
  {
    ref: 'WS-GUR-001',
    centreRef: 'CTR-GUR-001',
    city: 'Gurgaon',
    locality: 'DLF Cyber City',
    name: 'Cyber City Team Cabin (8 Pax)',
    type: 'Private Office',
    capacity: 8,
    price_month_paise: 5200000,
    price_hour_paise: 169900,
    amenities: [
      'Wi-Fi',
      'Parking',
      'Reception',
      'Pantry',
      'Conference Room',
      '24/7 Access',
      'CCTV',
      'Power Backup',
      'GST Suitable',
    ],
    status: 'available',
    rating: 4.9,
    reviews: 118,
  },
  {
    ref: 'WS-BLR-001',
    centreRef: 'CTR-BLR-001',
    city: 'Bangalore',
    locality: 'Koramangala',
    name: 'Koramangala Dedicated Pod (4 Pax)',
    type: 'Private Office',
    capacity: 4,
    price_month_paise: 2400000,
    price_hour_paise: 89900,
    amenities: ['Wi-Fi', 'Reception', 'Pantry', 'Power Backup', 'CCTV', 'GST Suitable'],
    status: 'available',
    rating: 4.8,
    reviews: 84,
  },
  {
    ref: 'WS-DEL-001',
    centreRef: 'CTR-DEL-001',
    city: 'Delhi',
    locality: 'Connaught Place',
    name: 'Connaught Place Meeting Room (10 Pax)',
    type: 'Meeting Rooms',
    capacity: 10,
    price_month_paise: 2800000,
    price_hour_paise: 99900,
    amenities: ['Wi-Fi', 'Reception', 'Conference Room', 'Power Backup', 'CCTV'],
    status: 'available',
    rating: 4.9,
    reviews: 165,
  },
];

// City ref map: slug → ref (used by centres to set cityRef)
const CITY_REF = {
  mumbai: 'CITY-MUM',
  delhi: 'CITY-DEL',
  gurgaon: 'CITY-GUR',
  noida: 'CITY-NOI',
  bangalore: 'CITY-BLR',
  pune: 'CITY-PNE',
  hyderabad: 'CITY-HYD',
  nashik: 'CITY-NSK',
  chennai: 'CITY-CHN',
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vdesk';
  console.log(`[seed-catalog] connecting to ${uri}`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // Import models after connection (ESM)
  const { City, Centre, Workspace } = await import('../src/modules/catalog/catalog.model.js');

  // ── Cities ──
  let citiesUpserted = 0;
  for (const c of CITIES_SEED) {
    await City.updateOne(
      { ref: CITY_REF[c.slug] },
      { $set: { ...c, ref: CITY_REF[c.slug], active: true, deletedAt: null } },
      { upsert: true },
    );
    citiesUpserted++;
  }
  console.log(`[seed-catalog] cities upserted: ${citiesUpserted}`);

  // ── Centres ──
  let centresUpserted = 0;
  for (const c of CENTRES_SEED) {
    await Centre.updateOne({ ref: c.ref }, { $set: { ...c, active: true, deletedAt: null } }, { upsert: true });
    centresUpserted++;
  }
  console.log(`[seed-catalog] centres upserted: ${centresUpserted}`);

  // ── Workspaces ──
  let workspacesUpserted = 0;
  for (const w of WORKSPACES_SEED) {
    await Workspace.updateOne({ ref: w.ref }, { $set: { ...w, active: true, deletedAt: null } }, { upsert: true });
    workspacesUpserted++;
  }
  console.log(`[seed-catalog] workspaces upserted: ${workspacesUpserted}`);

  await mongoose.disconnect();
  console.log('[seed-catalog] done ✓');
}

main().catch((err) => {
  console.error('[seed-catalog] failed:', err);
  process.exit(1);
});
