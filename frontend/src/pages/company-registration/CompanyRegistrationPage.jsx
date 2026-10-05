import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import { Button, CtaBand, Plans, Section, SplitHero, Steps } from '@/components/ui/index.js';
import { getService } from '@/data/services.js';
import IncorporationWizardSection from './sections/IncorporationWizardSection.jsx';

const ENTITIES = [
  {
    name: 'Private Limited',
    description: 'Best if you plan to raise investment or issue ESOPs.',
    price: 6999,
    period: '+ govt. stamp duty',
    popular: true,
    features: [['2+ directors and shareholders'], ['Limited liability'], ['Easy to raise equity funding'], ['Higher annual compliance']],
    cta: 'Register Pvt Ltd',
    source: 'Company Registration - Pvt Ltd',
  },
  {
    name: 'LLP',
    description: 'Best for professional firms and partnerships.',
    price: 5499,
    period: '+ govt. fees',
    features: [['2+ designated partners'], ['Limited liability'], ['Lower compliance than Pvt Ltd'], ['Not suited to equity funding']],
    cta: 'Register LLP',
    source: 'Company Registration - LLP',
  },
  {
    name: 'One Person Company',
    description: 'Best for a solo founder who wants limited liability.',
    price: 5999,
    period: '+ govt. fees',
    features: [['1 director and shareholder'], ['Limited liability'], ['Nominee required'], ['Convert to Pvt Ltd as you grow']],
    cta: 'Register OPC',
    source: 'Company Registration - OPC',
  },
];

const STEPS = [
  { title: 'DSC & DIN', text: 'We issue digital signatures and director IDs for every director.' },
  { title: 'Name approval', text: 'We check availability and reserve your company name with the MCA.' },
  { title: 'Incorporation filing', text: 'Our CA files SPICe+ with your MOA, AOA and registered office proof.' },
  { title: 'Certificate & PAN', text: 'You receive the Certificate of Incorporation, PAN and TAN.' },
];

/** Company registration — compare entity types, see the steps, estimate cost, talk to a CA. */
export default function CompanyRegistrationPage() {
  const faqs = getService('company-registration').faqs;
  return (
    <main id="main-content" className="ui-page">
      <SplitHero
        badge="Handled by certified CA / CS professionals"
        title={
          <>
            Register your company, <em>without the paperwork stress</em>
          </>
        }
        description="Private Limited, LLP or One Person Company — we handle name approval, digital signatures and MCA filing, and give you a registered office address."
        price={5499}
        priceNote="+ government fees"
        actions={
          <>
            <Button href="#entities" variant="primary" size="lg" iconRight="ph-arrow-down">
              Compare company types
            </Button>
            <Button href="#incorpWizard" variant="outline" size="lg">
              Estimate my cost
            </Button>
          </>
        }
        trust={['Typically 5–7 working days', 'Registered office included', 'Dedicated CA']}
        lead={{
          ribbon: 'FREE CONSULTATION',
          title: 'Talk to a CA for free',
          subtitle: 'Not sure which company type fits? Share your details and a CA will call you.',
          service: 'Company Registration',
          source: 'Company Registration Hero',
          cta: 'Request a call →',
        }}
      />

      <Section id="entities" tone="white" kicker="Company types" title="Which company type is right for you?" lead="Professional fees shown. Government fees and stamp duty depend on your state.">
        <Plans plans={ENTITIES} />
        <p style={{ textAlign: 'center', margin: '22px 0 0', color: '#64748B', fontSize: '0.92rem' }}>
          Registering an NGO? Section 8 company registration starts at ₹11,999 + govt. fees.
        </p>
      </Section>

      <Section id="process" kicker="How it works" title={<>From documents to certificate in <em>four steps</em></>} lead="Typically 5–7 working days after your documents are complete, subject to MCA processing.">
        <Steps steps={STEPS} />
      </Section>

      <IncorporationWizardSection />

      <Section id="faq" kicker="FAQ" title="Common questions">
        <FaqAccordion items={faqs} />
      </Section>

      <section className="ui-section ui-section--tight">
        <div className="ui-container">
          <CtaBand title="Ready to start your company?" text="Share your details and our CA team will guide you through documents, name approval and filing." source="Company Registration - Final CTA" />
        </div>
      </section>
    </main>
  );
}
