import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import CentreAddressCard from '@/components/cards/CentreAddressCard.jsx';

/**
 * "Our Locations & Plans" — a city's centres with what each address costs.
 *
 * The zone tabs only appear where a city has zones to choose between, so a city with one zone (or none)
 * shows the cards straight away rather than a tab bar with a single tab in it.
 */

const TRUST = [
  ['ph-shield-check', 'Trusted & Reliable', 'Your business, our priority'],
  ['ph-headset', 'Dedicated Support', 'Always here to help'],
  ['ph-map-pin-line', 'Prime Locations', 'Across the city'],
  ['ph-calendar-check', 'Flexible Plans', 'For every business'],
];

export default function LocationsPlans({ city, centres }) {
  const zones = useMemo(() => [...new Set(centres.map((c) => c.zone).filter(Boolean))], [centres]);
  const [zone, setZone] = useState('all');

  const shown = zone === 'all' ? centres : centres.filter((c) => c.zone === zone);

  return (
    <section className="ui-locplans" id="centres">
      <div className="ui-container">
        <header className="ui-locplans__head">
          <h2>
            Our <em>Locations</em> &amp; Plans
          </h2>
          <p>Premium business addresses at prime locations in {city}</p>
        </header>

        {zones.length > 1 && (
          <div className="ui-locplans__tabs" role="tablist" aria-label={`Areas in ${city}`}>
            <button
              type="button"
              role="tab"
              aria-selected={zone === 'all'}
              className={zone === 'all' ? 'is-on' : undefined}
              onClick={() => setZone('all')}
            >
              All Locations
            </button>
            {zones.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={zone === name}
                className={zone === name ? 'is-on' : undefined}
                onClick={() => setZone(name)}
              >
                <i className="ph-fill ph-map-pin" /> {name}
              </button>
            ))}
          </div>
        )}

        <div className="ui-locplans__grid">
          {shown.map((centre) => (
            <CentreAddressCard key={centre.id} centre={centre} />
          ))}
        </div>

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
      </div>
    </section>
  );
}
