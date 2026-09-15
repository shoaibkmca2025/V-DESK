import { Link, useParams } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import FeatureGrid from '@/components/page/FeatureGrid.jsx';
import LeadCard from '@/components/page/LeadCard.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import ProcessSteps from '@/components/page/ProcessSteps.jsx';
import SectionHeader from '@/components/page/SectionHeader.jsx';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import { CITIES } from '@/data/cities.js';
import { getService } from '@/data/services.js';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';

/** /services/:slug — SEO landing page per business service (PRD §57–58). */
export default function ServicePage() {
  const { slug } = useParams();
  const service = getService(slug);
  if (!service) return <NotFoundPage />;

  const meta = { title: `${service.name} — ${service.titleHighlight} | V-DESK`, description: service.description };

  return (
    <SiteLayout page="service" meta={meta}>
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Services', to: '/services' }, { label: service.name }]} />
        <PageHero
          id="serviceHero"
          badge={service.eyebrow}
          badgeIcon={service.icon}
          title={service.title}
          highlight={service.titleHighlight}
          description={service.description}
          stats={service.stats}
          trust={service.trust}
          actions={
            <>
              <Link to={service.ctaTo} className="btn btn--gold btn--lg">
                <i className="ph-bold ph-arrow-right" />
                {service.cta}
              </Link>
              <a href="#serviceFaq" className="btn btn--outline btn--lg">
                <i className="ph-bold ph-question" />
                Read FAQs
              </a>
            </>
          }
          aside={<LeadCard title={`${service.name} Quote`} subtitle={`Starting ₹${service.startingPrice.toLocaleString('en-IN')}${service.priceUnit}. Share your details for an itemised proposal.`} service={service.name} source={`Service Page: ${service.name}`} />}
        />

        <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
          <div className="container">
            <SectionHeader eyebrow="What's Included" title="What's included" />
            <FeatureGrid items={service.features} />
          </div>
        </section>

        <section className="section" style={{ padding: '70px 0', background: '#F8FAFC' }}>
          <div className="container">
            <SectionHeader eyebrow="Who It's For" title="Who this is for" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '28px' }}>
              {service.suitability.map((item) => (
                <span key={item} className="hero-trust-badge" style={{ background: '#FFFFFF', border: '1px solid #E8E2D8', color: '#081D40', padding: '10px 16px', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '0.88rem' }}>
                  <i className="ph-bold ph-check-circle" style={{ color: '#C59239' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
          <div className="container">
            <SectionHeader eyebrow="Process" title="How it works" />
            <ProcessSteps steps={service.process} />
          </div>
        </section>

        <section className="section" style={{ padding: '70px 0', background: '#F8FAFC' }}>
          <div className="container">
            <SectionHeader eyebrow="Available Across India" title={`${service.name} in`} highlight="10+ cities" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '28px' }}>
              {CITIES.map((city) => (
                <Link key={city.slug} to={service.slug === 'virtual-office' ? `/locations/${city.slug}/virtual-office` : `/locations/${city.slug}`} className="btn btn--outline btn--sm">
                  <i className="ph-bold ph-map-pin" /> {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section vo-faq-section" id="serviceFaq">
          <div className="container">
            <SectionHeader eyebrow="Regulatory FAQ" title="Common questions" />
            <FaqAccordion items={service.faqs} />
          </div>
        </section>

        <CtaStrip source={`Service Page: ${service.name}`} />
      </main>
    </SiteLayout>
  );
}
