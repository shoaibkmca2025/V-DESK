/** Icon cards; `items` = [[icon, title, text], …]. */
export default function FeatureGrid({ items, columns = 3 }) {
  return (
    <div className={`ui-grid ui-grid--${Math.min(columns, 3)}`}>
      {items.map(([icon, title, text], index) => (
        <div key={title} className="ui-card">
          <div className={index % 3 === 1 ? 'ui-card__icon ui-card__icon--gold' : 'ui-card__icon'}>
            <i className={`ph-bold ${icon}`} />
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
