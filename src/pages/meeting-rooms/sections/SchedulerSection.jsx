import { calculateMrPrice, handleMrCityChange, openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { nativeEvent, rawStyle } from '@/lib/domRefs.js';

/** SECTION: INTERACTIVE MEETING ROOM SCHEDULER & LIVE PRICING ENGINE */
export default function SchedulerSection() {
  return (
    <section
      className="section meeting-rooms-section dark-luxury-section"
      id="scheduler"
      ref={rawStyle('padding: 70px 0; background: #05132B !important;')}
    >
      <div className="container">
        <div className="ui-section-head ui-section-head--center ui-section-head--dark">
          <span className="ui-kicker">Book a room</span>
          <h2 className="ui-title">
            Check availability and <em>book in a minute</em>
          </h2>
          <p className="ui-lead">Pick a city, room size, date and time. You see the full price before you pay.</p>
        </div>
        <div className="meeting-scheduler-box" style={{ marginTop: '30px' }}>
          <div className="scheduler-form-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="mrCitySelect">
                <i className="ph-bold ph-map-pin" /> City / Hub
              </label>
              <select
                id="mrCitySelect"
                className="form-select"
                onChange={(event) => handleMrCityChange(event.currentTarget.value)}
              >
                <option value="NSK-001">Nashik HQ — College Road</option>
                <option value="MUM-002">Mumbai — Bandra Kurla Complex (BKC)</option>
                <option value="DEL-001">Delhi — Connaught Place</option>
                <option value="BLR-001">Bangalore — Koramangala Tech Park</option>
                <option value="PNE-001">Pune — Baner Business Park</option>
                <option value="GUR-001">Gurgaon — DLF Cyber City</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mrRoomTypeSelect">
                <i className="ph-bold ph-door" /> Room Category
              </label>
              <select
                id="mrRoomTypeSelect"
                className="form-select"
                onChange={() => calculateMrPrice()}
                defaultValue="Conference Room"
              >
                <option value="Huddle Room" data-rate="499">
                  Huddle Room (4 Pax) — ₹499/hr
                </option>
                <option value="Conference Room" data-rate="799">
                  Conference Room (8 Pax) — ₹799/hr
                </option>
                <option value="Boardroom" data-rate="1199">
                  Executive Boardroom (12 Pax) — ₹1,199/hr
                </option>
                <option value="Training Hall" data-rate="1999">
                  Training Hall (20 Pax) — ₹1,999/hr
                </option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mrDateInput">
                <i className="ph-bold ph-calendar" /> Date
              </label>
              <input
                type="date"
                id="mrDateInput"
                className="form-input"
                ref={nativeEvent('change', () => calculateMrPrice())}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mrTimeSlotSelect">
                <i className="ph-bold ph-clock" /> Preferred Slot
              </label>
              <select
                id="mrTimeSlotSelect"
                className="form-select"
                onChange={() => calculateMrPrice()}
                defaultValue="02:00 PM - 04:00 PM"
              >
                <option value="09:00 AM - 11:00 AM">09:00 AM – 11:00 AM (Morning Slot)</option>
                <option value="11:30 AM - 01:30 PM">11:30 AM – 01:30 PM (Mid-Day Slot)</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM – 04:00 PM (Afternoon Slot)</option>
                <option value="04:30 PM - 06:30 PM">04:30 PM – 06:30 PM (Evening Slot)</option>
                <option value="07:00 PM - 09:00 PM">07:00 PM – 09:00 PM (Late Slot)</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mrDurationSelect">
                <i className="ph-bold ph-hourglass" /> Duration
              </label>
              <select
                id="mrDurationSelect"
                className="form-select"
                onChange={() => calculateMrPrice()}
                defaultValue="2"
              >
                <option value="1">1 Hour</option>
                <option value="2">2 Hours (Standard Meeting)</option>
                <option value="4">4 Hours (Half Day — 10% Off)</option>
                <option value="8">8 Hours (Full Day — 20% Off)</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mrAttendeesInput">
                <i className="ph-bold ph-users" /> Attendees
              </label>
              <input
                type="number"
                id="mrAttendeesInput"
                className="form-input"
                defaultValue="6"
                min="1"
                max="25"
                ref={nativeEvent('change', () => calculateMrPrice())}
              />
            </div>
          </div>
          <div className="mr-state-ticker">
            <div className="mr-state-badge available">
              <span className="state-dot" />
              <strong>Status: Available for Instant Hold</strong>
            </div>
            <div className="mr-pricing-tally">
              <span className="mr-rate-calc" id="mrRateCalc">
                2 Hours × ₹799/hr
              </span>
              <span className="mr-final-cost" id="mrFinalCost">
                ₹1,885 <small>(incl. 18% GST)</small>
              </span>
            </div>
            <button type="button" className="btn btn--primary btn--lg" onClick={() => openMeetingBookingModal()}>
              <i className="ph-bold ph-ticket" />
              Proceed to Reserve Room →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
