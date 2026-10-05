import { simulateKycDocUpload, submitKycApplication } from '@/features/kyc/kyc.js';
import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';

/** Digital KYC document upload dialog. */
export default function DigitalKycModal() {
  return (
    <div
      className="modal-overlay"
      id="digitalKycModal"
      onClick={(event) => closeModalOnBackdrop(event, 'digitalKycModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--kyc" role="dialog" aria-modal="true">
        <div className="modal-card__header">
          <div className="legal-modal__title-wrap">
            <span className="legal-modal__badge">
              <i className="ph-bold ph-shield-check" /> Paperless Verification
            </span>
            <h3 className="modal-card__title">Digital KYC & Verification Desk</h3>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('digitalKycModal')}>
            ×
          </button>
        </div>
        <p className="modal-card__subtitle">
          Mandatory compliance under CGST Act 2017 & MCA SPICe+ rules. Documents are encrypted and verified within 4
          hours.
        </p>
        <div className="kyc-doc-uploader">
          <div className="kyc-doc-list">
            <div className="kyc-doc-row">
              <div className="doc-icon">
                <i className="ph-bold ph-identification-card" />
              </div>
              <div className="doc-details">
                <strong>1. Company / Signatory PAN Card *</strong>
                <span>Government issued PAN card (Clear color scan)</span>
              </div>
              <div className="doc-action">
                <label className="doc-upload-btn">
                  <input type="file" onChange={(event) => simulateKycDocUpload(event.currentTarget, 'PAN Card')} />
                  <i className="ph-bold ph-upload-simple" />
                  Upload
                </label>
                <span className="doc-status uploaded" id="kycStatusPAN">
                  <i className="ph-bold ph-check" /> Uploaded
                </span>
              </div>
            </div>
            <div className="kyc-doc-row">
              <div className="doc-icon">
                <i className="ph-bold ph-address-book" />
              </div>
              <div className="doc-details">
                <strong>2. Aadhaar / Passport of Director *</strong>
                <span>Front & Back address proof with masked UIDAI</span>
              </div>
              <div className="doc-action">
                <label className="doc-upload-btn">
                  <input type="file" onChange={(event) => simulateKycDocUpload(event.currentTarget, 'Aadhaar Card')} />
                  <i className="ph-bold ph-upload-simple" />
                  Upload
                </label>
                <span className="doc-status uploaded" id="kycStatusAadhaar">
                  <i className="ph-bold ph-check" /> Uploaded
                </span>
              </div>
            </div>
            <div className="kyc-doc-row">
              <div className="doc-icon">
                <i className="ph-bold ph-buildings" />
              </div>
              <div className="doc-details">
                <strong>3. Certificate of Incorporation / Partnership Deed</strong>
                <span>MCA CIN or Registered LLP agreement (Optional for Sole Prop)</span>
              </div>
              <div className="doc-action">
                <label className="doc-upload-btn">
                  <input type="file" onChange={(event) => simulateKycDocUpload(event.currentTarget, 'COI')} />
                  <i className="ph-bold ph-upload-simple" />
                  Upload
                </label>
                <span className="doc-status pending" id="kycStatusCOI">
                  Pending Upload
                </span>
              </div>
            </div>
            <div className="kyc-doc-row">
              <div className="doc-icon">
                <i className="ph-bold ph-bank" />
              </div>
              <div className="doc-details">
                <strong>4. Bank Proof / Cancelled Cheque</strong>
                <span>Bank statement showing company name or director name</span>
              </div>
              <div className="doc-action">
                <label className="doc-upload-btn">
                  <input type="file" onChange={(event) => simulateKycDocUpload(event.currentTarget, 'Bank Proof')} />
                  <i className="ph-bold ph-upload-simple" />
                  Upload
                </label>
                <span className="doc-status uploaded" id="kycStatusBank">
                  <i className="ph-bold ph-check" /> Uploaded
                </span>
              </div>
            </div>
          </div>
          <div className="kyc-otp-box">
            <div className="otp-header">
              <i className="ph-bold ph-fingerprint" />
              <span>Director Aadhaar / Mobile OTP Verification</span>
            </div>
            <div className="otp-inputs">
              <input type="text" maxLength="1" className="otp-digit" defaultValue="4" />
              <input type="text" maxLength="1" className="otp-digit" defaultValue="8" />
              <input type="text" maxLength="1" className="otp-digit" defaultValue="2" />
              <input type="text" maxLength="1" className="otp-digit" defaultValue="1" />
              <span className="otp-verified-badge">
                <i className="ph-bold ph-check-circle" />
                Mobile Verified (+91 98*** **210)
              </span>
            </div>
          </div>
          <label className="kyc-consent-label">
            <input type="checkbox" id="kycConsentCheckbox" defaultChecked />
            <span>
              I hereby give consent to V-DESK Workspace & Consulting LLP to verify identity documents for registered
              lease deed preparation and statutory GST/MCA filing.
            </span>
          </label>
          <div className="kyc-actions">
            <button
              type="button"
              className="btn btn--primary btn--block btn--lg"
              onClick={() => submitKycApplication()}
            >
              <i className="ph-bold ph-paper-plane-tilt" />
              Submit Complete KYC Dossier →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
