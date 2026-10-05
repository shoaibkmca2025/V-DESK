/**
 * Subpage hero in the simple-UI style: white surface, one headline, one supporting line.
 * `aside` renders in the right column (lead card, summary card, …); omit it for a centred hero.
 */
export default function PageHero({ id, badge, badgeIcon = 'ph-seal-check', title, highlight, description, stats, trust, actions, aside }) {
  const heading = (
    <h1 className="ui-hero__title">
      {title}
      {highlight && (
        <>
          {' '}
          <em>{highlight}</em>
        </>
      )}
    </h1>
  );

  const body = (
    <>
      {badge && (
        <span className="ui-hero__badge">
          <i className={`ph-bold ${badgeIcon}`} /> {badge}
        </span>
      )}
      {heading}
      {description && <p className="ui-hero__desc">{description}</p>}
      {actions && <div className="ui-actions ui-page-hero__actions">{actions}</div>}
      {trust && (
        <div className="ui-hero__trust">
          {trust.map((item) => (
            <span key={item}>
              <i className="ph-bold ph-check-circle" /> {item}
            </span>
          ))}
        </div>
      )}
      {stats && (
        <div className="ui-page-hero__stats">
          {stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (!aside) {
    return (
      <section className="ui-page-hero ui-page-hero--center" id={id}>
        <div className="ui-container">
          <div className="ui-hero__inner">{body}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="ui-split-hero ui-page-hero" id={id}>
      <div className="ui-container">
        <div className="ui-split-hero__grid">
          <div className="ui-split-hero__col">{body}</div>
          <div className="ui-split-hero__aside">{aside}</div>
        </div>
      </div>
    </section>
  );
}
