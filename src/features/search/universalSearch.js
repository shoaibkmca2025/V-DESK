import { parseSearchIntent } from './parseSearchIntent.js';
import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { closeModal } from '@/features/modals/modalManager.js';
import { scrollToSection } from '@/features/ui/scroll.js';
import { asset } from '@/lib/assets.js';
import { action, escapeHtml } from '@/lib/html.js';

/* Universal search (PRD §9–16): intent parsing + faceted results explorer (#universalSearchResultsModal). */

const DEFAULT_MAX_PRICE = 15000;

function createExplorerFilters() {
  return {
    city: 'all',
    type: 'all',
    capacity: 'all',
    maxPrice: DEFAULT_MAX_PRICE,
    sort: 'recommended',
    amenities: { gst: true, wifi: false, parking: false, meeting: false, access247: false },
  };
}

let activeExplorerFilters = createExplorerFilters();

export function resetSearchState() {
  activeExplorerFilters = createExplorerFilters();
}

export function quickChipSearch(term) {
  trackSearchEvent('search_suggestion_selected', { term });
  executeSearchQuery(term);
}

export function executeSearchQuery(query) {
  trackSearchEvent('search_submitted', { query });
  openUniversalSearchResults(query, parseSearchIntent(query));
}

function capacityBucket(capacity) {
  if (capacity <= 1) return '1';
  if (capacity <= 5) return '2-5';
  if (capacity <= 10) return '6-10';
  if (capacity <= 25) return '11-25';
  return '25+';
}

export function openUniversalSearchResults(query, parsed) {
  const modal = document.getElementById('universalSearchResultsModal');
  const title = document.getElementById('searchResultsModalTitle');
  const intentParsed = document.getElementById('explorerIntentParsed');
  const citySelect = document.getElementById('filterCity');
  const typeSelect = document.getElementById('filterType');

  if (!modal) return;

  if (title) title.textContent = `Search Results for "${query}"`;
  if (intentParsed) intentParsed.textContent = parsed ? parsed.summary : query;

  // Auto-apply filters based on the parsed intent
  if (parsed) {
    if (parsed.location && citySelect) {
      citySelect.value = parsed.location;
      activeExplorerFilters.city = parsed.location;
    } else if (citySelect) {
      citySelect.value = 'all';
      activeExplorerFilters.city = 'all';
    }

    if (parsed.intent && parsed.intent !== 'General Discovery' && typeSelect) {
      typeSelect.value = parsed.intent;
      activeExplorerFilters.type = parsed.intent;
    } else if (typeSelect) {
      typeSelect.value = 'all';
      activeExplorerFilters.type = 'all';
    }

    if (parsed.capacity) activeExplorerFilters.capacity = capacityBucket(parsed.capacity);
  }

  renderExplorerResults();
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

export function filterExplorerResults() {
  const citySelect = document.getElementById('filterCity');
  const typeSelect = document.getElementById('filterType');
  const sortSelect = document.getElementById('filterSort');

  if (citySelect) activeExplorerFilters.city = citySelect.value;
  if (typeSelect) activeExplorerFilters.type = typeSelect.value;
  if (sortSelect) activeExplorerFilters.sort = sortSelect.value;

  trackSearchEvent('search_filter_used', activeExplorerFilters);
  renderExplorerResults();
}

export function setExplorerCapacity(btn, cap) {
  activeExplorerFilters.capacity = cap;
  document.querySelectorAll('.filter-capacity-pills .cap-pill').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterExplorerResults();
}

export function updateExplorerPriceFilter(val) {
  activeExplorerFilters.maxPrice = parseInt(val, 10);
  const display = document.getElementById('filterPriceDisplay');
  if (display) display.textContent = `₹${parseInt(val, 10).toLocaleString('en-IN')}`;
  filterExplorerResults();
}

export function resetExplorerFilters() {
  activeExplorerFilters = createExplorerFilters();

  const citySelect = document.getElementById('filterCity');
  const typeSelect = document.getElementById('filterType');
  const sortSelect = document.getElementById('filterSort');
  const priceRange = document.getElementById('filterPriceRange');
  const priceDisplay = document.getElementById('filterPriceDisplay');

  if (citySelect) citySelect.value = 'all';
  if (typeSelect) typeSelect.value = 'all';
  if (sortSelect) sortSelect.value = 'recommended';
  if (priceRange) priceRange.value = DEFAULT_MAX_PRICE;
  if (priceDisplay) priceDisplay.textContent = '₹15,000';

  document.querySelectorAll('.filter-capacity-pills .cap-pill').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  renderExplorerResults();
}

/** Virtual office centres + marketplace workspaces as one searchable inventory. */
function searchableInventory() {
  const centres = catalog.locations.map((loc) => ({
    id: loc.id,
    name: loc.fullName,
    type: 'Virtual Office',
    city: loc.city,
    locality: loc.areaName,
    address: loc.address,
    capacity: 10,
    priceMonth: loc.vo_price,
    status: loc.status,
    rating: 4.9,
    reviews: 160 + (loc.vo_price % 70),
  }));

  const workspaces = catalog.workspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    type: ws.type,
    city: ws.city,
    locality: ws.locality,
    address: ws.address,
    capacity: ws.capacity,
    priceMonth: ws.priceMonth,
    status: ws.status,
    rating: ws.rating,
    reviews: ws.reviews,
  }));

  return [...centres, ...workspaces];
}

