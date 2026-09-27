import { Link } from 'react-router';
import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import { Button, CityGrid, CityStrip, CtaBand, Plans, SearchHero, Section, Steps, Testimonials } from '@/components/ui/index.js';
import { FAQ_GROUPS } from '@/data/faqs.js';
import { GUIDES } from '@/data/guides.js';
import { asset } from '@/lib/assets.js';

const SERVICES = [
  {
    to: '/virtual-office',
    image: 'assets/vdesk-reception.jpg',
    tag: 'Most chosen',
    title: 'Virtual Office',
    text: 'A registered business address with the rent agreement, NOC and utility bill needed for GST and company registration.',
    price: '₹849',
    unit: '/month',
  },
  {
    to: '/coworking-spaces',
    image: 'assets/vdesk-coworking.jpg',
    title: 'Coworking & Cabins',
    text: 'Hot desks, dedicated desks and private cabins with Wi-Fi, reception and meeting credits.',
    price: '₹399',
    unit: '/day',
  },
  {
    to: '/meeting-rooms',
    image: 'assets/vdesk-boardroom.jpg',
    title: 'Meeting Rooms',
    text: 'Boardrooms and huddle rooms with 4K screens. Book by the hour, pay online.',
    price: '₹499',
    unit: '/hour',
  },
];

const BUSINESS_SERVICES = [
  { icon: 'ph-certificate', tone: 'gold', title: 'Company Registration', text: 'Pvt Ltd, LLP or OPC — name approval, DSC, DIN and incorporation handled by our CA team.', to: '/company-registration' },
  { icon: 'ph-receipt', title: 'GST Registration', text: 'A compliant address plus document and officer-visit support for your GSTIN application.', to: '/services/gst-registration' },
  { icon: 'ph-magnifying-glass', tone: 'navy', title: 'Find a Workspace', text: 'Compare centres by city, price and team size in one list.', to: '/search' },
];

const STEPS = [
  { title: 'Pick a plan and city', text: 'Choose what you need and where. Prices are shown upfront.', time: '2 minutes' },
  { title: 'Pay and upload KYC', text: 'Pay online, then upload PAN, Aadhaar and a photo. No office visit needed.', time: '5 minutes' },
  { title: 'Receive your documents', text: 'Rent agreement, NOC and utility bill arrive in your portal, ready to file.', time: 'Within 24 hours' },
];

const PLANS = [
  {
    name: 'Mailing Address',
    description: 'A prime address for letters and couriers.',
    price: 849,
    features: [['Commercial business address'], ['Mail & courier handling'], ['WhatsApp photo alerts'], ['GST registration documents', false], ['Name board at centre', false]],
    source: 'Home - Mailing Plan',
  },
  {
    name: 'GST Registration',
    description: 'Everything you need to get your GSTIN approved.',
    price: 1249,
    popular: true,
    features: [['Everything in Mailing'], ['Rent agreement, NOC & utility bill'], ['Officer verification support'], ['Company name board'], ['Documents in 24 hours']],
    cta: 'Get this plan',
    source: 'Home - GST Plan',
  },
  {
    name: 'All-Inclusive',
    description: 'For Pvt Ltd companies that also need meeting space.',
    price: 1999,
    features: [['Everything in GST plan'], ['MCA-compliant incorporation proofs'], ['10 free boardroom hours / month'], ['Dedicated concierge'], ['Bank account verification desk']],
    source: 'Home - Enterprise Plan',
  },
];

const WHY = [
  { icon: 'ph-seal-check', title: '100% approval support', text: 'If your GST or MCA application is rejected because of our documents, you get a full refund.' },
  { icon: 'ph-lightning', tone: 'gold', title: 'Ready in 24 hours', text: 'Digital KYC and e-signed documents — most clients are filing the same day.' },
  { icon: 'ph-currency-inr', tone: 'navy', title: 'Clear pricing', text: 'One price per plan, GST invoice included. No setup fees or hidden charges.' },
  { icon: 'ph-headset', title: 'Real people to help', text: 'Verified WhatsApp concierge, available 24/7, plus a dedicated advisor for your account.' },
];

const HOME_FAQS = FAQ_GROUPS.flatMap((group) => group.items).slice(0, 5);

