import { useState } from 'react';
import { Link } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import { getBookings, setBookingState } from '@/features/bookings/bookingStore.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { showToast } from '@/features/ui/toast.js';

const STATE_LABEL = { hold: 'On Hold', payment_pending: 'Payment Pending', confirmed: 'Confirmed', checked_in: 'Checked In', completed: 'Completed', cancelled: 'Cancelled' };
const TABS = [
  ['upcoming', 'Upcoming', (b) => ['hold', 'payment_pending', 'confirmed', 'checked_in'].includes(b.state)],
  ['past', 'Past', (b) => b.state === 'completed'],
  ['cancelled', 'Cancelled', (b) => b.state === 'cancelled'],
];

/** /bookings — meeting room & workspace reservations (PRD §45, §64 bottom-nav "Bookings"). */
export default function BookingsPage() {
  const [bookings, setBookings] = useState(getBookings);
  const [tab, setTab] = useState('upcoming');
  const filter = TABS.find(([key]) => key === tab)[2];
  const list = bookings.filter(filter);

  function cancel(ref) {
    if (!window.confirm('Cancel this reservation? Refunds are processed within 5–7 working days.')) return;
    setBookingState(ref, 'cancelled');
    setBookings(getBookings());
    showToast('Cancellation Requested', `Booking ${ref} moved to cancelled; refund initiated.`, 'info');
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
