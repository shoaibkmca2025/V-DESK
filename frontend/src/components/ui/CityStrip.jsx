import { Link } from 'react-router';
import CityIcon, { colourFor } from './cityIcons.jsx';
import { CITIES } from '@/data/cities.js';
import { asset, srcSetFor } from '@/lib/assets.js';

/**
 * Quick city picker: a round landmark badge per city over a photo band, ending in "View all". Each badge
 * carries its own colour (cityIcons.jsx) so the row reads as eight places at a glance.
 * Scrolls sideways on small screens.
 */
export default function CityStrip({ image = 'assets/vdesk-coworking.webp', limit = 8 }) {
  const cities = limit ? CITIES.slice(0, limit) : CITIES;
  return (
    <section className="ui-city-strip" aria-label="Choose a city">
      <img
        className="ui-city-strip__bg"
        src={asset(image)}
        srcSet={srcSetFor(image)}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div className="ui-city-strip__scroll">
        <ul className="ui-city-strip__row">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link to={`/locations/${city.slug}`} className="ui-city-pill">
                <span
                  className="ui-city-pill__badge"
                  style={{ '--city-from': colourFor(city.slug)[0], '--city-to': colourFor(city.slug)[1] }}
                >
                  <CityIcon slug={city.slug} />
                </span>
                <span className="ui-city-pill__label">{city.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link to="/locations" className="ui-city-pill ui-city-pill--all">
              <span className="ui-city-pill__badge">
                <i className="ph-bold ph-arrow-right" />
              </span>
              <span className="ui-city-pill__label">View all</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
