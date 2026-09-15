import { handleContactSubmit } from '@/features/leads/leadForms.js';

/** SECTION 12 &mdash; DIRECT CONNECT / CONTACT */
export default function ContactSection() {
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <div className="section__header reveal">
          <span className="section__eyebrow">Direct Connect</span>
          <h2 className="section__title">
            TALK TO A V-DESK
            <br />
            BUSINESS STRATEGIST.
          </h2>
          <p className="section__desc">
            Questions regarding GST documentation, multi-city expansion, or private cabin availability? We're ready to
            assist.
          </p>
        </div>
        <div className="contact__grid">
          <div className="reveal">
            <a href="tel:+919876543210" className="contact__channel">
              <div className="contact__channel-icon">
                <i className="ph-bold ph-phone-call" />
              </div>
              <div>
                <div className="contact__channel-title">Helpline & Support</div>
                <div className="contact__channel-desc">+91 98765 43210 (Mon—Sat, 9:00 AM — 7:30 PM IST)</div>
              </div>
            </a>
            <a href="mailto:contact@vdeskworkspace.com" className="contact__channel">
              <div className="contact__channel-icon">
                <i className="ph-bold ph-envelope" />
              </div>
              <div>
                <div className="contact__channel-title">Official Enterprise Email</div>
                <div className="contact__channel-desc">contact@vdeskworkspace.com</div>
              </div>
            </a>
            <a
              href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20would%20like%20to%20connect%20with%20a%20business%20advisor."
              target="_blank"
              rel="noopener"
              className="contact__channel"
            >
              <div
                className="contact__channel-icon"
                style={{ background: 'rgba(37,211,102,0.1)', borderColor: 'rgba(37,211,102,0.2)', color: '#25D366' }}
              >
                <i className="ph-bold ph-whatsapp-logo" />
              </div>
              <div>
                <div className="contact__channel-title">WhatsApp Fast Channel</div>
                <div className="contact__channel-desc">Instant response • Document checklist & rate card</div>
              </div>
            </a>
          </div>
          <div className="contact__form-card reveal">
            <h3 className="contact__form-title">Send Us a Direct Message</h3>
            <p className="contact__form-desc">
              Our corporate strategists reply within 15 minutes during business hours.
            </p>
            <form id="contactPageForm" onSubmit={(event) => handleContactSubmit(event)}>
              <div className="form-field">
                <label className="form-label" htmlFor="cfName">
                  Your Full Name *
                </label>
                <input type="text" id="cfName" className="form-input" placeholder="e.g. Rahul Sharma" required />
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label" htmlFor="cfMobile">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="cfMobile"
                    className="form-input"
                    placeholder="10-digit mobile"
                    pattern={'[0-9]{10}'}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="cfEmail">
                    Work Email *
                  </label>
                  <input type="email" id="cfEmail" className="form-input" placeholder="name@company.com" required />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="cfMessage">
                  Requirement Details *
                </label>
                <textarea
                  id="cfMessage"
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. We need Virtual Office for GST in Mumbai & Bangalore..."
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary btn--block">
                Send Message
                <i className="ph-bold ph-paper-plane-tilt" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
