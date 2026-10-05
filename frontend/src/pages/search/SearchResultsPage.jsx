import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import SectionHeader from '@/components/page/SectionHeader.jsx';
import { CITIES } from '@/data/cities.js';
import { GUIDES } from '@/data/guides.js';
import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { parseSearchIntent } from '@/features/search/parseSearchIntent.js';
import { createExplorerFilters, filterInventory, filtersFromIntent, matchServices } from '@/features/search/searchEngine.js';
import { asset } from '@/lib/assets.js';

/** Results page shows the full price range by default; the slider narrows it. */
const PAGE_MAX_PRICE = 75000;
const pageFilters = () => ({ ...createExplorerFilters(), maxPrice: PAGE_MAX_PRICE });

const POPULAR = ['Virtual Office in Mumbai', 'Coworking in Nashik', 'Private Office in Gurgaon', 'Meeting room for 10 people', 'GST registration'];
const TYPES = ['all', 'Virtual Office', 'Coworking', 'Private Office', 'Meeting Rooms'];
const CAPACITY_PILLS = [
  ['all', 'Any'],
  ['1', '1'],
  ['2-5', '2–5'],
  ['6-10', '6–10'],
  ['11-25', '11–25'],
  ['25+', '25+'],
];

const CARD_IMAGE = { 'Meeting Rooms': 'assets/vdesk-boardroom.jpg', Coworking: 'assets/vdesk-coworking.jpg' };

