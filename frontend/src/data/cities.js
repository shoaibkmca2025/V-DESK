import { CITY_IMAGES } from './cityImages.js';
import { LOCATIONS } from './locations.js';
import { WORKSPACES } from './workspaces.js';

/** City landing pages (/locations/:city) — PRD §25, §57. */
export const CITIES = [
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', tier: 'Tier-1', tagline: 'Financial capital of India', localities: ['BKC', 'Andheri East', 'Lower Parel', 'Powai', 'Thane'] },
  { slug: 'delhi', name: 'Delhi', state: 'Delhi NCR', tier: 'Tier-1', tagline: 'National capital & policy hub', localities: ['Connaught Place', 'Nehru Place', 'Aerocity', 'Saket'] },
  { slug: 'gurgaon', name: 'Gurgaon', state: 'Haryana', tier: 'Tier-1', tagline: 'Corporate & Fortune-500 corridor', localities: ['DLF Cyber City', 'Golf Course Road', 'Sohna Road'] },
  { slug: 'noida', name: 'Noida', state: 'Uttar Pradesh', tier: 'Tier-2', tagline: 'IT & manufacturing gateway', localities: ['Sector 62', 'Sector 18', 'Sector 125'] },
  { slug: 'bangalore', name: 'Bangalore', state: 'Karnataka', tier: 'Tier-1', tagline: 'Startup capital of India', localities: ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield'] },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', tier: 'Tier-2', tagline: 'IT, auto & education hub', localities: ['Baner', 'Viman Nagar', 'Hinjewadi', 'Kharadi'] },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', tier: 'Tier-1', tagline: 'Pharma & technology corridor', localities: ['HITEC City', 'Madhapur', 'Gachibowli'] },
  { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', tier: 'Tier-2', tagline: 'V-DESK flagship headquarters', localities: ['College Road', 'Gangapur Road', 'Nashik Road'] },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', tier: 'Tier-1', tagline: 'Manufacturing & SaaS hub', localities: ['Nungambakkam', 'OMR', 'Guindy'] },
];

/** Workspace products available per city (/locations/:city/:product) — PRD §57. */
export const CITY_PRODUCTS = [
  { slug: 'virtual-office', name: 'Virtual Office', icon: 'ph-buildings', service: 'Virtual Office', workspaceType: null, priceKey: 'vo_price', unit: '/mo', blurb: 'GST & MCA compliant business address with notarized documentation.' },
  { slug: 'coworking', name: 'Coworking', icon: 'ph-laptop', service: 'Coworking', workspaceType: 'Coworking', priceKey: 'cw_price', unit: '/day', blurb: 'Hot desks and dedicated desks with enterprise Wi-Fi and meeting credits.' },
  { slug: 'meeting-rooms', name: 'Meeting Rooms', icon: 'ph-presentation', service: 'Meeting Rooms', workspaceType: 'Meeting Rooms', priceKey: null, unit: '/hr', blurb: '4K boardrooms and huddle rooms bookable by the hour.' },
  { slug: 'private-office', name: 'Private Office', icon: 'ph-door', service: 'Private Office', workspaceType: 'Private Office', priceKey: null, unit: '/mo', blurb: 'Lockable cabins and team suites for 2–25 members.' },
];

export const getCity = (slug) => CITIES.find((c) => c.slug === slug);
export const getCityProduct = (slug) => CITY_PRODUCTS.find((p) => p.slug === slug);

export function cityCentres(city) {
  return LOCATIONS.filter((l) => l.city === city.name);
}

export function cityWorkspaces(city, type) {
  return WORKSPACES.filter((w) => w.city === city.name && (!type || w.type === type));
}

export function cityImage(city) {
  return CITY_IMAGES[city.name] || 'assets/vdesk-reception.jpg';
}

/** Lowest advertised price for a product in a city, or null when only on request. */
export function cityStartingPrice(city, product) {
  const centres = cityCentres(city).filter((c) => c.services.includes(product.service));
  if (product.priceKey && centres.length) return Math.min(...centres.map((c) => c[product.priceKey]));
  const spaces = cityWorkspaces(city, product.workspaceType);
  if (!spaces.length) return null;
  return product.unit === '/hr' ? Math.min(...spaces.map((w) => w.priceHour)) : Math.min(...spaces.map((w) => w.priceMonth));
}
