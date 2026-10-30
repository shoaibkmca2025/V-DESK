/*
 * Navigation structure for the header, mobile drawer and footer.
 * On the homepage most entries scroll to in-page sections (`href`); on every other page they link to
 * the dedicated route (`to`). `activeOn` lists the page keys (see config/pages.js) that highlight an entry.
 */

/**
 * The four things people come for sit in the bar itself — a virtual office, a desk, CA work, or a space to
 * list. Everything else the site already has lives under "All Solutions", so the bar stays short enough to
 * read at a glance on a laptop.
 */
export const HEADER_NAV = [
  { label: 'Home', to: '/', href: '#top', activeOn: ['home'] },
  { label: 'Virtual Office', to: '/virtual-office', activeOn: ['virtualOffice'] },
  { label: 'Co-Working Space', to: '/coworking-spaces', activeOn: ['coworking', 'cityWorkspaces'] },
  { label: 'CA Services', to: '/services', activeOn: ['services', 'service', 'companyRegistration'] },
  { label: 'List Your Space', to: '/list-your-space', activeOn: ['listYourSpace'] },
  {
    label: 'All Solutions',
    to: '/services',
    activeOn: ['meetingRooms', 'pricing', 'locations', 'city', 'cityProduct', 'resources', 'guide', 'faqs'],
    dropdown: [
      { icon: 'ph-presentation', title: 'Meeting Rooms', subtitle: 'Book by the hour', to: '/meeting-rooms', activeOn: ['meetingRooms'] },
      { icon: 'ph-certificate', title: 'Company Registration', subtitle: 'Pvt Ltd, LLP, OPC', to: '/company-registration', activeOn: ['companyRegistration'] },
      { icon: 'ph-receipt', title: 'GST Registration', subtitle: 'GSTIN with a compliant address', to: '/services/gst-registration' },
      { icon: 'ph-check-square-offset', title: 'Track GST Application', subtitle: 'Check your ARN status', action: 'openGstTrackerModal' },
      { icon: 'ph-map-pin', title: 'Locations', subtitle: 'Centres in 10+ cities', to: '/locations', activeOn: ['locations', 'city', 'cityProduct'] },
      { icon: 'ph-tag', title: 'Pricing', subtitle: 'Plans and what they include', to: '/pricing', activeOn: ['pricing'] },
      { icon: 'ph-briefcase', title: 'Enterprise Solutions', subtitle: 'Multi-city teams', action: 'openEnterpriseSuiteModal' },
      { icon: 'ph-book-open', title: 'Guides & FAQs', subtitle: 'How GST and MCA filings work', to: '/resources', activeOn: ['resources', 'guide', 'faqs'] },
    ],
  },
  { label: 'Contact Us', to: '/contact', activeOn: ['contact'] },
];

/** Mobile drawer: the header's structure, opened out — nothing hidden behind a dropdown on a phone. */
export const SITE_DRAWER_NAV = [
  { label: 'Home', icon: 'ph-house', to: '/', page: 'home' },
  { label: 'Virtual Office', icon: 'ph-buildings', to: '/virtual-office', page: 'virtualOffice' },
  { label: 'Co-Working Space', icon: 'ph-laptop', to: '/coworking-spaces', page: 'coworking' },
  { label: 'CA Services', icon: 'ph-calculator', to: '/services', page: 'services' },
  { label: 'List Your Space', icon: 'ph-buildings', to: '/list-your-space', page: 'listYourSpace' },
  { heading: 'All Solutions' },
  { label: 'Meeting Rooms', icon: 'ph-presentation', to: '/meeting-rooms', page: 'meetingRooms' },
  { label: 'Company Registration', icon: 'ph-certificate', to: '/company-registration', page: 'companyRegistration' },
  { label: 'GST Registration', icon: 'ph-receipt', to: '/services/gst-registration', page: 'service' },
  { label: 'Locations', icon: 'ph-map-pin', to: '/locations', page: 'locations' },
  { label: 'Pricing', icon: 'ph-tag', to: '/pricing', page: 'pricing' },
  { heading: 'Account & Help' },
  { label: 'My Account', icon: 'ph-user-circle', to: '/portal', page: 'portal' },
  { label: 'Guides & FAQs', icon: 'ph-book-open', to: '/resources', page: 'resources' },
  { label: 'Contact Us', icon: 'ph-envelope', to: '/contact', page: 'contact' },
];

export const HOME_DRAWER_NAV = SITE_DRAWER_NAV;

export const FOOTER_COLUMNS = [
  {
    heading: 'Workspaces',
    links: [
      { label: 'Virtual Office', to: '/virtual-office' },
      { label: 'Coworking & Cabins', to: '/coworking-spaces' },
      { label: 'Meeting Rooms', to: '/meeting-rooms' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Find a Workspace', to: '/search' },
    ],
  },
  {
    heading: 'Registration',
    links: [
      { label: 'Company Registration', to: '/company-registration' },
      { label: 'GST Registration', to: '/services/gst-registration' },
      { label: 'All Business Services', to: '/services' },
      { label: 'Guides', to: '/resources' },
      { label: 'FAQs', to: '/faqs' },
    ],
  },
  {
    heading: 'Cities',
    links: [
      { label: 'Mumbai', to: '/locations/mumbai' },
      { label: 'Delhi', to: '/locations/delhi' },
      { label: 'Bangalore', to: '/locations/bangalore' },
      { label: 'Pune', to: '/locations/pune' },
      { label: 'All locations', to: '/locations' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'My Portal', to: '/portal' },
      { label: 'My Bookings', to: '/bookings' },
      { label: 'List Your Space', to: '/list-your-space' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
];
