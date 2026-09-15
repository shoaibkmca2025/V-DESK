import { toggleVoFaq } from '@/features/faq/faq.js';

/** Accordion using the virtual-office FAQ styles. `items` = [[question, answer], …]. */
export default function FaqAccordion({ items, openFirst = true }) {
  return (
    <div className="vo-faq-accordion">
      {items.map(([question, answer], index) => (
        <div key={question} className={openFirst && index === 0 ? 'vo-faq-item active' : 'vo-faq-item'}>
          <button
            type="button"
            className="vo-faq-trigger"
            aria-expanded={openFirst && index === 0 ? 'true' : 'false'}
            onClick={(event) => toggleVoFaq(event.currentTarget)}
          >
            <span>{question}</span>
            <i className="ph-bold ph-caret-down vo-faq-icon" />
          </button>
          <div className="vo-faq-body">
            <p>{answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
