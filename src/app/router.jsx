import { createBrowserRouter, Navigate } from 'react-router';
import { LEGACY_FILE_ROUTES } from '@/config/pages.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import AdminPage from '@/pages/admin/AdminPage.jsx';
import CompanyRegistrationPage from '@/pages/company-registration/CompanyRegistrationPage.jsx';
import ContactPage from '@/pages/contact/ContactPage.jsx';
import CoworkingPage from '@/pages/coworking/CoworkingPage.jsx';
import HomePage from '@/pages/home/HomePage.jsx';
import LocationsPage from '@/pages/locations/LocationsPage.jsx';
import MeetingRoomsPage from '@/pages/meeting-rooms/MeetingRoomsPage.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';
import PortalPage from '@/pages/portal/PortalPage.jsx';
import PricingPage from '@/pages/pricing/PricingPage.jsx';
import VirtualOfficePage from '@/pages/virtual-office/VirtualOfficePage.jsx';
import RootLayout from './RootLayout.jsx';

const page = (key, Component) => (
  <SiteLayout page={key}>
    <Component />
  </SiteLayout>
);

/** Old `*.html` URLs keep working (bookmarks, SEO backlinks, shared links). */
const legacyRedirects = Object.entries(LEGACY_FILE_ROUTES).map(([file, to]) => ({
  path: file,
  element: <Navigate to={to} replace />,
}));

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: page('home', HomePage) },
        { path: 'virtual-office', element: page('virtualOffice', VirtualOfficePage) },
        { path: 'coworking-spaces', element: page('coworking', CoworkingPage) },
        { path: 'meeting-rooms', element: page('meetingRooms', MeetingRoomsPage) },
        { path: 'locations', element: page('locations', LocationsPage) },
        { path: 'pricing', element: page('pricing', PricingPage) },
        { path: 'company-registration', element: page('companyRegistration', CompanyRegistrationPage) },
        { path: 'portal', element: page('portal', PortalPage) },
        { path: 'admin', element: page('admin', AdminPage) },
        { path: 'contact', element: page('contact', ContactPage) },
        ...legacyRedirects,
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
