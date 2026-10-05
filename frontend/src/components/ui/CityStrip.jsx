import { Link } from 'react-router';
import CityIcon from './cityIcons.jsx';
import { CITIES } from '@/data/cities.js';
import { asset } from '@/lib/assets.js';

/**
 * Quick city picker: round landmark badges over a photo band, ending in "View all".
 * Scrolls sideways on small screens.
 */
export default function CityStrip({ image = 'assets/vdesk-coworking.jpg', limit = 8 }) {
  const cities = limit ? CITIES.slice(0, limit) : CITIES;
  return (
    <section className="ui-city-strip" aria-label="Choose a city">
      <img className="ui-city-strip__bg" src={asset(image)} alt="" aria-hidden="true" loading="lazy" />
      <div className="ui-city-strip__scroll">
        <ul className="ui-city-strip__row">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link to={`/locations/${city.slug}`} className="ui-city-pill">
                <span className="ui-city-pill__badge">
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
