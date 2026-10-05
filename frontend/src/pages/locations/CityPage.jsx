import { Link, useParams } from 'react-router';
import CentreCard from '@/components/cards/CentreCard.jsx';
import WorkspaceCard from '@/components/cards/WorkspaceCard.jsx';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import LeadCard from '@/components/page/LeadCard.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import SectionHeader from '@/components/page/SectionHeader.jsx';
import { CITY_PRODUCTS, cityCentres, cityStartingPrice, cityWorkspaces, getCity } from '@/data/cities.js';
import { CITY_PRICING_MULTIPLIERS } from '@/data/cityPricing.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';

/** /locations/:city — city hub page listing centres, products and workspaces (PRD §57). */
export default function CityPage() {
  const { city: slug } = useParams();
  const city = getCity(slug);
  if (!city) return <NotFoundPage />;

  const centres = cityCentres(city);
  const workspaces = cityWorkspaces(city);
  const minVo = centres.length ? Math.min(...centres.map((c) => c.vo_price)) : null;
  const pricing = CITY_PRICING_MULTIPLIERS[city.name];

  const meta = {
    title: `Virtual Office, Coworking & Meeting Rooms in ${city.name} | V-DESK`,
    description: `Verified Grade-A business addresses and flexible workspaces in ${city.name} (${city.localities.join(', ')}). GST & MCA compliant, activated in 24 hours.`,
  };

  return (
    <SiteLayout page="city" meta={meta}>
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Locations', to: '/locations' }, { label: city.name }]} />
        <PageHero
          id="cityHero"
          badge={`${city.state} • ${city.tagline}`}
          badgeIcon="ph-map-pin"
          title="Office space & business address in"
          highlight={city.name}
          description={`Virtual offices, coworking and meeting rooms in ${city.localities.join(', ')} — with the documents you need for GST and company registration.`}
          stats={[
            [centres.length ? String(centres.length) : 'On Request', 'Verified Centres'],
            [minVo ? `₹${minVo.toLocaleString('en-IN')}` : 'Custom', 'Virtual Office / mo'],
            [String(city.localities.length), 'Prime Localities'],
            ['24 Hrs', 'Address Activation'],
          ]}
          trust={['GST & MCA compliant', 'Documents in 24 hours', 'On-site centre team']}
          aside={<LeadCard title={`${city.name} Setup Quote`} subtitle={`Tell us what you need in ${city.name}; our advisor replies within 15 minutes.`} city={city.name} source={`City Page: ${city.name}`} />}
        />

        <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
          <div className="container">
            <SectionHeader eyebrow="Solutions" title={`What you can set up in`} highlight={city.name} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '36px' }}>
              {CITY_PRODUCTS.map((product) => {
                const price = cityStartingPrice(city, product);
                return (
                  <Link key={product.slug} to={`/locations/${city.slug}/${product.slug}`} className="spotlight-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', display: 'block', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                    <i className={`ph-bold ${product.icon}`} style={{ fontSize: '1.6rem', color: '#C59239' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#081D40', margin: '12px 0 6px 0' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 12px 0' }}>{product.blurb}</p>
                    <strong style={{ color: '#081D40' }}>{price ? `From ₹${price.toLocaleString('en-IN')}${product.unit}` : 'Price on request'}</strong>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section" style={{ padding: '70px 0', background: '#F8FAFC' }}>
          <div className="container">
            <SectionHeader eyebrow="Verified Centres" title={`Business centres in ${city.name}`} description={centres.length ? 'Every centre holds a registered commercial lease, municipal tax receipt and utility bill for statutory use.' : `We are onboarding partner centres in ${city.name}. Request a quote and our team will confirm availability within a working day.`} />
            {centres.length > 0 ? (
              <div className="locations__grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
                {centres.map((centre) => (
                  <CentreCard key={centre.id} centre={centre} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <Link to="/locations" className="btn btn--outline">
                  Browse All Cities
                </Link>
              </div>
            )}
          </div>
        </section>

        {workspaces.length > 0 && (
          <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
            <div className="container">
              <SectionHeader eyebrow="Workspace Marketplace" title="Workspaces you can book in" highlight={city.name} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
                {workspaces.map((w) => (
                  <WorkspaceCard key={w.id} workspace={w} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <Link to={`/workspaces/${city.slug}`} className="btn btn--primary">
                  View All {city.name} Workspaces <i className="ph-bold ph-arrow-right" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="section" style={{ padding: '60px 0', background: '#F8FAFC' }}>
          <div className="container">
            <SectionHeader eyebrow="Localities" title={`Areas we cover in ${city.name}`} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
              {city.localities.map((locality) => (
                <span key={locality} className="btn btn--outline btn--sm" style={{ cursor: 'default' }}>
                  <i className="ph-bold ph-map-pin" /> {city.name} — {locality}
                </span>
              ))}
            </div>
          </div>
        </section>

        <CtaStrip title={`Ready to set up in ${city.name}?`} source={`City Page: ${city.name}`} />
      </main>
    </SiteLayout>
  );
}
