import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { googleSignInMessage, isGoogleSignInAvailable, mountGoogleSignIn } from '@/features/auth/googleSignIn.js';
import { getCustomer, restoreSession } from '@/features/auth/session.js';
import { claimBooking } from '@/features/bookings/bookingApi.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';
import { isApiEnabled } from '@/lib/api.js';
import { openTaxInvoiceModal } from './taxInvoice.js';

/*
 * Unified checkout (PRD §48). Payments are simulated in the UI — "test mode, no money is taken" — until a gateway
 * (Razorpay / Cashfree) is connected.
 *
 * Paying is the one step that needs an account (ADR-012): the dialog asks the visitor to continue with Google
 * first, and a held meeting room (`data.bookingRef`) is then put in their name on the API so it shows in their
 * bookings. A build with no API keeps its local demo checkout without a sign-in.
 */

const DEFAULT_AMOUNT = 21499;
const PAY_METHODS = ['upi', 'card', 'netbanking'];

let activeCheckoutData = null;
let payer = null;

const byId = (id) => document.getElementById(id);
const setText = (id, text) => {
  const el = byId(id);
  if (el) el.textContent = text;
};
const show = (id, visible) => {
  const el = byId(id);
  if (el) el.style.display = visible ? '' : 'none';
};

export function switchPayMethod(method) {
  const panes = { upi: 'payMethodUpi', card: 'payMethodCard', netbanking: 'payMethodNetbanking' };
  for (const [key, id] of Object.entries(panes)) {
    const pane = byId(id);
    if (pane) pane.style.display = method === key ? 'block' : 'none';
  }

  document.querySelectorAll('.checkout-tabs .pay-tab').forEach((tab, i) => {
    tab.classList.toggle('active', PAY_METHODS[i] === method);
  });
}

/** Payment options for a known payer (or the no-API demo); the Google button for everyone else. */
function showPaymentStep(customer) {
  payer = customer ?? null;
  show('chkSignInGate', false);
  show('chkPayMethods', true);
  setText('chkPayer', customer ? `Paying as ${customer.name}${customer.email ? ` · ${customer.email}` : ''}` : '');
}

/** What to do when a held room cannot be put in this customer's name. */
function explainClaim(error) {
  switch (error.code) {
    case 'HOLD_EXPIRED':
      return 'The 10-minute hold on this room ran out, so it was released. Please choose the slot again.';
    case 'BOOKING_ALREADY_CLAIMED':
      return 'This booking already belongs to another account.';
    case 'BOOKING_NOT_HELD':
      return 'This booking is no longer on hold. Please choose the slot again.';
    default:
      return null;
  }
}

/** Signed in: attach the held room (if any) to the account, then show the payment options. */
async function readyToPay(customer, data) {
  if (data?.bookingRef) {
    try {
      await claimBooking(data.bookingRef);
    } catch (error) {
      const message = explainClaim(error);
      if (message) {
        if (data === activeCheckoutData) closeModal('paymentCheckoutModal');
        showToast('This room can’t be paid for', message, 'warning');
        return;
      }
      // Anything else (a network blip) must not stop the checkout; the booking ref still identifies it.
      console.warn('[V-DESK] booking not linked to the account:', error.code);
    }
  }
  if (data === activeCheckoutData) showPaymentStep(customer);
}

function showSignInGate(data) {
  show('chkPayMethods', false);
  show('chkSignInGate', true);
  setText('chkGateStatus', '');
  const container = byId('chkGoogleButton');
  if (!container) return;

  if (!isGoogleSignInAvailable()) {
    container.replaceChildren();
    setText(
      'chkGateStatus',
      'Google sign-in is not switched on for this site yet, so payment is not available online. Please call or WhatsApp us to complete your booking.',
    );
    return;
  }
  setText('chkGateStatus', 'Loading Google sign-in…');
  mountGoogleSignIn(container, {
    onBusy: (busy) => setText('chkGateStatus', busy ? 'Signing you in…' : ''),
    onSignedIn: (customer) => {
      showToast('Signed in ✓', `Welcome, ${customer.name}.`, 'success');
      readyToPay(customer, data);
    },
    onError: (error) => setText('chkGateStatus', googleSignInMessage(error)),
  })
    .then(() => setText('chkGateStatus', ''))
    .catch((error) => setText('chkGateStatus', error.message));
}

export function openCheckoutModal(data = {}) {
  activeCheckoutData = data;
  payer = null;
  const modal = byId('paymentCheckoutModal');
  if (!modal) return;

  const amount = data.amount || DEFAULT_AMOUNT;
  const base = Math.round(amount / 1.18);
  const gst = amount - base;

  setText('chkProductName', data.item || 'Virtual Office Package');
  setText('chkSubtotal', `₹${base.toLocaleString('en-IN')}`);
  setText('chkGst', `₹${gst.toLocaleString('en-IN')}`);
  setText('chkTotal', `₹${amount.toLocaleString('en-IN')}`);

  switchPayMethod('upi');
  if (!isApiEnabled()) {
    showPaymentStep(null);
  } else if (getCustomer()) {
    show('chkSignInGate', false);
    show('chkPayMethods', false);
    readyToPay(getCustomer(), data);
  } else {
    // A fresh tab may still have a valid sign-in cookie; ask before showing the button.
    show('chkPayMethods', false);
    restoreSession().then((customer) => {
      if (data !== activeCheckoutData) return;
      if (customer) readyToPay(customer, data);
      else showSignInGate(data);
    });
  }
  openActiveModal('paymentCheckoutModal');
  trackSearchEvent('checkout_started', { amount });
}

export function simulatePaymentProcessing(methodLabel) {
  if (isApiEnabled() && !payer) {
    showToast('Sign in to pay', 'Continue with Google first — it takes a few seconds.', 'info');
    return;
  }
  showToast('Processing test payment…', `Simulating ${methodLabel} — no money is taken.`, 'info');

  setTimeout(() => {
    closeModal('paymentCheckoutModal');
    showToast('Test payment complete ✓', 'No money was taken. Your GST invoice preview is ready.', 'success');
    trackSearchEvent('payment_success', { method: methodLabel, amount: activeCheckoutData?.amount });

    const invoiceData = {
      invoiceNo: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      name: activeCheckoutData?.customerName || payer?.name || 'Guest',
      company: activeCheckoutData?.company || payer?.company || '',
      email: activeCheckoutData?.email || payer?.email || '',
      city: activeCheckoutData?.city || 'Mumbai (BKC)',
      item: activeCheckoutData?.item || 'Virtual Office for GST Registration (12-Mo Plan)',
      amount: activeCheckoutData?.amount || DEFAULT_AMOUNT,
    };

    setTimeout(() => openTaxInvoiceModal(invoiceData), 700);

    if (typeof activeCheckoutData?.onSuccess === 'function') activeCheckoutData.onSuccess();
  }, 1200);
}
