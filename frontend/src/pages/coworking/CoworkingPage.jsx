import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import { Button, CityGrid, CtaBand, FeatureCards, Plans, Section, SplitHero } from '@/components/ui/index.js';
import { FAQ_GROUPS } from '@/data/faqs.js';
import MarketplaceSection from './sections/MarketplaceSection.jsx';
import TeamSavingsCalculator from './sections/TeamSavingsCalculator.jsx';

const OPTIONS = [
  {
    name: 'Day Pass',
    description: 'Drop in and work for a day, no commitment.',
    price: 299,
    period: '/day',
    features: [['Any open desk'], ['High-speed Wi-Fi'], ['Tea, coffee & pantry'], ['Meeting room access', false], ['Business address', false]],
    source: 'Coworking - Day Pass',
  },
  {
    name: 'Dedicated Desk',
    description: 'Your own desk in a shared space, every day.',
    price: 6999,
    popular: true,
    features: [['Reserved desk & storage'], ['High-speed Wi-Fi & printing'], ['Meeting room credits'], ['Mail handling'], ['24/7 access at select centres']],
    cta: 'Book a tour',
    source: 'Coworking - Dedicated Desk',
  },
  {
    name: 'Private Cabin',
    description: 'A lockable office for your team of 2–25.',
    price: 11999,
    features: [['Private, lockable cabin'], ['Furniture & storage'], ['Company name board'], ['Meeting room credits'], ['Reception & concierge']],
    source: 'Coworking - Private Cabin',
  },
];

const AMENITIES = [
  { icon: 'ph-wifi-high', title: 'Fast, reliable Wi-Fi', text: 'Dual 500 Mbps connections so calls never drop.' },
  { icon: 'ph-armchair', tone: 'gold', title: 'Ergonomic furniture', text: 'Herman Miller chairs and adjustable standing desks.' },
  { icon: 'ph-coffee', tone: 'navy', title: 'Café & pantry', text: 'Tea, coffee and a serviced café on site.' },
  { icon: 'ph-phone', title: 'Phone booths', text: 'Soundproof booths for private calls.' },
  { icon: 'ph-lock-key', tone: 'gold', title: 'Secure access', text: 'Keyless smart locks and CCTV at every centre.' },
  { icon: 'ph-headset', tone: 'navy', title: 'On-site team', text: 'Reception and IT support whenever you need help.' },
];

const FAQS = FAQ_GROUPS.find((group) => group.id === 'workspaces').items;

/** Coworking — choose desk type, browse spaces, see amenities, pick a city. */
export default function CoworkingPage() {
  return (
    <main id="main-content" className="ui-page">
      <SplitHero
        badge="Flexible terms • No lock-in"
        title={
          <>
            Coworking desks & private cabins, <em>ready when you are</em>
          </>
        }
        description="Work from a fully serviced office by the day or month. Wi-Fi, furniture, meeting rooms and reception are all included."
        price={299}
        priceNote="per day"
        actions={
          <>
            <Button href="#marketplace" variant="primary" size="lg" iconRight="ph-arrow-down">
              Browse spaces
            </Button>
            <Button href="#options" variant="outline" size="lg">
              Compare options
            </Button>
          </>
        }
        trust={['Move in same day', 'All-inclusive pricing', 'GST invoice']}
        lead={{
          ribbon: 'FREE TOUR',
          title: 'Book a free tour',
          subtitle: 'Tell us your team size and city. We’ll show you available spaces.',
          service: 'Coworking',
          source: 'Coworking Hero',
          cta: 'Book my tour →',
        }}
      />

      <Section id="options" tone="white" kicker="Options" title="Choose how you want to work" lead="Monthly prices, all-inclusive. Metro centres may vary — see each city page.">
        <Plans plans={OPTIONS} />
      </Section>

      <MarketplaceSection />

      <Section id="amenities" tone="white" kicker="Included" title="Everything you need to get work done">
        <FeatureCards items={AMENITIES} />
      </Section>

      <TeamSavingsCalculator />

      <Section id="cities" tone="white" kicker="Locations" title="Coworking in 10+ cities">
        <CityGrid limit={8} productSlug="coworking" />
      </Section>

      <Section id="faq" kicker="FAQ" title="Common questions">
        <FaqAccordion items={FAQS} />
      </Section>

      <section className="ui-section ui-section--tight">
        <div className="ui-container">
          <CtaBand title="See the space before you decide" text="Book a free walkthrough at any centre. We’ll help you pick the right desk or cabin for your team." source="Coworking - Final CTA" />
        </div>
      </section>
    </main>
  );
}
