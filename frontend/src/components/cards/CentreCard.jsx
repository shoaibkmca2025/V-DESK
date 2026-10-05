import { catalog } from '@/features/catalog/catalogStore.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { copyToClipboard } from '@/features/ui/clipboard.js';
import { asset } from '@/lib/assets.js';

/** Commercial centre card — same markup as the location explorer cards on the homepage. */
export default function CentreCard({ centre, priceKey = 'vo_price', unit = '/mo' }) {
  const image = asset(catalog.cityImages[centre.city] || 'assets/vdesk-reception.jpg');
  return (
    <div className="location-card">
      <div className="location-card__img-wrap">
        <img src={image} alt={centre.fullName} loading="lazy" className="location-card__thumb" />
        <span className={`location-card__status location-card__status--${centre.status}`}>{centre.status === 'limited' ? 'Limited' : 'Available'}</span>
        {centre.flagship && <span className="location-card__flagship-badge">★ Flagship</span>}
      </div>
      <div className="location-card__content">
        <div className="location-card__header">
          <div>
            <div className="location-card__city">{centre.city}</div>
            <h4 className="location-card__name">{centre.areaName}</h4>
          </div>
        </div>
        <div className="location-card__address">{centre.address}</div>
        <div className="location-card__services">
          {centre.services.map((s) => (
            <span key={s} className="location-card__service-tag">
              {s}
            </span>
          ))}
        </div>
        <div className="location-card__footer">
          <div className="location-card__price-wrap">
            <span className="location-price-lbl">Starting from</span>
            <span className="location-card__price">
              ₹{centre[priceKey].toLocaleString('en-IN')}
              <small>{unit}</small>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button className="btn btn--ghost btn--sm" title="Copy Address" onClick={() => copyToClipboard(centre.address, 'Address copied to clipboard!')}>
              <i className="ph-bold ph-copy" />
            </button>
            <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal(`Location: ${centre.fullName}`)}>
              Get Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
