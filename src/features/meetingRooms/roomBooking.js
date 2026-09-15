import { GST_RATE } from '@/data/constants.js';
import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';
import { onPageExit } from '@/lib/pageScope.js';

/*
 * Meeting room scheduler (PRD §34–35).
 * Booking state machine: available → hold (10 min lock) → confirmed (after payment).
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

export function openMeetingBookingModal() {
  calculateMrPrice();
  const modal = document.getElementById('meetingRoomBookingModal');
  if (!modal) return;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('rbSelectedRoom', activeRoomBooking.room);
  setText('rbSelectedHub', activeRoomBooking.hub);
  const slotEl = document.getElementById('rbSelectedSlot');
  if (slotEl) {
    slotEl.innerHTML = '<i class="ph-bold ph-clock"></i> ';
    slotEl.append(`${activeRoomBooking.date}, ${activeRoomBooking.slot} (${activeRoomBooking.duration}h)`);
  }
  setText('rbTotalPrice', `₹${activeRoomBooking.totalAmount.toLocaleString('en-IN')}`);

  setBookingStep(1);
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

export function handleRoomBookingHold(e) {
  if (e) e.preventDefault();
  const valueOf = (id, fallback) => document.getElementById(id)?.value || fallback;
  activeRoomBooking.customer = {
    name: valueOf('rbName', 'Guest User'),
    company: valueOf('rbCompany', 'Acme Enterprises'),
    mobile: valueOf('rbMobile', '9876543210'),
    email: valueOf('rbEmail', 'user@company.com'),
  };
  activeRoomBooking.state = 'hold';
  activeRoomBooking.ref = 'BK-' + Date.now().toString(36).toUpperCase();

  setBookingStep(2);
  startHoldCountdown();
  showToast('Slot Held for 10 Minutes', 'Complete payment to confirm reservation.', 'info');
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

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
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
