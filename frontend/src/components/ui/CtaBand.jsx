import Button from './Button.jsx';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

const WHATSAPP = 'https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20help%20choosing%20a%20plan';

/** Navy call-to-action band: one primary action (quote) and one secondary (WhatsApp). */
export default function CtaBand({ title, text, primary, secondary, source = 'CTA Band', note = 'Reply within 15 minutes on WhatsApp • No commitment' }) {
  return (
    <div className="ui-cta">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="ui-cta__actions">
        {primary || (
          <Button variant="gold" size="lg" icon="ph-paper-plane-tilt" onClick={() => openQuoteModal(source)}>
            Get a free quote
          </Button>
        )}
        {secondary || (
          <Button variant="white" href={WHATSAPP} target="_blank" rel="noopener" icon="ph-whatsapp-logo">
            Chat on WhatsApp
          </Button>
        )}
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}
