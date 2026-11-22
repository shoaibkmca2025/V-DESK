import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import LocationsTrust from '@/components/page/LocationsTrust.jsx';
import { rowsFor } from '@/components/cards/CentreAddressCard.jsx';
import { CITIES } from '@/data/cities.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { asset, srcSetFor } from '@/lib/assets.js';

/**
 * The landing-page locations layout: one centre shown large with its plans beside it, then the rest of
 * the area as a strip to explore. The city pages use the four-up grid instead (LocationsPlans) — there
 * the job is comparing centres, here it is showing one well and letting people wander.
 *
 * Picking a tab or another location swaps the featured centre; nothing navigates away.
 */

const photoOf = (centre) => centre.photo || catalog.cityImages?.[centre.city] || 'assets/vdesk-reception.webp';

function Photo({ centre, className }) {
  const image = photoOf(centre);
  const remote = image.startsWith('http');
  return (
    <img
      className={className}
      src={remote ? image : asset(image)}
      srcSet={remote ? undefined : srcSetFor(image)}
      sizes="(max-width: 900px) 100vw, 50vw"
      alt={centre.fullName}
      loading="lazy"
    />
  );
}

export default function LocationsFeature({ city, subtitle, centres }) {
  const groupOf = (c) => c.zone ?? c.city;
  const groups = useMemo(() => [...new Set(centres.map(groupOf))], [centres]);
  const [group, setGroup] = useState(groups[0]);
  const [pickedId, setPickedId] = useState(null);

  const inGroup = centres.filter((c) => groupOf(c) === group);
  const featured = inGroup.find((c) => c.id === pickedId) ?? inGroup[0];
  // Drawn from the whole city, not just the open tab — a zone with one centre would otherwise show nothing.
  const others = centres.filter((c) => c.id !== featured?.id).slice(0, 3);

  if (!featured) return null;

  const citySlug = CITIES.find((c) => c.name === featured.city)?.slug;

  return (
    <section className="ui-locfeat" id="locations">
      <div className="ui-container">
        <header className="ui-locplans__head">
          <h2>
            Our <em>Locations</em> &amp; Plans
          </h2>
          <p>{subtitle ?? `Premium business addresses at prime locations in ${city}`}</p>
        </header>

        {groups.length > 1 && (
          <div className="ui-locplans__tabs" role="tablist" aria-label={`Areas in ${city}`}>
            {groups.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={group === name}
                className={group === name ? 'is-on' : undefined}
                onClick={() => {
                  setGroup(name);
                  setPickedId(null);
                }}
              >
                <i className="ph-fill ph-map-pin" /> {name}
              </button>
            ))}
          </div>
        )}

        <div className="ui-locfeat__main">
          <figure className="ui-locfeat__photo">
            <Photo centre={featured} />
            <span className="ui-locfeat__pin">
              <i className="ph-fill ph-map-pin" /> {groupOf(featured)}
            </span>
            <figcaption>
              <strong>{featured.areaName}</strong>
              <span>{featured.tagline ?? `A prime business address in ${featured.city}`}</span>
            </figcaption>
          </figure>

          <div className="ui-locfeat__plans">
            <h3>Available plans at {groupOf(featured)}</h3>
            <div className="ui-locfeat__tiles">
              {rowsFor(featured).map(([icon, label, price, unit], i) => (
                <div key={label} className="ui-locfeat__tile">
                  <span className="ui-locfeat__tileIcon">
                    <i className={`ph-bold ${icon}`} />
                  </span>
                  <p className="ui-locfeat__tileName">{label}</p>
                  <p className="ui-locfeat__tilePrice">
                    {price ? (
                      <>
                        {price}
                        <small>{unit}</small>
                      </>
                    ) : (
                      <span className="is-na">Not at this centre</span>
                    )}
                  </p>
                  {i === rowsFor(featured).length - 1 && citySlug ? (
                    <Link to={`/locations/${citySlug}/virtual-office`} className="ui-btn ui-btn--gold ui-btn--sm">
                      Book now <i className="ph-bold ph-arrow-right" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="ui-btn ui-btn--outline ui-btn--sm"
                      onClick={() => openQuoteModal(`${featured.fullName} — ${label}`)}
                    >
                      Get quote
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <>
            <h3 className="ui-locfeat__explore">Explore our other locations</h3>
            <div className="ui-locfeat__others">
              {others.map((centre) => (
                <button key={centre.id} type="button" className="ui-locfeat__other" onClick={() => setPickedId(centre.id)}>
                  <Photo centre={centre} />
                  <span>
                    <i className="ph-fill ph-map-pin" /> {centre.areaName}
                  </span>
                  <i className="ph-bold ph-caret-right" />
                </button>
              ))}
              <div className="ui-locfeat__more">
                <i className="ph-bold ph-map-trifold" />
                <p>
                  More locations
                  <span>across {city}</span>
                </p>
                <Link to="/locations" className="ui-btn ui-btn--outline ui-btn--sm">
                  View all locations
                </Link>
              </div>
            </div>
          </>
        )}

        <LocationsTrust />
      </div>
    </section>
  );
}
