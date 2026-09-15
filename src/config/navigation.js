/*
 * Navigation structure for the header, mobile drawer and footer.
 * On the homepage most entries scroll to in-page sections (`href`); on every other page they link to
 * the dedicated route (`to`). `activeOn` lists the page keys (see config/pages.js) that highlight an entry.
 */

export const HEADER_NAV = [
  { label: 'Home', home: { href: '#top' }, site: { to: '/' }, activeOn: ['home'] },
  {
    label: 'Workspaces',
    home: { href: '#solutionFinder' },
    site: { to: '/coworking-spaces' },
    activeOn: ['virtualOffice', 'coworking', 'meetingRooms'],
    dropdown: [
      { icon: 'ph-buildings', title: 'Virtual Office Platform', subtitle: 'Custom Setup & Pricing', to: '/virtual-office', activeOn: ['virtualOffice'] },
      { icon: 'ph-laptop', title: 'Workspace Marketplace', subtitle: 'Coworking, Cabins & Desks', to: '/coworking-spaces', activeOn: ['coworking'] },
      { icon: 'ph-presentation', title: 'Meeting Room Scheduler', subtitle: 'Hourly / Daily State Machine', to: '/meeting-rooms' },
      { icon: 'ph-door', title: 'Private Cabins', subtitle: 'Secure Executive Suites', to: '/coworking-spaces', activeOn: ['coworking'] },
    ],
  },
  {
    label: 'Ecosystem',
    home: { href: '#journey' },
    site: { to: '/company-registration' },
    activeOn: ['companyRegistration'],
    dropdown: [
      { icon: 'ph-file-text', title: 'START: Company Formation', subtitle: 'Pvt Ltd, LLP, OPC, Sec 8', home: { to: '/company-registration' }, site: { action: 'openCompanyRegModal' } },
      { icon: 'ph-buildings', title: 'ESTABLISH: Virtual Office & GST', subtitle: '100% Tax & MCA Approval', to: '/virtual-office', activeOn: ['virtualOffice'] },
      { icon: 'ph-users-three', title: 'WORK: Coworking & Cabins', subtitle: '50+ Grade-A Commercial Hubs', to: '/coworking-spaces', activeOn: ['coworking'] },
      { icon: 'ph-check-square-offset', title: 'GROW: GST Status Tracker', subtitle: 'Real-Time ARN Step Tracker', home: { to: '/virtual-office#gstTrackerSection' }, site: { action: 'openGstTrackerModal' } },
    ],
  },
  {
    label: 'Interactive Tools',
    home: { href: '#pricing' },
    site: { to: '/pricing' },
    activeOn: ['pricing'],
    dropdown: [
      { icon: 'ph-magic-wand', title: 'Business Setup Wizard', subtitle: '6-Step Recommendation', to: '/company-registration#wizard' },
      { icon: 'ph-calculator', title: 'ROI & Savings Calculator', subtitle: 'Traditional Lease vs V-DESK', to: '/pricing' },
      { icon: 'ph-fingerprint', title: 'Digital KYC Portal', subtitle: 'Self-Service Verification', action: 'openDigitalKycModal' },
      { icon: 'ph-user-circle', title: 'Customer Portal', subtitle: 'Active Services & Renewals', to: '/portal' },
    ],
  },
  { label: 'Locations', to: '/locations', activeOn: ['locations'] },
  { label: 'Pricing', to: '/pricing', activeOn: ['pricing'] },
  { label: 'Enterprise', action: 'openEnterpriseSuiteModal', hiddenOn: ['pricing'] },
  { label: 'Resources', home: { href: '#knowledge' }, site: { to: '/virtual-office#faq' } },
];

