import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/router.jsx';
import { LEGACY_FILE_ROUTES } from '@/config/pages.js';

/*
 * A crash on any page is the worst bug this product can have: the visitor gets a blank screen and we
 * hear nothing. Lazy loading means a broken page only fails when someone opens it, and the build does
 * not catch it — it only checks that imports resolve, not that a page can render.
 *
 * So render each one, at a URL that matches its route, and fail on any throw. This is a smoke test, not
 * a check of what a page says.
 *
 * The last test keeps this list honest: it reads the real route table and fails if a route is neither
 * rendered here nor listed in SKIPPED with a reason. Add a route, and this test tells you.
 */

const PAGES = [
  ['home', '/', () => import('@/pages/home/HomePage.jsx'), '/'],
  ['virtual office', '/virtual-office', () => import('@/pages/virtual-office/VirtualOfficePage.jsx'), 'virtual-office'],
  ['coworking', '/coworking-spaces', () => import('@/pages/coworking/CoworkingPage.jsx'), 'coworking-spaces'],
  ['meeting rooms', '/meeting-rooms', () => import('@/pages/meeting-rooms/MeetingRoomsPage.jsx'), 'meeting-rooms'],
  ['pricing', '/pricing', () => import('@/pages/pricing/PricingPage.jsx'), 'pricing'],
  ['company registration', '/company-registration', () => import('@/pages/company-registration/CompanyRegistrationPage.jsx'), 'company-registration'],
  ['contact', '/contact', () => import('@/pages/contact/ContactPage.jsx'), 'contact'],
  ['list your space', '/list-your-space', () => import('@/pages/partners/ListYourSpacePage.jsx'), 'list-your-space'],
  ['services', '/services', () => import('@/pages/services/ServicesPage.jsx'), 'services'],
  ['service', '/services/gst-registration', () => import('@/pages/services/ServicePage.jsx'), 'services/:slug'],
  ['locations', '/locations', () => import('@/pages/locations/LocationsPage.jsx'), 'locations'],
  ['city', '/locations/mumbai', () => import('@/pages/locations/CityPage.jsx'), 'locations/:city'],
  ['city product', '/locations/mumbai/virtual-office', () => import('@/pages/locations/CityProductPage.jsx'), 'locations/:city/:product'],
  ['city workspaces', '/workspaces/mumbai', () => import('@/pages/workspaces/CityWorkspacesPage.jsx'), 'workspaces/:city'],
  ['resources', '/resources', () => import('@/pages/resources/ResourcesPage.jsx'), 'resources'],
  ['guide', '/resources/gst-registration-guide', () => import('@/pages/resources/GuidePage.jsx'), 'resources/:slug'],
  ['faqs', '/faqs', () => import('@/pages/resources/FaqsPage.jsx'), 'faqs'],
  ['legal', '/legal/privacy', () => import('@/pages/legal/LegalPage.jsx'), 'legal/:doc'],
  ['search', '/search?q=mumbai', () => import('@/pages/search/SearchResultsPage.jsx'), 'search'],
  ['not found', '/no-such-page', () => import('@/pages/not-found/NotFoundPage.jsx'), '*'],
];

/** Routes deliberately not rendered here, and why. */
const SKIPPED = {
  workspaces: 'redirect to /coworking-spaces',
  privacy: 'redirect to /legal/privacy',
  terms: 'redirect to /legal/terms',
  checkout: 'rendered in checkoutPage.test.jsx, both with and without a price',
  login: 'needs a signed-in customer',
  register: 'needs a signed-in customer',
  kyc: 'needs a signed-in customer',
  bookings: 'needs a signed-in customer',
  portal: 'needs a signed-in customer',
  'quote/:ref': 'needs a quote that exists',
  admin: 'needs a signed-in staff user',
};

describe('every public page renders', () => {
  it.each(PAGES)('%s', async (_name, url, load, routePath) => {
    const { default: Page } = await load();
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path={routePath} element={<Page />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(html).toMatch(/<(h1|h2|main|section)[\s>]/);
  });

  it('accounts for every route in the router', () => {
    const legacy = new Set(Object.keys(LEGACY_FILE_ROUTES));
    const covered = new Set(PAGES.map(([, , , routePath]) => routePath));
    const declared = routes[0].children
      .map((route) => (route.index ? '/' : route.path))
      .filter((path) => path && !legacy.has(path));

    const unaccounted = declared.filter((path) => !covered.has(path) && !(path in SKIPPED));
    expect(unaccounted, `add these to PAGES or to SKIPPED with a reason: ${unaccounted.join(', ')}`).toEqual([]);
  });
});