/** Homepage — one clear path: search or pick a service → see pricing → choose a city → get a quote. */
export default function HomePage() {
  return (
    <main id="main-content" className="ui-page">
      <SearchHero
        badge="Trusted by 10,000+ businesses across India"
        title={
          <>
            Your business address & workspace, <em>ready in 24 hours</em>
          </>
        }
        description="Virtual offices, coworking desks, meeting rooms and company registration in 10+ cities — with every document you need for GST and MCA."
        placeholder="Try “virtual office in Mumbai” or “meeting room for 8”"
        chips={[
          { label: 'Virtual Office', icon: 'ph-buildings', to: '/virtual-office' },
          { label: 'Coworking', icon: 'ph-laptop', to: '/coworking-spaces' },
          { label: 'Meeting Rooms', icon: 'ph-presentation', to: '/meeting-rooms' },
          { label: 'GST Registration', icon: 'ph-receipt', to: '/services/gst-registration' },
          { label: 'Company Registration', icon: 'ph-certificate', to: '/company-registration' },
        ]}
        trust={['GST & MCA compliant', 'Documents in 24 hours', 'Full refund if rejected']}
        image={asset('assets/vdesk-reception.jpg')}
        stats={[
          ['10,000+', 'Businesses served'],
          ['10+', 'Cities'],
          ['24 hrs', 'Activation'],
          ['4.9★', 'Client rating'],
        ]}
      />

      <CityStrip />

      <Section id="services" tone="white" kicker="What we offer" title="What does your business need?" lead="Start with the service you need. Every plan includes a GST invoice and support from a real advisor.">
        <div className="ui-grid ui-grid--3">
          {SERVICES.map((service) => (
            <Link key={service.title} to={service.to} className="ui-card ui-card--service">
              <div className="ui-card__media">
                <img src={asset(service.image)} alt={service.title} loading="lazy" />
                {service.tag && <span className="ui-card__tag">{service.tag}</span>}
              </div>
              <div className="ui-card__body">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <div className="ui-card__price">
                  From <strong>{service.price}</strong>
                  {service.unit}
                </div>
                <span className="ui-card__link">
                  View plans <i className="ph-bold ph-arrow-right" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="ui-grid ui-grid--3 ui-grid--gap-tight">
          {BUSINESS_SERVICES.map((item) => (
            <Link key={item.title} to={item.to} className="ui-card">
              <div className={item.tone ? `ui-card__icon ui-card__icon--${item.tone}` : 'ui-card__icon'}>
                <i className={`ph-bold ${item.icon}`} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="ui-card__link">
                Learn more <i className="ph-bold ph-arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="journey" kicker="How it works" title={<>Get started in <em>three simple steps</em></>} lead="Everything happens online. Most clients finish in under ten minutes.">
        <Steps steps={STEPS} />
        <div className="ui-actions ui-actions--center" style={{ marginTop: '32px' }}>
          <Button to="/virtual-office" variant="primary" size="lg" iconRight="ph-arrow-right">
            Start with a virtual office
          </Button>
        </div>
      </Section>

      <Section id="pricing" tone="white" kicker="Pricing" title="Simple plans, no hidden fees" lead="Virtual office prices for our Nashik centre. Metro cities are shown on each location page.">
        <Plans plans={PLANS} />
        <p className="ui-note">
          Billed annually • 100% tax deductible • <Link to="/pricing">Compare all plans and savings →</Link>
        </p>
      </Section>

      <Section id="locations" kicker="Locations" title="Choose your city" lead="Grade-A business centres in India’s top commercial areas. Tap a city to see centres and prices.">
        <CityGrid limit={8} />
        <div className="ui-actions ui-actions--center" style={{ marginTop: '28px' }}>
          <Button to="/locations" variant="outline" iconRight="ph-arrow-right">
            See all locations
          </Button>
        </div>
      </Section>

      <Section id="why" tone="navy" kicker="Why V-DESK" title="Built so you don’t have to worry about compliance" lead="Ten thousand businesses have used a V-DESK address to register, file and grow.">
        <div className="ui-stat-row">
          {[['10,000+', 'Businesses served'], ['100%', 'Document approval guarantee'], ['24 hrs', 'Document delivery'], ['4.9★', 'Client rating']].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="ui-grid ui-grid--2">
          {WHY.map((item, index) => (
            <div key={item.title} className="ui-card ui-card--dark">
              <div className={index % 2 ? 'ui-card__icon ui-card__icon--gold' : 'ui-card__icon'}>
                <i className={`ph-bold ${item.icon}`} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="testimonials" kicker="Reviews" title="What our clients say">
        <Testimonials />
      </Section>

      <Section id="knowledge" tone="white" kicker="Guides" title="Helpful reads before you decide" align="left">
        <div className="ui-grid ui-grid--3">
          {GUIDES.slice(0, 3).map((guide) => (
            <Link key={guide.slug} to={`/resources/${guide.slug}`} className="ui-card">
              <span className="ui-card__meta">
                {guide.category} • {guide.readTime} min read
              </span>
              <h3>{guide.title}</h3>
              <p>{guide.excerpt}</p>
              <span className="ui-card__link">
                Read guide <i className="ph-bold ph-arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="faq" kicker="FAQ" title="Common questions">
        <FaqAccordion items={HOME_FAQS} />
        <p className="ui-note">
          <Link to="/faqs">See all questions →</Link>
        </p>
      </Section>

      <section className="ui-section ui-section--tight" id="contact">
        <div className="ui-container">
          <CtaBand
            title="Not sure which plan fits? We’ll help you choose."
            text="Tell us your city and what you need. An advisor will send you the right plan and exact price — free, with no obligation."
            source="Home - Final CTA"
          />
        </div>
      </section>
    </main>
  );
}
