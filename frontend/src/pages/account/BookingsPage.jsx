import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import { useCustomer } from '@/features/auth/useCustomer.js';
import { cancelBooking, fetchMyBookings } from '@/features/bookings/bookingApi.js';
import { getBookings, setBookingState } from '@/features/bookings/bookingStore.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { showToast } from '@/features/ui/toast.js';

const STATE_LABEL = { hold: 'On Hold', payment_pending: 'Payment Pending', confirmed: 'Confirmed', checked_in: 'Checked In', completed: 'Completed', cancelled: 'Cancelled' };
const TABS = [
  ['upcoming', 'Upcoming', (b) => ['hold', 'payment_pending', 'confirmed', 'checked_in'].includes(b.state)],
  ['past', 'Past', (b) => b.state === 'completed'],
  ['cancelled', 'Cancelled', (b) => b.state === 'cancelled'],
];

/** The API's statuses, in the states this page's tabs and buttons are written around. */
const API_STATE = {
  HELD: 'hold',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'cancelled',
};

/** An API booking in the shape of a stored one (features/bookings/bookingStore.js), so one row renders both. */
const fromApi = (booking) => ({
  ref: booking.ref,
  room: booking.room,
  hub: booking.hub,
  date: booking.date,
  slot: booking.slot,
  duration: booking.duration,
  attendees: booking.attendees,
  totalAmount: Math.round((booking.pricing?.total_paise ?? 0) / 100),
  state: API_STATE[booking.status] ?? 'hold',
});

/**
 * /bookings — meeting room & workspace reservations (PRD §45, §64 bottom-nav "Bookings").
 *
 * Bookings belong to an account, so this page asks who is signed in first. Signed in, it shows the
 * reservations the API holds for them; on a build with no API it falls back to this browser's own store.
 */
export default function BookingsPage() {
  const { customer, ready } = useCustomer();
  const [apiBookings, setApiBookings] = useState(null);
  const [stored, setStored] = useState(getBookings);
  const [tab, setTab] = useState('upcoming');

  const load = useCallback(async () => {
    if (!customer) return;
    const mine = await fetchMyBookings({ limit: 50 });
    setApiBookings(mine ? mine.map(fromApi) : null);
  }, [customer]);

  useEffect(() => {
    load();
  }, [load]);

  const live = Array.isArray(apiBookings);
  const bookings = live ? apiBookings : stored;
  const filter = TABS.find(([key]) => key === tab)[2];
  const list = bookings.filter(filter);

  async function cancel(ref) {
    if (!window.confirm('Cancel this reservation? Refunds are processed within 5–7 working days.')) return;
    if (live) {
      try {
        await cancelBooking(ref);
        showToast('Cancellation Requested', `Booking ${ref} moved to cancelled; refund initiated.`, 'info');
      } catch (error) {
        showToast('Could not cancel', error.message, 'warning');
      }
      load();
      return;
    }
    setBookingState(ref, 'cancelled');
    setStored(getBookings());
    showToast('Cancellation Requested', `Booking ${ref} moved to cancelled; refund initiated.`, 'info');
  }

  if (!ready) {
    return <div className="ui-route-loading">Checking your session…</div>;
  }

  // Signed out there is nothing to list: a reservation is held against an account, not against a browser.
  if (!customer) {
    return (
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Client Portal', to: '/portal' }, { label: 'My Bookings' }]} />
        <section className="section" style={{ padding: '56px 0', background: '#F8FAFC' }}>
          <div className="container" style={{ maxWidth: '640px' }}>
            <div className="ui-card ui-signin">
              <h2>Sign in to see your bookings</h2>
              <p>
                Meeting rooms are held against your V-DESK account for ten minutes. Sign in with your mobile
                number to see, hold or cancel a reservation.
              </p>
              <div className="ui-actions">
                <Link className="ui-btn ui-btn--primary" to="/login?next=/bookings">
                  Sign in
                </Link>
                <Link className="ui-btn ui-btn--outline" to="/meeting-rooms">
                  Browse meeting rooms
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="ui-page">
      <Breadcrumbs trail={[{ label: 'Client Portal', to: '/portal' }, { label: 'My Bookings' }]} />
      <PageHero
        id="bookingsHero"
        badge="Reservations"
        badgeIcon="ph-calendar-check"
        title="My Bookings"
        highlight="Meeting Rooms & Workspaces"
        description="Every reservation with its access pass, invoice and cancellation option."
        stats={[
          [String(bookings.filter(TABS[0][2]).length), 'Upcoming'],
          [String(bookings.filter(TABS[1][2]).length), 'Completed'],
          ['10 min', 'Hold Window'],
          ['4K AV', 'Every Boardroom'],
        ]}
        actions={
          <button type="button" className="btn btn--gold btn--lg" onClick={() => openMeetingBookingModal()}>
            <i className="ph-bold ph-plus" />
            New Room Reservation
          </button>
        }
      />

      <section className="section" style={{ padding: '56px 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: '1040px' }}>
          <div className="cw-amenities-filters" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {TABS.map(([key, label]) => (
              <button key={key} type="button" className={tab === key ? 'cw-filter-pill active' : 'cw-filter-pill'} onClick={() => setTab(key)}>
                {label} ({bookings.filter(TABS.find(([k]) => k === key)[2]).length})
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px dashed #C59239', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
              <i className="ph-bold ph-calendar-blank" style={{ fontSize: '2.4rem', color: '#C59239' }} />
              <h3 style={{ color: '#081D40', margin: '12px 0 6px' }}>No {tab} bookings</h3>
              <p style={{ color: '#64748B', marginBottom: '18px' }}>Reserve a boardroom or huddle room in any V-DESK centre.</p>
              <Link to="/meeting-rooms" className="btn btn--primary">
                Browse Meeting Rooms
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {list.map((b) => (
                <div key={b.ref} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }} className="booking-row">
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                      <span className={`kyc-status-badge ${['confirmed', 'completed', 'checked_in'].includes(b.state) ? 'verified' : ''}`}>{STATE_LABEL[b.state] || b.state}</span>
                      <strong style={{ color: '#081D40', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{b.ref}</strong>
                    </div>
                    <h3 style={{ color: '#081D40', fontSize: '1.1rem', margin: '0 0 4px' }}>{b.room}</h3>
                    <div style={{ color: '#64748B', fontSize: '0.86rem' }}>
                      <i className="ph-bold ph-map-pin" /> {b.hub} &nbsp;•&nbsp; <i className="ph-bold ph-clock" /> {b.date}, {b.slot} ({b.duration}h) &nbsp;•&nbsp; <i className="ph-bold ph-users" /> {b.attendees} Pax
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#081D40', marginBottom: '8px' }}>₹{b.totalAmount.toLocaleString('en-IN')}</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {['confirmed', 'checked_in'].includes(b.state) && (
                        <button className="btn btn--outline btn--sm" onClick={() => showToast('Access Pass', `Pass code ${b.ref} • Guest Wi-Fi: VDESK-VIP-2026`, 'info')}>
                          <i className="ph-bold ph-qr-code" /> Pass
                        </button>
                      )}
                      {b.state === 'completed' && (
                        <button className="btn btn--ghost btn--sm" onClick={() => showToast('Receipt', `Receipt for ${b.ref} downloaded.`, 'success')}>
                          <i className="ph-bold ph-receipt" /> Receipt
                        </button>
                      )}
                      {['hold', 'payment_pending', 'confirmed'].includes(b.state) && (
                        <button className="btn btn--ghost btn--sm" onClick={() => cancel(b.ref)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
