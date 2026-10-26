import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Button, Section } from '@/components/ui/index.js';
import { GST_RATE } from '@/data/constants.js';
import { getBookings, setBookingState } from '@/features/bookings/bookingStore.js';
import { openTaxInvoiceModal } from '@/features/checkout/taxInvoice.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { showToast } from '@/features/ui/toast.js';
import { readJson } from '@/lib/storage.js';

/**
 * Customer dashboard.
 *
 * It answers four questions in order: is my address active, is anything waiting for me, what can
 * I download, and what have I booked or paid. Everything here is the account's own data — the
 * service, documents and invoices are the demo account until customer sign-in exists on the API.
 */

const SERVICE = {
  plan: 'Virtual Office for GST',
  centre: 'Mumbai — Bandra Kurla Complex (BKC)',
  address: 'BKC Business Center, G Block, BKC, Mumbai',
  renewalDate: '12 Mar 2027',
  gstin: '27AAYCZ8921P1Z8',
  gstStatus: 'Verified',
  mailForwarded: 3,
  meetingCreditsHours: 5,
};

const DOCUMENTS = [
  ['ph-file-text', 'Registered rent agreement', '12-month notarized commercial lease, accepted for GST and MCA filing.'],
  ['ph-seal-check', 'Owner no-objection certificate', 'Building ownership consent in your company name.'],
  ['ph-lightning', 'Commercial electricity bill', 'Latest billing cycle with the paid receipt.'],
];

const INVOICES = [
  { no: 'INV-2026-8921', period: 'Mar 2026 – Mar 2027', item: 'Virtual Office for GST', taxable: 18219 },
];

const rupees = (value) => '₹' + Math.round(value).toLocaleString('en-IN');

function Stat({ label, value, tone, hint }) {
  return (
    <div className="ui-portal-stat">
      <span className="ui-portal-stat__label">{label}</span>
      <strong className={tone ? `ui-portal-stat__value is-${tone}` : 'ui-portal-stat__value'}>{value}</strong>
      {hint && <span className="ui-portal-stat__hint">{hint}</span>}
    </div>
  );
}

