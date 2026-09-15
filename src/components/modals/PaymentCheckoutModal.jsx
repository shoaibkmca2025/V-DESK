import { simulatePaymentProcessing, switchPayMethod } from '@/features/checkout/checkout.js';
import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';

/** Unified payment checkout dialog. */
export default function PaymentCheckoutModal() {
  return (
    <div
      className="modal-overlay"
      id="paymentCheckoutModal"
      onClick={(event) => closeModalOnBackdrop(event, 'paymentCheckoutModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--checkout" role="dialog" aria-modal="true">
        <div className="modal-card__header">
          <div className="legal-modal__title-wrap">
            <span className="legal-modal__badge">
              <i className="ph-bold ph-lock-key" /> 256-Bit Encrypted Gateway
            </span>
            <h3 className="modal-card__title">Checkout & Instant Activation</h3>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('paymentCheckoutModal')}>
            ×
          </button>
        </div>
        <div className="checkout-layout">
          <div className="checkout-methods">
            <div className="checkout-tabs">
              <button type="button" className="pay-tab active" onClick={() => switchPayMethod('upi')}>
                <i className="ph-bold ph-qr-code" /> UPI / QR
              </button>{' '}
              <button type="button" className="pay-tab" onClick={() => switchPayMethod('card')}>
                <i className="ph-bold ph-credit-card" /> Card
              </button>{' '}
              <button type="button" className="pay-tab" onClick={() => switchPayMethod('netbanking')}>
                <i className="ph-bold ph-bank" /> Net Banking
              </button>
            </div>
            <div className="pay-body" id="payMethodUpi">
              <div className="upi-qr-box">
                <div className="qr-placeholder">
                  <i className="ph-bold ph-qr-code qr-big-icon" />{' '}
                  <span>Scan with Google Pay, PhonePe, Paytm or BHIM</span>
                </div>
                <div className="upi-id-row">
                  <span>Or enter UPI VPA ID:</span>
                  <div className="upi-input-flex">
                    <input type="text" className="form-input" placeholder="username@okhdfcbank" id="upiVpaInput" />{' '}
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => simulatePaymentProcessing('UPI ID')}
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="pay-body" id="payMethodCard" style={{ display: 'none' }}>
              <div className="form-field">
                <label className="form-label">Card Number</label>
                <input type="text" className="form-input" placeholder="4532 •••• •••• 8921" maxLength="19" />
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Expiry MM/YY</label>
                  <input type="text" className="form-input" placeholder="12/28" maxLength="5" />
                </div>
                <div className="form-field">
                  <label className="form-label">CVV</label>
                  <input type="password" className="form-input" placeholder="•••" maxLength="3" />
                </div>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--block btn--lg"
                style={{ marginTop: '10px' }}
                onClick={() => simulatePaymentProcessing('Card')}
              >
                Pay Securely →
              </button>
            </div>
            <div className="pay-body" id="payMethodNetbanking" style={{ display: 'none' }}>
              <label className="form-label">Select Bank</label>
              <div className="bank-grid">
                <button type="button" className="bank-pill" onClick={() => simulatePaymentProcessing('HDFC Bank')}>
                  HDFC Bank
                </button>{' '}
                <button type="button" className="bank-pill" onClick={() => simulatePaymentProcessing('ICICI Bank')}>
                  ICICI Bank
                </button>{' '}
                <button type="button" className="bank-pill" onClick={() => simulatePaymentProcessing('SBI')}>
                  State Bank of India
                </button>{' '}
                <button type="button" className="bank-pill" onClick={() => simulatePaymentProcessing('Axis Bank')}>
                  Axis Bank
                </button>
              </div>
            </div>
          </div>
          <div className="checkout-summary-box">
            <h4>Order Summary</h4>
            <div className="checkout-summary-row">
              <span id="chkProductName">Virtual Office Package</span> <strong id="chkSubtotal">₹18,220</strong>
            </div>
            <div className="checkout-summary-row">
              <span>GST (18%):</span> <strong id="chkGst">₹3,279</strong>
            </div>
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-row checkout-summary-row--total">
              <span>Payable Amount:</span> <strong id="chkTotal">₹21,499</strong>
            </div>
            <div className="checkout-trust-badge">
              <i className="ph-bold ph-shield-check" /> <span>Tax Invoice issued instantly upon confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
