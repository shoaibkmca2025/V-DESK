import { Link, useParams } from 'react-router';
import CentreCard from '@/components/cards/CentreCard.jsx';
import WorkspaceCard from '@/components/cards/WorkspaceCard.jsx';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import LeadCard from '@/components/page/LeadCard.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import SectionHeader from '@/components/page/SectionHeader.jsx';
import { CITY_PRODUCTS, cityCentres, cityStartingPrice, cityWorkspaces, getCity, getCityProduct } from '@/data/cities.js';
import { getService } from '@/data/services.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';

const PRODUCT_CTA = {
  'virtual-office': { label: 'Configure Virtual Office', to: '/virtual-office' },
  coworking: { label: 'Explore Coworking Plans', to: '/coworking-spaces' },
  'meeting-rooms': { label: 'Book a Meeting Room', to: '/meeting-rooms' },
  'private-office': { label: 'Enquire for Private Cabins', to: '/coworking-spaces' },
};

/** /locations/:city/:product — e.g. /locations/mumbai/virtual-office (PRD §14, §57). */
export default function CityProductPage() {
  const { city: citySlug, product: productSlug } = useParams();
  const city = getCity(citySlug);
  const product = getCityProduct(productSlug);
  if (!city || !product) return <NotFoundPage />;

  const centres = cityCentres(city).filter((c) => c.services.includes(product.service));
  const workspaces = product.workspaceType ? cityWorkspaces(city, product.workspaceType) : [];
  const price = cityStartingPrice(city, product);
  const service = getService('virtual-office');
  const faqs = productSlug === 'virtual-office' ? service.faqs : [
    [`How quickly can I start using a ${product.name.toLowerCase()} in ${city.name}?`, 'Same day for hot desks and meeting rooms subject to availability; dedicated desks and cabins are typically ready within 48 hours.'],
    ['Is GST input credit available on workspace invoices?', 'Yes — all invoices carry the centre GSTIN and 18% GST so registered businesses can claim input tax credit.'],
    ['Can I switch between centres in the city?', 'Members can use meeting-room credits across V-DESK centres in the same city; desk relocations are handled by the centre team.'],
  ];
  const cta = PRODUCT_CTA[productSlug];

  const meta = {
    title: `${product.name} in ${city.name} — ${price ? `From ₹${price.toLocaleString('en-IN')}${product.unit}` : 'Verified Centres'} | V-DESK`,
    description: `${product.blurb} Verified V-DESK centres in ${city.name}: ${city.localities.join(', ')}.`,
  };

  return (
    <SiteLayout page="cityProduct" meta={meta}>
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Locations', to: '/locations' }, { label: city.name, to: `/locations/${city.slug}` }, { label: product.name }]} />
        <PageHero
          id="cityProductHero"
          badge={`${product.name} • ${city.name}, ${city.state}`}
          badgeIcon={product.icon}
          title={`${product.name} in ${city.name}`}
          highlight={price ? `From ₹${price.toLocaleString('en-IN')}${product.unit}` : 'Verified Grade-A Centres'}
          description={`${product.blurb} Available across ${city.localities.join(', ')} with GST-compliant invoicing and on-site support.`}
          stats={[
            [String(centres.length || workspaces.length || 'On Request'), centres.length ? 'Centres' : 'Spaces'],
            [price ? `₹${price.toLocaleString('en-IN')}` : 'Custom', `Starting ${product.unit.trim()}`],
            ['24 Hrs', 'Activation'],
            ['100%', 'GST Invoicing'],
          ]}
          trust={['Verified Commercial Premises', 'Transparent Pricing', 'Secure Digital KYC', 'Dedicated Support Desk']}
          actions={
            <Link to={cta.to} className="btn btn--gold btn--lg">
              <i className="ph-bold ph-arrow-right" />
              {cta.label}
            </Link>
          }
          aside={<LeadCard title={`${product.name} — ${city.name}`} subtitle="Get availability and an itemised quote within 15 minutes." service={product.service} city={city.name} source={`City Product: ${city.name} ${product.name}`} />}
        />

        <section className="section" style={{ padding: '70px 0', background: '#F8FAFC' }}>
          <div className="container">
            <SectionHeader eyebrow="Availability" title={`${product.name} centres in`} highlight={city.name} description={centres.length || workspaces.length ? undefined : `We are onboarding partner centres for ${product.name.toLowerCase()} in ${city.name}. Leave your details and we will confirm availability within a working day.`} />
            {centres.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
                {centres.map((centre) => (
                  <CentreCard key={centre.id} centre={centre} priceKey={product.priceKey || 'vo_price'} unit={product.priceKey === 'cw_price' ? '/day' : '/mo'} />
                ))}
              </div>
            )}
            {workspaces.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
                {workspaces.map((w) => (
                  <WorkspaceCard key={w.id} workspace={w} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section" style={{ padding: '60px 0', background: '#FFFFFF' }}>
          <div className="container">
            <SectionHeader eyebrow="Also In This City" title={`Other options in ${city.name}`} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
              {CITY_PRODUCTS.filter((p) => p.slug !== product.slug).map((p) => (
                <Link key={p.slug} to={`/locations/${city.slug}/${p.slug}`} className="btn btn--outline btn--sm">
                  <i className={`ph-bold ${p.icon}`} /> {p.name} in {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section vo-faq-section">
          <div className="container">
            <SectionHeader eyebrow="FAQ" title={`${product.name} in ${city.name}:`} highlight="common questions" />
            <FaqAccordion items={faqs} />
          </div>
        </section>

        <CtaStrip title={`Need a ${product.name.toLowerCase()} in ${city.name}?`} source={`City Product: ${city.name} ${product.name}`} />
      </main>
    </SiteLayout>
  );
}