export default function PortalDashboard() {
  const [bookings, setBookings] = useState(() => getBookings());
  const orders = useMemo(() => readJson('VDESK_ORDERS', []), []);

  const visible = bookings.filter((booking) => booking.state !== 'cancelled');
  const invoices = [
    ...INVOICES,
    ...orders.map((order) => ({
      no: order.invoiceNo,
      period: new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      item: order.item,
      taxable: Math.round(order.amount / (1 + GST_RATE)),
    })),
  ];

  function cancel(ref) {
    setBookingState(ref, 'cancelled');
    setBookings(getBookings());
    showToast('Booking cancelled', `${ref} has been released.`, 'info');
  }

  return (
    <>
      {/* Who you are and what is active — the two things to confirm at a glance. */}
      <section className="ui-portal-head">
        <div className="ui-container">
          <div className="ui-portal-head__row">
            <div>
              <span className="ui-portal-head__eyebrow">Your account</span>
              <h1 className="ui-portal-head__title">Arjun Mehta</h1>
              <p className="ui-portal-head__meta">Apex Dynamics Technologies LLP · Account VDESK-MCA-8921</p>
            </div>
            <div className="ui-actions">
              <Button variant="outline" icon="ph-presentation" onClick={() => openMeetingBookingModal()}>
                Book a meeting room
              </Button>
              <Button
                variant="primary"
                icon="ph-receipt"
                onClick={() => openTaxInvoiceModal({ invoiceNo: invoices[0].no, item: invoices[0].item, amount: Math.round(invoices[0].taxable * (1 + GST_RATE)), city: 'Mumbai (BKC)' })}
              >
                Latest invoice
              </Button>
            </div>
          </div>

          <div className="ui-portal-stats">
            <Stat label="Service" value="Active" tone="good" hint={`Renews ${SERVICE.renewalDate}`} />
            <Stat label="GST status" value={SERVICE.gstStatus} tone="good" hint={SERVICE.gstin} />
            <Stat label="Mail waiting" value={`${SERVICE.mailForwarded} items`} hint="Forwarded this month" />
            <Stat label="Meeting credits" value={`${SERVICE.meetingCreditsHours} hrs`} hint="Left this month" />
          </div>
        </div>
      </section>

      <Section tone="tint" tight>
        <div className="ui-portal-grid">
          {/* Primary: the address you are paying for. */}
          <article className="ui-card ui-portal-service">
            <div className="ui-portal-service__head">
              <span className="ui-badge is-good">
                <i className="ph-bold ph-check-circle" /> Subscription active
              </span>
              <span className="ui-portal-service__renewal">
                Renews <strong>{SERVICE.renewalDate}</strong>
              </span>
            </div>
            <h2>{SERVICE.centre}</h2>
            <p>
              {SERVICE.address} · {SERVICE.plan}
            </p>
            <div className="ui-actions">
              <Button variant="primary" icon="ph-download-simple" onClick={() => showToast('Preparing download', 'Your rent agreement will download shortly.', 'info')}>
                Rent agreement
              </Button>
              <Button variant="outline" icon="ph-download-simple" onClick={() => showToast('Preparing download', 'Your owner NOC will download shortly.', 'info')}>
                Owner NOC
              </Button>
              <Button variant="outline" icon="ph-download-simple" onClick={() => showToast('Preparing download', 'Your electricity bill will download shortly.', 'info')}>
                Electricity bill
              </Button>
            </div>
          </article>

          {/* Secondary: anything that needs the customer to act. */}
          <article className="ui-card ui-portal-aside">
            <h3>Nothing needs your attention</h3>
            <p>KYC is complete, your documents are verified and your next renewal is {SERVICE.renewalDate}.</p>
            <ul className="ui-checks">
              <li>
                <i className="ph-bold ph-check-circle" /> KYC verified
              </li>
              <li>
                <i className="ph-bold ph-check-circle" /> Documents issued
              </li>
              <li>
                <i className="ph-bold ph-check-circle" /> Invoices paid
              </li>
            </ul>
            <Link to="/contact" className="ui-card__link">
              Need something changed? <i className="ph-bold ph-arrow-right" />
            </Link>
          </article>
        </div>
      </Section>

      <Section tone="white" tight kicker="Documents" title="Your compliance documents" align="left">
        <div className="ui-grid ui-grid--3">
          {DOCUMENTS.map(([icon, title, text]) => (
            <div key={title} className="ui-card">
              <div className="ui-card__icon">
                <i className={`ph-bold ${icon}`} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <button type="button" className="ui-card__link" onClick={() => showToast('Preparing download', `${title} will download shortly.`, 'info')}>
                Download PDF <i className="ph-bold ph-arrow-right" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="tint" tight kicker="Bookings" title="Your meeting rooms" align="left">
        {visible.length === 0 ? (
          <div className="ui-card ui-empty">
            <h3>No rooms booked</h3>
            <p>Your plan includes {SERVICE.meetingCreditsHours} hours of meeting room time this month.</p>
            <Button variant="primary" icon="ph-presentation" onClick={() => openMeetingBookingModal()}>
              Book a room
            </Button>
          </div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Room</th>
                  <th scope="col">When</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="ui-table__actions">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((booking) => {
                  const state = booking.state ?? 'hold';
                  const done = state === 'completed' || state === 'past';
                  return (
                  <tr key={booking.ref}>
                    <td>
                      <strong>{booking.room}</strong>
                      <br />
                      <span className="ui-table__sub">
                        {booking.hub} · {booking.ref}
                      </span>
                    </td>
                    <td>
                      {booking.date} · {booking.slot}
                    </td>
                    <td>
                      <span className={`ui-badge ${done ? '' : state === 'confirmed' ? 'is-good' : 'is-warn'}`}>
                        {done ? 'Finished' : state === 'confirmed' ? 'Confirmed' : 'On hold'}
                      </span>
                    </td>
                    <td className="ui-table__actions">
                      {done ? (
                        <span className="ui-table__sub">—</span>
                      ) : (
                        <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => cancel(booking.ref)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section tone="white" tight kicker="Billing" title="Invoices and receipts" align="left">
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Period</th>
                <th scope="col">Service</th>
                <th scope="col">Total</th>
                <th scope="col" className="ui-table__actions">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const total = Math.round(invoice.taxable * (1 + GST_RATE));
                return (
                  <tr key={invoice.no}>
                    <td>
                      <strong>{invoice.no}</strong>
                    </td>
                    <td>{invoice.period}</td>
                    <td>{invoice.item}</td>
                    <td>
                      <strong>{rupees(total)}</strong>
                      <br />
                      <span className="ui-table__sub">incl. GST {rupees(total - invoice.taxable)}</span>
                    </td>
                    <td className="ui-table__actions">
                      <button
                        type="button"
                        className="ui-btn ui-btn--outline ui-btn--sm"
                        onClick={() => openTaxInvoiceModal({ invoiceNo: invoice.no, item: invoice.item, amount: total, city: 'Mumbai (BKC)' })}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="ui-note">GSTIN {SERVICE.gstin} · every invoice is eligible for input tax credit.</p>
      </Section>
    </>
  );
}
