import { catalog } from '@/features/catalog/catalogStore.js';
import { asset } from '@/lib/assets.js';
import { action, escapeHtml } from '@/lib/html.js';

/* Location explorer grid (#locationsContainer) with search and city filters. */

export function renderLocations(locations) {
  const container = document.getElementById('locationsContainer');
  if (!container) return;

  if (locations.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3.5rem 1.5rem;background:var(--vd-bg-secondary, #FAF8F3);border-radius:12px;border:1px dashed var(--vd-border-soft, #E8E2D8);">
        <div style="font-size:2.2rem;margin-bottom:0.75rem;">📍</div>
        <h4 style="color:var(--vd-navy-deep, #0B1B33);margin-bottom:0.35rem;font-size:1.1rem;">No locations found matching your search</h4>
        <p style="color:var(--vd-text-muted, #687386);font-size:0.875rem;margin-bottom:1.25rem;">Try searching for a different city, neighborhood, or service.</p>
        <button class="btn btn--secondary btn--sm" ${action('clearLocationSearch')}>Show All Locations</button>
      </div>`;
    return;
  }

  container.innerHTML = locations
    .map((loc) => {
      const cityImg = asset(catalog.cityImages[loc.city] || 'assets/vdesk-reception.jpg');
      return `
    <div class="location-card">
      <div class="location-card__img-wrap">
        <img src="${escapeHtml(cityImg)}" alt="${escapeHtml(loc.fullName)}" loading="lazy" class="location-card__thumb">
        <span class="location-card__status location-card__status--${escapeHtml(loc.status)}">${loc.status === 'limited' ? 'Limited' : 'Available'}</span>
        ${loc.flagship ? '<span class="location-card__flagship-badge">★ Flagship</span>' : ''}
      </div>
      <div class="location-card__content">
        <div class="location-card__header">
          <div>
            <div class="location-card__city">${escapeHtml(loc.city)}</div>
            <h4 class="location-card__name">${escapeHtml(loc.areaName)}</h4>
          </div>
        </div>
        <div class="location-card__address">${escapeHtml(loc.address)}</div>
        <div class="location-card__services">
          ${loc.services.map((s) => `<span class="location-card__service-tag">${escapeHtml(s)}</span>`).join('')}
        </div>
        <div class="location-card__footer">
          <div class="location-card__price-wrap">
            <span class="location-price-lbl">Starting from</span>
            <span class="location-card__price">₹${loc.vo_price.toLocaleString('en-IN')}<small>/mo</small></span>
          </div>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <button class="btn btn--ghost btn--sm" title="Copy Address" ${action('copyToClipboard', loc.address, 'Address copied to clipboard!')}>
              <i class="ph-bold ph-copy"></i>
            </button>
            <button class="btn btn--primary btn--sm" ${action('openQuoteModal', `Location: ${loc.fullName}`)}>Get Quote</button>
          </div>
        </div>
      </div>
    </div>
  `;
    })
    .join('');
}

export function handleLocationSearch(query) {
  const clearBtn = document.getElementById('clearSearchBtn');
  clearBtn.style.display = query ? 'block' : 'none';

  document.querySelectorAll('.locations__filter-btn').forEach((b) => b.classList.remove('active'));
  document.querySelector('.locations__filter-btn').classList.add('active');

  if (!query.trim()) {
    renderLocations(catalog.locations);
    return;
  }

  const q = query.toLowerCase();
  renderLocations(
    catalog.locations.filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.areaName.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.services.some((s) => s.toLowerCase().includes(q)),
    ),
  );
}

export function clearLocationSearch() {
  const input = document.getElementById('citySearchInput');
  if (input) input.value = '';
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = 'none';
  renderLocations(catalog.locations);
}

export function filterLocationsByCity(city, btn) {
  document.querySelectorAll('.locations__filter-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.city === city || (city === 'all' && b.dataset.city === 'all'));
  });
  if (btn) btn.classList.add('active');

  const input = document.getElementById('citySearchInput');
  if (input) input.value = '';
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  if (!city || city === 'all') {
    renderLocations(catalog.locations);
  } else {
    const q = city.toLowerCase().trim();
    renderLocations(
      catalog.locations.filter((l) => l.city.toLowerCase() === q || l.city.toLowerCase().includes(q) || q.includes(l.city.toLowerCase())),
    );
  }
}

/** City quick-hopper on /locations: scrolls to a metro card and highlights it briefly. */
export function jumpToMetro(cardId) {
  const el = document.getElementById(cardId);
  if (!el) return;
  const card = el.closest('.metro-hub-card') || el;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.style.transition = 'box-shadow 0.4s ease, transform 0.4s ease';
  card.style.boxShadow = '0 0 0 3px #C59239, 0 16px 36px rgba(197, 146, 57, 0.3)';
  card.style.transform = 'translateY(-4px)';
  setTimeout(() => {
    card.style.boxShadow = '';
    card.style.transform = '';
  }, 2000);
}
