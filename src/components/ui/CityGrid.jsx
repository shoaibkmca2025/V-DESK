import { Link } from 'react-router';
import { CITIES, cityCentres, cityImage, cityStartingPrice, getCityProduct } from '@/data/cities.js';
import { asset } from '@/lib/assets.js';

/** City cards linking to each city hub. `limit` trims the list; `productSlug` picks which starting price is shown. */
export default function CityGrid({ limit, productSlug = 'virtual-office' }) {
  const product = getCityProduct(productSlug);
  const cities = limit ? CITIES.slice(0, limit) : CITIES;
  return (
    <div className={cities.length % 4 !== 0 && cities.length % 3 === 0 ? 'ui-cities ui-cities--3' : 'ui-cities'}>
      {cities.map((city) => {
        const price = cityStartingPrice(city, product);
        const centres = cityCentres(city).length;
        const img = cityImage(city);
        return (
          <Link key={city.slug} to={`/locations/${city.slug}`} className="ui-city">
            <img src={img.startsWith('http') ? img : asset(img)} alt={`${city.name} workspace`} loading="lazy" />
            {city.tier === 'Tier-1' && <span className="ui-city__flag">Tier-1</span>}
            <div className="ui-city__body">
              <strong>{city.name}</strong>
              <span>
                {centres ? `${centres} centre${centres > 1 ? 's' : ''}` : city.state}
                {price ? (
                  <>
                    {' • from '}
                    <em>₹{price.toLocaleString('en-IN')}</em>
                    {product.unit}
                  </>
                ) : null}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
