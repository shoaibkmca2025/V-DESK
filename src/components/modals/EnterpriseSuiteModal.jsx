import {
  handleEnterpriseDeskChange,
  submitEnterpriseRfp,
  toggleEnterpriseCity,
} from '@/features/enterprise/enterpriseSuite.js';
import { closeModal } from '@/features/modals/modalManager.js';
import { rawStyle } from '@/lib/domRefs.js';

/** Enterprise multi-city bulk desk estimator & RFP dialog. */
export default function EnterpriseSuiteModal() {
  return (
    <div
      className="modal-overlay"
      id="enterpriseSuiteModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enterpriseSuiteModalTitle"
    >
      <div className="modal-backdrop" onClick={() => closeModal('enterpriseSuiteModal')} />
      <div
        className="modal-container"
        ref={rawStyle(
          'max-width: 820px; background: #05132B; color: #FFFFFF; border: 1px solid rgba(197,146,57,0.3); border-radius: 16px; padding: 32px;',
        )}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                background: '#C59239',
                color: '#000',
                padding: '2px 8px',
                fontWeight: '800',
                borderRadius: '4px',
              }}
            >
              P2 ENTERPRISE
            </span>
            <h3 id="enterpriseSuiteModalTitle" style={{ margin: '4px 0 0 0', color: '#FFFFFF', fontSize: '1.4rem' }}>
              Enterprise Multi-City Workspace Platform
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
              Bulk desk allocation, custom master services agreements (MSA), and centralized billing across 10+ Indian
              metros.
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => closeModal('enterpriseSuiteModal')}
            aria-label="Close modal"
          >
            <i className="ph-bold ph-x" />
          </button>
        </div>
        <form onSubmit={(event) => submitEnterpriseRfp(event)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label
                style={{
                  fontSize: '0.82rem',
                  color: '#CBD5E1',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                1. Select Commercial Hubs for Your Team:
              </label>
              <div className="enterprise-cities-chips">
                <button
                  type="button"
                  className="enterprise-city-chip active"
                  onClick={(event) => toggleEnterpriseCity('Mumbai', event.currentTarget)}
                >
                  Mumbai (BKC / Andheri)
                </button>
                <button
                  type="button"
                  className="enterprise-city-chip active"
                  onClick={(event) => toggleEnterpriseCity('Bangalore', event.currentTarget)}
                >
                  Bangalore (Koramangala)
                </button>
                <button
                  type="button"
                  className="enterprise-city-chip"
                  onClick={(event) => toggleEnterpriseCity('Delhi-NCR', event.currentTarget)}
                >
                  Delhi / Gurgaon
                </button>
                <button
                  type="button"
                  className="enterprise-city-chip"
                  onClick={(event) => toggleEnterpriseCity('Pune', event.currentTarget)}
                >
                  Pune (Baner)
                </button>
                <button
                  type="button"
                  className="enterprise-city-chip"
                  onClick={(event) => toggleEnterpriseCity('Hyderabad', event.currentTarget)}
                >
                  Hyderabad (HITEC City)
                </button>
                <button
                  type="button"
                  className="enterprise-city-chip"
                  onClick={(event) => toggleEnterpriseCity('Nashik', event.currentTarget)}
                >
                  Nashik (Flagship HQ)
                </button>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <label style={{ fontSize: '0.82rem', color: '#CBD5E1', fontWeight: '600' }}>
                    2. Total Required Capacity:
                  </label>
                  <strong id="entDeskCountDisplay" style={{ color: '#C59239' }}>
                    50 Desks / Cabins
                  </strong>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  defaultValue="50"
                  style={{ width: '100%', accentColor: '#C59239' }}
                  onInput={(event) => handleEnterpriseDeskChange(event.currentTarget.value)}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: '#64748B',
                    marginTop: '4px',
                  }}
                >
                  <span>20 Seats</span>
                  <span>100 Seats</span>
                  <span>250 Seats</span>
                  <span>500+ Seats</span>
                </div>
              </div>
              <div
                style={{
                  marginTop: '20px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Enterprise Amenities Included:
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '0.78rem',
                    color: '#E2E8F0',
                  }}
                >
                  <div>✓ Dedicated Key Account Director</div>
                  <div>✓ Consolidated Single Monthly GST Invoice</div>
                  <div>✓ Unlimited High-Speed Fiber Mesh</div>
                  <div>✓ Biometric & Access Control Suite</div>
                  <div>✓ Dedicated Executive Cabins</div>
                  <div>✓ 50 Hours 4K Boardroom Credits</div>
                </div>
              </div>
            </div>
            <div>
              <div className="enterprise-kpi-banner">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#C59239', fontWeight: '700' }}>
                  Dynamic Enterprise Rate
                </span>
                <div
                  style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}
                  id="entMonthlyRate"
                >
                  ₹6,799 / seat / mo
                </div>
                <span
                  id="entDiscountRate"
                  style={{
                    background: 'rgba(16,185,129,0.2)',
                    color: '#10B981',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '700',
                  }}
                >
                  15% Enterprise Bulk Rebate
                </span>
                <div
                  style={{
                    marginTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '12px',
                    fontSize: '0.82rem',
                    lineHeight: '1.8',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Selected Metros:</span>
                    <strong id="entCitiesSelected" style={{ color: '#FFF' }}>
                      Mumbai, Bangalore
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Estimated Annual Investment:</span>
                    <strong id="entTotalAnnual" style={{ color: '#C59239' }}>
                      ₹48,09,892 / yr
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Savings vs Traditional Leases:</span>
                    <strong id="entSavingsAnnual" style={{ color: '#10B981' }}>
                      ₹65,18,000 Savings
                    </strong>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="text"
                  id="entContactName"
                  className="form-input"
                  placeholder="Your Name"
                  required
                  ref={rawStyle(
                    'background: #081D40; color: #FFF; border-color: rgba(255,255,255,0.2); padding: 8px 12px; font-size: 0.85rem;',
                  )}
                />
                <input
                  type="text"
                  id="entCompanyName"
                  className="form-input"
                  placeholder="Company Name"
                  required
                  ref={rawStyle(
                    'background: #081D40; color: #FFF; border-color: rgba(255,255,255,0.2); padding: 8px 12px; font-size: 0.85rem;',
                  )}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="email"
                  id="entContactEmail"
                  className="form-input"
                  placeholder="Work Email"
                  required
                  ref={rawStyle(
                    'background: #081D40; color: #FFF; border-color: rgba(255,255,255,0.2); padding: 8px 12px; font-size: 0.85rem;',
                  )}
                />
                <input
                  type="tel"
                  id="entContactPhone"
                  className="form-input"
                  placeholder="Mobile / WhatsApp"
                  required
                  ref={rawStyle(
                    'background: #081D40; color: #FFF; border-color: rgba(255,255,255,0.2); padding: 8px 12px; font-size: 0.85rem;',
                  )}
                />
              </div>
              <button
                type="submit"
                className="btn btn--gold btn--full"
                style={{ padding: '14px', fontSize: '0.95rem' }}
              >
                <i className="ph-bold ph-file-text" />
                Dispatch Enterprise RFP & Get Custom Deck
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
