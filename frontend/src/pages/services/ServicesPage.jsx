import { Link } from 'react-router';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import SectionHeader from '@/components/page/SectionHeader.jsx';
import { SERVICES } from '@/data/services.js';

const LIFECYCLE = [
  ['START', 'Company Formation', '/services/company-registration', 'ph-rocket-launch'],
  ['ESTABLISH', 'Virtual Office + GST', '/services/virtual-office', 'ph-buildings'],
  ['WORK', 'Coworking + Offices', '/coworking-spaces', 'ph-laptop'],
  ['GROW', 'Multi-city Expansion', '/locations', 'ph-trend-up'],
];

/** /services — index of business services with the four-stage lifecycle (PRD §4, §23). */
export default function ServicesPage() {
  return (
    <main id="main-content" className="ui-page">
      <PageHero
        id="servicesHero"
        badge="Business Infrastructure Platform"
        badgeIcon="ph-stack"
        title="Everything Your Business Needs"
        highlight="To Start, Establish, Work & Grow"
        description="Company formation, GST, verified business addresses and flexible workspaces — one partner, one portal, every Indian metro."
        stats={[
          ['3', 'Registration Services'],
          ['10+', 'Prime Metros'],
          ['24 Hrs', 'Address Activation'],
          ['CA / CS', 'Certified Desk'],
        ]}
      />

      <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
        <div className="container">
          <SectionHeader eyebrow="Registration & Compliance" title="Business services with" highlight="guaranteed approval" description="Each service includes a dedicated compliance desk, document delivery in your portal and status tracking." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '36px' }}>
            {SERVICES.map((service) => (
              <div key={service.slug} className="spotlight-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#081D40', color: '#DFB15B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                  <i className={`ph-bold ${service.icon}`} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', color: '#C59239', textTransform: 'uppercase' }}>{service.eyebrow}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#081D40', margin: '6px 0 10px 0' }}>{service.name}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', margin: '0 0 16px 0', flexGrow: 1 }}>{service.description}</p>
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Starting from</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#081D40' }}>
                    ₹{service.startingPrice.toLocaleString('en-IN')}
                    <small style={{ fontSize: '0.78rem', fontWeight: '400', color: '#64748B' }}>{service.priceUnit}</small>
                  </div>
                </div>
                <Link to={`/services/${service.slug}`} className="btn btn--primary btn--full">
                  Explore {service.name} <i className="ph-bold ph-arrow-right" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '70px 0', background: '#F8FAFC' }}>
        <div className="container">
          <SectionHeader eyebrow="Business Lifecycle" title="One partner for" highlight="every stage" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '36px' }}>
            {LIFECYCLE.map(([stage, label, to, icon]) => (
              <Link key={stage} to={to} className="spotlight-card" style={{ background: '#081D40', borderRadius: '14px', padding: '26px', color: '#FFF', display: 'block' }}>
                <i className={`ph-bold ${icon}`} style={{ fontSize: '1.6rem', color: '#DFB15B' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.12em', color: '#DFB15B', marginTop: '14px' }}>{stage}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '4px', color: '#FFF' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '10px' }}>
                  Explore <i className="ph-bold ph-arrow-right" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip source="Services Index" />
    </main>
  );
}
