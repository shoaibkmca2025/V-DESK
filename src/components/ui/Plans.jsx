import Button from './Button.jsx';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/**
 * Pricing tiers. `plans` = [{ name, description, price, period, note, features: [[text, included]], popular, cta, source, to }].
 * A plan opens the quote dialog, or navigates when `to` is set.
 */
export default function Plans({ plans }) {
  return (
    <div className="ui-plans">
      {plans.map((plan) => (
        <div key={plan.name} className={plan.popular ? 'ui-plan ui-plan--popular' : 'ui-plan'}>
          {plan.popular && <span className="ui-plan__badge">Most popular</span>}
          <div className="ui-plan__head">
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
          </div>
          <div className="ui-plan__price">
            <strong>₹{plan.price.toLocaleString('en-IN')}</strong>
            <span>{plan.period || '/month'}</span>
          </div>
          {plan.note && <p className="ui-plan__note">{plan.note}</p>}
          <ul className="ui-checks">
            {plan.features.map(([text, included = true]) => (
              <li key={text} className={included ? undefined : 'is-off'}>
                <i className={`ph-bold ${included ? 'ph-check-circle' : 'ph-x-circle'}`} /> {text}
              </li>
            ))}
          </ul>
          <Button
            variant={plan.popular ? 'gold' : 'outline'}
            to={plan.to}
            onClick={plan.to ? undefined : () => openQuoteModal(plan.source || plan.name)}
            iconRight="ph-arrow-right"
          >
            {plan.cta || 'Choose plan'}
          </Button>
        </div>
      ))}
    </div>
  );
}
