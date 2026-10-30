import { GST_RATE } from '@/data/constants.js';
import { getCustomer, restoreSession, signInPath } from '@/features/auth/session.js';
import { addBooking } from '@/features/bookings/bookingStore.js';
import { holdBooking } from '@/features/bookings/bookingApi.js';
import { liveCentreRef } from '@/features/catalog/catalogApi.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';
import { onPageExit } from '@/lib/pageScope.js';

/*
 * Meeting room scheduler (PRD §34–35).
 * Booking state machine: available → hold (10 min lock) → confirmed (after payment).
 *
 * A hold takes a real room out of circulation, so it belongs to an account: the visitor signs in first, and
 * the name, number and email on the booking are the ones on that account (the API will not take them from
 * the request). Only the company the booking is for is asked here.
 */

const HOLD_SECONDS = 599;

function createBooking() {
  return {
    ref: null,
    hub: 'Nashik HQ — College Road',
    room: 'Conference Room (8 Pax)',
    rateHour: 799,
    date: 'Today',
    slot: '02:00 PM - 04:00 PM',
    duration: 2,
    attendees: 6,
    totalAmount: 1885,
    state: 'available',
    customer: null,
  };
}

let activeRoomBooking = createBooking();
let holdCountdownTimer = null;

export function resetRoomBookingState() {
  clearInterval(holdCountdownTimer);
  activeRoomBooking = createBooking();
}

export function handleMrCityChange() {
  const select = document.getElementById('mrCitySelect');
  if (select) activeRoomBooking.hub = select.options[select.selectedIndex].text;
  calculateMrPrice();
}

export function calculateMrPrice() {
  const roomSelect = document.getElementById('mrRoomTypeSelect');
  const durationSelect = document.getElementById('mrDurationSelect');
  const timeSelect = document.getElementById('mrTimeSlotSelect');
  const dateInput = document.getElementById('mrDateInput');
  const attendeesInput = document.getElementById('mrAttendeesInput');

  if (roomSelect) {
    activeRoomBooking.room = roomSelect.value;
    activeRoomBooking.rateHour = parseInt(roomSelect.options[roomSelect.selectedIndex].getAttribute('data-rate'), 10) || 799;
  }
  if (durationSelect) activeRoomBooking.duration = parseInt(durationSelect.value, 10) || 2;
  if (timeSelect) activeRoomBooking.slot = timeSelect.value;
  if (dateInput && dateInput.value) activeRoomBooking.date = dateInput.value;
  if (attendeesInput) activeRoomBooking.attendees = parseInt(attendeesInput.value, 10) || 6;

  const { rateHour, duration } = activeRoomBooking;
  const discountMult = duration >= 8 ? 0.8 : duration >= 4 ? 0.9 : 1.0;
  const totalWithGst = Math.round(rateHour * duration * discountMult * (1 + GST_RATE));
  activeRoomBooking.totalAmount = totalWithGst;

  const rateCalcEl = document.getElementById('mrRateCalc');
  const finalCostEl = document.getElementById('mrFinalCost');
  if (rateCalcEl) rateCalcEl.textContent = `${duration} Hour${duration > 1 ? 's' : ''} × ₹${rateHour}/hr`;
  if (finalCostEl) finalCostEl.innerHTML = `₹${totalWithGst.toLocaleString('en-IN')} <small>(incl. 18% GST)</small>`;
}

function setBookingStep(step) {
  const panes = ['roomBookingStepSummary', 'roomBookingStepHold', 'roomBookingStepConfirmed'];
  panes.forEach((id, index) => {
    const pane = document.getElementById(id);
    if (pane) pane.style.display = step === index + 1 ? 'block' : 'none';
  });

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`bStep${i}`);
    if (el) {
      el.classList.toggle('active', i === step);
      el.classList.toggle('completed', i < step);
    }
  }
}

const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

/**
 * Shows either the booking form or the "sign in first" panel, and names the account the room will be held
 * for, so nobody fills in a form only to be turned away at the end.
 */
function renderAccount() {
  const customer = getCustomer();
  const form = document.getElementById('roomBookingUserForm');
  const prompt = document.getElementById('rbSignInRequired');
  if (form) form.style.display = customer ? 'block' : 'none';
  if (prompt) prompt.style.display = customer ? 'none' : 'block';
  if (!customer) return;

  setText('rbAccountName', customer.name);
  setText('rbAccountMeta', [customer.mobile && `+91 ${customer.mobile}`, customer.email].filter(Boolean).join(' · '));
  const company = document.getElementById('rbCompany');
  if (company && !company.value) company.value = customer.company ?? '';
}

/** Sends the visitor to sign in and back to the page they were booking from. */
export function goToSignIn() {
  closeModal('meetingRoomBookingModal');
  globalThis.location.assign(signInPath());
}

export function openMeetingBookingModal() {
  calculateMrPrice();
  const modal = document.getElementById('meetingRoomBookingModal');
  if (!modal) return;

  setText('rbSelectedRoom', activeRoomBooking.room);
  setText('rbSelectedHub', activeRoomBooking.hub);
  const slotEl = document.getElementById('rbSelectedSlot');
  if (slotEl) {
    slotEl.innerHTML = '<i class="ph-bold ph-clock"></i> ';
    slotEl.append(`${activeRoomBooking.date}, ${activeRoomBooking.slot} (${activeRoomBooking.duration}h)`);
  }
  setText('rbTotalPrice', `₹${activeRoomBooking.totalAmount.toLocaleString('en-IN')}`);

  setBookingStep(1);
  renderAccount();
  // A fresh tab may still have a valid refresh cookie, so the panel is drawn again once that is known.
  restoreSession().then(renderAccount);
  openActiveModal('meetingRoomBookingModal');
}

