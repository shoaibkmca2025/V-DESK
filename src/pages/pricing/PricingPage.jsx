import { Link } from 'react-router';
import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import { Button, CtaBand, Plans, Section } from '@/components/ui/index.js';
import { CITIES, cityStartingPrice, getCityProduct } from '@/data/cities.js';
import { FAQ_GROUPS } from '@/data/faqs.js';
import SavingsComparisonSection from './sections/SavingsComparisonSection.jsx';

const VO_PLANS = [
  {
    name: 'Mailing Address',
    description: 'A prime address for letters and couriers.',
    price: 849,
    features: [['Commercial business address'], ['Mail & courier receiving'], ['WhatsApp photo alerts'], ['GST registration documents', false]],
    source: 'Pricing - Mailing Plan',
  },
  {
    name: 'GST Registration',
    description: 'Everything needed to get your GSTIN.',
    price: 1249,
    popular: true,
    features: [['Rent agreement, NOC & utility bill'], ['Company name board'], ['Officer inspection support'], ['Full refund if rejected']],
    cta: 'Get this plan',
    source: 'Pricing - GST Plan',
  },
  {
    name: 'All-Inclusive',
    description: 'For Pvt Ltd companies that also meet clients.',
    price: 1999,
    features: [['Everything in GST plan'], ['MCA incorporation proofs'], ['10 free boardroom hours / month'], ['Dedicated concierge']],
    source: 'Pricing - Enterprise Plan',
  },
];

const OTHER_PRICES = [
  ['ph-laptop', 'Coworking day pass', '₹299', '/day', '/coworking-spaces'],
  ['ph-desktop-tower', 'Dedicated desk', '₹6,999', '/month', '/coworking-spaces'],
  ['ph-door', 'Private cabin', '₹11,999', '/month', '/coworking-spaces'],
  ['ph-presentation', 'Meeting room', '₹499', '/hour', '/meeting-rooms'],
  ['ph-certificate', 'Company registration', '₹5,499', '+ govt. fees', '/company-registration'],
  ['ph-receipt', 'GST registration', '₹1,499', 'one-time', '/services/gst-registration'],
];

const FAQS = FAQ_GROUPS.find((group) => group.id === 'billing').items;

/** Pricing — virtual office plans, other services, prices by city, savings. */
export default function PricingPage() {
  const vo = getCityProduct('virtual-office');
  return (
    <main id="main-content" className="ui-page">
      <PageHero
        id="pricingHero"
        badge="No setup fees • GST invoice on every plan"
        title="Simple, upfront"
        highlight="pricing"
        description="Every price on one page. Pick a plan, or ask us for an exact quote for your city."
        actions={
          <>
            <Button href="#plans" variant="primary" size="lg" iconRight="ph-arrow-down">
              See plans
            </Button>
            <Button href="#cities" variant="outline" size="lg">
              Prices by city
            </Button>
          </>
        }
      />

      <Section id="plans" tone="white" kicker="Virtual office" title="Virtual office plans" lead="Per month, billed annually. Prices exclude 18% GST.">
        <Plans plans={VO_PLANS} />
      </Section>

      <Section id="other" kicker="Other services" title="Workspaces & registration">
        <div className="ui-grid ui-grid--3">
          {OTHER_PRICES.map(([icon, name, price, unit, to]) => (
            <Link key={name} to={to} className="ui-card">
              <div className="ui-card__icon">
                <i className={`ph-bold ${icon}`} />
              </div>
              <h3>{name}</h3>
              <div className="ui-card__price">
                From <strong>{price}</strong> {unit}
              </div>
              <span className="ui-card__link">
                View details <i className="ph-bold ph-arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="cities" tone="white" kicker="By city" title="Virtual office prices by city" lead="Lowest monthly price at each city’s centres.">
        <div className="ui-table-wrap" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>City</th>
                <th>State</th>
                <th>From</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {CITIES.map((city) => {
                const price = cityStartingPrice(city, vo);
                return (
                  <tr key={city.slug}>
                    <td>
                      <strong>{city.name}</strong>
                    </td>
                    <td>{city.state}</td>
                    <td>{price ? <strong>₹{price.toLocaleString('en-IN')}/mo</strong> : 'On request'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/locations/${city.slug}/virtual-office`} style={{ color: '#00A896', fontWeight: 700 }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <SavingsComparisonSection />

      <Section id="faq" kicker="FAQ" title="Billing questions">
        <FaqAccordion items={FAQS} />
      </Section>

      <section className="ui-section ui-section--tight">
        <div className="ui-container">
          <CtaBand title="Want an exact price for your city?" text="Tell us what you need and we’ll send an itemised quote with GST — usually within 15 minutes." source="Pricing - Final CTA" />
        </div>
      </section>
    </main>
  );
}
