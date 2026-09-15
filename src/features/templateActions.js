import { advanceLeadStatus, exportLeadsToCSV, updateLeadStatus } from '@/features/admin/leadActions.js';
import { switchAdminTab, switchStandaloneAdminTab } from '@/features/admin/adminSuite.js';
import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { openTaxInvoiceModal } from '@/features/checkout/taxInvoice.js';
import { executePaletteItem } from '@/features/commandPalette/commandPalette.js';
import { resetDiscoveryFilters } from '@/features/discovery/discoveryEngine.js';
import { openDigitalKycModal } from '@/features/kyc/kyc.js';
import { clearLocationSearch } from '@/features/locations/locationExplorer.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { handleExplorerCardAction } from '@/features/search/universalSearch.js';
import { copyToClipboard } from '@/features/ui/clipboard.js';
import { showToast } from '@/features/ui/toast.js';
import { registerActions } from '@/lib/actions.js';

/** Actions reachable from HTML-string widgets via `data-action` / `data-change-action`. */
export function registerTemplateActions() {
  registerActions({
    advanceLeadStatus,
    clearLocationSearch,
    copyToClipboard,
    executePaletteItem,
    exportLeadsToCSV,
    handleExplorerCardAction,
    openCheckoutModal,
    openDigitalKycModal,
    openExternal: (url) => window.open(url, '_blank'),
    openMeetingBookingModal,
    openQuoteModal,
    openTaxInvoiceModal,
    resetDiscoveryFilters,
    showToast,
    switchAdminTab,
    switchStandaloneAdminTab,
    updateLeadStatus,
  });
}
