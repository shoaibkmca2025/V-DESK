import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import VirtualOfficeConfigurator from '@/components/sections/VirtualOfficeConfigurator.jsx';
import DocumentChecklist from '@/components/ui/DocumentChecklist.jsx';
import { Button, CityGrid, CtaBand, FeatureCards, Plans, Section, SplitHero, Steps } from '@/components/ui/index.js';

const PLANS = [
  {
    name: 'Mailing Address',
    description: 'For freelancers and remote teams who need a prime address for mail.',
    price: 849,
    features: [['Commercial business address'], ['Mail & courier receiving'], ['WhatsApp photo alerts'], ['GST registration documents', false], ['Name board at centre', false]],
    source: 'Virtual Office - Mailing Plan',
  },
  {
    name: 'GST Registration',
    description: 'Everything needed for a PPOB or APOB GST registration.',
    price: 1249,
    popular: true,
    features: [['Notarized rent agreement'], ['Landlord NOC & electricity bill'], ['Company name board'], ['Officer inspection support'], ['Full refund if rejected']],
    cta: 'Get this plan',
    source: 'Virtual Office - GST Plan',
  },
  {
    name: 'All-Inclusive',
    description: 'For Pvt Ltd companies with directors and client meetings.',
    price: 1999,
    features: [['Everything in GST plan'], ['MCA incorporation proofs'], ['10 free boardroom hours / month'], ['Dedicated concierge'], ['Bank account verification desk']],
    source: 'Virtual Office - Enterprise Plan',
  },
];

const INCLUDED = [
  { icon: 'ph-file-text', title: 'Rent agreement', text: 'A notarized commercial rent agreement in your business name.' },
  { icon: 'ph-seal-check', tone: 'gold', title: 'NOC & utility bill', text: 'Landlord no-objection certificate and a recent electricity bill for the address.' },
  { icon: 'ph-envelope-simple', tone: 'navy', title: 'Mail handling', text: 'We receive letters, notices and couriers and send you a photo on WhatsApp.' },
  { icon: 'ph-identification-badge', title: 'Name board', text: 'Your company name displayed at the centre, as GST officers expect.' },
  { icon: 'ph-user-check', tone: 'gold', title: 'Officer visit support', text: 'Our on-site manager handles physical verification visits for you.' },
  { icon: 'ph-shield-check', tone: 'navy', title: 'Refund guarantee', text: 'If your application is rejected because of our documents, you get your money back.' },
];

const STEPS = [
  { title: 'Choose a plan and city', text: 'Pick the plan above and the centre you want as your address.', time: '2 minutes' },
  { title: 'Upload KYC and pay', text: 'Upload PAN, Aadhaar and a photo, then pay online. No visit needed.', time: '5 minutes' },
  { title: 'Download your documents', text: 'Rent agreement, NOC and utility bill arrive in your portal, ready to file.', time: 'Within 24 hours' },
];

const FAQS = [
  ['What is a virtual office and who needs it?', 'A virtual office gives you a real commercial address with a rent agreement, NOC and utility bill — without renting a physical office. It suits startups, e-commerce sellers, consultants and companies expanding to new states.'],
  ['Will GST or MCA officials accept this address?', 'Yes. V-DESK addresses follow MCA SPICe+ guidelines and the CGST Act. You receive a notarized rent agreement, owner NOC and utility bill — the documents officers ask for.'],
  ['What if a GST officer visits the address?', 'All our addresses are staffed business centres. Our centre manager meets the officer, shows your name board and confirms your registration.'],
  ['Can I open a bank current account with this address?', 'Yes. Major banks such as HDFC, ICICI, SBI, Axis and Kotak accept our rent agreement, NOC and utility bill along with your GST or incorporation certificate.'],
  ['How does the money-back guarantee work?', 'If your GST or MCA application is rejected because of a problem with our property documents, we fix it first — and if it still cannot be approved, we refund you.'],
  ['How is my mail handled?', 'Our front desk receives your letters, tax notices and couriers and sends you a WhatsApp photo. Forwarding and scanning are available on request.'],
];

/** Virtual office — pick a plan, see what's included, choose a city, get documents in 24 hours. */
export default function VirtualOfficePage() {
  return (
    <main id="main-content" className="ui-page">
      <SplitHero
        badge="100% GST & MCA approval guarantee"
        title={
          <>
            A registered business address, <em>ready in 24 hours</em>
          </>
        }
        description="Get a virtual office with every document you need for GST registration, company incorporation and a bank account — without renting an office."
        price={849}
        actions={
          <>
            <Button href="#plans" variant="primary" size="lg" iconRight="ph-arrow-down">
              See plans
            </Button>
            <Button href="#cities" variant="outline" size="lg">
              Choose a city
            </Button>
          </>
        }
        trust={['Documents in 24 hours', 'Officer visit support', 'Full refund if rejected']}
        lead={{
          ribbon: 'FREE QUOTE',
          title: 'Get your exact price',
          subtitle: 'Tell us your city and plan. An advisor replies on WhatsApp within 15 minutes.',
          service: 'Virtual Office',
          source: 'Virtual Office Hero',
          cta: 'Get my quote →',
        }}
      />

      <Section id="plans" tone="white" kicker="Plans" title="Pick the plan that fits your business" lead="All prices are per month, billed annually. Metro city prices are shown on each city page.">
        <Plans plans={PLANS} />
      </Section>

      <Section id="included" kicker="What you get" title="Every document you need, in one place">
        <FeatureCards items={INCLUDED} />
      </Section>

      <Section id="process" tone="white" kicker="How it works" title={<>Three steps, <em>fully online</em></>}>
        <Steps steps={STEPS} />
      </Section>

      <Section id="cities" kicker="Locations" title="Choose your business address city" lead="Tap a city to see the centres and exact prices.">
        <CityGrid limit={8} />
      </Section>

      <Section id="documents" tone="white" kicker="KYC" title="Documents you’ll need" lead="Keep these ready — upload takes about five minutes.">
        <DocumentChecklist />
      </Section>

      <VirtualOfficeConfigurator />

      <Section id="faq" tone="white" kicker="FAQ" title="Questions people ask before buying">
        <FaqAccordion items={FAQS} />
      </Section>

      <section className="ui-section ui-section--tight">
        <div className="ui-container">
          <CtaBand title="Still deciding? Talk to an advisor." text="We’ll recommend the right plan and city for your GST or company registration — free, in 15 minutes." source="Virtual Office - Final CTA" />
        </div>
      </section>
    </main>
  );
}
