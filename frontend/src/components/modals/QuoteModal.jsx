import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';
import { handleModalQuoteSubmit } from '@/features/quote/quoteModal.js';

/** Instant quote request dialog. */
export default function QuoteModal() {
  return (
    <div className="modal-overlay" id="quoteModal" onClick={(event) => closeModalOnBackdrop(event, 'quoteModal')}>
      <div className="modal-card">
        <div className="modal-card__header">
          <h3 className="modal-card__title" id="modalQuoteTitle">
            Get Your Instant Quote
          </h3>
          <button className="modal-card__close" onClick={() => closeModal('quoteModal')}>
            ×
          </button>
        </div>
        <p className="modal-card__subtitle">
          Our business infrastructure specialists will send you an itemized proposal within 15 minutes.
        </p>
        <form id="modalQuoteForm" onSubmit={(event) => handleModalQuoteSubmit(event)}>
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label" htmlFor="mqName">
                Full Name *
              </label>
              <input type="text" id="mqName" className="form-input" placeholder="Your name" required />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mqCompany">
                Company / Brand Name
              </label>
              <input type="text" id="mqCompany" className="form-input" placeholder="e.g. Acme Tech Solutions" />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label" htmlFor="mqMobile">
                Mobile Number *
              </label>
              <input
                type="tel"
                id="mqMobile"
                name="mobile"
                className="form-input"
                placeholder="10-digit mobile"
                pattern={'[0-9]{10}'}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mqEmail">
                Work Email *
              </label>
              <input type="email" id="mqEmail" className="form-input" placeholder="name@company.com" required />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label" htmlFor="mqCity">
                Target City
              </label>
              <select id="mqCity" className="form-select">
                <option value="Nashik">Nashik (Flagship)</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Noida">Noida</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Chennai">Chennai</option>
                <option value="Other">Other Metro</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="mqService">
                Primary Service
              </label>
              <select id="mqService" className="form-select">
                <option value="Virtual Office">Virtual Office for GST</option>
                <option value="Coworking">Coworking Space</option>
                <option value="Private Office">Private Office Cabin</option>
                <option value="Meeting Rooms">Meeting Room</option>
                <option value="Company Registration">Company Registration</option>
                <option value="GST Registration">GST Registration</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="mqMessage">
              Specific Notes
            </label>
            <textarea
              id="mqMessage"
              className="form-textarea"
              rows="2"
              placeholder="e.g. We require registered rent agreement in Mumbai BKC within 48 hours..."
            />
          </div>
          <button type="submit" className="btn btn--primary btn--block">
            Submit Quote Request
            <i className="ph-bold ph-paper-plane-tilt" />
          </button>
        </form>
      </div>
    </div>
  );
}
