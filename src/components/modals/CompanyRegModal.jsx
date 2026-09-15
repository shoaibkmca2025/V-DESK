import { proceedEntityToQuote, selectCompanyEntity } from '@/features/companyRegistration/companyRegistration.js';
import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';

/** Company registration entity picker dialog. */
export default function CompanyRegModal() {
  return (
    <div
      className="modal-overlay"
      id="companyRegModal"
      onClick={(event) => closeModalOnBackdrop(event, 'companyRegModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--wide" role="dialog" aria-modal="true">
        <div className="modal-card__header">
          <div className="legal-modal__title-wrap">
            <span className="legal-modal__badge">
              <i className="ph-bold ph-file-text" /> START Foundation
            </span>
            <h3 className="modal-card__title">Company Incorporation Platform</h3>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('companyRegModal')}>
            ×
          </button>
        </div>
        <div className="entity-picker-grid">
          <div className="entity-card active" onClick={(event) => selectCompanyEntity(event.currentTarget, 'Pvt Ltd')}>
            <div className="entity-badge">Most Popular</div>
            <h4>Private Limited Company</h4>
            <p>For high-growth startups seeking equity investment, ESOP pools, and limited liability.</p>
            <div className="entity-price">
              ₹4,999 <small>+ Govt Fees</small>
            </div>
          </div>
          <div className="entity-card" onClick={(event) => selectCompanyEntity(event.currentTarget, 'LLP')}>
            <div className="entity-badge">Low Compliance</div>
            <h4>Limited Liability Partnership (LLP)</h4>
            <p>Best for consulting, service agencies, professional firms, and multi-partner ventures.</p>
            <div className="entity-price">
              ₹3,999 <small>+ Govt Fees</small>
            </div>
          </div>
          <div className="entity-card" onClick={(event) => selectCompanyEntity(event.currentTarget, 'OPC')}>
            <div className="entity-badge">Solo Founder</div>
            <h4>One Person Company (OPC)</h4>
            <p>100% corporate identity and protection for single founders with zero co-founder requirement.</p>
            <div className="entity-price">
              ₹4,499 <small>+ Govt Fees</small>
            </div>
          </div>
          <div className="entity-card" onClick={(event) => selectCompanyEntity(event.currentTarget, 'Section 8')}>
            <div className="entity-badge">Non-Profit</div>
            <h4>Section 8 Foundation</h4>
            <p>For NGOs, trusts, research consortiums, and social impact enterprises.</p>
            <div className="entity-price">
              ₹7,999 <small>+ Govt Fees</small>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn--outline" onClick={() => closeModal('companyRegModal')}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={() => proceedEntityToQuote()}>
            <span>Proceed with Selected Entity →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
