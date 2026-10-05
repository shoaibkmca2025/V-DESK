import {
  closeAllLocationsModal,
  filterCityFromModal,
  filterModalStates,
  selectStateFromModal,
} from '@/features/locations/allLocationsModal.js';
import { closeModalOnBackdrop } from '@/features/modals/modalManager.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** All cities & states coverage dialog. */
export default function AllLocationsModal() {
  return (
    <div
      className="modal-overlay"
      id="allLocationsModal"
      onClick={(event) => closeModalOnBackdrop(event, 'allLocationsModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--wide" role="dialog" aria-modal="true" aria-label="Pan-India Locations">
        <div
          className="modal-card__header"
          style={{ borderBottom: '1px solid var(--vd-border-soft)', paddingBottom: '16px' }}
        >
          <div className="legal-modal__title-wrap">
            <span
              className="legal-modal__badge"
              style={{
                background: 'rgba(0, 168, 150, 0.12)',
                color: 'var(--vd-teal-primary)',
                borderColor: 'rgba(0, 168, 150, 0.3)',
              }}
            >
              {' '}
              <i className="ph-bold ph-globe-hemisphere-east" /> Pan-India Coverage • 28 States & 8 UTs{' '}
            </span>
            <h3
              className="modal-card__title"
              style={{ marginTop: '6px', fontSize: '1.35rem', color: 'var(--vd-navy-deep)' }}
            >
              Explore V-DESK Approved Workspace Hubs
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--vd-slate-600)', marginTop: '4px' }}>
              CBIC & MCA compliant Grade-A commercial addresses across India with 100% NOC & document guarantee.
            </p>
          </div>
          <button className="modal-card__close" onClick={() => closeAllLocationsModal()}>
            ×
          </button>
        </div>
        <div className="modal-card__body" style={{ padding: '20px 24px', maxHeight: '65vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="modalStateFilterInput"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--vd-navy-deep)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              Quick Search State or City
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="ph-bold ph-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--vd-slate-400)',
                  fontSize: '1rem',
                }}
              />
              <input
                type="text"
                id="modalStateFilterInput"
                className="form-input"
                placeholder="Type city or state (e.g. Bangalore, Gujarat, Kolkata, Noida)..."
                style={{ paddingLeft: '38px', borderRadius: '10px' }}
                onInput={(event) => filterModalStates(event.currentTarget.value)}
              />
            </div>
          </div>
          <div style={{ marginBottom: '22px' }}>
            <h4
              style={{
                fontSize: '0.88rem',
                fontWeight: '700',
                color: 'var(--vd-navy-deep)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="ph-bold ph-buildings" style={{ color: 'var(--vd-teal-primary)' }} />
              Top Tier-1 Metros & Flagships
            </h4>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}
              id="modalMetroGrid"
            >
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Mumbai')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Mumbai</strong> (BKC, Andheri)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Delhi NCR')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Delhi NCR</strong> (CP, Cyber City)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Bangalore')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Bangalore</strong> (K’mangala, HSR)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Pune')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Pune</strong> (Baner, Viman Nagar)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Hyderabad')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Hyderabad</strong> (HITEC, Madhapur)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Nashik')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Nashik</strong> (College Rd HQ)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Chennai')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Chennai</strong> (OMR, Guindy)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
              <button
                className="state-pill"
                onClick={() => filterCityFromModal('Kolkata')}
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span>
                  <strong>Kolkata</strong> (Salt Lake, Sector V)
                </span>
                <i className="ph-bold ph-arrow-right" style={{ color: 'var(--vd-teal-primary)' }} />
              </button>
            </div>
          </div>
          <div>
            <h4
              style={{
                fontSize: '0.88rem',
                fontWeight: '700',
                color: 'var(--vd-navy-deep)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="ph-bold ph-map-pin" style={{ color: 'var(--vd-teal-primary)' }} />
              All 28 States & 8 Union Territories
            </h4>
            <div className="state-pill-grid" id="modalStatesPillContainer">
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Andhra Pradesh');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Andhra Pradesh
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Arunachal Pradesh');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Arunachal Pradesh
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Assam');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Assam (Guwahati)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Bihar');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Bihar (Patna)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Chandigarh');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Chandigarh UT
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Chhattisgarh');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Chhattisgarh (Raipur)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Delhi');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Delhi NCR
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Goa');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Goa (Panaji)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Gujarat');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Gujarat (Ahmedabad, Surat)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Haryana');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Haryana (Gurugram, Faridabad)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Himachal Pradesh');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Himachal Pradesh
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Jammu & Kashmir');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Jammu & Kashmir
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Jharkhand');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Jharkhand (Ranchi, Jamshedpur)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Karnataka');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Karnataka (Bangalore, Mysore)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Kerala');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Kerala (Kochi, Trivandrum)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Madhya Pradesh');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Madhya Pradesh (Indore, Bhopal)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Maharashtra');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Maharashtra (Mumbai, Pune, Nashik)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Manipur');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Manipur
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Meghalaya');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Meghalaya
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Mizoram');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Mizoram
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Nagaland');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Nagaland
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Odisha');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Odisha (Bhubaneswar)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Puducherry');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Puducherry UT
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Punjab');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Punjab (Ludhiana, Mohali)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Rajasthan');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Rajasthan (Jaipur, Udaipur)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Sikkim');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Sikkim
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Tamil Nadu');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Tamil Nadu (Chennai, Coimbatore)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Telangana');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Telangana (Hyderabad)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Tripura');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Tripura
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Uttar Pradesh');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Uttar Pradesh (Noida, Lucknow)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('Uttarakhand');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                Uttarakhand (Dehradun)
              </a>
              <a
                href="#"
                className="state-pill"
                onClick={(event) => {
                  event.preventDefault();
                  selectStateFromModal('West Bengal');
                }}
              >
                <i className="ph-bold ph-map-pin" />
                West Bengal (Kolkata)
              </a>
            </div>
          </div>
          <div
            style={{
              marginTop: '24px',
              padding: '14px 18px',
              background: 'rgba(0, 168, 150, 0.06)',
              borderRadius: '12px',
              border: '1px dashed rgba(0, 168, 150, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--vd-navy-deep)', fontSize: '0.88rem', display: 'block' }}>
                Need a Micro-Market Not Listed?
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--vd-slate-600)' }}>
                We can onboard custom commercial properties across Tier-2/3 industrial clusters within 72 hours.
              </span>
            </div>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => {
                closeAllLocationsModal();
                openQuoteModal('Custom State/City Sourcing');
              }}
            >
              <i className="ph-bold ph-paper-plane-tilt" />
              Request Custom City
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
