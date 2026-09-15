import { switchKycTab } from '@/features/kyc/kyc.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** KYC document checklist by entity type. */
export default function KycDocuments() {
  return (
    <section className="kyc-section" id="kycDocs">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-file-text" />
            Transparent Compliance
          </span>
          <h2 className="section__title">
            REQUIRED KYC <span className="highlight-gold">DOCUMENTS</span>
          </h2>
          <p className="section__desc">
            Clear, paperless checklist required for fast registration, agreement execution, and 100% approval by tax
            officers.
          </p>
        </div>
        <div className="kyc-tabs-nav reveal">
          <button
            type="button"
            className="kyc-tab-btn active"
            onClick={(event) => switchKycTab('individual', event.currentTarget)}
          >
            <i className="ph-bold ph-user" /> Sole Proprietor / Individual
          </button>
          <button
            type="button"
            className="kyc-tab-btn"
            onClick={(event) => switchKycTab('partnership', event.currentTarget)}
          >
            <i className="ph-bold ph-users-three" /> LLP & Partnership Firms
          </button>
          <button
            type="button"
            className="kyc-tab-btn"
            onClick={(event) => switchKycTab('company', event.currentTarget)}
          >
            <i className="ph-bold ph-buildings" /> Company (Pvt Ltd, OPC, Public)
          </button>
        </div>
        <div className="kyc-panes-container">
          <div className="kyc-pane active" id="kycPaneIndividual">
            <div className="kyc-doc-list">
              <div className="kyc-doc-item">
                <i className="ph-bold ph-identification-card kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>PAN Card Copy</strong>
                  <span>Self-attested copy of applicant / proprietor's permanent account number card.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-address-book kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Aadhaar Card / Passport Copy</strong>
                  <span>Valid photo identification and residential address proof of the proprietor.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-image kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Passport Size Photograph</strong>
                  <span>Recent color digital photo of the business applicant.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-bank kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Bank Proof / Cancelled Cheque</strong>
                  <span>Copy of cancelled cheque or passbook front page for bank verification.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="kyc-pane" id="kycPanePartnership">
            <div className="kyc-doc-list">
              <div className="kyc-doc-item">
                <i className="ph-bold ph-users kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>PAN & Aadhaar of All Partners</strong>
                  <span>Self-attested identity and address proof copies for each designated partner.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-certificate kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Firm Registration / LLP Agreement</strong>
                  <span>Certificate of Incorporation (COI for LLP) or notarized Partnership Deed.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-files kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Entity PAN Card</strong>
                  <span>Copy of the official PAN card issued in the name of the LLP / Firm.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-bank kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Bank Account Proof</strong>
                  <span>Firm's current account cancelled cheque or bank statement copy.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="kyc-pane" id="kycPaneCompany">
            <div className="kyc-doc-list">
              <div className="kyc-doc-item">
                <i className="ph-bold ph-seal-check kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Certificate of Incorporation (COI)</strong>
                  <span>MCA SPICe+ Incorporation Certificate with CIN (or proposed names for new setup).</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-identification-card kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Directors' KYC (PAN & Aadhaar)</strong>
                  <span>Identity and address verification copies for all appointed Directors / DIN holders.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-file-text kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>MOA & AOA / Board Resolution</strong>
                  <span>Memorandum & Articles of Association and letter of authorization on company letterhead.</span>
                </div>
              </div>
              <div className="kyc-doc-item">
                <i className="ph-bold ph-bank kyc-doc-icon" />
                <div className="kyc-doc-content">
                  <strong>Company PAN & Bank Cheque</strong>
                  <span>
                    Company PAN copy and bank cheque (or initial incorporation documentation for new Pvt Ltd).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button className="btn btn--teal btn--md" onClick={() => openQuoteModal('KYC Document Checklist')}>
            <i className="ph-bold ph-download-simple" />
            Download Complete KYC Checklist
          </button>
        </div>
      </div>
    </section>
  );
}
