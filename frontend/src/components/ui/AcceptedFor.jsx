const DEFAULT_ITEMS = [
  ['ph-receipt', 'GST registration'],
  ['ph-certificate', 'Company incorporation (MCA)'],
  ['ph-bank', 'Bank current account'],
  ['ph-shopping-cart', 'Marketplace seller APOB'],
];

/** Row stating what the address is accepted for — the first question buyers ask. */
export default function AcceptedFor({ label = 'Accepted for', items = DEFAULT_ITEMS }) {
  return (
    <div className="ui-accepted">
      <span className="ui-accepted__label">{label}</span>
      {items.map(([icon, text]) => (
        <span key={text} className="ui-accepted__item">
          <i className={`ph-bold ${icon}`} /> {text}
        </span>
      ))}
    </div>
  );
}
