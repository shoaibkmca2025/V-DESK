import { filterMarketplaceCategory, filterMarketplaceCity } from '@/features/marketplace/marketplace.js';
import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: WORKSPACE MARKETPLACE EXPLORER (PRD Sec 30-33) */
export default function MarketplaceSection() {
  return (
    <section className="section cw-marketplace-section" id="marketplace">
      <div className="container">
        <div className="ui-section-head ui-section-head--center ui-section-head--dark">
          <span className="ui-kicker">Browse spaces</span>
          <h2 className="ui-title">
            Find a workspace <em>near you</em>
          </h2>
          <p className="ui-lead">Filter by type or city. Every space includes Wi-Fi, reception and security.</p>
        </div>
        <div className="mp-filter-toolbar" style={{ marginTop: '30px' }}>
          <div className="mp-cat-btn-group">
            <button
              type="button"
              className="mp-cat-btn active"
              onClick={(event) => filterMarketplaceCategory('all', event.currentTarget)}
            >
              <i className="ph-bold ph-squares-four" /> All Spaces
            </button>
            <button
              type="button"
              className="mp-cat-btn"
              onClick={(event) => filterMarketplaceCategory('coworking', event.currentTarget)}
            >
              <i className="ph-bold ph-laptop" /> Coworking Desks
            </button>
            <button
              type="button"
              className="mp-cat-btn"
              onClick={(event) => filterMarketplaceCategory('private', event.currentTarget)}
            >
              <i className="ph-bold ph-door" /> Private Cabins
            </button>
            <button
              type="button"
              className="mp-cat-btn"
              onClick={(event) => filterMarketplaceCategory('meeting', event.currentTarget)}
            >
              <i className="ph-bold ph-presentation" /> Meeting Suites
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="mpCitySelect" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#CBD5E1' }}>
              <i className="ph-bold ph-map-pin" /> City:
            </label>
            <select
              id="mpCitySelect"
              className="form-select"
              onChange={(event) => filterMarketplaceCity(event.currentTarget.value)}
              ref={rawStyle(
                'padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; background: #081D40; color: #FFF; border-color: rgba(197, 146, 57, 0.3);',
              )}
            >
              <option value="all">All Metros (Pan-India)</option>
              <option value="Delhi">Delhi NCR (Worldmark Aerocity)</option>
              <option value="Mumbai">Mumbai (BKC)</option>
              <option value="Bangalore">Bangalore (Koramangala)</option>
              <option value="Nashik">Nashik (Flagship HQ)</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
        </div>
        <div className="marketplace-grid" id="marketplaceGrid" />
      </div>
    </section>
  );
}
