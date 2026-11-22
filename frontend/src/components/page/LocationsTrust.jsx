import { Link } from 'react-router';

/** The reassurance strip under both locations layouts — shared so the two cannot drift apart. */
const TRUST = [
  ['ph-shield-check', 'Trusted & Reliable', 'Your business, our priority'],
  ['ph-headset', 'Dedicated Support', 'Always here to help'],
  ['ph-map-pin-line', 'Prime Locations', 'Across India'],
  ['ph-calendar-check', 'Flexible Plans', 'For every business'],
];

export default function LocationsTrust() {
  return (
    <div className="ui-locplans__trust">
      <ul>
        {TRUST.map(([icon, title, note]) => (
          <li key={title}>
            <i className={`ph-bold ${icon}`} />
            <div>
              <strong>{title}</strong>
              <span>{note}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="ui-locplans__cta">
        <p>
          Find the perfect plan
          <span>for your business</span>
        </p>
        <Link to="/contact" className="ui-btn ui-btn--gold">
          Contact Us <i className="ph-bold ph-arrow-right" />
        </Link>
      </div>
    </div>
  );
}
