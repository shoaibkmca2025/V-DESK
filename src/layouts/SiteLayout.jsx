import FloatingContactWidget from '@/components/layout/FloatingContactWidget.jsx';
import MobileAppBottomDock from '@/components/layout/MobileAppBottomDock.jsx';
import MobileDrawer from '@/components/layout/MobileDrawer.jsx';
import MobileStickyDock from '@/components/layout/MobileStickyDock.jsx';
import PwaInstallBanner from '@/components/layout/PwaInstallBanner.jsx';
import ScrollProgressBar from '@/components/layout/ScrollProgressBar.jsx';
import ScrollTopButton from '@/components/layout/ScrollTopButton.jsx';
import SiteFooter from '@/components/layout/SiteFooter.jsx';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import ToastContainer from '@/components/layout/ToastContainer.jsx';
import TopUtilityBar from '@/components/layout/TopUtilityBar.jsx';
import AdminModal from '@/components/modals/AdminModal.jsx';
import AdminSuiteModal from '@/components/modals/AdminSuiteModal.jsx';
import AllLocationsModal from '@/components/modals/AllLocationsModal.jsx';
import CommandPaletteModal from '@/components/modals/CommandPaletteModal.jsx';
import CompanyRegModal from '@/components/modals/CompanyRegModal.jsx';
import CustomerPortalModal from '@/components/modals/CustomerPortalModal.jsx';
import DigitalKycModal from '@/components/modals/DigitalKycModal.jsx';
import EnterpriseSuiteModal from '@/components/modals/EnterpriseSuiteModal.jsx';
import LegalModal from '@/components/modals/LegalModal.jsx';
import MeetingRoomBookingModal from '@/components/modals/MeetingRoomBookingModal.jsx';
import PaymentCheckoutModal from '@/components/modals/PaymentCheckoutModal.jsx';
import QuoteModal from '@/components/modals/QuoteModal.jsx';
import QuoteProposalModal from '@/components/modals/QuoteProposalModal.jsx';
import TaxInvoiceModal from '@/components/modals/TaxInvoiceModal.jsx';
import UniversalSearchResultsModal from '@/components/modals/UniversalSearchResultsModal.jsx';
import { usePageDocument } from '@/hooks/usePageDocument.js';
import { usePageRuntime } from '@/hooks/usePageRuntime.js';

/** Lead capture dialogs, floating contact actions and the toast stack. */
function EngagementLayer() {
  return (
    <>
      <QuoteModal />
      <AdminModal />
      <LegalModal />
      <CommandPaletteModal />
      <AllLocationsModal />
      <FloatingContactWidget />
      <MobileStickyDock />
      <ScrollTopButton />
      <ToastContainer />
    </>
  );
}

/** Transaction platform dialogs (search, booking, KYC, quotes, checkout, portal, admin) and the mobile dock. */
function PlatformLayer() {
  return (
    <>
      <UniversalSearchResultsModal />
      <MeetingRoomBookingModal />
      <CustomerPortalModal />
      <DigitalKycModal />
      <QuoteProposalModal />
      <PaymentCheckoutModal />
      <CompanyRegModal />
      <AdminSuiteModal />
      <MobileAppBottomDock />
    </>
  );
}

/**
 * Shared page frame: header, drawer, footer and all global dialogs.
 * Overlay stacking follows DOM order, so the homepage keeps its original layer order.
 */
export default function SiteLayout({ page, children }) {
  usePageDocument(page);
  usePageRuntime(page);

  const isHome = page === 'home';

  return (
    <>
      <ScrollProgressBar />
      <TopUtilityBar />
      <SiteHeader page={page} />
      <MobileDrawer page={page} />
      {children}
      <SiteFooter page={page} />
      {isHome ? (
        <>
          <EngagementLayer />
          <PlatformLayer />
        </>
      ) : (
        <>
          <PlatformLayer />
          <EngagementLayer />
        </>
      )}
      <TaxInvoiceModal />
      <EnterpriseSuiteModal />
      <PwaInstallBanner />
    </>
  );
}
