/**
 * Route + document metadata for every page of the platform.
 * `htmlClass` / `bodyClass` reproduce the per-page classes of the original site.
 */
export const PAGES = {
  home: {
    path: '/',
    title: 'V-DESK — Business Infrastructure & Workspace Platform',
    description:
      'Your business deserves a better address. V-DESK provides premium virtual offices, coworking spaces, meeting rooms, company registration and GST infrastructure across 10+ prime commercial hubs in India.',
    htmlClass: '',
    bodyClass: '',
  },
  virtualOffice: {
    path: '/virtual-office',
    title: 'Virtual Office for GST Registration & Company Incorporation | V-DESK',
    description:
      '100% tax and MCA compliant virtual offices across 18+ Indian cities. Complete documentation in 24 hours including notarized rent agreement, NOC, and bill.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--virtual-office',
  },
  coworking: {
    path: '/coworking-spaces',
    title: 'Coworking Spaces, Hot Desks & Private Executive Cabins | V-DESK',
    description:
      'Discover flexible coworking desks and soundproof private cabins across 50+ Grade-A towers in Mumbai, Delhi, Bangalore, Pune and Nashik.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--coworking',
  },
  meetingRooms: {
    path: '/meeting-rooms',
    title: 'On-Demand 4K Meeting Rooms & Executive Boardrooms | V-DESK',
    description:
      'Reserve executive conference rooms and boardrooms with 10-minute hold lock, 4K displays, and instant digital booking passes across India.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--meeting-rooms',
  },
  locations: {
    path: '/locations',
    title: 'Pan-India Commercial Hubs & Grade-A Towers Directory | V-DESK',
    description:
      'Explore verified Grade-A commercial addresses across Mumbai BKC, Delhi CP, Bangalore Koramangala, Nashik HQ, Pune, Gurgaon and Hyderabad.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--locations',
  },
  pricing: {
    path: '/pricing',
    title: 'Transparent Pricing, Plans & Operational ROI Calculator | V-DESK',
    description:
      'Compare Virtual Office, Coworking, and Private Office pricing plans. Calculate operational savings vs traditional commercial leases.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--pricing',
  },
  companyRegistration: {
    path: '/company-registration',
    title: 'Company Incorporation, MCA SPICe+ & Corporate Compliance | V-DESK',
    description:
      'Incorporate your Private Limited Company, LLP, or One Person Company with complete MCA, DIN, PAN, TAN, and registered office address.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--company-reg',
  },
  portal: {
    path: '/portal',
    title: 'Client Self-Service Portal & Document Vault | V-DESK',
    description:
      'Manage active virtual office subscriptions, download signed agreements, review mail scans, and monitor boardroom credits.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--portal',
  },
  admin: {
    path: '/admin',
    title: 'Centralized Operations & CRM Management Suite | V-DESK Admin',
    description:
      'Operations management console for V-DESK super admins. Monitor lead pipelines, KYC approval queues, and inventory.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--admin',
  },
  contact: {
    path: '/contact',
    title: 'Contact V-DESK | Headquarters, Commercial Hubs & Expert Advisory',
    description:
      'Get in touch with V-DESK for virtual office setups, coworking desks, meeting room reservations, and company incorporation.',
    htmlClass: 'scroll-smooth',
    bodyClass: 'subpage subpage--contact',
  },
  services: { path: '/services', title: 'Business Services — Virtual Office, GST & Company Registration | V-DESK', description: 'Start, establish and grow your business with V-DESK services across India.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--services' },
  service: { path: '/services/:slug', title: 'Service | V-DESK', description: '', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--service' },
  city: { path: '/locations/:city', title: 'City | V-DESK', description: '', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--city' },
  cityProduct: { path: '/locations/:city/:product', title: 'City Product | V-DESK', description: '', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--city-product' },
  cityWorkspaces: { path: '/workspaces/:city', title: 'Workspaces | V-DESK', description: '', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--workspaces' },
  search: { path: '/search', title: 'Search Results | V-DESK', description: 'Search cities, workspaces and business services across the V-DESK platform.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--search' },
  resources: { path: '/resources', title: 'Resources & Guides — GST, Incorporation & Workspace | V-DESK', description: 'Practical guides on GST registration, company incorporation, compliance and flexible workspaces.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--resources' },
  guide: { path: '/resources/:slug', title: 'Guide | V-DESK', description: '', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--guide' },
  faqs: { path: '/faqs', title: 'Frequently Asked Questions | V-DESK', description: 'Answers on virtual offices, GST, coworking, billing and KYC.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--faqs' },
  legal: { path: '/legal/:doc', title: 'Legal | V-DESK', description: '', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--legal' },
  login: { path: '/login', title: 'Sign In | V-DESK Client Portal', description: 'Access your V-DESK services, documents and bookings.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--auth' },
  register: { path: '/register', title: 'Create Account | V-DESK', description: 'Create your V-DESK business account.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--auth' },
  kyc: { path: '/kyc', title: 'Digital KYC Verification | V-DESK', description: 'Upload statutory documents for verification within 4 working hours.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--kyc' },
  checkout: { path: '/checkout', title: 'Secure Checkout | V-DESK', description: 'Complete your V-DESK order with UPI, card or net banking.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--checkout' },
  bookings: { path: '/bookings', title: 'My Bookings | V-DESK', description: 'Meeting room and workspace reservations.', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--bookings' },
  quote: { path: '/quote/:ref', title: 'Quote Proposal | V-DESK', description: '', htmlClass: 'scroll-smooth', bodyClass: 'subpage subpage--quote' },
  notFound: {
    path: '*',
    title: 'Page Not Found (404) | V-DESK Business Infrastructure',
    description: '',
    htmlClass: '',
    bodyClass: '',
  },
};

/** Old static file names (still used in shared links and bookmarks) → routes. */
export const LEGACY_FILE_ROUTES = {
  'index.html': PAGES.home.path,
  'virtual-office.html': PAGES.virtualOffice.path,
  'coworking-spaces.html': PAGES.coworking.path,
  'meeting-rooms.html': PAGES.meetingRooms.path,
  'locations.html': PAGES.locations.path,
  'pricing.html': PAGES.pricing.path,
  'company-registration.html': PAGES.companyRegistration.path,
  'portal.html': PAGES.portal.path,
  'admin.html': PAGES.admin.path,
  'contact.html': PAGES.contact.path,
};
