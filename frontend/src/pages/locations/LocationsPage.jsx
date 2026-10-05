import { useState } from 'react';
import { Link } from 'react-router';
import PageHero from '@/components/page/PageHero.jsx';
import { CityGrid, CityStrip, CtaBand, FeatureCards, Section } from '@/components/ui/index.js';
import { LOCATIONS } from '@/data/locations.js';

const WHY = [
  { icon: 'ph-buildings', title: 'Grade-A buildings', text: 'Every centre is in a recognised commercial building in a prime business area.' },
  { icon: 'ph-file-text', tone: 'gold', title: 'Verified documents', text: 'Each centre holds a registered lease, tax receipt and utility bill for legal use.' },
  { icon: 'ph-users', tone: 'navy', title: 'Staffed on site', text: 'A centre team receives your mail and meets officers during verification.' },
];

/** Locations — pick a city, or search every centre by name or area. */
export default function LocationsPage() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = q ? LOCATIONS.filter((l) => `${l.city} ${l.areaName} ${l.address}`.toLowerCase().includes(q)).slice(0, 8) : [];

  return (
    <main id="main-content" className="ui-page">
      <PageHero
        id="locHero"
        badge={`${LOCATIONS.length} centres across India`}
        badgeIcon="ph-map-pin"
        title="Find a V-DESK centre"
        highlight="near you"
        description="Choose a city to see its centres, prices and available workspaces."
        actions={
          <form className="ui-search" role="search" onSubmit={(e) => e.preventDefault()} style={{ margin: '0 auto', maxWidth: '560px' }}>
            <i className="ph-bold ph-magnifying-glass" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a city or area, e.g. “BKC” or “Baner”" aria-label="Search centres" />
          </form>
        }
      />

      <CityStrip limit={0} />

      {q && (
        <Section tight title={matches.length ? `${matches.length} centre${matches.length > 1 ? 's' : ''} found` : 'No centres match that search'} lead={matches.length ? undefined : 'Try a city name like Mumbai, Pune or Delhi.'}>
          <div className="ui-grid ui-grid--2">
            {matches.map((centre) => (
              <Link key={centre.id} to={`/locations/${centre.city.toLowerCase()}`} className="ui-card" style={{ flexDirection: 'row', gap: '14px' }}>
                <div className="ui-card__icon" style={{ flexShrink: 0 }}>
                  <i className="ph-bold ph-map-pin" />
                </div>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <h3>
                    {centre.city} — {centre.areaName}
                  </h3>
                  <p>{centre.address}</p>
                  <div className="ui-card__price">
                    Virtual office from <strong>₹{centre.vo_price.toLocaleString('en-IN')}</strong>/mo
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section id="metroGrid" tone="white" kicker="Cities" title="Choose your city">
        <CityGrid />
      </Section>

      <Section kicker="Every centre" title="The same standard, in every city">
        <FeatureCards items={WHY} />
      </Section>

      <section className="ui-section ui-section--tight">
        <div className="ui-container">
          <CtaBand title="Don’t see your city?" text="We work with partner centres in 18+ cities. Tell us where you need an address and we’ll check availability." source="Locations - Final CTA" />
        </div>
      </section>
    </main>
  );
}
