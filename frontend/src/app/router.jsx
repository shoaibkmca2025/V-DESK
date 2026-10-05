import { createBrowserRouter, Navigate } from 'react-router';
import { LEGACY_FILE_ROUTES } from '@/config/pages.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import AuthPage from '@/pages/account/AuthPage.jsx';
import BookingsPage from '@/pages/account/BookingsPage.jsx';
import CheckoutPage from '@/pages/account/CheckoutPage.jsx';
import KycPage from '@/pages/account/KycPage.jsx';
import QuotePage from '@/pages/account/QuotePage.jsx';
import AdminPage from '@/pages/admin/AdminPage.jsx';
import CompanyRegistrationPage from '@/pages/company-registration/CompanyRegistrationPage.jsx';
import ContactPage from '@/pages/contact/ContactPage.jsx';
import CoworkingPage from '@/pages/coworking/CoworkingPage.jsx';
import HomePage from '@/pages/home/HomePage.jsx';
import LegalPage from '@/pages/legal/LegalPage.jsx';
import CityPage from '@/pages/locations/CityPage.jsx';
import CityProductPage from '@/pages/locations/CityProductPage.jsx';
import LocationsPage from '@/pages/locations/LocationsPage.jsx';
import MeetingRoomsPage from '@/pages/meeting-rooms/MeetingRoomsPage.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';
import PortalPage from '@/pages/portal/PortalPage.jsx';
import PricingPage from '@/pages/pricing/PricingPage.jsx';
import FaqsPage from '@/pages/resources/FaqsPage.jsx';
import GuidePage from '@/pages/resources/GuidePage.jsx';
import ResourcesPage from '@/pages/resources/ResourcesPage.jsx';
import SearchResultsPage from '@/pages/search/SearchResultsPage.jsx';
import ServicePage from '@/pages/services/ServicePage.jsx';
import ServicesPage from '@/pages/services/ServicesPage.jsx';
import VirtualOfficePage from '@/pages/virtual-office/VirtualOfficePage.jsx';
import CityWorkspacesPage from '@/pages/workspaces/CityWorkspacesPage.jsx';
import RootLayout from './RootLayout.jsx';

/** Static page: layout + component. Dynamic pages (services/:slug, locations/:city, …) render their own SiteLayout with computed meta. */
const page = (key, Component, props) => (
  <SiteLayout page={key}>
    <Component {...props} />
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

        // Core product pages
        { path: 'virtual-office', element: page('virtualOffice', VirtualOfficePage) },
        { path: 'coworking-spaces', element: page('coworking', CoworkingPage) },
        { path: 'meeting-rooms', element: page('meetingRooms', MeetingRoomsPage) },
        { path: 'pricing', element: page('pricing', PricingPage) },
        { path: 'company-registration', element: page('companyRegistration', CompanyRegistrationPage) },
        { path: 'contact', element: page('contact', ContactPage) },

        // SEO architecture (PRD §57)
        { path: 'services', element: page('services', ServicesPage) },
        { path: 'services/:slug', element: <ServicePage /> },
        { path: 'locations', element: page('locations', LocationsPage) },
        { path: 'locations/:city', element: <CityPage /> },
        { path: 'locations/:city/:product', element: <CityProductPage /> },
        { path: 'workspaces/:city', element: <CityWorkspacesPage /> },
        { path: 'workspaces', element: <Navigate to="/coworking-spaces" replace /> },

        // Discovery & resources
        { path: 'search', element: page('search', SearchResultsPage) },
        { path: 'resources', element: page('resources', ResourcesPage) },
        { path: 'resources/:slug', element: <GuidePage /> },
        { path: 'faqs', element: page('faqs', FaqsPage) },
        { path: 'legal/:doc', element: <LegalPage /> },
        { path: 'privacy', element: <Navigate to="/legal/privacy" replace /> },
        { path: 'terms', element: <Navigate to="/legal/terms" replace /> },

        // Account & transaction flows
        { path: 'login', element: page('login', AuthPage, { mode: 'login' }) },
        { path: 'register', element: page('register', AuthPage, { mode: 'register' }) },
        { path: 'kyc', element: page('kyc', KycPage) },
        { path: 'checkout', element: page('checkout', CheckoutPage) },
        { path: 'bookings', element: page('bookings', BookingsPage) },
        { path: 'quote/:ref', element: <QuotePage /> },
        { path: 'portal', element: page('portal', PortalPage) },
        { path: 'admin', element: page('admin', AdminPage) },

        ...legacyRedirects,
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
