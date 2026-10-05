import { catalog } from '@/features/catalog/catalogStore.js';
import { asset } from '@/lib/assets.js';
import { action, escapeHtml } from '@/lib/html.js';

/* Workspace marketplace grid (PRD §30–33) on the coworking page. */

const CATEGORY_TYPES = { coworking: 'Coworking', private: 'Private Office', meeting: 'Meeting Rooms' };

let activeCategory = 'all';
let activeCity = 'all';

export function resetMarketplaceState() {
  activeCategory = 'all';
  activeCity = 'all';
}

export function renderMarketplaceGrid() {
  const container = document.getElementById('marketplaceGrid');
  if (!container) return;

  let list = catalog.workspaces;
  if (activeCategory !== 'all' && CATEGORY_TYPES[activeCategory]) {
    list = list.filter((w) => w.type === CATEGORY_TYPES[activeCategory]);
  }
  if (activeCity !== 'all') {
    list = list.filter((w) => w.city.toLowerCase() === activeCity.toLowerCase());
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #FAF8F3; border: 1px dashed #C59239; border-radius: 12px;">
        <i class="ph-bold ph-buildings" style="font-size: 2.5rem; color: #C59239; margin-bottom: 12px; display: block;"></i>
        <h3 style="color: #081D40; margin: 0 0 8px 0;">No Exact Workspaces in this Category</h3>
        <p style="color: #64748B; max-width: 480px; margin: 0 auto 16px auto;">We have over 50 custom Grade-A spaces available on request. Talk to our commercial strategist for off-market inventory.</p>
        <button class="btn btn--primary btn--sm" ${action('openQuoteModal', 'Custom Workspace Search')}>Request Custom Space</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list
    .map(
      (w) => `
    <div class="workspace-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;">
      <div style="position: relative; height: 210px; overflow: hidden;">
        <img src="${escapeHtml(asset(w.image))}" alt="${escapeHtml(w.name)}" style="width: 100%; height: 100%; object-fit: cover;">
        <span style="position: absolute; top: 12px; left: 12px; background: #081D40; color: #FFFFFF; font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;">${escapeHtml(w.type)}</span>
        <span style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: #C59239; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
          ★ ${w.rating} <small style="color: #FFF; font-weight: 400;">(${w.reviews})</small>
        </span>
      </div>

      <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
        <div style="font-size: 0.8rem; color: #64748B; margin-bottom: 4px;">
          <i class="ph-bold ph-map-pin"></i> ${escapeHtml(w.city)} &bull; ${escapeHtml(w.locality)}
        </div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #081D40; margin: 0 0 8px 0; line-height: 1.3;">${escapeHtml(w.name)}</h3>
        <p style="font-size: 0.82rem; color: #64748B; margin: 0 0 14px 0; line-height: 1.4;">${escapeHtml(w.address)}</p>

        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
          <span style="background: #F1F5F9; color: #334155; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 600;"><i class="ph-bold ph-users"></i> ${w.capacity} Pax</span>
          ${w.amenities
            .slice(0, 3)
            .map((a) => `<span style="background: #F1F5F9; color: #334155; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px;">${escapeHtml(a)}</span>`)
            .join('')}
          <span style="background: #DCFCE7; color: #166534; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 600;">✓ GST Ready</span>
        </div>

        <div style="margin-top: auto; border-top: 1px solid #F1F5F9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 0.75rem; color: #64748B; display: block;">Starting from</span>
            <strong style="font-size: 1.2rem; color: #081D40;">₹${w.priceMonth.toLocaleString('en-IN')}<small style="font-size: 0.75rem; font-weight: 400; color: #64748B;">/mo</small></strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--outline btn--sm" ${action('openQuoteModal', `Schedule Tour: ${w.name}`)} style="padding: 6px 10px; font-size: 0.78rem;">Tour</button>
            <button class="btn btn--primary btn--sm" ${action('openCheckoutModal', { item: w.name, amount: w.priceMonth, city: w.city })} style="padding: 6px 12px; font-size: 0.78rem;">Book</button>
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join('');
}

export function filterMarketplaceCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.mp-cat-btn').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMarketplaceGrid();
}

export function filterMarketplaceCity(city) {
  activeCity = city;
  renderMarketplaceGrid();
}
