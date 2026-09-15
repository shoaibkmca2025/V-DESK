import { catalog } from '@/features/catalog/catalogStore.js';
import { asset } from '@/lib/assets.js';
import { action, escapeHtml } from '@/lib/html.js';

/* Workspace discovery engine (#discoveryResultsContainer) filtered by city, type, team size and duration. */

export function filterDiscoveryEngine() {
  const container = document.getElementById('discoveryResultsContainer');
  if (!container) return;

  const cityVal = document.getElementById('discCity')?.value || 'all';
  const typeVal = document.getElementById('discType')?.value || 'all';
  const teamVal = document.getElementById('discTeam')?.value || 'all';
  const durationVal = document.getElementById('discDuration')?.value || 'all';

  const filtered = catalog.discoverySpaces.filter((w) => {
    if (cityVal !== 'all' && w.city !== cityVal) return false;
    if (typeVal !== 'all' && w.type !== typeVal) return false;
    if (teamVal !== 'all' && w.capacityCategory !== 'all' && !w.capacityCategory.includes(teamVal)) return false;
    if (durationVal !== 'all' && !w.durationMatch.includes(durationVal)) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="discovery-empty-state">
        <div class="empty-icon"><i class="ph-bold ph-buildings"></i></div>
        <h4>No workspaces match these specific criteria</h4>
        <p>Try broadening your filters or speak directly with our infrastructure consultant for custom team requirements.</p>
        <button class="btn btn--primary btn--sm" ${action('resetDiscoveryFilters')}>Reset Filters</button>
      </div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (item) => `
    <div class="discovery-card">
      <div class="discovery-card__media">
        <img src="${escapeHtml(asset(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="discovery-card__status ${item.status === 'Limited' ? 'status--limited' : 'status--avail'}">
          <span class="status-dot"></span> ${escapeHtml(item.status)}
        </span>
        <span class="discovery-card__type-tag">${escapeHtml(item.type)}</span>
      </div>
      <div class="discovery-card__body">
        <div class="discovery-card__location">
          <i class="ph-bold ph-map-pin"></i> <strong>${escapeHtml(item.city)}</strong> &bull; <span>${escapeHtml(item.area)}</span>
        </div>
        <h4 class="discovery-card__title">${escapeHtml(item.title)}</h4>
        <div class="discovery-card__capacity">
          <i class="ph-bold ph-users"></i> Capacity: <strong>${escapeHtml(item.capacity)}</strong>
        </div>
        <div class="discovery-card__amenities">
          ${item.amenities.map((a) => `<span class="amenity-pill"><i class="ph-bold ph-check"></i> ${escapeHtml(a)}</span>`).join('')}
        </div>
      </div>
      <div class="discovery-card__footer">
        <div class="discovery-card__price-wrap">
          <span class="price-from">Starting at</span>
          <span class="price-amount">${escapeHtml(item.price)}<small>${escapeHtml(item.priceUnit)}</small></span>
        </div>
        <button class="btn btn--primary btn--sm" ${action('openQuoteModal', `Discovery: ${item.quoteLabel}`)}>
          Get Quote <i class="ph-bold ph-arrow-right"></i>
        </button>
      </div>
    </div>
  `,
    )
    .join('');
}

export function resetDiscoveryFilters() {
  for (const id of ['discCity', 'discType', 'discTeam', 'discDuration']) {
    const select = document.getElementById(id);
    if (select) select.value = 'all';
  }
  filterDiscoveryEngine();
}