function startHoldCountdown() {
  let seconds = HOLD_SECONDS;
  const timerEl = document.getElementById('holdTimerCountdown');
  clearInterval(holdCountdownTimer);

  holdCountdownTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(holdCountdownTimer);
      cancelRoomBookingHold();
      showToast('Hold Expired', 'The room slot has been released.', 'error');
      return;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (timerEl) timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
  onPageExit(() => clearInterval(holdCountdownTimer));
}

/** '02:00 PM - 04:00 PM' → '14:00', which is what the API expects. */
function startHour24(slot) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(slot ?? '');
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * The date the booking is for, as YYYY-MM-DD. An untouched date field means the visitor never
 * chose one, so the scheduler's own default — the next day — is used, and the record is updated to
 * match so the pass, the confirmation and the server all name the same day.
 */
function bookingDate() {
  const value = document.getElementById('mrDateInput')?.value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return value;
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  activeRoomBooking.date = tomorrow;
  return tomorrow;
}

export function handleRoomBookingHold(e) {
  if (e) e.preventDefault();
  const customer = getCustomer();
  if (!customer) {
    showToast('Sign in to hold a room', 'Rooms are held against your account, so we need you signed in.', 'info');
    goToSignIn();
    return;
  }
  activeRoomBooking.customer = {
    name: customer.name,
    company: document.getElementById('rbCompany')?.value || customer.company || '',
    mobile: customer.mobile,
    email: customer.email,
  };
  activeRoomBooking.state = 'hold';
  activeRoomBooking.ref = 'BK-' + Date.now().toString(36).toUpperCase();

  setBookingStep(2);
  startHoldCountdown();
  showToast('Slot Held for 10 Minutes', 'Complete payment to confirm reservation.', 'info');
  holdOnServer();
}

/**
 * Mirrors the hold to the API, which is what actually locks the slot for everyone else. The UI has
 * already moved on: a server hold replaces the local ref, and a clash is reported honestly instead
 * of letting the visitor pay for a slot someone else took.
 */
function holdOnServer() {
  const centreRef = liveCentreRef(document.getElementById('mrCitySelect')?.value, catalog);
  const startTime = startHour24(activeRoomBooking.slot);
  if (!centreRef || !startTime) return;

  const { room, duration, attendees, customer } = activeRoomBooking;
  holdBooking({ centreRef, room, date: bookingDate(), startTime, duration, attendees, company: customer.company })
    .then((booking) => {
      if (booking?.ref) activeRoomBooking.ref = booking.ref;
    })
    .catch((error) => {
      if (error.code === 'SLOT_UNAVAILABLE') {
        cancelRoomBookingHold();
        showToast('That slot has just gone', error.message, 'warning');
        return;
      }
      if (error.status === 401) {
        // The session ran out between opening the form and submitting it.
        cancelRoomBookingHold();
        showToast('Please sign in again', 'Your session has expired, so the room was not held.', 'warning');
        goToSignIn();
        return;
      }
      if (error.status === 409 || error.status === 422 || error.status === 400) {
        // The room, centre or time was not acceptable — say what the server said rather than guess.
        cancelRoomBookingHold();
        showToast('That booking could not be held', error.message, 'warning');
        return;
      }
      console.warn('[V-DESK] booking not held on the API:', error.code);
    });
}

export function cancelRoomBookingHold() {
  clearInterval(holdCountdownTimer);
  activeRoomBooking.state = 'available';
  setBookingStep(1);
}

function openConfirmedBookingPass() {
  const modal = document.getElementById('meetingRoomBookingModal');
  if (!modal) return;

  const bookingId = activeRoomBooking.ref || 'BK-' + Date.now().toString(36).toUpperCase();
  activeRoomBooking.state = 'confirmed';
  /*
   * The hold stays a hold on the server: confirming is a staff action (bookings:write) and the
   * payment that should trigger it is still simulated in the browser. Calling it from here would
   * only ever get a 401, and the ten-minute hold would quietly expire behind a "confirmed" pass.
   */
  const { customer, ...record } = activeRoomBooking;
  addBooking({ ...record, ref: bookingId, host: customer?.name || 'Authorized Guest' });

  setText('passBookingId', bookingId);
  setText('passRoomName', activeRoomBooking.room);
  setText('passCentreName', activeRoomBooking.hub);
  setText('passHostName', activeRoomBooking.customer?.name || 'Authorized Guest');
  setText('passSlotTime', `${activeRoomBooking.date} • ${activeRoomBooking.slot}`);
  setText('passPax', `${activeRoomBooking.attendees} Pax`);

  setBookingStep(3);
  openActiveModal('meetingRoomBookingModal');
}

export function triggerBookingCheckout() {
  clearInterval(holdCountdownTimer);
  closeModal('meetingRoomBookingModal');
  openCheckoutModal({
    item: `${activeRoomBooking.room} Reservation`,
    hub: activeRoomBooking.hub,
    amount: activeRoomBooking.totalAmount,
    onSuccess: openConfirmedBookingPass,
  });
}
