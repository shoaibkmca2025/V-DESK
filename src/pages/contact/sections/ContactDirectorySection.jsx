import { handleContactSubmit } from '@/features/leads/leadForms.js';
import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: DUAL INBOUND CONSULTATION & HEADQUARTERS DIRECTORY */
export default function ContactDirectorySection() {
  return (
    <section className="section dark-luxury-section" ref={rawStyle('padding: 70px 0; background: #05132B !important;')}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '36px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  color: 'var(--vd-teal-primary)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Direct Advisory
              </span>
              <h2 style={{ color: '#081D40', fontSize: '1.5rem', margin: '4px 0 6px 0' }}>
                Request Business Consultation
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0' }}>
                Fill out your requirements below and our commercial manager will respond within 30 minutes with a
                customized proposal.
              </p>
            </div>
            <form onSubmit={(event) => handleContactSubmit(event)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="ctName">
                    Full Name *
                  </label>
                  <input type="text" id="ctName" className="form-input" required placeholder="Arjun Mehta" />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="ctPhone">
                    Phone / WhatsApp *
                  </label>
                  <input type="tel" id="ctPhone" className="form-input" required placeholder="+91 98765 43210" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="ctEmail">
                    Corporate Email *
                  </label>
                  <input type="email" id="ctEmail" className="form-input" required placeholder="arjun@company.in" />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="ctCompany">
                    Company Name
                  </label>
                  <input type="text" id="ctCompany" className="form-input" placeholder="Apex Dynamics LLP" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="ctService">
                    Service Required *
                  </label>
                  <select id="ctService" className="form-select">
                    <option value="Virtual Office for GST">Virtual Office for GST Registration</option>
                    <option value="Virtual Office for MCA">Virtual Office for MCA Incorporation</option>
                    <option value="Coworking Dedicated Desks">Coworking Dedicated Desks</option>
                    <option value="Private Executive Cabin">Private Executive Cabin</option>
                    <option value="Meeting Room Reservation">Meeting Room Reservation</option>
                    <option value="Multi-City Enterprise">Multi-City Enterprise Expansion</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="ctCity">
                    Target City *
                  </label>
                  <select id="ctCity" className="form-select">
                    <option value="Nashik">Nashik (Flagship HQ)</option>
                    <option value="Mumbai">Mumbai (BKC)</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Other">Other Metro</option>
                  </select>
                </div>
              </div>
              <div className="form-field" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="ctMessage">
                  Specific Requirements / Inquiries
                </label>
                <textarea
                  id="ctMessage"
                  className="form-input"
                  rows="3"
                  placeholder="Describe your timeline, number of states required, or custom layout needs..."
                />
              </div>
              <button type="submit" className="btn btn--primary btn--full btn--lg">
                <i className="ph-bold ph-paper-plane-tilt" />
                Submit Inquiry to Commercial Desk →
              </button>
            </form>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              ref={rawStyle(
                'background: #081D40; color: #FFFFFF; border-radius: 14px; padding: 26px; border: 2px solid #C59239;',
              )}
            >
              <span
                style={{
                  background: '#C59239',
                  color: '#05132B',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                }}
              >
                Corporate Headquarters
              </span>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.3rem', margin: '10px 0 6px 0' }}>Nashik Flagship Campus</h3>
              <p style={{ color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '16px' }}>
                V-DESK Workspace & Consulting LLP, Level 4, Business Bay, College Road, Nashik 422005, Maharashtra.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: '#E2E8F0',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '14px',
                }}
              >
                <div>
                  <i className="ph-bold ph-phone-call" style={{ color: '#C59239' }} /> Phone: +91 253 234 5678
                </div>
                <div>
                  <i className="ph-bold ph-whatsapp-logo" style={{ color: '#10B981' }} /> WhatsApp Concierge: +91 98765
                  43210
                </div>
                <div>
                  <i className="ph-bold ph-envelope" style={{ color: '#C59239' }} /> Direct Desk: info@vdesk.in /
                  legal@vdesk.in
                </div>
                <div>
                  <i className="ph-bold ph-clock" style={{ color: '#94A3B8' }} /> Hours: Mon – Sat: 9:00 AM – 8:00 PM
                  IST
                </div>
              </div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px' }}>
              <h4 style={{ color: '#081D40', margin: '0 0 14px 0', fontSize: '1.1rem' }}>
                <i className="ph-bold ph-buildings" /> Regional Corporate Liaisons
              </h4>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: '#334155' }}
              >
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <strong style={{ color: '#081D40' }}>Mumbai Hub:</strong> G Block, BKC Business Centre, Bandra East,
                  Mumbai 400051
                </div>
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <strong style={{ color: '#081D40' }}>Delhi NCR Hub:</strong> Statesman House, Barakhamba Road,
                  Connaught Place, New Delhi 110001
                </div>
                <div>
                  <strong style={{ color: '#081D40' }}>Bangalore Hub:</strong> 80ft Road, 4th Block, Koramangala,
                  Bengaluru 560034
                </div>
              </div>
            </div>
            <div
              style={{
                background: '#FAF8F3',
                border: '1px solid #E8E2D8',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <strong style={{ color: '#081D40', fontSize: '0.95rem', display: 'block' }}>
                  Emergency GST Notice or Inspection?
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Connect with on-duty CA immediately on WhatsApp.
                </span>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20have%20an%20urgent%20compliance%20question"
                target="_blank"
                rel="noopener"
                className="btn btn--secondary btn--sm"
              >
                <i className="ph-bold ph-whatsapp-logo" />
                Instant WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
