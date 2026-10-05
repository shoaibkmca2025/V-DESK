import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';
import { openConsultationModal } from '@/features/quote/quoteModal.js';
import {
  filterExplorerResults,
  quickChipSearch,
  resetExplorerFilters,
  setExplorerCapacity,
  updateExplorerPriceFilter,
} from '@/features/search/universalSearch.js';

/** Universal search results & faceted explorer. */
export default function UniversalSearchResultsModal() {
  return (
    <div
      className="modal-overlay"
      id="universalSearchResultsModal"
      onClick={(event) => closeModalOnBackdrop(event, 'universalSearchResultsModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--full-explorer" role="dialog" aria-modal="true">
        <div className="modal-card__header">
          <div className="explorer-header-left">
            <span className="explorer-badge">
              <i className="ph-bold ph-magnifying-glass" />
              V-DESK Universal Search Engine
            </span>
            <h3 className="modal-card__title" id="searchResultsModalTitle">
              Search Results for "Virtual Office in Mumbai"
            </h3>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('universalSearchResultsModal')}>
            ×
          </button>
        </div>
        <div className="explorer-intent-strip" id="explorerIntentStrip">
          <div className="intent-strip__content">
            <i className="ph-bold ph-lightning" style={{ color: 'var(--vd-gold-primary)' }} />
            <span>
              <strong>Detected Intent:</strong>{' '}
              <span id="explorerIntentParsed">Virtual Office • Location: Mumbai • Grade-A Hubs</span>
            </span>
          </div>
          <div className="intent-strip__count" id="explorerResultCount">
            Showing 3 Available Locations
          </div>
        </div>
        <div className="explorer-layout">
          <aside className="explorer-filter-sidebar">
            <div className="filter-sidebar__header">
              <h4>
                <i className="ph-bold ph-faders" />
                Faceted Filters
              </h4>
              <button type="button" className="filter-reset-btn" onClick={() => resetExplorerFilters()}>
                Reset
              </button>
            </div>
            <div className="filter-group">
              <label className="filter-group__title">City / Region</label>
              <select id="filterCity" className="form-select filter-select" onChange={() => filterExplorerResults()}>
                <option value="all">All Cities (Pan-India)</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Nashik">Nashik (HQ)</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Noida">Noida</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-group__title">Workspace Type</label>
              <select id="filterType" className="form-select filter-select" onChange={() => filterExplorerResults()}>
                <option value="all">All Solutions</option>
                <option value="Virtual Office">Virtual Office (GST/MCA)</option>
                <option value="Coworking">Coworking Flex Desks</option>
                <option value="Private Office">Private Executive Cabins</option>
                <option value="Meeting Rooms">Meeting Rooms & Boardrooms</option>
                <option value="Company Registration">Company Registration</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-group__title">Capacity</label>
              <div className="filter-capacity-pills">
                <button
                  type="button"
                  className="cap-pill active"
                  onClick={(event) => setExplorerCapacity(event.currentTarget, 'all')}
                >
                  Any
                </button>
                <button
                  type="button"
                  className="cap-pill"
                  onClick={(event) => setExplorerCapacity(event.currentTarget, '1')}
                >
                  1
                </button>
                <button
                  type="button"
                  className="cap-pill"
                  onClick={(event) => setExplorerCapacity(event.currentTarget, '2-5')}
                >
                  2–5
                </button>
                <button
                  type="button"
                  className="cap-pill"
                  onClick={(event) => setExplorerCapacity(event.currentTarget, '6-10')}
                >
                  6–10
                </button>
                <button
                  type="button"
                  className="cap-pill"
                  onClick={(event) => setExplorerCapacity(event.currentTarget, '11-25')}
                >
                  11–25
                </button>
                <button
                  type="button"
                  className="cap-pill"
                  onClick={(event) => setExplorerCapacity(event.currentTarget, '25+')}
                >
                  25+
                </button>
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-group__title">Maximum Budget / Month</label>
              <input
                type="range"
                id="filterPriceRange"
                min="500"
                max="15000"
                step="500"
                defaultValue="15000"
                className="filter-range"
                onInput={(event) => updateExplorerPriceFilter(event.currentTarget.value)}
              />
              <div className="filter-price-readout">
                Up to <strong id="filterPriceDisplay">₹15,000</strong>/mo
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-group__title">Key Amenities</label>
              <label className="filter-checkbox">
                <input type="checkbox" id="filterAmenityGst" onChange={() => filterExplorerResults()} defaultChecked />
                GST Suitable & NOC
              </label>
              <label className="filter-checkbox">
                <input type="checkbox" id="filterAmenityWifi" onChange={() => filterExplorerResults()} />
                High-Speed Wi-Fi
              </label>
              <label className="filter-checkbox">
                <input type="checkbox" id="filterAmenityParking" onChange={() => filterExplorerResults()} />
                Reserved Parking
              </label>
              <label className="filter-checkbox">
                <input type="checkbox" id="filterAmenityMeeting" onChange={() => filterExplorerResults()} />
                4K Meeting Room
              </label>
              <label className="filter-checkbox">
                <input type="checkbox" id="filterAmenity247" onChange={() => filterExplorerResults()} />
                24/7 Access
              </label>
            </div>
            <div className="filter-group">
              <label className="filter-group__title">Sort By</label>
              <select id="filterSort" className="form-select filter-select" onChange={() => filterExplorerResults()}>
                <option value="recommended">Recommended & Flagship</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="capacity">Highest Capacity</option>
              </select>
            </div>
          </aside>
          <main className="explorer-results-main">
            <div className="explorer-results-grid" id="explorerResultsGrid" />
            <div className="zero-results-card" id="zeroResultsCard" style={{ display: 'none' }}>
              <div className="zero-results-icon">
                <i className="ph-bold ph-magnifying-glass" />
              </div>
              <h4 className="zero-results-title">We couldn't find an exact match.</h4>
              <p className="zero-results-desc">
                We don't currently list an off-the-shelf hub matching all your exact parameters, but our operations
                network covers 100+ micro-markets across India.
              </p>
              <div className="zero-results-recommendations">
                <h5>Recommended Alternatives:</h5>
                <div className="zero-rec-tags">
                  <button type="button" className="zero-tag" onClick={() => quickChipSearch('Mumbai')}>
                    <i className="ph-bold ph-map-pin" />
                    Mumbai (MMR Hubs)
                  </button>
                  <button type="button" className="zero-tag" onClick={() => quickChipSearch('Nashik')}>
                    <i className="ph-bold ph-buildings" />
                    Nashik Headquarters
                  </button>
                  <button type="button" className="zero-tag" onClick={() => quickChipSearch('Virtual Office')}>
                    <i className="ph-bold ph-certificate" />
                    Pan-India Virtual Office
                  </button>
                </div>
              </div>
              <div className="zero-results-cta-box">
                <span>Need a custom solution tailored to your exact team size or city?</span>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    closeModal('universalSearchResultsModal');
                    openConsultationModal('Custom Search Sourcing');
                  }}
                >
                  <i className="ph-bold ph-headset" />
                  Talk to a V-DESK Expert
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
