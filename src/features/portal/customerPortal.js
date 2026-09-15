import { openActiveModal } from '@/features/modals/modalManager.js';
import { action } from '@/lib/html.js';

/* Customer self-service portal (PRD §45, §49): the account dialog and the /portal page share the same data. */

const SUPPORT_WHATSAPP_URL = 'https://wa.me/919876543210?text=Hi%20Rahul,%20I%20need%20support%20for%20my%20V-DESK%20account%20VD-AC-8921';

const toast = (title, desc, type) => action('showToast', title, desc, type);

const PORTAL_MODAL_TABS = {
  activeServices: () => `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <span class="badge badge--success" style="margin-bottom: 8px;">● Subscription Active</span>
              <h4 style="font-size: 1.25rem; margin: 4px 0; color: var(--vd-navy-deep);">Mumbai — Bandra Kurla Complex (BKC)</h4>
              <p style="color: #64748B; font-size: 0.84rem; margin: 0;">BKC Business Center, G Block, BKC, Mumbai &bull; Plan: Virtual Office for GST</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.76rem; color: #64748B; display: block;">Renewal Due:</span>
              <strong style="color: var(--vd-navy-deep); font-size: 1.05rem;">12 Mar 2027</strong>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; background: #F8FAFC; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <div><strong>GST Status:</strong> <span style="color: #10B981; font-weight: 600;">Verified (27AAY...Z1)</span></div>
            <div><strong>Mail Forwarding:</strong> <span>Active (3 pieces forwarded)</span></div>
            <div><strong>Meeting Credits:</strong> <span>5 Hours Remaining</span></div>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn--outline btn--sm" ${toast('Document Downloaded', 'Registered Commercial Rent Agreement downloaded.', 'success')}><i class="ph-bold ph-download-simple"></i> Download Rent Agreement</button>
            <button class="btn btn--outline btn--sm" ${toast('Document Downloaded', 'Owner NOC copy downloaded.', 'success')}><i class="ph-bold ph-download-simple"></i> Download Owner NOC</button>
            <button class="btn btn--outline btn--sm" ${toast('Document Downloaded', 'Recent Electricity Bill copy downloaded.', 'success')}><i class="ph-bold ph-download-simple"></i> Download Electricity Bill</button>
            <button class="btn btn--primary btn--sm" ${action('openMeetingBookingModal')}><i class="ph-bold ph-presentation"></i> Book Meeting Room</button>
          </div>
        </div>
      </div>
    `,
  bookings: () => `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-calendar-check"></i> Upcoming Workspaces &amp; Rooms</h4>
        <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="badge badge--success">Confirmed</span>
            <h5 style="margin: 4px 0; font-size: 1rem;">Executive Conference Room (8 Pax)</h5>
            <span style="font-size: 0.8rem; color: #64748B;">Mumbai BKC Centre &bull; Tomorrow, 02:00 PM &ndash; 04:00 PM</span>
          </div>
          <button class="btn btn--outline btn--sm" ${toast('Pass Displayed', 'Pass code: BK-2026-9812', 'info')}><i class="ph-bold ph-qr-code"></i> View Pass</button>
        </div>
      </div>
    `,
  documents: () => `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-files"></i> Verified Business Documents</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8FAFC; border-radius: 10px;">
            <span><i class="ph-bold ph-file-text" style="color: var(--vd-gold-primary);"></i> Certificate of Incorporation (CIN: U74999MH2024PTC123456)</span>
            <span style="color: #10B981; font-weight: 600; font-size: 0.84rem;">Verified &bull; Approved</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8FAFC; border-radius: 10px;">
            <span><i class="ph-bold ph-file-text" style="color: var(--vd-gold-primary);"></i> Director PAN &amp; Aadhaar Card</span>
            <span style="color: #10B981; font-weight: 600; font-size: 0.84rem;">Verified &bull; Approved</span>
          </div>
        </div>
      </div>
    `,
  invoices: () => `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-receipt"></i> Billing &amp; Tax Invoices</h4>
        <table class="proposal-table">
          <thead>
            <tr><th>Invoice #</th><th>Date</th><th>Service</th><th>Amount</th><th>Receipt</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>INV-2026-0812</strong></td>
              <td>12 Mar 2026</td>
              <td>Annual Virtual Office BKC</td>
              <td>₹21,499</td>
              <td><button class="btn btn--outline btn--sm" ${toast('Invoice Downloaded', 'Tax invoice PDF downloaded.', 'success')}><i class="ph-bold ph-download-simple"></i> PDF</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  renewals: () => `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 8px;"><i class="ph-bold ph-arrows-clockwise"></i> 1-Click Subscription Renewal</h4>
        <p style="color: #64748B; font-size: 0.88rem; margin-bottom: 20px;">Renew your Mumbai BKC agreement early to lock in your preferential base rate and maintain continuous GST compliance without inspection risks.</p>
        <button class="btn btn--primary" ${action('openCheckoutModal', { item: 'Renewal: Mumbai BKC Virtual Office (12 Months)', amount: 19999 })}>
          <i class="ph-bold ph-arrows-clockwise"></i> Renew Now (Save Additional 10%) &rarr;
        </button>
      </div>
    `,
  support: () => `
      <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
        <h4 style="font-size: 1.1rem; color: var(--vd-navy-deep); margin-bottom: 16px;"><i class="ph-bold ph-headset"></i> Dedicated Concierge Desk</h4>
        <p style="color: #64748B; font-size: 0.84rem; margin-bottom: 16px;">Assigned Executive: <strong>Adv. Rahul Deshmukh</strong> &bull; Direct Helpline: +91 98765 43210</p>
        <button class="btn btn--primary" ${action('openExternal', SUPPORT_WHATSAPP_URL)}>
          <i class="ph-bold ph-whatsapp-logo"></i> Connect on WhatsApp
        </button>
      </div>
    `,
};

export function switchPortalTab(tab) {
  document.querySelectorAll('.portal-tabs .portal-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  const content = document.getElementById('portalTabContent');
  if (!content) return;
  const render = PORTAL_MODAL_TABS[tab];
  if (render) content.innerHTML = render();
}

export function openCustomerPortal() {
  if (!document.getElementById('customerPortalModal')) return;
  switchPortalTab('activeServices');
  openActiveModal('customerPortalModal');
}

/* ---------------------------------------------------------------------------
   /portal page
   --------------------------------------------------------------------------- */
const PORTAL_PAGE_TABS = {
  activeServices: () => `
      <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 24px; background: #FAFDFB;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
              <strong style="color: #10B981; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Subscription Active</strong>
            </div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: #081D40; margin: 0 0 4px 0;">Mumbai &mdash; Bandra Kurla Complex (BKC)</h3>
            <p style="font-size: 0.88rem; color: #64748B; margin: 0;">BKC Business Center, G Block, BKC, Mumbai &bull; Plan: Virtual Office for GST</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.8rem; color: #64748B; display: block;">Renewal Due:</span>
            <strong style="font-size: 1.1rem; color: #081D40;">12 Mar 2027</strong>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0; padding: 16px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px;">
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; display: block;">GST Status</span>
            <strong style="color: #10B981; font-size: 0.95rem;">Verified (27AAY...Z1)</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; display: block;">Mail Forwarding</span>
            <strong style="color: #081D40; font-size: 0.95rem;">Active (3 pieces forwarded)</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; display: block;">Meeting Credits</span>
            <strong style="color: #C59239; font-size: 0.95rem;">5 Hours Remaining</strong>
          </div>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn--primary btn--sm" ${toast('Downloading Rent Agreement', 'Verified 12-Month Notarized Lease Agreement with QR stamp.', 'success')}><i class="ph-bold ph-download-simple"></i> Download Rent Agreement</button>
          <button class="btn btn--outline btn--sm" ${toast('Downloading Owner NOC', 'Official Landlord Non-Objection Certificate for MCA / GST.', 'success')}><i class="ph-bold ph-download-simple"></i> Download Owner NOC</button>
          <button class="btn btn--outline btn--sm" ${toast('Downloading Electricity Bill', 'Commercial utility proof (latest cycle, paid receipt attached).', 'success')}><i class="ph-bold ph-download-simple"></i> Download Electricity Bill</button>
          <button class="btn btn--secondary btn--sm" ${action('openMeetingBookingModal')}><i class="ph-bold ph-presentation"></i> Book Meeting Room</button>
        </div>
      </div>
    `,
  bookings: () => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h4 style="margin: 0; color: #081D40;">Meeting Room &amp; Workspace Bookings</h4>
        <button class="btn btn--primary btn--sm" ${action('openMeetingBookingModal')}><i class="ph-bold ph-plus"></i> New Room Reservation</button>
      </div>
      <table class="tax-invoice-table">
        <thead>
          <tr><th>Booking ID</th><th>Facility / Hub</th><th>Date &amp; Slot</th><th>Attendees</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>BK-2026-9812</strong></td>
            <td>4K Boardroom (Nashik Flagship)</td>
            <td>18 Sep 2026 &bull; 02:00 PM (2h)</td>
            <td>8 Pax</td>
            <td><span class="kyc-status-badge verified">Confirmed</span></td>
            <td><button class="btn btn--outline btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" ${toast('Pass Generated', 'Guest Wi-Fi Pass: VDESK-VIP-2026', 'success')}>View Pass</button></td>
          </tr>
          <tr>
            <td><strong>BK-2026-7734</strong></td>
            <td>Conference Room (Mumbai BKC)</td>
            <td>28 Aug 2026 &bull; 11:00 AM (3h)</td>
            <td>6 Pax</td>
            <td><span class="kyc-status-badge verified">Completed</span></td>
            <td><button class="btn btn--ghost btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" ${toast('Invoice Saved', 'Downloaded booking receipt.', 'info')}>Receipt</button></td>
          </tr>
        </tbody>
      </table>
    `,
  documents: () => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h4 style="margin: 0; color: #081D40;">Compliance Document Vault</h4>
        <button class="btn btn--outline btn--sm" ${action('openDigitalKycModal')}><i class="ph-bold ph-upload-simple"></i> Upload New Document</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        <div style="border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <i class="ph-bold ph-file-text" style="font-size: 1.8rem; color: #081D40;"></i>
            <span class="kyc-status-badge verified">Verified ✓</span>
          </div>
          <strong style="color: #081D40; display: block; margin-bottom: 4px;">Registered Rent Agreement</strong>
          <p style="font-size: 0.8rem; color: #64748B; margin: 0 0 12px 0;">12-Month Notarized Commercial Lease for MCA / GST registration.</p>
          <button class="btn btn--primary btn--sm" style="width: 100%;" ${toast('Downloading Rent Agreement', 'Verified agreement PDF saved.', 'success')}>Download PDF</button>
        </div>

        <div style="border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <i class="ph-bold ph-shield-check" style="font-size: 1.8rem; color: #C59239;"></i>
            <span class="kyc-status-badge verified">Verified ✓</span>
          </div>
          <strong style="color: #081D40; display: block; margin-bottom: 4px;">Owner Non-Objection (NOC)</strong>
          <p style="font-size: 0.8rem; color: #64748B; margin: 0 0 12px 0;">Official building ownership consent certificate.</p>
          <button class="btn btn--outline btn--sm" style="width: 100%;" ${toast('Downloading Landlord NOC', 'NOC certificate saved.', 'success')}>Download NOC</button>
        </div>

        <div style="border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <i class="ph-bold ph-lightning" style="font-size: 1.8rem; color: #10B981;"></i>
            <span class="kyc-status-badge verified">Verified ✓</span>
          </div>
          <strong style="color: #081D40; display: block; margin-bottom: 4px;">Commercial Electricity Bill</strong>
          <p style="font-size: 0.8rem; color: #64748B; margin: 0 0 12px 0;">Latest billing cycle utility proof with paid verification receipt.</p>
          <button class="btn btn--outline btn--sm" style="width: 100%;" ${toast('Downloading Utility Proof', 'Electricity bill copy saved.', 'success')}>Download Bill</button>
        </div>
      </div>
    `,
  invoices: () => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h4 style="margin: 0; color: #081D40;">Tax Invoices &amp; GST Receipts</h4>
        <span style="font-size: 0.82rem; color: #64748B;">GSTIN: 27AAYCZ8921P1Z8</span>
      </div>
      <table class="tax-invoice-table">
        <thead>
          <tr><th>Invoice No.</th><th>Billing Period</th><th>Service</th><th>Taxable</th><th>GST (18%)</th><th>Total</th><th>Action</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>INV-2026-8921</strong></td>
            <td>Mar 2026 – Mar 2027</td>
            <td>Virtual Office for GST</td>
            <td>₹18,219</td>
            <td>₹3,280</td>
            <td><strong>₹21,499</strong></td>
            <td><button class="btn btn--primary btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" ${action('openTaxInvoiceModal', { invoiceNo: 'INV-2026-8921', amount: 21499 })}>View GST Invoice</button></td>
          </tr>
          <tr>
            <td><strong>INV-2026-4102</strong></td>
            <td>One-Time Deposit</td>
            <td>Compliance Security</td>
            <td>₹2,542</td>
            <td>₹458</td>
            <td><strong>₹3,000</strong></td>
            <td><button class="btn btn--outline btn--sm" style="padding: 4px 8px; font-size: 0.75rem;" ${action('openTaxInvoiceModal', { invoiceNo: 'INV-2026-4102', amount: 3000, item: 'Compliance Escrow Security' })}>View Receipt</button></td>
          </tr>
        </tbody>
      </table>
    `,
  renewals: () => `
      <div style="background: #FAF8F3; border: 1px solid #E8E2D8; border-radius: 12px; padding: 24px; max-width: 620px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <i class="ph-bold ph-arrows-clockwise" style="font-size: 2rem; color: #C59239;"></i>
          <div>
            <h4 style="margin: 0; color: #081D40;">Annual License Renewal Management</h4>
            <span style="font-size: 0.82rem; color: #64748B;">Next Renewal: 12 March 2027 (180 Days Remaining)</span>
          </div>
        </div>
        <p style="font-size: 0.85rem; color: #334155; line-height: 1.6;">Your registered address at Mumbai BKC is protected under sovereign lease lock. Renewing ahead ensures continuous GST compliance and automatic notarized rent agreement extension.</p>
        <div style="margin: 16px 0; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #081D40;">2-Year Lock-In Extension</strong>
            <div style="font-size: 0.78rem; color: #10B981;">Includes 25% Multi-Year Discount</div>
          </div>
          <strong style="color: #C59239; font-size: 1.15rem;">₹17,199 / yr</strong>
        </div>
        <button class="btn btn--gold btn--full" ${action('openCheckoutModal', { item: '2-Year Virtual Office Renewal Lock', amount: 34398, city: 'Mumbai' })}>
          <i class="ph-bold ph-shield-check"></i> Extend Subscription with 25% Rebate
        </button>
      </div>
    `,
};

export function switchPortalPageTab(tab) {
  document.querySelectorAll('.portal-nav-tab').forEach((t) => {
    t.classList.remove('active');
    t.style.color = '#94A3B8';
    t.style.borderBottom = 'none';
  });

  const activeBtn = document.getElementById(`pTabBtn_${tab}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.color = '#C59239';
    activeBtn.style.borderBottom = '2px solid #C59239';
  }

  const body = document.getElementById('portalTabContentBody');
  if (!body) return;
  const render = PORTAL_PAGE_TABS[tab];
  if (render) body.innerHTML = render();
}
