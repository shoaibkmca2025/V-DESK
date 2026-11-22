import { useMemo, useState } from 'react';
import CentreAddressCard from '@/components/cards/CentreAddressCard.jsx';
import LocationsTrust from '@/components/page/LocationsTrust.jsx';

/**
 * "Our Locations & Plans" — a city's centres with what each address costs.
 *
 * The zone tabs only appear where a city has zones to choose between, so a city with one zone (or none)
 * shows the cards straight away rather than a tab bar with a single tab in it.
 */


export default function LocationsPlans({ city, subtitle, centres, limit, footer = true }) {
  // A city with zones tabs by zone; a nationwide list tabs by city. Same control, same component.
  const groupOf = (c) => c.zone ?? c.city;
  const zones = useMemo(() => [...new Set(centres.map(groupOf))], [centres]);
  const [zone, setZone] = useState('all');

  const matching = zone === 'all' ? centres : centres.filter((c) => groupOf(c) === zone);
  const shown = limit ? matching.slice(0, limit) : matching;

  return (
    <section className="ui-locplans" id="centres">
      <div className="ui-container">
        <header className="ui-locplans__head">
          <h2>
            Our <em>Locations</em> &amp; Plans
          </h2>
          <p>{subtitle ?? `Premium business addresses at prime locations in ${city}`}</p>
        </header>

        {/* A trimmed showcase has nothing useful to filter — tabs only earn their place on the full list. */}
        {!limit && zones.length > 1 && (
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

        {footer && <LocationsTrust />}
      </div>
    </section>
  );
}
