import { openTaxInvoiceModal } from '@/features/checkout/taxInvoice.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { switchPortalPageTab } from '@/features/portal/customerPortal.js';
import { copyToClipboard } from '@/features/ui/clipboard.js';
import { rawStyle } from '@/lib/domRefs.js';

/** STANDALONE CLIENT SELF-SERVICE DASHBOARD (PRD Sec 45 & 49) */
export default function PortalDashboard() {
  return (
    <section
      className="section portal-page-wrap"
      style={{ background: '#F1F5F9', minHeight: '80vh', padding: '40px 0' }}
    >
      <div className="container">
        <div
          ref={rawStyle(
            'background: #081D40; color: #fff; padding: 24px 30px; border-radius: 16px 16px 0 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-bottom: 2px solid #C59239;',
          )}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#C59239',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <i className="ph-bold ph-shield-check" /> Sovereign Commercial Portal
            </div>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.5rem', margin: '4px 0 2px 0' }}>Welcome, Arjun Mehta</h1>
            <p
              style={{
                color: '#94A3B8',
                fontSize: '0.85rem',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span>Apex Dynamics Technologies LLP</span>•<span>Account:</span>
              <span className="copyable-badge" onClick={() => copyToClipboard('VDESK-ACC-8921', 'Client Account ID')}>
                <i className="ph-bold ph-copy" />
                VDESK-ACC-8921
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn--outline btn--sm" onClick={() => openMeetingBookingModal()}>
              <i className="ph-bold ph-presentation" />
              Reserve Room
            </button>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => openTaxInvoiceModal({ invoiceNo: 'INV-2026-8921', amount: 21499 })}
            >
              <i className="ph-bold ph-receipt" />
              Latest Tax Invoice
            </button>
          </div>
        </div>
        <div
          ref={rawStyle(
            'background: #05132B; padding: 0 20px; display: flex; overflow-x: auto; border-bottom: 1px solid rgba(255,255,255,0.1);',
          )}
        >
          <button
            type="button"
            className="portal-nav-tab active"
            id="pTabBtn_activeServices"
            onClick={() => switchPortalPageTab('activeServices')}
          >
            <i className="ph-bold ph-buildings" />
            Active Services
          </button>
          <button
            type="button"
            className="portal-nav-tab"
            id="pTabBtn_bookings"
            onClick={() => switchPortalPageTab('bookings')}
          >
            <i className="ph-bold ph-calendar-check" />
            Room Bookings
          </button>
          <button
            type="button"
            className="portal-nav-tab"
            id="pTabBtn_documents"
            onClick={() => switchPortalPageTab('documents')}
          >
            <i className="ph-bold ph-folder-notch-open" />
            Document Vault
          </button>
          <button
            type="button"
            className="portal-nav-tab"
            id="pTabBtn_invoices"
            onClick={() => switchPortalPageTab('invoices')}
          >
            <i className="ph-bold ph-receipt" />
            Tax Invoices & GST
          </button>
          <button
            type="button"
            className="portal-nav-tab"
            id="pTabBtn_renewals"
            onClick={() => switchPortalPageTab('renewals')}
          >
            <i className="ph-bold ph-arrows-clockwise" />
            Renewal Lock-In
          </button>
        </div>
        <div
          id="portalTabContentBody"
          style={{
            background: '#FFFFFF',
            borderRadius: '0 0 16px 16px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            minHeight: '400px',
          }}
        />
      </div>
    </section>
  );
}
