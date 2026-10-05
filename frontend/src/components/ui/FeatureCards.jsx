/** Icon + title + text cards. `items` = [{ icon, title, text, tone }]. */
export default function FeatureCards({ items, columns = 3 }) {
  return (
    <div className={`ui-grid ui-grid--${columns}`}>
      {items.map((item) => (
        <div key={item.title} className="ui-card">
          <div className={item.tone ? `ui-card__icon ui-card__icon--${item.tone}` : 'ui-card__icon'}>
            <i className={`ph-bold ${item.icon}`} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}
