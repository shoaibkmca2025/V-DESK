import LeadCard from '@/components/page/LeadCard.jsx';

/** Product-page hero: message + price + actions on the left, lead form (or a custom aside) on the right. */
export default function SplitHero({ badge, title, description, price, priceNote = 'per month', trust = [], actions, aside, lead }) {
  return (
    <section className="ui-split-hero" id="top">
      <div className="ui-container">
        <div className="ui-split-hero__grid">
          <div className="ui-split-hero__col">
            {badge && (
              <span className="ui-hero__badge">
                <i className="ph-bold ph-seal-check" /> {badge}
              </span>
            )}
            <h1 className="ui-hero__title">{title}</h1>
            <p className="ui-hero__desc">{description}</p>
            {price && (
              <div className="ui-split-hero__price">
                Starting at <strong>₹{price.toLocaleString('en-IN')}</strong> {priceNote}
              </div>
            )}
            {actions && <div className="ui-actions">{actions}</div>}
            {trust.length > 0 && (
              <div className="ui-hero__trust">
                {trust.map((item) => (
                  <span key={item}>
                    <i className="ph-bold ph-check-circle" /> {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="ui-split-hero__aside">{aside || (lead && <LeadCard {...lead} />)}</div>
        </div>
      </div>
    </section>
  );
}