function matchesCapacity(capacityFilter, capacity) {
  switch (capacityFilter) {
    case '1':
      return capacity === 1;
    case '2-5':
      return capacity >= 2 && capacity <= 5;
    case '6-10':
      return capacity >= 6 && capacity <= 10;
    case '11-25':
      return capacity >= 11 && capacity <= 25;
    case '25+':
      return capacity >= 25;
    default:
      return true;
  }
}

export function renderExplorerResults() {
  const grid = document.getElementById('explorerResultsGrid');
  const zeroCard = document.getElementById('zeroResultsCard');
  const countEl = document.getElementById('explorerResultCount');
  if (!grid) return;

  const filters = activeExplorerFilters;
  const filtered = searchableInventory().filter((item) => {
    if (filters.city !== 'all' && item.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.type !== 'all' && item.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    if (!matchesCapacity(filters.capacity, item.capacity)) return false;
    return item.priceMonth <= filters.maxPrice;
  });

  if (filters.sort === 'price-asc') filtered.sort((a, b) => a.priceMonth - b.priceMonth);
  else if (filters.sort === 'price-desc') filtered.sort((a, b) => b.priceMonth - a.priceMonth);
  else if (filters.sort === 'capacity') filtered.sort((a, b) => b.capacity - a.capacity);

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} Available Location${filtered.length === 1 ? '' : 's'}`;
  }

  // Zero-result experience (PRD §16)
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (zeroCard) zeroCard.style.display = 'block';
    trackSearchEvent('search_no_results', filters);
    return;
  }

  if (zeroCard) zeroCard.style.display = 'none';

  grid.innerHTML = filtered
    .map((item) => {
      const bgImage = asset(
        item.type === 'Meeting Rooms' ? 'assets/vdesk-boardroom.jpg' : item.type === 'Coworking' ? 'assets/vdesk-coworking.jpg' : 'assets/vdesk-reception.jpg',
      );

      return `
      <div class="explorer-card">
        <div class="explorer-card__image" style="background-image: linear-gradient(180deg, rgba(5,19,43,0.2) 0%, rgba(5,19,43,0.7) 100%), url('${bgImage}');">
          <span class="badge ${item.status === 'available' ? 'badge--success' : 'badge--warning'}">
            ${item.status === 'available' ? '● Verified Available' : '● High Demand'}
          </span>
          <span style="font-size: 0.75rem; color: #fff; background: rgba(0,0,0,0.6); padding: 2px 8px; border-radius: 4px;">
            ★ ${item.rating} (${item.reviews})
          </span>
        </div>
        <div class="explorer-card__body">
          <div class="explorer-card__city">${escapeHtml(item.city)} &bull; ${escapeHtml(item.locality)}</div>
          <h4 class="explorer-card__title">${escapeHtml(item.name)}</h4>
          <p class="explorer-card__address">${escapeHtml(item.address)}</p>
          <div class="explorer-card__tags">
            <span class="explorer-tag"><i class="ph-bold ph-shield-check"></i> GST / MCA Ready</span>
            <span class="explorer-tag"><i class="ph-bold ph-users"></i> Up to ${item.capacity} Pax</span>
            <span class="explorer-tag"><i class="ph-bold ph-lightning"></i> 24h SLA</span>
          </div>
          <div class="explorer-card__footer">
            <div class="explorer-card__price">
              <strong>₹${item.priceMonth.toLocaleString('en-IN')}</strong><small>/month</small>
            </div>
            <button class="btn btn--primary btn--sm" ${action('handleExplorerCardAction', item.id, item.type)}>
              ${item.type === 'Meeting Rooms' ? 'Book Room' : 'Configure Setup'} &rarr;
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

export function handleExplorerCardAction(itemId, type) {
  closeModal('universalSearchResultsModal');
  if (type === 'Meeting Rooms') openMeetingBookingModal();
  else scrollToSection('#voConfigurator');
}
