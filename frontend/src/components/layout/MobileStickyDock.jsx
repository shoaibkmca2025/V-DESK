import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** Sticky conversion dock on small screens. */
export default function MobileStickyDock() {
  return (
    <aside className="mobile-sticky-dock" id="mobileStickyDock" aria-label="Quick Booking Actions">
      <div className="mobile-sticky-dock__inner">
        <div className="mobile-sticky-dock__info">
          <div className="mobile-sticky-dock__price">
            From <strong>₹799</strong>
            <small>/mo</small>
          </div>
          <div className="mobile-sticky-dock__rating">
            <i className="ph-fill ph-star" />
            4.9 (2,400+ reviews)
          </div>
        </div>
        <div className="mobile-sticky-dock__actions">
          <a
            href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20a%20workspace%20quote"
            target="_blank"
            rel="noopener"
            className="btn-dock-whatsapp"
            aria-label="Chat on WhatsApp"
          >
            <i className="ph-bold ph-whatsapp-logo" />
          </a>
          <button
            className="btn btn--primary btn--sm btn-dock-quote"
            onClick={() => openQuoteModal('Mobile Sticky Dock')}
          >
            <i className="ph-bold ph-paper-plane-tilt" />
            Get Quote
          </button>
        </div>
      </div>
    </aside>
  );
}
