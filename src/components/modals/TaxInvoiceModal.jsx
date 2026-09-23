import { downloadInvoicePdf, printTaxInvoice } from '@/features/checkout/taxInvoice.js';
import { closeModal } from '@/features/modals/modalManager.js';
import { asset } from '@/lib/assets.js';
import { rawStyle } from '@/lib/domRefs.js';

/** GST tax invoice dialog. */
export default function TaxInvoiceModal() {
  return (
    <div
      className="modal-overlay"
      id="taxInvoiceModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="taxInvoiceModalTitle"
    >
      <div className="modal-backdrop" onClick={() => closeModal('taxInvoiceModal')} />
      <div
        className="modal-container"
        style={{ maxWidth: '740px', background: 'transparent', padding: '0', boxShadow: 'none' }}
      >
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '10px' }}
          className="no-print"
        >
          <button className="btn btn--secondary btn--sm" onClick={() => printTaxInvoice()}>
            <i className="ph-bold ph-printer" />
            Print / Save PDF
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => downloadInvoicePdf()}>
            <i className="ph-bold ph-download-simple" />
            Download PDF
          </button>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => closeModal('taxInvoiceModal')}
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
          >
            <i className="ph-bold ph-x" />
            Close
          </button>
        </div>
        <div className="tax-invoice-sheet" id="taxInvoiceSheet">
          <div className="tax-invoice-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <img src={asset('assets/vdesk-logo-compact.png')} alt="V-DESK" style={{ height: '32px' }} />
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: '#C59239',
                    color: '#000',
                    padding: '2px 8px',
                    fontWeight: '800',
                    borderRadius: '4px',
                  }}
                >
                  TAX INVOICE
                </span>
              </div>
              <h2 className="tax-invoice-title" id="taxInvoiceModalTitle">
                V-DESK Workspace & Consulting LLP
              </h2>
              <div className="tax-invoice-subtitle">LLPIN: AAY-9842 • GSTIN: 27AAYFV9842K1Z5 • SAC Code: 997212</div>
              <div className="tax-invoice-subtitle">
                HQ: Landmark Trade Centre, 3rd Floor, College Road, Nashik, Maharashtra – 422005
              </div>
            </div>
            <div className="tax-invoice-meta">
              <div>
                Invoice No:{' '}
                <strong id="invNumberDisplay" style={{ color: '#081D40' }}>
                  INV-2026-8921
                </strong>
              </div>
              <div>
                Date: <span id="invDateDisplay">12 Sep 2026</span>
              </div>
              <div>
                Place of Supply: <strong id="invClientCity">Maharashtra (27)</strong>
              </div>
              <div style={{ color: '#10B981', fontWeight: '700', marginTop: '4px' }}>
                <i className="ph-bold ph-check-circle" /> PAYMENT RECEIVED
              </div>
            </div>
          </div>
          <div className="tax-invoice-parties">
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Billed To (Customer):
              </span>
              <strong id="invClientName" style={{ color: '#081D40', fontSize: '0.95rem' }}>
                Priya Kulkarni
              </strong>
              <br /> <span id="invClientCompany">Zenith D2C Brands Pvt Ltd</span>
              <br />{' '}
              <span id="invClientEmail" style={{ color: '#64748B' }}>
                priya@zenithd2c.com
              </span>
              <br /> <span>GSTIN: 27AAYCZ8921P1Z8</span>
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Authorized Fulfillment Hub:
              </span>
              <strong>V-DESK Grade-A Partner Centre</strong>
              <br /> <span>BKC Business Center, G Block, Bandra Kurla Complex</span>
              <br /> <span>Mumbai, Maharashtra – 400051</span>
              <br /> <span style={{ color: '#C59239', fontWeight: '600' }}>Dedicated Compliance Escrow Active</span>
            </div>
          </div>
          <table className="tax-invoice-table">
            <thead>
              <tr>
                <th>Description of Services (SAC: 997212)</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong id="invItemDesc">Virtual Office Infrastructure for GST (12-Month Plan)</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Includes Notarized Lease Deed, Owner NOC, Electricity Bill & Signboard Compliance
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>1 Year</td>
                <td style={{ textAlign: 'right' }} id="invItemBase">
                  ₹18,219
                </td>
              </tr>
            </tbody>
          </table>
          <div className="tax-invoice-total-card">
            <div className="tax-invoice-total-row">
              <span>Taxable Subtotal:</span>
              <strong id="invSubtotal">₹18,219</strong>
            </div>
            <div className="tax-invoice-total-row">
              <span>CGST (9.0%):</span>
              <span id="invCgst">₹1,640</span>
            </div>
            <div className="tax-invoice-total-row">
              <span>SGST (9.0%):</span>
              <span id="invSgst">₹1,640</span>
            </div>
            <div className="tax-invoice-total-row grand">
              <span>Total Amount Paid (INR):</span>
              <span id="invGrandTotal">₹21,499</span>
            </div>
          </div>
          <div className="tax-invoice-footer">
            <div className="tax-invoice-qr">
              <div
                ref={rawStyle(
                  'width: 44px; height: 44px; background: #081D40; color: #C59239; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;',
                )}
              >
                <i className="ph-bold ph-qr-code" />
              </div>
              <div>
                <strong>Digitally Authenticated Tax Invoice</strong>
                <div>Verification Hash: SHA256-VD-9842-GST-2026</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <img
                src={asset('assets/vdesk-logo-compact.png')}
                alt="V-DESK Seal"
                style={{ height: '20px', opacity: '0.7', marginBottom: '2px' }}
              />
              <br /> <span>For V-DESK Workspace & Consulting LLP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
