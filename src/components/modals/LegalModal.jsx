import { switchLegalTab } from '@/features/legal/legalModal.js';
import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';

/** Legal & compliance documents dialog. */
export default function LegalModal() {
  return (
    <div className="modal-overlay" id="legalModal" onClick={(event) => closeModalOnBackdrop(event, 'legalModal')}>
      <div className="modal-card modal-card--legal">
        <div className="modal-card__header">
          <div className="legal-modal__title-wrap">
            <span className="legal-modal__badge">
              <i className="ph-bold ph-shield-check" /> Verified LLP Compliance
            </span>
            <h3 className="modal-card__title" id="legalModalTitle">
              V-DESK Corporate Legal Framework
            </h3>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('legalModal')}>
            ×
          </button>
        </div>
        <div className="legal-modal__tabs">
          <button className="legal-modal__tab-btn active" id="tabBtn-terms" onClick={() => switchLegalTab('terms')}>
            Terms of Service
          </button>
          <button className="legal-modal__tab-btn" id="tabBtn-privacy" onClick={() => switchLegalTab('privacy')}>
            Privacy Policy
          </button>
          <button className="legal-modal__tab-btn" id="tabBtn-refund" onClick={() => switchLegalTab('refund')}>
            Refund Policy
          </button>
          <button className="legal-modal__tab-btn" id="tabBtn-compliance" onClick={() => switchLegalTab('compliance')}>
            GST & MCA Compliance
          </button>
        </div>
        <div className="legal-modal__body" id="legalModalBody" />
      </div>
    </div>
  );
}
