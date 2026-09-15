import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';

/* Digital quote proposals (PRD §41). */

export function openQuoteProposalModal(customData = {}) {
  const modal = document.getElementById('quoteProposalModal');
  if (!modal) return;

  const quoteId = 'VDQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('propQuoteId', quoteId);
  setText('propDate', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
  if (customData.name) setText('propClientName', customData.name);
  if (customData.company) setText('propClientCompany', customData.company);

  openActiveModal('quoteProposalModal');
  trackSearchEvent('quote_started', { quoteId });
}

export function copyQuoteLink() {
  const qId = document.getElementById('propQuoteId')?.textContent || 'VDQ-2026';
  const url = `${window.location.origin}/#quote?ref=${qId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Quote Link Copied!', 'Shareable digital proposal URL copied to clipboard.', 'success');
  });
}

export function proceedQuoteToPayment() {
  closeModal('quoteProposalModal');
  openCheckoutModal({
    item: 'Official V-DESK Infrastructure Setup',
    amount: 21499,
  });
}
