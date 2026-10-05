/*
 * Navigation structure for the header, mobile drawer and footer.
 * On the homepage most entries scroll to in-page sections (`href`); on every other page they link to
 * the dedicated route (`to`). `activeOn` lists the page keys (see config/pages.js) that highlight an entry.
 */

export const HEADER_NAV = [
  {
    label: 'Workspaces',
    to: '/coworking-spaces',
    activeOn: ['virtualOffice', 'coworking', 'meetingRooms', 'cityWorkspaces'],
    dropdown: [
      { icon: 'ph-buildings', title: 'Virtual Office', subtitle: 'Business address for GST & MCA', to: '/virtual-office', activeOn: ['virtualOffice'] },
      { icon: 'ph-laptop', title: 'Coworking & Cabins', subtitle: 'Desks and private offices', to: '/coworking-spaces', activeOn: ['coworking'] },
      { icon: 'ph-presentation', title: 'Meeting Rooms', subtitle: 'Book by the hour', to: '/meeting-rooms', activeOn: ['meetingRooms'] },
    ],
  },
  {
    label: 'Registration',
    to: '/services',
    activeOn: ['companyRegistration', 'services', 'service'],
    dropdown: [
      { icon: 'ph-certificate', title: 'Company Registration', subtitle: 'Pvt Ltd, LLP, OPC', to: '/company-registration', activeOn: ['companyRegistration'] },
      { icon: 'ph-receipt', title: 'GST Registration', subtitle: 'GSTIN with compliant address', to: '/services/gst-registration' },
      { icon: 'ph-check-square-offset', title: 'Track GST Application', subtitle: 'Check your ARN status', action: 'openGstTrackerModal' },
      { icon: 'ph-briefcase', title: 'Enterprise Solutions', subtitle: 'Multi-city teams', action: 'openEnterpriseSuiteModal' },
    ],
  },
  { label: 'Locations', to: '/locations', activeOn: ['locations', 'city', 'cityProduct'] },
  { label: 'Pricing', to: '/pricing', activeOn: ['pricing'] },
  { label: 'Help', to: '/resources', activeOn: ['resources', 'guide', 'faqs'] },
];

/** Mobile drawer: the same plain-language structure on every page. */
export const SITE_DRAWER_NAV = [
  { label: 'Home', icon: 'ph-house', to: '/', page: 'home' },
  { heading: 'Workspaces' },
  { label: 'Virtual Office', icon: 'ph-buildings', to: '/virtual-office', page: 'virtualOffice' },
  { label: 'Coworking & Cabins', icon: 'ph-laptop', to: '/coworking-spaces', page: 'coworking' },
  { label: 'Meeting Rooms', icon: 'ph-presentation', to: '/meeting-rooms', page: 'meetingRooms' },
  { label: 'Locations', icon: 'ph-map-pin', to: '/locations', page: 'locations' },
  { heading: 'Registration' },
  { label: 'Company Registration', icon: 'ph-certificate', to: '/company-registration', page: 'companyRegistration' },
  { label: 'GST Registration', icon: 'ph-receipt', to: '/services/gst-registration', page: 'service' },
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
      { label: 'Contact Us', to: '/contact' },
    ],
  },
];
