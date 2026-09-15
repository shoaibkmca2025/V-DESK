import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';
import { openTaxInvoiceModal } from './taxInvoice.js';

/*
 * Unified checkout (PRD §48). Payments are simulated in the UI until a gateway (Razorpay / Cashfree) is connected.
 */

const DEFAULT_AMOUNT = 21499;
const PAY_METHODS = ['upi', 'card', 'netbanking'];

let activeCheckoutData = null;

export function switchPayMethod(method) {
  const panes = { upi: 'payMethodUpi', card: 'payMethodCard', netbanking: 'payMethodNetbanking' };
  for (const [key, id] of Object.entries(panes)) {
    const pane = document.getElementById(id);
    if (pane) pane.style.display = method === key ? 'block' : 'none';
  }

  document.querySelectorAll('.checkout-tabs .pay-tab').forEach((tab, i) => {
    tab.classList.toggle('active', PAY_METHODS[i] === method);
  });
}

export function openCheckoutModal(data = {}) {
  activeCheckoutData = data;
  const modal = document.getElementById('paymentCheckoutModal');
  if (!modal) return;

  const amount = data.amount || DEFAULT_AMOUNT;
  const base = Math.round(amount / 1.18);
  const gst = amount - base;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('chkProductName', data.item || 'Virtual Office Package');
  setText('chkSubtotal', `₹${base.toLocaleString('en-IN')}`);
  setText('chkGst', `₹${gst.toLocaleString('en-IN')}`);
  setText('chkTotal', `₹${amount.toLocaleString('en-IN')}`);

  switchPayMethod('upi');
  openActiveModal('paymentCheckoutModal');
  trackSearchEvent('checkout_started', { amount });
}

export function simulatePaymentProcessing(methodLabel) {
  showToast('Processing Payment...', `Verifying transaction via ${methodLabel}`, 'info');

  setTimeout(() => {
    closeModal('paymentCheckoutModal');
    showToast('Payment Successful! ✓', 'Click below to view your official GST Tax Invoice & NOC.', 'success');
    trackSearchEvent('payment_success', { method: methodLabel, amount: activeCheckoutData?.amount });

    const invoiceData = {
      invoiceNo: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      name: activeCheckoutData?.customerName || 'Priya Kulkarni',
      company: activeCheckoutData?.company || 'Zenith D2C Brands Pvt Ltd',
      email: activeCheckoutData?.email || 'priya@zenithd2c.com',
      city: activeCheckoutData?.city || 'Mumbai (BKC)',
      item: activeCheckoutData?.item || 'Virtual Office for GST Registration (12-Mo Plan)',
      amount: activeCheckoutData?.amount || DEFAULT_AMOUNT,
    };

    setTimeout(() => openTaxInvoiceModal(invoiceData), 700);

    if (typeof activeCheckoutData?.onSuccess === 'function') activeCheckoutData.onSuccess();
  }, 1200);
}
