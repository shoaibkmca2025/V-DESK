import LeadCard from '@/components/page/LeadCard.jsx';
import { Button, CtaBand, FeatureCards, Section, StatsRow, Steps } from '@/components/ui/index.js';

/**
 * /list-your-space — for building owners and operators who want V-DESK to fill their space.
 *
 * The other side of the marketplace: every other page sells space to businesses, this one asks for it. It
 * uses the same lead form as the rest of the site, so an enquiry lands in the same pipeline the sales team
 * already works from, tagged with its own source.
 */

const WHY = [
  {
    icon: 'ph-users-three',
    title: 'Demand, not just a listing',
    text: 'Businesses arrive through V-DESK already looking for an address or a desk in your city — we bring the enquiry, not a classified ad.',
  },
  {
    icon: 'ph-file-text',
    tone: 'gold',
    title: 'Paperwork handled',
    text: 'Rent agreements, NOCs and utility bills are prepared and verified in the format GST and MCA accept, so your team is not drafting documents.',
  },
  {
    icon: 'ph-shield-check',
    tone: 'navy',
    title: 'Clients we have checked',
    text: 'Every business completes KYC before it is given your address. You see who is coming before they arrive.',
  },
  {
    icon: 'ph-calendar-check',
    title: 'Rooms filled by the hour',
    text: 'Meeting rooms and spare cabins get booked through the same system, which turns idle hours into revenue.',
  },
  {
    icon: 'ph-receipt',
    tone: 'gold',
    title: 'One monthly settlement',
    text: 'A single invoice and one payout a month, with the GST split shown line by line.',
  },
  {
    icon: 'ph-chart-line-up',
    tone: 'navy',
    title: 'What your space earns',
    text: 'See occupancy, bookings and what each floor brings in, instead of guessing at the end of the quarter.',
  },
];

const STEPS = [
  { title: 'Tell us about the space', text: 'City, locality, carpet area, and what you have free — a few cabins, a floor, or just a board-ready address.' },
  { title: 'We visit and verify', text: 'Our team checks the property, the ownership papers and whether the address will clear a GST inspection.' },
  { title: 'We agree commercials', text: 'Revenue share or fixed monthly, whichever suits the space. Written down before anything goes live.' },
  { title: 'Your space goes live', text: 'It appears in search, on your city page and in quotes — and the first enquiries usually arrive the same week.' },
];

/** The form asks what is on offer, not what is wanted — the same pipeline, a different question. */
const SPACE_TYPES = [
  ['Office floor', 'A floor or wing in a commercial building'],
  ['Private cabins', 'Private cabins or a business centre'],
  ['Coworking desks', 'Coworking desks'],
  ['Meeting rooms', 'Meeting rooms by the hour'],
  ['Registered address', 'A compliant address for registrations'],
  ['Whole building', 'A whole building'],
];

const SUITABLE = [
  'Commercial buildings with spare floors',
  'Business centres with empty cabins',
  'Coworking operators with unsold desks',
  'Hotels with unused meeting rooms',
  'Owners with a compliant commercial address',
];

export default function ListYourSpacePage() {
  return (
    <main id="main-content" className="ui-page">
      <section className="ui-page-hero" id="listSpaceHero">
        <div className="ui-container">
          <div className="ui-two-col" style={{ alignItems: 'center' }}>
            <div className="ui-hero__inner" style={{ textAlign: 'left', margin: 0 }}>
              <span className="ui-hero__badge">
                <i className="ph-bold ph-buildings" /> For space owners & operators
              </span>
              <h1 className="ui-hero__title">
                Have space in a commercial building? <em>Put it to work.</em>
              </h1>
              <p className="ui-hero__desc">
                List it with V-DESK and we will bring verified businesses, prepare the compliance paperwork and
                settle with you every month. You keep the building; we keep it occupied.
              </p>
              <div className="ui-actions" style={{ marginTop: '22px' }}>
                <Button variant="gold" icon="ph-paper-plane-tilt" href="#list-your-space-form">
                  List your space
                </Button>
                <Button
                  variant="outline"
                  icon="ph-whatsapp-logo"
                  href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20want%20to%20list%20my%20space"
                  target="_blank"
                >
                  Ask on WhatsApp
                </Button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LeadCard
                ribbon="WE REPLY IN 15 MIN"
                title="List your space"
                subtitle="Tell us where the space is and how much is free. Our partnerships team will call you back."
                source="List Your Space"
                cta="Send details →"
                requirementLabel="What are you offering? *"
                requirements={SPACE_TYPES}
                cityLabel="Where is it? *"
              />
            </div>
          </div>
        </div>
      </section>

      <StatsRow
        stats={[
          ['10+', 'Cities live'],
          ['24 hrs', 'Verification visit'],
          ['Monthly', 'Settlement cycle'],
          ['100%', 'KYC-checked clients'],
        ]}
      />

      <Section
        kicker="Why V-DESK"
        title="What you get for listing with us"
        lead="We are not a listings site. We bring the client, the paperwork and the compliance, and you keep running your building."
      >
        <FeatureCards items={WHY} />
      </Section>

      <Section tone="tint" kicker="How it works" title="Four steps, about a week">
        <Steps steps={STEPS} />
      </Section>

      <Section tone="white" kicker="Who this suits" title="Spaces we are looking for" align="left">
        <div className="ui-two-col" style={{ alignItems: 'start' }}>
          <ul className="ui-checks">
            {SUITABLE.map((item) => (
              <li key={item}>
                <i className="ph-bold ph-check-circle" /> {item}
              </li>
            ))}
          </ul>
          <div className="ui-card">
            <div className="ui-card__icon ui-card__icon--gold">
              <i className="ph-bold ph-info" />
            </div>
            <h3>What we check before going live</h3>
            <p>
              Ownership or a registered lease in your name, a commercial property tax receipt, a recent utility
              bill, and that the building allows business registration at the address. If something is missing we
              will tell you plainly whether it can be fixed.
            </p>
          </div>
        </div>
      </Section>

      <Section id="list-your-space-form" tone="tint" kicker="Get started" title="Send us your space details" align="center">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LeadCard
            ribbon="PARTNERSHIPS TEAM"
            title="Tell us about your space"
            subtitle="City, locality and how much is free is enough to start. We will take it from there."
            source="List Your Space — Form"
            cta="Submit details →"
            requirementLabel="What are you offering? *"
            requirements={SPACE_TYPES}
            cityLabel="Where is it? *"
          />
        </div>
      </Section>

      <CtaBand
        title="Not sure if your building qualifies?"
        text="Send us the address and we will tell you in a day whether it will clear a GST inspection."
        note="A partnerships advisor replies within one working day"
        primary={
          <Button variant="gold" size="lg" icon="ph-paper-plane-tilt" to="/contact">
            Talk to partnerships
          </Button>
        }
        secondary={
          <Button variant="white" icon="ph-map-pin" to="/locations">
            See our centres
          </Button>
        }
      />
    </main>
  );
}
