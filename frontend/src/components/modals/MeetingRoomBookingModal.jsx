import {
  cancelRoomBookingHold,
  goToSignIn,
  handleRoomBookingHold,
  triggerBookingCheckout,
} from '@/features/meetingRooms/roomBooking.js';
import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';

/**
 * Meeting room booking flow (summary → hold → confirmed pass).
 *
 * Who is booking comes from the signed-in account, so this dialog shows that account rather than asking for
 * a name and number again; `roomBooking.js` fills `#rbAccount*` in and swaps the form for `#rbSignInRequired`
 * when nobody is signed in.
 */
export default function MeetingRoomBookingModal() {
  return (
    <div
      className="modal-overlay"
      id="meetingRoomBookingModal"
      onClick={(event) => closeModalOnBackdrop(event, 'meetingRoomBookingModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--room-booking" role="dialog" aria-modal="true">
        <div className="modal-card__header">
          <div className="legal-modal__title-wrap">
            <span className="legal-modal__badge">
              <i className="ph-bold ph-presentation" /> On-Demand Reservation
            </span>
            <h3 className="modal-card__title">Reserve Executive Meeting Room</h3>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('meetingRoomBookingModal')}>
            ×
          </button>
        </div>
        <div className="booking-state-stepper" id="bookingStateStepper">
          <div className="state-step active" id="bStep1">
            <span>1</span>Availability
          </div>
          <div className="state-step-arrow">→</div>
          <div className="state-step" id="bStep2">
            <span>2</span>Room Hold
          </div>
          <div className="state-step-arrow">→</div>
          <div className="state-step" id="bStep3">
            <span>3</span>Payment
          </div>
          <div className="state-step-arrow">→</div>
          <div className="state-step" id="bStep4">
            <span>4</span>Confirmed
          </div>
        </div>
        <div className="room-booking-body" id="roomBookingBody">
          <div id="roomBookingStepSummary">
            <div className="room-summary-banner">
              <div className="room-summary-meta">
                <strong id="rbSelectedRoom">Executive Conference Room (8 Pax)</strong>{' '}
                <span id="rbSelectedHub">V-DESK HQ — College Road, Nashik</span>
                <div className="rb-slot-pill" id="rbSelectedSlot">
                  <i className="ph-bold ph-clock" /> Today, 02:00 PM – 04:00 PM (2 Hours)
                </div>
              </div>
              <div className="room-summary-price">
                <span className="price-val" id="rbTotalPrice">
                  ₹1,885
                </span>{' '}
                <span className="price-gst">Includes 18% GST</span>
              </div>
            </div>
            <div className="rb-signin" id="rbSignInRequired" style={{ display: 'none', marginTop: '18px' }}>
              <div className="rb-signin__icon">
                <i className="ph-bold ph-lock-key" />
              </div>
              <h4>Sign in to hold this room</h4>
              <p>
                Rooms are held against your V-DESK account for ten minutes, so we need to know who the booking
                is for. It takes one OTP.
              </p>
              <button type="button" className="btn btn--primary btn--block btn--lg" onClick={() => goToSignIn()}>
                <i className="ph-bold ph-sign-in" />
                Sign in or register →
              </button>
            </div>
            <form
              id="roomBookingUserForm"
              onSubmit={(event) => handleRoomBookingHold(event)}
              style={{ marginTop: '18px', display: 'none' }}
            >
              <div className="rb-account">
                <div className="rb-account__avatar">
                  <i className="ph-bold ph-user-circle" />
                </div>
                <div className="rb-account__who">
                  <span className="rb-account__label">Booking as</span>
                  <strong id="rbAccountName">Your account</strong>
                  <span className="rb-account__meta" id="rbAccountMeta" />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="rbCompany">
                  Company / Organization this booking is for
                </label>
                <input type="text" id="rbCompany" className="form-input" placeholder="e.g. Acme Innovations" />
              </div>
              <div className="room-amenities-check">
                <span>
                  <i className="ph-bold ph-wifi-high" /> High-Speed Wi-Fi (300 Mbps)
                </span>{' '}
                <span>
                  <i className="ph-bold ph-monitor" /> 4K Presentation Display
                </span>{' '}
                <span>
                  <i className="ph-bold ph-coffee" /> Executive Coffee/Tea
                </span>{' '}
                <span>
                  <i className="ph-bold ph-chalkboard" /> Glass Whiteboard
                </span>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn--primary btn--block btn--lg">
                  <i className="ph-bold ph-lock-key" />
                  Lock Slot & Proceed to Pay →
                </button>
              </div>
            </form>
          </div>
          <div id="roomBookingStepHold" style={{ display: 'none' }}>
            <div className="hold-timer-card">
              <div className="hold-timer-circle">
                <span id="holdTimerCountdown">09:59</span>
                <small>Hold Active</small>
              </div>
              <h4>Your Room Slot is Temporarily Locked</h4>
              <p>We have placed a 10-minute hold on this room to prevent double-booking while you complete payment.</p>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn--primary btn--block btn--lg"
                onClick={() => triggerBookingCheckout()}
              >
                <i className="ph-bold ph-credit-card" />
                Pay Now (₹1,885) →
              </button>{' '}
              <button
                type="button"
                className="btn btn--outline btn--block"
                style={{ marginTop: '8px' }}
                onClick={() => cancelRoomBookingHold()}
              >
                Release Slot
              </button>
            </div>
          </div>
          <div id="roomBookingStepConfirmed" style={{ display: 'none' }}>
            <div className="booking-confirmation-pass">
              <div className="pass-header">
                <span className="pass-status">
                  <i className="ph-bold ph-check-circle" /> BOOKING CONFIRMED
                </span>{' '}
                <span className="pass-code" id="passBookingId">
                  BK-2026-9812
                </span>
              </div>
              <div className="pass-body">
                <h4 id="passRoomName">Executive Conference Room (8 Pax)</h4>
                <p id="passCentreName">V-DESK Headquarters — College Road, Nashik</p>
                <div className="pass-grid">
                  <div>
                    <strong>Host:</strong> <span id="passHostName">Vikramaditya Roy</span>
                  </div>
                  <div>
                    <strong>Date & Time:</strong> <span id="passSlotTime">18 Sep • 02:00 PM</span>
                  </div>
                  <div>
                    <strong>Attendees:</strong> <span id="passPax">6 Pax</span>
                  </div>
                  <div>
                    <strong>Wi-Fi Passcode:</strong> <code>VDESK-VIP-2026</code>
                  </div>
                </div>
              </div>
              <div className="pass-actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => window.print()}>
                  <i className="ph-bold ph-printer" />
                  Print Pass
                </button>{' '}
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => {
                    closeModal('meetingRoomBookingModal');
                    showToast('Booking Pass Saved', 'Sent to your WhatsApp & Email', 'success');
                  }}
                >
                  <i className="ph-bold ph-check" />
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
