import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import WorkspaceCard from '@/components/cards/WorkspaceCard.jsx';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import SectionHeader from '@/components/page/SectionHeader.jsx';
import { CITIES, cityWorkspaces, getCity } from '@/data/cities.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';

const TYPES = ['All', 'Coworking', 'Private Office', 'Meeting Rooms'];
const CAPACITIES = [
  ['all', 'Any Size'],
  ['1', '1'],
  ['2-5', '2–5'],
  ['6-10', '6–10'],
  ['11-25', '11–25'],
];

function inCapacity(bucket, capacity) {
  if (bucket === 'all') return true;
  if (bucket === '1') return capacity === 1;
  const [lo, hi] = bucket.split('-').map(Number);
  return capacity >= lo && capacity <= hi;
}

/** /workspaces/:city — filterable marketplace for one city (PRD §30–32, §57). */
export default function CityWorkspacesPage() {
  const { city: slug } = useParams();
  const city = getCity(slug);
  const [type, setType] = useState('All');
  const [capacity, setCapacity] = useState('all');
  const [sort, setSort] = useState('recommended');

  const all = useMemo(() => (city ? cityWorkspaces(city) : []), [city]);
  const list = useMemo(() => {
    const items = all.filter((w) => (type === 'All' || w.type === type) && inCapacity(capacity, w.capacity));
    if (sort === 'price-asc') items.sort((a, b) => a.priceMonth - b.priceMonth);
    if (sort === 'price-desc') items.sort((a, b) => b.priceMonth - a.priceMonth);
    if (sort === 'capacity') items.sort((a, b) => b.capacity - a.capacity);
    return items;
  }, [all, type, capacity, sort]);

  if (!city) return <NotFoundPage />;

  const meta = { title: `Coworking, Private Offices & Meeting Rooms in ${city.name} | V-DESK Workspaces`, description: `Browse ${all.length} bookable workspaces in ${city.name}: hot desks, dedicated desks, private cabins and 4K meeting rooms.` };

  return (
    <SiteLayout page="cityWorkspaces" meta={meta}>
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Workspaces', to: '/coworking-spaces' }, { label: city.name }]} />
        <PageHero
          id="workspacesHero"
          badge={`Workspace Marketplace • ${city.name}`}
          badgeIcon="ph-laptop"
          title={`Workspaces in ${city.name}`}
          highlight="Desks, Cabins & Boardrooms On Demand"
          description={`${all.length} verified spaces across ${city.localities.join(', ')}. Filter by type and team size, then book online with GST invoicing.`}
          stats={[
            [String(all.length), 'Bookable Spaces'],
            ['Hourly', 'to Annual Terms'],
            ['4K AV', 'Meeting Rooms'],
            ['24/7', 'Access Options'],
          ]}
        />

        <section className="section" style={{ padding: '60px 0', background: '#F8FAFC' }}>
          <div className="container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px' }}>
              <div className="cw-amenities-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TYPES.map((t) => (
                  <button key={t} type="button" className={t === type ? 'cw-filter-pill active' : 'cw-filter-pill'} onClick={() => setType(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <select className="form-select" value={capacity} onChange={(e) => setCapacity(e.target.value)} aria-label="Capacity">
                  {CAPACITIES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label === 'Any Size' ? label : `${label} people`}
                    </option>
                  ))}
                </select>
                <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>
            </div>

            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
              Showing <strong style={{ color: '#081D40' }}>{list.length}</strong> of {all.length} workspaces in {city.name}
            </p>

            {list.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {list.map((w) => (
                  <WorkspaceCard key={w.id} workspace={w} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FAF8F3', border: '1px dashed #C59239', borderRadius: '12px' }}>
                <i className="ph-bold ph-buildings" style={{ fontSize: '2.5rem', color: '#C59239', display: 'block', marginBottom: '12px' }} />
                <h3 style={{ color: '#081D40', margin: '0 0 8px 0' }}>We couldn't find an exact match</h3>
                <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 auto 16px auto' }}>Over 50 partner spaces in {city.name} are available on request. Tell us your team size and we will shortlist options within a working day.</p>
                <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal(`Custom Workspace Search: ${city.name}`)}>
                  Talk to a V-DESK Expert
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="section" style={{ padding: '60px 0', background: '#FFFFFF' }}>
          <div className="container">
            <SectionHeader eyebrow="Other Cities" title="Workspaces in" highlight="other cities" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
              {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
                <Link key={c.slug} to={`/workspaces/${c.slug}`} className="btn btn--outline btn--sm">
                  <i className="ph-bold ph-map-pin" /> {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CtaStrip title={`Need a bigger team space in ${city.name}?`} text="Enterprise suites and bulk desk programmes are priced on request." source={`Workspaces: ${city.name}`} />
      </main>
    </SiteLayout>
  );
}
