import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Button from './Button.jsx';
import { routeForQuery } from '@/features/search/searchEngine.js';
import { trackSearchEvent } from '@/features/analytics/telemetry.js';

/**
 * Centered hero with one search box (the PRD's universal search), quick-pick chips,
 * a trust row and a faded image carrying a stats card — one message, one action.
 */
export default function SearchHero({ badge, title, description, placeholder, chips = [], trust = [], image, stats = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function submit(event) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    trackSearchEvent('hero_search', { query: q });
    navigate(routeForQuery(q) || `/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <section className="ui-hero" id="top">
      <div className="ui-container">
        <div className="ui-hero__inner">
          {badge && (
            <span className="ui-hero__badge">
              <i className="ph-bold ph-seal-check" /> {badge}
            </span>
          )}
          <h1 className="ui-hero__title">{title}</h1>
          <p className="ui-hero__desc">{description}</p>
          <form className="ui-search" onSubmit={submit} role="search">
            <i className="ph-bold ph-magnifying-glass" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              aria-label="Search workspaces and services"
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
          {chips.length > 0 && (
            <div className="ui-chips">
              {chips.map((chip) => (
                <Link key={chip.label} to={chip.to} className="ui-chip">
                  <i className={`ph-bold ${chip.icon}`} /> {chip.label}
                </Link>
              ))}
            </div>
          )}
          {trust.length > 0 && (
            <div className="ui-hero__trust">
              {trust.map((item) => (
                <span key={item}>
                  <i className="ph-bold ph-check-circle" /> {item}
                </span>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="ui-hero__media">
            <img src={image} alt="" loading="eager" />
            {stats.length > 0 && (
              <div className="ui-hero__stats">
                {stats.map(([value, label]) => (
                  <div key={label} className="ui-hero__stat">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
