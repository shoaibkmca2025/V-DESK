import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';
import { saveQuote, setQuoteStatus } from './quoteStore.js';

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

  saveQuote({
    ref: quoteId,
    status: 'SENT',
    product: customData.product || 'Virtual Office Platform',
    purpose: customData.purpose || 'GST Registration',
    tenure: customData.tenure || '12 Months',
    rateMonth: customData.rateMonth || 1249,
    name: customData.name || 'Priya Kulkarni',
    company: customData.company || 'Zenith D2C Brands Pvt Ltd',
    createdAt: new Date().toISOString(),
  });
  openActiveModal('quoteProposalModal');
  trackSearchEvent('quote_started', { quoteId });
}

export function copyQuoteLink() {
  const qId = document.getElementById('propQuoteId')?.textContent || 'VDQ-2026';
  const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/quote/${qId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Quote Link Copied!', 'Shareable digital proposal URL copied to clipboard.', 'success');
  });
}

export function proceedQuoteToPayment() {
  const ref = document.getElementById('propQuoteId')?.textContent;
  if (ref) setQuoteStatus(ref, 'ACCEPTED');
  closeModal('quoteProposalModal');
  openCheckoutModal({
    item: 'Official V-DESK Infrastructure Setup',
    amount: 21499,
  });
}