function ResultCard({ item, navigate }) {
  const image = asset(CARD_IMAGE[item.type] || 'assets/vdesk-reception.jpg');
  const action = () => {
    trackSearchEvent('search_result_clicked', { id: item.id, type: item.type });
    if (item.type === 'Meeting Rooms') openMeetingBookingModal();
    else if (item.type === 'Virtual Office') navigate('/virtual-office#voConfigurator');
    else navigate(`/checkout?item=${encodeURIComponent(item.name)}&amount=${item.priceMonth}&city=${encodeURIComponent(item.city)}`);
  };
  return (
    <div className="explorer-card">
      <div className="explorer-card__image" style={{ backgroundImage: `linear-gradient(180deg, rgba(5,19,43,0.2) 0%, rgba(5,19,43,0.7) 100%), url('${image}')` }}>
        <span className={`badge ${item.status === 'available' ? 'badge--success' : 'badge--warning'}`}>{item.status === 'available' ? '● Verified Available' : '● High Demand'}</span>
        <span style={{ fontSize: '0.75rem', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
          ★ {item.rating} ({item.reviews})
        </span>
      </div>
      <div className="explorer-card__body">
        <div className="explorer-card__city">
          {item.city} • {item.locality}
        </div>
        <h4 className="explorer-card__title">{item.name}</h4>
        <p className="explorer-card__address">{item.address}</p>
        <div className="explorer-card__tags">
          <span className="explorer-tag">
            <i className="ph-bold ph-shield-check" /> GST / MCA Ready
          </span>
          <span className="explorer-tag">
            <i className="ph-bold ph-users" /> Up to {item.capacity} Pax
          </span>
          <span className="explorer-tag">
            <i className="ph-bold ph-lightning" /> 24h SLA
          </span>
        </div>
        <div className="explorer-card__footer">
          <div className="explorer-card__price">
            <strong>₹{item.priceMonth.toLocaleString('en-IN')}</strong>
            <small>/month</small>
          </div>
          <button className="btn btn--primary btn--sm" onClick={action}>
            {item.type === 'Meeting Rooms' ? 'Book Room' : 'Configure Setup'} →
          </button>
        </div>
      </div>
    </div>
  );
}

/** /search?q= — universal search results with faceted filters and zero-result recovery (PRD §15–16). */
export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get('q') || '';
  const [draft, setDraft] = useState(query);
  const parsed = useMemo(() => parseSearchIntent(query), [query]);
  const [filters, setFilters] = useState(() => filtersFromIntent(parsed, pageFilters()));

  useEffect(() => {
    setDraft(query);
    setFilters(filtersFromIntent(parseSearchIntent(query), pageFilters()));
    if (query) trackSearchEvent('search_submitted', { query, page: 'search' });
  }, [query]);

  const results = useMemo(() => filterInventory(filters), [filters]);
  const services = useMemo(() => matchServices(query), [query]);
  const guides = useMemo(() => {
    const q = query.toLowerCase();
    return q.trim() ? GUIDES.filter((g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || q.split(/\s+/).some((w) => w.length > 3 && g.title.toLowerCase().includes(w))).slice(0, 3) : [];
  }, [query]);

  useEffect(() => {
    if (query && results.length === 0 && services.length === 0) trackSearchEvent('search_no_results', { query });
  }, [query, results.length, services.length]);

  const update = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    trackSearchEvent('search_filter_used', patch);
  };

  const submit = (event) => {
    event.preventDefault();
    if (draft.trim()) setParams({ q: draft.trim() });
  };

  const total = results.length + services.length;
  const similarCities = CITIES.filter((c) => c.name !== parsed?.location).slice(0, 5);

  return (
    <main id="main-content" className="ui-page">
      <section className="ui-compact-hero" id="searchHero" style={{ padding: '48px 0 40px' }}>
        <div className="container">
          <div className="hero-badge-pill">
            <i className="ph-bold ph-magnifying-glass" />
            <span>Universal Search</span>
          </div>
          <h1 className="hero-luxury-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
            {query ? (
              <>
                Results for <span className="highlight-gold">“{query}”</span>
              </>
            ) : (
              <>
                What are you <span className="highlight-gold">looking for?</span>
              </>
            )}
          </h1>
          <form onSubmit={submit} className="hero-lead-form search-hero-form" style={{ maxWidth: '760px', marginTop: '18px' }}>
            <input type="search" className="form-control" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search a city, workspace or business requirement" aria-label="Search" />
            <button type="submit" className="btn btn--gold">
              Search <i className="ph-bold ph-arrow-right" />
            </button>
          </form>
          {parsed && (
            <p className="hero-luxury-desc" style={{ marginTop: '14px', marginBottom: 0 }}>
              <i className="ph-bold ph-brain" style={{ color: '#DFB15B' }} /> Detected intent: <strong style={{ color: '#081D40' }}>{parsed.summary}</strong> • {total} result{total === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </section>

      <section className="section" style={{ padding: '50px 0', background: '#F8FAFC' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '28px', alignItems: 'start' }} className="search-layout">
            <aside style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', position: 'sticky', top: '100px' }}>
              <h4 style={{ margin: '0 0 14px 0', color: '#081D40', fontSize: '1rem' }}>
                <i className="ph-bold ph-funnel" /> Filters
              </h4>
              <div className="form-field">
                <label className="form-label">City</label>
                <select className="form-select" value={filters.city} onChange={(e) => update({ city: e.target.value })}>
                  <option value="all">All Cities</option>
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Workspace Type</label>
                <select className="form-select" value={filters.type} onChange={(e) => update({ type: e.target.value })}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'all' ? 'All Types' : t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Capacity</label>
                <div className="filter-capacity-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CAPACITY_PILLS.map(([value, label]) => (
                    <button key={value} type="button" className={filters.capacity === value ? 'cap-pill active' : 'cap-pill'} onClick={() => update({ capacity: value })}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">
                  Max Monthly Price: <strong>₹{filters.maxPrice.toLocaleString('en-IN')}</strong>
                </label>
                <input type="range" min="1000" max={PAGE_MAX_PRICE} step="500" value={filters.maxPrice} onChange={(e) => update({ maxPrice: Number(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div className="form-field">
                <label className="form-label">Sort</label>
                <select className="form-select" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>
              <button type="button" className="btn btn--outline btn--sm btn--full" onClick={() => setFilters(pageFilters())}>
                Reset Filters
              </button>
            </aside>

            <div>
              {services.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ color: '#081D40', fontSize: '1.1rem', margin: '0 0 12px 0' }}>
                    <i className="ph-bold ph-file-text" /> Business Services
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {services.map((s) => (
                      <Link key={s.slug} to={`/services/${s.slug}`} className="spotlight-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', display: 'block' }}>
                        <i className={`ph-bold ${s.icon}`} style={{ color: '#C59239', fontSize: '1.3rem' }} />
                        <strong style={{ display: 'block', color: '#081D40', margin: '8px 0 4px' }}>{s.name}</strong>
                        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>From ₹{s.startingPrice.toLocaleString('en-IN')}{s.priceUnit}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <h3 style={{ color: '#081D40', fontSize: '1.1rem', margin: '0 0 12px 0' }}>
                <i className="ph-bold ph-buildings" /> Locations & Workspaces{' '}
                <span style={{ color: '#64748B', fontWeight: '400', fontSize: '0.9rem' }}>
                  — {results.length} available
                </span>
              </h3>

              {results.length > 0 ? (
                <div className="explorer-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {results.map((item) => (
                    <ResultCard key={item.id} item={item} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <div style={{ background: '#FFFFFF', border: '1px dashed #C59239', borderRadius: '14px', padding: '36px 24px', textAlign: 'center' }}>
                  <i className="ph-bold ph-magnifying-glass" style={{ fontSize: '2.4rem', color: '#C59239' }} />
                  <h3 style={{ color: '#081D40', margin: '12px 0 6px' }}>We couldn't find an exact match.</h3>
                  <p style={{ color: '#64748B', maxWidth: '520px', margin: '0 auto 18px' }}>Try a nearby city, broaden the filters, or let a V-DESK expert shortlist verified options for you.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '18px' }}>
                    {similarCities.map((c) => (
                      <button key={c.slug} type="button" className="zero-tag" onClick={() => setParams({ q: `${filters.type === 'all' ? 'Virtual Office' : filters.type} in ${c.name}` })}>
                        <i className="ph-bold ph-map-pin" /> {c.name}
                      </button>
                    ))}
                    {services.length === 0 &&
                      ['GST Registration', 'Company Registration'].map((s) => (
                        <button key={s} type="button" className="zero-tag" onClick={() => setParams({ q: s })}>
                          <i className="ph-bold ph-file-text" /> {s}
                        </button>
                      ))}
                  </div>
                  <button type="button" className="btn btn--gold" onClick={() => openQuoteModal(`Search: ${query}`)}>
                    <i className="ph-bold ph-headset" /> Talk to a V-DESK Expert
                  </button>
                </div>
              )}

              {guides.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ color: '#081D40', fontSize: '1.1rem', margin: '0 0 12px 0' }}>
                    <i className="ph-bold ph-book-open" /> Guides
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                    {guides.map((g) => (
                      <li key={g.slug}>
                        <Link to={`/resources/${g.slug}`} style={{ color: '#081D40', fontWeight: '600' }}>
                          {g.title}
                        </Link>{' '}
                        <span style={{ color: '#64748B', fontSize: '0.82rem' }}>• {g.readTime} min read</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '32px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', color: '#64748B', textTransform: 'uppercase' }}>Popular searches</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {POPULAR.map((term) => (
                    <button key={term} type="button" className="zero-tag" onClick={() => setParams({ q: term })}>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '50px 0', background: '#FFFFFF' }}>
        <div className="container">
          <SectionHeader eyebrow="Browse" title="Browse by city" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            {CITIES.map((c) => (
              <Link key={c.slug} to={`/locations/${c.slug}`} className="btn btn--outline btn--sm">
                <i className="ph-bold ph-map-pin" /> {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip source={`Search: ${query}`} />
    </main>
  );
}
