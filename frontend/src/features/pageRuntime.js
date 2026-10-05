import { switchStandaloneAdminTab } from '@/features/admin/adminSuite.js';
import { renderAdminLeads } from '@/features/admin/adminLeadsTable.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { initCommandPalette } from '@/features/commandPalette/commandPalette.js';
import { resetCompanyRegistrationState } from '@/features/companyRegistration/companyRegistration.js';
import { filterDiscoveryEngine } from '@/features/discovery/discoveryEngine.js';
import { resetEnterpriseState } from '@/features/enterprise/enterpriseSuite.js';
import { resetKycState } from '@/features/kyc/kyc.js';
import { initAccessibility } from '@/features/layout/accessibility.js';
import { initFooterInteractions } from '@/features/layout/footer.js';
import { initHeader } from '@/features/layout/header.js';
import { initMobileDrawer } from '@/features/layout/mobileDrawer.js';
import { initNavigation } from '@/features/layout/navigation.js';
import {
  initMobileStickyBar,
  initScrollChrome,
  initScrollProgressAndFab,
  initScrollProgressBar,
} from '@/features/layout/scrollProgress.js';
import { renderLocations } from '@/features/locations/locationExplorer.js';
import { renderMarketplaceGrid, resetMarketplaceState } from '@/features/marketplace/marketplace.js';
import { resetRoomBookingState } from '@/features/meetingRooms/roomBooking.js';
import { initMetricCounters, initRevealObserver, initScrollAnimations } from '@/features/motion/reveal.js';
import { initCardSpotlight, initSpotlightCards } from '@/features/motion/spotlight.js';
import { switchPortalPageTab } from '@/features/portal/customerPortal.js';
import { runCostCalculation } from '@/features/pricing/costCalculator.js';
import { resetSearchState } from '@/features/search/universalSearch.js';
import { initTestimonials } from '@/features/testimonials/testimonials.js';
import { resetVoConfigState } from '@/features/virtualOffice/voConfigurator.js';
import { initWizard, resetWizardState } from '@/features/wizard/setupWizard.js';

/** Widget state starts fresh on every page, exactly like a full page load. */
function resetWidgetState() {
  resetWizardState();
  resetVoConfigState();
  resetRoomBookingState();
  resetSearchState();
  resetEnterpriseState();
  resetMarketplaceState();
  resetCompanyRegistrationState();
  resetKycState();
}

/**
 * Initialises the interactive behaviour of the page that was just rendered.
 * Must run inside an active page scope (see lib/pageScope.js).
 *
 * The call order matters: several initialisers write to the same elements on scroll
 * (progress bar, back-to-top button, reveal classes), so it mirrors the order in which
 * the original site wired them up.
 */
export function initPageRuntime() {
  resetWidgetState();

  // Scroll chrome and reveal tagging
  initScrollChrome();
  initRevealObserver();

  // Core interactions
  initHeader();
  initScrollAnimations();
  initNavigation();
  initScrollProgressAndFab();
  initCardSpotlight();
  initAccessibility();
  renderLocations(catalog.locations);
  filterDiscoveryEngine();
  runCostCalculation();
  initTestimonials();
  initMobileDrawer();
  renderAdminLeads();

  // Footer, micro-interactions and shortcuts
  initFooterInteractions();
  initScrollProgressBar();
  initSpotlightCards();
  initMetricCounters();
  initCommandPalette();
  initMobileStickyBar();
  initWizard();

  // Standalone pages
  renderMarketplaceGrid();
  if (document.getElementById('portalTabContentBody')) switchPortalPageTab('activeServices');
  if (document.getElementById('standaloneAdminTabBody')) switchStandaloneAdminTab('dashboard');
}
