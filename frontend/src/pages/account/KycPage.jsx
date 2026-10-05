import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { showToast } from '@/features/ui/toast.js';

const DOCUMENTS = [
  ['pan', 'ph-identification-card', 'Company / Signatory PAN Card', 'Government issued PAN card (clear colour scan)', true],
  ['aadhaar', 'ph-address-book', 'Aadhaar / Passport of Director', 'Front & back with masked UIDAI number', true],
  ['incorporation', 'ph-buildings', 'Certificate of Incorporation / Partnership Deed', 'MCA CIN or registered LLP agreement (optional for sole proprietors)', false],
  ['bank', 'ph-bank', 'Bank Proof', 'Cancelled cheque or first page of passbook', true],
  ['photo', 'ph-user-focus', 'Passport Photograph', 'Recent photograph of the authorised signatory', true],
  ['signature', 'ph-signature', 'Specimen Signature', 'Signature on white paper', false],
];

const STAGES = ['Uploaded', 'Under Review', 'Approved'];

/** /kyc — standalone digital KYC flow (PRD §46–47). Only file names are kept in memory; nothing is persisted. */
export default function KycPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState({});
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const requiredDone = DOCUMENTS.filter((d) => d[4]).every((d) => files[d[0]]);
  const progress = Math.round((Object.keys(files).length / DOCUMENTS.length) * 100);

  function upload(key, label, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please upload a file under 5 MB.', 'warning');
      input.value = '';
      return;
    }
    setFiles((f) => ({ ...f, [key]: file.name }));
    showToast('Document Uploaded', `${label} (${file.name}) received securely.`, 'success');
    trackSearchEvent('document_uploaded', { docType: label, fileName: file.name });
  }

  function submit() {
    if (!requiredDone) {
      showToast('Documents Missing', 'Upload all mandatory documents to continue.', 'warning');
      return;
    }
    if (!consent) {
      showToast('Consent Required', 'Please confirm statutory verification consent.', 'info');
      return;
    }
    setSubmitted(true);
    trackSearchEvent('kyc_submitted', { documents: Object.keys(files).length });
    showToast('KYC Application Submitted', 'Compliance team will verify documents within 4 working hours.', 'success');
  }

  return (
    <main id="main-content" className="ui-page">
      <Breadcrumbs trail={[{ label: 'Client Portal', to: '/portal' }, { label: 'Digital KYC' }]} />
      <PageHero
        id="kycHero"
        badge="Secure Verification • AES-256 Encrypted"
        badgeIcon="ph-fingerprint"
        title="Digital KYC"
        highlight="Verified Within 4 Working Hours"
        description="Mandatory under the CGST Act 2017 and MCA SPICe+ rules before a rent agreement and NOC can be issued in your entity's name."
        stats={[
          ['4 Hrs', 'Verification SLA'],
          ['6', 'Document Types'],
          ['AES-256', 'Encryption'],
          ['Zero', 'Third-Party Sharing'],
        ]}
      />

      <section className="section" style={{ padding: '60px 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: '980px' }}>
          {submitted ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
              <i className="ph-bold ph-seal-check" style={{ fontSize: '3rem', color: '#10B981' }} />
              <h2 style={{ color: '#081D40', margin: '12px 0 6px' }}>Application Submitted</h2>
              <p style={{ color: '#64748B', maxWidth: '520px', margin: '0 auto 22px' }}>Your dossier is with the compliance desk. You will receive a WhatsApp and email update once documents are approved; rejections always include the reason and a re-upload link.</p>
              <div className="booking-state-stepper" style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
                {STAGES.map((s, i) => (
                  <span key={s} className={`kyc-status-badge ${i < 2 ? 'verified' : ''}`}>
                    {i < 2 ? '✓ ' : ''}
                    {s}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn--gold" onClick={() => navigate('/portal')}>
                  Go to Portal <i className="ph-bold ph-arrow-right" />
                </button>
                <Link to="/" className="btn btn--outline">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(240px, 300px)', gap: '24px', alignItems: 'start' }} className="kyc-layout">
              <div className="kyc-doc-uploader" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
                <div className="kyc-doc-list">
                  {DOCUMENTS.map(([key, icon, label, hint, required], index) => (
                    <div key={key} className="kyc-doc-row">
                      <div className="doc-icon">
                        <i className={`ph-bold ${icon}`} />
                      </div>
                      <div className="doc-details">
                        <strong>
                          {index + 1}. {label} {required ? '*' : ''}
                        </strong>
                        <span>{files[key] ? `Uploaded: ${files[key]}` : hint}</span>
                      </div>
                      <div className="doc-action">
                        <label className="doc-upload-btn">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => upload(key, label, e.currentTarget)} />
                          <i className="ph-bold ph-upload-simple" />
                          {files[key] ? 'Replace' : 'Upload'}
                        </label>
                        <span className={`doc-status ${files[key] ? 'uploaded' : ''}`}>
                          <i className={`ph-bold ${files[key] ? 'ph-check' : 'ph-clock'}`} /> {files[key] ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '20px', fontSize: '0.86rem', color: '#334155' }}>
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span>
                    I authorise V-DESK Workspace & Consulting LLP to verify these documents with statutory authorities and issue the rent agreement, NOC and utility bill in my entity's name. See the <Link to="/legal/privacy">Privacy Policy</Link>.
                  </span>
                </label>
                <button type="button" className="btn btn--gold btn--full" style={{ marginTop: '18px', padding: '13px', fontWeight: '700' }} onClick={submit}>
                  <i className="ph-bold ph-paper-plane-tilt" />
                  Submit KYC Application →
                </button>
              </div>
              <aside style={{ background: '#081D40', borderRadius: '16px', padding: '22px', color: '#FFF', position: 'sticky', top: '100px' }}>
                <strong style={{ color: '#DFB15B', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Progress</strong>
                <div style={{ fontSize: '2rem', fontWeight: '800', margin: '6px 0' }}>{progress}%</div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '6px', overflow: 'hidden', marginBottom: '18px' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#C59239', transition: 'width 0.3s' }} />
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.84rem', lineHeight: '1.9', color: '#CBD5E1' }}>
                  <li>
                    <i className="ph-bold ph-check-circle" style={{ color: '#10B981' }} /> Accepted: PDF, JPG, PNG (max 5 MB)
                  </li>
                  <li>
                    <i className="ph-bold ph-check-circle" style={{ color: '#10B981' }} /> Masked Aadhaar recommended
                  </li>
                  <li>
                    <i className="ph-bold ph-check-circle" style={{ color: '#10B981' }} /> Documents stay encrypted
                  </li>
                  <li>
                    <i className="ph-bold ph-check-circle" style={{ color: '#10B981' }} /> Rejections include a reason
                  </li>
                </ul>
                <a href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20help%20with%20KYC" target="_blank" rel="noopener" className="btn btn--glass btn--sm btn--full" style={{ marginTop: '18px' }}>
                  <i className="ph-bold ph-whatsapp-logo" /> Need help? WhatsApp us
                </a>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
