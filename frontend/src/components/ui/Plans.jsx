import { useState } from 'react';
import Button from './Button.jsx';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/**
 * Pricing tiers. `plans` = [{ name, icon, description, price, period, note, billedAnnually,
 * features: [[text, included]], popular, cta, source, to }].
 *
 * Long feature lists collapse to the first few with a "Show more" toggle, so three plans of different
 * lengths still line up and the price sits at the same height in each card. The price block is pushed to
 * the bottom for the same reason: it is what people compare, so it should not move between cards.
 */

const COLLAPSED = 4;

function Plan({ plan }) {
  const [open, setOpen] = useState(false);
  const canCollapse = plan.features.length > COLLAPSED;
  const shown = canCollapse && !open ? plan.features.slice(0, COLLAPSED) : plan.features;

  return (
    <div className={plan.popular ? 'ui-plan ui-plan--popular' : 'ui-plan'}>
      <div className="ui-plan__top">
        {plan.icon && (
          <span className="ui-plan__icon">
            <i className={`ph-bold ${plan.icon}`} />
          </span>
        )}
        {plan.billedAnnually && <span className="ui-plan__billed">*Billed annually</span>}
        {!plan.billedAnnually && plan.popular && <span className="ui-plan__billed">Most popular</span>}
      </div>

      <h3 className="ui-plan__name">{plan.name}</h3>
      {plan.description && <p className="ui-plan__desc">{plan.description}</p>}

      <ul className="ui-plan__features">
        {shown.map(([text, included = true]) => (
          <li key={text} className={included ? undefined : 'is-off'}>
            <i className={`ph-bold ${included ? 'ph-check-circle' : 'ph-x-circle'}`} />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {canCollapse && (
        <button type="button" className="ui-plan__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Show less' : `Show ${plan.features.length - COLLAPSED} more`}
        </button>
      )}

      <div className="ui-plan__foot">
        <p className="ui-plan__price">
          <small>Starts at</small>
          <strong>₹{plan.price.toLocaleString('en-IN')}</strong>
          <span>{plan.period || 'per month'}</span>
        </p>
        {plan.note && <p className="ui-plan__note">{plan.note}</p>}
        <Button
          variant={plan.popular ? 'gold' : 'outline'}
          block
          to={plan.to}
          onClick={plan.to ? undefined : () => openQuoteModal(plan.source || plan.name)}
          iconRight="ph-arrow-right"
        >
          {plan.cta || 'Request a callback'}
        </Button>
      </div>
    </div>
  );
}

export default function Plans({ plans }) {
  return (
    <div className="ui-plans">
      {plans.map((plan) => (
        <Plan key={plan.name} plan={plan} />
      ))}
    </div>
  );
}