/** Mobile drawer on the homepage: jumps to homepage sections. */
export const HOME_DRAWER_NAV = [
  { label: 'Home', icon: 'ph-house', href: '#top', active: true },
  { heading: 'Workspaces & Solutions' },
  { label: 'Virtual Office', icon: 'ph-buildings', href: '#services' },
  { label: 'Coworking Spaces', icon: 'ph-laptop', href: '#services' },
  { label: 'Meeting Rooms', icon: 'ph-presentation', href: '#services' },
  { label: 'Private Cabins', icon: 'ph-door', href: '#services' },
  { heading: 'Business Services' },
  { label: 'Business Registration', icon: 'ph-file-text', href: '#wizard' },
  { label: 'ROI Pricing Calculator', icon: 'ph-tag', href: '#pricing' },
  { label: 'Locations (10+ Cities)', icon: 'ph-map-pin', href: '#locations' },
  { label: 'Resources & Blog', icon: 'ph-book-open', href: '#knowledge' },
  { label: 'Contact Us', icon: 'ph-envelope', href: '#contact' },
];

/** Mobile drawer on every other page: links to the dedicated pages. */
export const SITE_DRAWER_NAV = [
  { label: 'Home', icon: 'ph-house', to: '/', page: 'home' },
  { heading: 'Workspaces & Solutions' },
  { label: 'Virtual Office', icon: 'ph-buildings', to: '/virtual-office', page: 'virtualOffice' },
  { label: 'Coworking Spaces', icon: 'ph-laptop', to: '/coworking-spaces', page: 'coworking' },
  { label: 'Meeting Rooms', icon: 'ph-presentation', to: '/meeting-rooms', page: 'meetingRooms' },
  { label: 'Pan-India Locations', icon: 'ph-map-pin', to: '/locations', page: 'locations' },
  { heading: 'Plans & Registration' },
  { label: 'Pricing & ROI', icon: 'ph-tag', to: '/pricing', page: 'pricing' },
  { label: 'Company Registration', icon: 'ph-certificate', to: '/company-registration', page: 'companyRegistration' },
  { heading: 'Client & Management' },
  { label: 'Client Portal', icon: 'ph-user-circle', to: '/portal', page: 'portal' },
  { label: 'Admin CRM', icon: 'ph-shield-check', to: '/admin', page: 'admin' },
  { label: 'Contact Us', icon: 'ph-envelope', to: '/contact', page: 'contact' },
];

export const FOOTER_COLUMNS = [
  {
    heading: 'Workspaces',
    icon: 'ph-buildings',
    links: [
      { label: 'Virtual Office (GST)', href: '#services', to: '/virtual-office' },
      { label: 'Dedicated Coworking', href: '#services', to: '/virtual-office' },
      { label: 'Executive Private Cabins', href: '#services', to: '/virtual-office' },
      { label: '4K Boardrooms & Huddles', href: '#services', to: '/virtual-office' },
      { label: 'Enterprise Flex Desks', href: '#pricing', to: '/pricing' },
      { label: 'Multi-State APOB Network', href: '#solutionFinder', to: '/coworking-spaces' },
    ],
  },
  {
    heading: 'Corporate Services',
    icon: 'ph-scales',
    links: [
      { label: 'Pvt Ltd Incorporation', href: '#wizard', to: '/company-registration' },
      { label: 'LLP Registration', href: '#wizard', to: '/company-registration' },
      { label: 'GST Registration & Filing', href: '#services', to: '/virtual-office' },
      { label: 'Trademark Class Search', href: '#services', to: '/virtual-office' },
      { label: 'MCA Annual Compliance', href: '#wizard', to: '/company-registration' },
      { label: 'CA / CS Advisory', href: '#services', to: '/virtual-office' },
    ],
  },
  {
    heading: 'Nationwide Hubs',
    icon: 'ph-map-pin',
    links: [
      { label: 'Nashik (Flagship Hub)', href: '#locations', to: '/locations', city: 'Nashik' },
      { label: 'Mumbai (BKC & Andheri)', href: '#locations', to: '/locations', city: 'Mumbai' },
      { label: 'Delhi (Connaught Place)', href: '#locations', to: '/locations', city: 'Delhi' },
      { label: 'Bangalore (Koramangala)', href: '#locations', to: '/locations', city: 'Bangalore' },
      { label: 'Pune (Baner Road)', href: '#locations', to: '/locations', city: 'Pune' },
      { label: 'Hyderabad (HITEC City)', href: '#locations', to: '/locations', city: 'Hyderabad' },
    ],
  },
];
