import { openAllLocationsModal } from '@/features/locations/allLocationsModal.js';
import {
  clearLocationSearch,
  filterLocationsByCity,
  handleLocationSearch,
} from '@/features/locations/locationExplorer.js';

/** SECTION 06 &mdash; LOCATION EXPLORER Large Editorial Location Cards + Search + Filter */
export default function LocationsSection() {
  return (
    <section className="section locations" id="locations">
      <div className="container">
        <div className="section__header reveal">
          <span className="section__eyebrow">Nationwide Network</span>
          <h2 className="section__title">
            FIND YOUR
            <br />
            BUSINESS BASE.
          </h2>
          <p className="section__desc">
            Explore prime commercial business centers across India's most vibrant commercial hubs.
          </p>
        </div>
        <div className="locations__search reveal">
          <i className="ph-bold ph-magnifying-glass locations__search-icon" />
          <input
            type="text"
            id="citySearchInput"
            className="locations__search-input"
            placeholder="Search by city (Mumbai, Nashik, Bangalore...) or area (BKC, Baner, CP)..."
            onInput={(event) => handleLocationSearch(event.currentTarget.value)}
          />
          <button className="locations__search-clear" id="clearSearchBtn" onClick={() => clearLocationSearch()}>
            ×
          </button>
        </div>
        <div className="locations__filters reveal" id="cityFilters">
          <button
            className="locations__filter-btn active"
            onClick={(event) => filterLocationsByCity('all', event.currentTarget)}
          >
            All Hubs
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Nashik', event.currentTarget)}
          >
            ★ Nashik
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Mumbai', event.currentTarget)}
          >
            Mumbai
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Delhi', event.currentTarget)}
          >
            Delhi
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Bangalore', event.currentTarget)}
          >
            Bangalore
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Pune', event.currentTarget)}
          >
            Pune
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Hyderabad', event.currentTarget)}
          >
            Hyderabad
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Noida', event.currentTarget)}
          >
            Noida
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Gurgaon', event.currentTarget)}
          >
            Gurgaon
          </button>
          <button
            className="locations__filter-btn"
            onClick={(event) => filterLocationsByCity('Chennai', event.currentTarget)}
          >
            Chennai
          </button>
        </div>
        <div className="locations__grid" id="locationsContainer" />
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button className="btn btn--teal btn--md" onClick={() => openAllLocationsModal()}>
            <i className="ph-bold ph-map-pin" />
            View All 28 States & 100+ Micro-Markets
          </button>
        </div>
      </div>
    </section>
  );
}
