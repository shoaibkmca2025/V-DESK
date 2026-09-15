import { openConsultationModal, openQuoteModal } from '@/features/quote/quoteModal.js';

/** SECTION 11 &mdash; FINAL CLOSING CTA "Build Your Business Without Building the Overhead." */
export default function FinalCtaSection() {
  return (
    <section className="section final-cta">
      <div className="container">
        <div className="reveal">
          <div className="section__eyebrow" style={{ justifyContent: 'center' }}>
            Scale Smarter
          </div>
          <h2 className="final-cta__title">
            BUILD YOUR BUSINESS WITHOUT
            <br />
            BUILDING THE OVERHEAD.
          </h2>
          <p className="final-cta__desc">
            From your first registration to your next city, V-DESK gives you the infrastructure to grow.
          </p>
          <div className="final-cta__actions">
            <button className="btn btn--gold btn--lg" onClick={() => openQuoteModal('Final CTA')}>
              <i className="ph-bold ph-paper-plane-tilt" />
              Get Your Exact Quote
            </button>
            <button className="btn btn--secondary btn--lg" onClick={() => openConsultationModal()}>
              <i className="ph-bold ph-calendar-check" />
              Book a Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
