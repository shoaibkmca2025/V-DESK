import { openCheckoutModal } from '@/features/checkout/checkout.js';

/** BOTTOM CONVERSION CTA STRIP */
export default function BottomCtaStrip() {
  return (
    <section className="section cw-bottom-cta-strip">
      <div className="container">
        <div className="cw-cta-strip-inner">
          <div className="cw-cta-strip-text">
            <span className="cw-cta-badge">
              <i className="ph-bold ph-sparkle" /> ELEVATE YOUR WORKPLACE
            </span>
            <h2 className="cw-cta-title">Experience Worldmark Aerocity in Person Today</h2>
            <p className="cw-cta-desc">
              Join 10,000+ founders, consultants, and enterprise teams operating from India's most prestigious
              commercial workspaces.
            </p>
          </div>
          <div className="cw-cta-strip-actions">
            <a href="#cwTourCard" className="btn btn--gold btn--lg">
              <i className="ph-bold ph-calendar-check" />
              Schedule Private Tour
            </a>
            <button
              className="btn btn--outline btn--lg"
              onClick={() =>
                openCheckoutModal({ item: 'Instant Drop-in Day Pass', amount: 299, city: 'Delhi Aerocity' })
              }
            >
              <i className="ph-bold ph-ticket" />
              Day Pass ₹299
            </button>
            <a
              href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20would%20like%20to%20schedule%20a%20tour%20at%20Worldmark%20Aerocity"
              target="_blank"
              rel="noopener"
              className="btn btn--glass btn--lg"
            >
              <i className="ph-bold ph-whatsapp-logo" />
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
