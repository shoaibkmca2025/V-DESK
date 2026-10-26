import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { LEGACY_FILE_ROUTES } from '@/config/pages.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import HomePage from '@/pages/home/HomePage.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';
import RootLayout from './RootLayout.jsx';


/*
 * Only the home page ships in the first bundle; every other page is fetched when it is first
 * opened, so a visitor landing on the home page does not download the admin console, the
 * checkout and twenty other screens before anything appears.
 */
const AdminPage = lazy(() => import('@/pages/admin/AdminPage.jsx'));
const AuthPage = lazy(() => import('@/pages/account/AuthPage.jsx'));
const BookingsPage = lazy(() => import('@/pages/account/BookingsPage.jsx'));
const CheckoutPage = lazy(() => import('@/pages/account/CheckoutPage.jsx'));
const CityPage = lazy(() => import('@/pages/locations/CityPage.jsx'));
const CityProductPage = lazy(() => import('@/pages/locations/CityProductPage.jsx'));
const CityWorkspacesPage = lazy(() => import('@/pages/workspaces/CityWorkspacesPage.jsx'));
const CompanyRegistrationPage = lazy(() => import('@/pages/company-registration/CompanyRegistrationPage.jsx'));
const ContactPage = lazy(() => import('@/pages/contact/ContactPage.jsx'));
const CoworkingPage = lazy(() => import('@/pages/coworking/CoworkingPage.jsx'));
const FaqsPage = lazy(() => import('@/pages/resources/FaqsPage.jsx'));
const GuidePage = lazy(() => import('@/pages/resources/GuidePage.jsx'));
const KycPage = lazy(() => import('@/pages/account/KycPage.jsx'));
const LegalPage = lazy(() => import('@/pages/legal/LegalPage.jsx'));
const LocationsPage = lazy(() => import('@/pages/locations/LocationsPage.jsx'));
const MeetingRoomsPage = lazy(() => import('@/pages/meeting-rooms/MeetingRoomsPage.jsx'));
const PortalPage = lazy(() => import('@/pages/portal/PortalPage.jsx'));
const PricingPage = lazy(() => import('@/pages/pricing/PricingPage.jsx'));
const QuotePage = lazy(() => import('@/pages/account/QuotePage.jsx'));
const ResourcesPage = lazy(() => import('@/pages/resources/ResourcesPage.jsx'));
const SearchResultsPage = lazy(() => import('@/pages/search/SearchResultsPage.jsx'));
const ServicePage = lazy(() => import('@/pages/services/ServicePage.jsx'));
const ServicesPage = lazy(() => import('@/pages/services/ServicesPage.jsx'));
const VirtualOfficePage = lazy(() => import('@/pages/virtual-office/VirtualOfficePage.jsx'));

/** Shown only while a route's code is still arriving — usually a frame or two. */
const RouteFallback = () => <div className="ui-route-loading" role="status" aria-live="polite">Loading…</div>;

/** Wraps a lazily-loaded page so React has something to show while it downloads. */
const lazyPage = (element) => <Suspense fallback={<RouteFallback />}>{element}</Suspense>;

/** Static page: layout + component. Dynamic pages (services/:slug, locations/:city, …) render their own SiteLayout with computed meta. */
const page = (key, Component, props) => (
  <SiteLayout page={key}>
    <Suspense fallback={<RouteFallback />}>
      <Component {...props} />
    </Suspense>
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
        { path: 'services/:slug', element: lazyPage(<ServicePage />) },
        { path: 'locations', element: page('locations', LocationsPage) },
        { path: 'locations/:city', element: lazyPage(<CityPage />) },
        { path: 'locations/:city/:product', element: lazyPage(<CityProductPage />) },
        { path: 'workspaces/:city', element: lazyPage(<CityWorkspacesPage />) },
        { path: 'workspaces', element: <Navigate to="/coworking-spaces" replace /> },

        // Discovery & resources
        { path: 'search', element: page('search', SearchResultsPage) },
        { path: 'resources', element: page('resources', ResourcesPage) },
        { path: 'resources/:slug', element: lazyPage(<GuidePage />) },
        { path: 'faqs', element: page('faqs', FaqsPage) },
        { path: 'legal/:doc', element: lazyPage(<LegalPage />) },
        { path: 'privacy', element: <Navigate to="/legal/privacy" replace /> },
        { path: 'terms', element: <Navigate to="/legal/terms" replace /> },

        // Account & transaction flows
        { path: 'login', element: page('login', AuthPage, { mode: 'login' }) },
        { path: 'register', element: page('register', AuthPage, { mode: 'register' }) },
        { path: 'kyc', element: page('kyc', KycPage) },
        { path: 'checkout', element: page('checkout', CheckoutPage) },
        { path: 'bookings', element: page('bookings', BookingsPage) },
        { path: 'quote/:ref', element: lazyPage(<QuotePage />) },
        { path: 'portal', element: page('portal', PortalPage) },
        { path: 'admin', element: page('admin', AdminPage) },

        ...legacyRedirects,
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
