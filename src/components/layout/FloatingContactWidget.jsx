import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** Floating WhatsApp / call widget. */
export default function FloatingContactWidget() {
  return (
    <aside className="floating-contact-widget" id="floatingContactWidget" aria-label="Direct Expert Support">
      <a
        href="https://wa.me/919876543210?text=Hi%20V-DESK%20Team,%20I%20am%20interested%20in%20a%20Virtual%20Office%20plan"
        target="_blank"
        rel="noopener"
        className="floating-whatsapp-btn"
        aria-label="Chat with expert on WhatsApp"
      >
        <i className="ph-bold ph-whatsapp-logo" style={{ fontSize: '1.3rem' }} />
        <span>WhatsApp Us</span>
      </a>
      <button
        className="floating-callback-btn"
        onClick={() => openQuoteModal('Floating Dock - Quick Callback')}
        aria-label="Request Instant Callback"
      >
        <i className="ph-bold ph-phone-call" style={{ fontSize: '1.15rem', color: 'var(--vd-teal-light)' }} />
        <span>Request Callback</span>
      </button>
    </aside>
  );
}
