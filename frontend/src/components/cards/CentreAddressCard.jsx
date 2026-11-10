import { Link } from 'react-router';
import { CITIES } from '@/data/cities.js';
import { getService } from '@/data/services.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { asset, srcSetFor } from '@/lib/assets.js';

/**
 * Wide address card for a commercial centre: photograph on the left, what the address can be used for
 * — and what each use costs — on the right.
 *
 * Every row comes from the centre's own `services` list, so a centre that does not offer something reads
 * N/A rather than being quietly left out: the reader can see the whole menu and where the gaps are.
 *
 * Only the city hub (/locations/:city) uses this card. The product pages keep `CentreCard`, because there
 * the price shown has to be the price of *that* product, not of the address.
 *
 * Prices here are the rates held in the data, shown in the unit they are held in. Nothing is totalled or
 * annualised: the real total adds a per-city adjustment and GST (backend pricing.engine.js), so any figure
 * worked out here would be wrong. Totals come from previewQuote() in features/pricing/pricingApi.js.
 */

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;
const priceOf = (slug) => getService(slug)?.startingPrice ?? null;

export function rowsFor(centre) {
  const has = (service) => centre.services.includes(service);
  const company = priceOf('company-registration');
  const gst = priceOf('gst-registration');
  return [
    ['ph-file-text', 'Business Registration', has('Company Registration') && company ? inr(company) : null, 'one-time'],
    ['ph-percent', 'GST Registration', has('GST Registration') && gst ? inr(gst) : null, 'one-time'],
    ['ph-envelope-simple', 'Mailing Address', has('Virtual Office') ? inr(centre.vo_price) : null, '/mo'],
    ['ph-laptop', 'Virtual Desk Plan', has('Coworking') ? inr(centre.cw_price) : null, '/day'],
  ];
}

export default function CentreAddressCard({ centre }) {
  // `centre.photo` is not in the data yet; adding one per centre is then a data-only change.
  const image = centre.photo || catalog.cityImages?.[centre.city] || 'assets/vdesk-reception.webp';
  const remote = image.startsWith('http');
  const citySlug = CITIES.find((c) => c.name === centre.city)?.slug;
  const bookable = citySlug && centre.services.includes('Virtual Office');

  return (
    <article className="ui-addr">
      <div className="ui-addr__media">
        <img
          src={remote ? image : asset(image)}
          srcSet={remote ? undefined : srcSetFor(image)}
          sizes="(max-width: 860px) 100vw, 42vw"
          alt={centre.fullName}
          loading="lazy"
        />
        {centre.flagship && (
          <span className="ui-addr__flag">
            <i className="ph-fill ph-star" /> Popular Location
          </span>
        )}
        <div className="ui-addr__place">
          <i className="ph-fill ph-map-pin" />
          <div>
            <strong>{centre.city}</strong>
            <span>A prime business address</span>
          </div>
        </div>
      </div>

      <div className="ui-addr__panel">
        <header className="ui-addr__head">
          <span className="ui-addr__brand">
            V&#8209;DESK <small>Workspace</small>
          </span>
          <span className="ui-addr__city">
            <i className="ph-fill ph-map-pin" /> {centre.city}
          </span>
        </header>

        <h3 className="ui-addr__title">{centre.areaName} Business Address</h3>

        <dl className="ui-addr__rows">
          {rowsFor(centre).map(([icon, label, price, unit]) => (
            <div key={label} className="ui-addr__row">
              <dt>
                <i className={`ph-bold ${icon}`} /> {label}
              </dt>
              <dd className={price ? undefined : 'is-na'}>
                {price ? (
                  <>
                    {price}
                    <small>{unit}</small>
                  </>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="ui-addr__actions">
          <button type="button" className="ui-btn ui-btn--outline" onClick={() => openQuoteModal(`Location: ${centre.fullName}`)}>
            Get Quote <i className="ph-bold ph-arrow-right" />
          </button>
          {bookable ? (
            <Link to={`/locations/${citySlug}/virtual-office`} className="ui-btn ui-btn--gold">
              Book Now <i className="ph-bold ph-arrow-right" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
