import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';
import { copyQuoteLink, proceedQuoteToPayment } from '@/features/quote/quoteProposal.js';
import { asset } from '@/lib/assets.js';

/** Digital quote proposal dialog. */
export default function QuoteProposalModal() {
  return (
    <div
      className="modal-overlay"
      id="quoteProposalModal"
      onClick={(event) => closeModalOnBackdrop(event, 'quoteProposalModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--proposal" role="dialog" aria-modal="true">
        <div className="modal-card__header">
          <div className="legal-modal__title-wrap">
            <span className="legal-modal__badge">
              <i className="ph-bold ph-file-text" /> Formal Quotation
            </span>
            <h3 className="modal-card__title">Official Commercial Proposal</h3>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('quoteProposalModal')}>
            ×
          </button>
        </div>
        <div className="proposal-document" id="proposalDocContent">
          <div className="proposal-header">
            <div className="proposal-brand">
              <img src={asset('assets/vdesk-logo.svg')} alt="V-DESK" style={{ height: '38px' }} />
              <div className="proposal-legal">V-DESK Workspace & Consulting LLP • LLPIN: AAY-9842</div>
            </div>
            <div className="proposal-meta-card">
              <div>
                <strong>Quote Ref:</strong> <span id="propQuoteId">VDQ-2026-8941</span>
              </div>
              <div>
                <strong>Date:</strong> <span id="propDate">12 Sep 2026</span>
              </div>
              <div>
                <strong>Validity:</strong> <span>15 Days</span>
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className="badge-status-proposal" id="propStatus">
                  ACTIVE / SENT
                </span>
              </div>
            </div>
          </div>
          <div className="proposal-client-row">
            <div>
              <span className="sub-label">Prepared For:</span> <strong id="propClientName">Vikramaditya Roy</strong>{' '}
              <span id="propClientCompany">Acme Innovations Pvt Ltd</span>{' '}
              <span id="propClientContact">+91 98765 43210 • contact@acme.com</span>
            </div>
            <div>
              <span className="sub-label">Designated Centre:</span>{' '}
              <strong id="propLocation">V-DESK Headquarters — College Road</strong>{' '}
              <span>Nashik, Maharashtra – 422005</span> <span>Commercial Office Premises</span>
            </div>
          </div>
          <table className="proposal-table">
            <thead>
              <tr>
                <th>Description / Service Package</th>
                <th>Tenure</th>
                <th>Rate / Mo</th>
                <th style={{ textAlign: 'right' }}>Amount (INR)</th>
              </tr>
            </thead>
            <tbody id="propTableBody">
              <tr>
                <td>
                  <strong>Commercial Business Address & NOC</strong>
                  <br /> <small>Registered rent agreement, electricity bill, and owner NOC for GST/MCA</small>
                </td>
                <td>12 Months</td>
                <td>₹1,249</td>
                <td style={{ textAlign: 'right' }}>₹14,988</td>
              </tr>
              <tr>
                <td>
                  <strong>Dedicated GST Support & Officer Visit Attendance</strong>
                  <br /> <small>Physical board signage, documentation response, and verification</small>
                </td>
                <td>12 Months</td>
                <td>₹350</td>
                <td style={{ textAlign: 'right' }}>₹4,200</td>
              </tr>
              <tr>
                <td>
                  <strong>Physical Mail & Courier Forwarding Concierge</strong>
                  <br /> <small>Daily mail logging and digital envelope scans</small>
                </td>
                <td>12 Months</td>
                <td>₹299</td>
                <td style={{ textAlign: 'right' }}>₹3,588</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right' }}>
                  Subtotal:
                </td>
                <td style={{ textAlign: 'right' }} id="propSubtotal">
                  ₹22,776
                </td>
              </tr>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', color: 'var(--vd-gold-primary)' }}>
                  Annual Discount (20% Off):
                </td>
                <td style={{ textAlign: 'right', color: 'var(--vd-gold-primary)' }} id="propDiscount">
                  -₹4,555
                </td>
              </tr>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right' }}>
                  Applicable GST (18%):
                </td>
                <td style={{ textAlign: 'right' }} id="propGst">
                  ₹3,279
                </td>
              </tr>
              <tr className="grand-total-row">
                <td colSpan="3" style={{ textAlign: 'right' }}>
                  <strong>Total Payable:</strong>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <strong id="propTotal">₹21,499</strong>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="proposal-terms">
            <strong>Key Terms & Compliance Notes:</strong>
            <ul>
              <li>
                Deliverables include notarized rent agreement, electricity bill copy, and owner NOC issued within 24
                working hours of KYC clearance.
              </li>
              <li>
                100% money-back guarantee in case of rejection by tax authority due to address documentation defect.
              </li>
              <li>
                Assigned Solutions Specialist: <strong>Adv. Rahul Deshmukh</strong> (+91 98765 43210 •
                rahul@vdeskworkspace.com)
              </li>
            </ul>
          </div>
          <div className="proposal-actions">
            <button type="button" className="btn btn--outline" onClick={() => copyQuoteLink()}>
              <i className="ph-bold ph-link" />
              Copy Share Link
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => window.print()}>
              <i className="ph-bold ph-printer" />
              Print / PDF
            </button>
            <button type="button" className="btn btn--primary" onClick={() => proceedQuoteToPayment()}>
              <i className="ph-bold ph-credit-card" />
              Accept & Pay Online →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
