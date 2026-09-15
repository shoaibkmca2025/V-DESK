import LeadCard from '@/components/page/LeadCard.jsx';
import { Section } from '@/components/ui/index.js';
import { LOCATIONS } from '@/data/locations.js';

const CHANNELS = [
  { icon: 'ph-whatsapp-logo', title: 'WhatsApp', text: 'Fastest reply — usually within 15 minutes.', label: 'Chat now', href: 'https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20have%20a%20question' },
  { icon: 'ph-phone-call', tone: 'gold', title: 'Call us', text: '+91 98765 43210', label: 'Call now', href: 'tel:+919876543210' },
  { icon: 'ph-envelope', tone: 'navy', title: 'Email', text: 'contact@vdeskworkspace.com', label: 'Send email', href: 'mailto:contact@vdeskworkspace.com' },
];

const HUB_IDS = ['NSK-001', 'MUM-002', 'DEL-001', 'BLR-001'];

/** Contact — three ways to reach us, one enquiry form, office addresses. */
export default function ContactPage() {
  const hubs = HUB_IDS.map((id) => LOCATIONS.find((l) => l.id === id)).filter(Boolean);
  return (
    <main id="main-content" className="ui-page">
      <section className="ui-page-hero ui-page-hero--center" id="contactHero">
        <div className="ui-container">
          <div className="ui-hero__inner">
            <span className="ui-hero__badge">
              <i className="ph-bold ph-headset" /> Real people, quick replies
            </span>
            <h1 className="ui-hero__title">
              How can we <em>help you?</em>
            </h1>
            <p className="ui-hero__desc">Ask about plans, cities or registration. Pick whichever way is easiest for you.</p>
          </div>
        </div>
      </section>

      <Section tight>
        <div className="ui-grid ui-grid--3">
          {CHANNELS.map((channel) => (
            <a key={channel.title} href={channel.href} className="ui-card" target={channel.href.startsWith('http') ? '_blank' : undefined} rel="noopener">
              <div className={channel.tone ? `ui-card__icon ui-card__icon--${channel.tone}` : 'ui-card__icon'}>
                <i className={`ph-bold ${channel.icon}`} />
              </div>
              <h3>{channel.title}</h3>
              <p>{channel.text}</p>
              <span className="ui-card__link">
                {channel.label} <i className="ph-bold ph-arrow-right" />
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section tone="white" id="enquiry">
        <div className="ui-two-col" style={{ alignItems: 'start' }}>
          <div>
            <span className="ui-kicker">Our offices</span>
            <h2 className="ui-title">Visit a centre</h2>
            <p className="ui-lead" style={{ marginBottom: '24px' }}>
              Walk in any weekday, or book a tour and we’ll have a desk ready for you.
            </p>
            <div style={{ display: 'grid', gap: '14px' }}>
              {hubs.map((hub) => (
                <div key={hub.id} className="ui-card" style={{ padding: '18px 20px', flexDirection: 'row', gap: '14px', alignItems: 'flex-start' }}>
                  <div className={hub.flagship ? 'ui-card__icon ui-card__icon--gold' : 'ui-card__icon'} style={{ flexShrink: 0, width: '40px', height: '40px', fontSize: '1.1rem' }}>
                    <i className="ph-bold ph-map-pin" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem' }}>
                      {hub.city} — {hub.areaName}
                      {hub.flagship ? ' (Head office)' : ''}
                    </h3>
                    <p style={{ fontSize: '0.88rem' }}>{hub.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LeadCard ribbon="REPLY IN 15 MIN" title="Send us a message" subtitle="Share a few details and an advisor will get back to you on WhatsApp." source="Contact Page" cta="Send message →" />
          </div>
        </div>
      </Section>
    </main>
  );
}
