import { TESTIMONIALS } from '@/data/testimonials.js';

/** Static review cards — nothing to operate. */
export default function Testimonials({ items = TESTIMONIALS }) {
  return (
    <div className="ui-grid ui-grid--3">
      {items.map((t) => (
        <article key={t.name} className="ui-card ui-quote">
          <div className="ui-quote__stars" aria-label="5 out of 5 stars">
            ★★★★★
          </div>
          <p>“{t.quote}”</p>
          <footer>
            <div className="ui-quote__avatar">
              {t.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <strong>{t.name}</strong>
              <span>{t.role}</span>
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
}
