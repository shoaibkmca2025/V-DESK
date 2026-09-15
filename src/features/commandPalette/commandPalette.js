import { openAdminModal } from '@/features/admin/adminLeadsTable.js';
import { filterLocationsByCity } from '@/features/locations/locationExplorer.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { scrollToSection } from '@/features/ui/scroll.js';
import { listen } from '@/lib/pageScope.js';
import { action } from '@/lib/html.js';

/* Raycast-style quick command palette (Ctrl/Cmd + K). */

const goToCity = (city) => () => {
  filterLocationsByCity(city);
  scrollToSection('#locations');
};

const COMMAND_PALETTE_ITEMS = [
  // Cities
  { type: 'city', title: 'Mumbai', subtitle: 'Bandra Kurla Complex (BKC), Andheri & Lower Parel', icon: 'ph-buildings', run: goToCity('Mumbai') },
  { type: 'city', title: 'Bangalore', subtitle: 'Koramangala, HSR Layout & Indiranagar', icon: 'ph-buildings', run: goToCity('Bangalore') },
  { type: 'city', title: 'Delhi NCR', subtitle: 'Connaught Place & Cyber City Gurgaon', icon: 'ph-buildings', run: goToCity('Delhi NCR') },
  { type: 'city', title: 'Pune', subtitle: 'Baner Business Park & Viman Nagar Hub', icon: 'ph-buildings', run: goToCity('Pune') },
  { type: 'city', title: 'Hyderabad', subtitle: 'HITEC City & Madhapur IT Corridor', icon: 'ph-buildings', run: goToCity('Hyderabad') },
  { type: 'city', title: 'Nashik', subtitle: 'College Road Flagship & Gangapur Road', icon: 'ph-buildings', run: goToCity('Nashik') },

  // Services
  { type: 'service', title: 'Virtual Office (GST & MCA)', subtitle: 'From ₹1,249/mo • Verified commercial address', icon: 'ph-certificate', run: () => openQuoteModal('Virtual Office') },
  { type: 'service', title: 'Dedicated Coworking Desks', subtitle: 'From ₹399/day • Ergonomic desks & 500 Mbps Wi-Fi', icon: 'ph-laptop', run: () => scrollToSection('#services') },
  { type: 'service', title: 'Meeting Rooms & Boardrooms', subtitle: 'From ₹499/hour • 4K conference displays', icon: 'ph-presentation', run: () => openQuoteModal('Meeting Rooms') },
  { type: 'service', title: 'Private Executive Cabins', subtitle: 'From ₹11,999/mo • 2-25+ seats lockable cabins', icon: 'ph-door', run: () => openQuoteModal('Private Offices') },
  { type: 'service', title: 'Pvt Ltd & LLP Company Incorporation', subtitle: 'From ₹4,999 • Fast SPICe+ MCA filing', icon: 'ph-file-text', run: () => openQuoteModal('Company Registration') },
  { type: 'service', title: 'GST Registration (PPOB & APOB)', subtitle: 'From ₹1,499 • Officer inspection assistance', icon: 'ph-shield-check', run: () => openQuoteModal('GST Registration') },
  { type: 'service', title: 'Trademark Registration', subtitle: 'From ₹1,999 • Fast filing & Nice classification', icon: 'ph-trademark', run: () => openQuoteModal('Trademark Registration') },

  // Tools
  { type: 'tool', title: 'Operational ROI Calculator', subtitle: 'Calculate savings vs traditional leases', icon: 'ph-calculator', run: () => scrollToSection('#pricing') },
  { type: 'tool', title: 'Business Setup Advisor', subtitle: '5-step tailored enterprise blueprint wizard', icon: 'ph-magic-wand', run: () => scrollToSection('#wizard') },
  { type: 'tool', title: 'Instant Quote Generator', subtitle: 'Get verified pricing & brochure in 2 minutes', icon: 'ph-paper-plane-tilt', run: () => openQuoteModal('Command Palette') },
  { type: 'tool', title: 'Admin CRM Portal', subtitle: 'Internal lead management and CSV export', icon: 'ph-lock-key', run: () => openAdminModal() },
];

const GROUP_LABELS = { city: 'Commercial Cities', service: 'Workspace & Legal Solutions', tool: 'Platform Tools & Actions' };

let selectedIndex = 0;
let filteredItems = [...COMMAND_PALETTE_ITEMS];

function renderCommandPaletteItems() {
  const container = document.getElementById('commandPaletteResults');
  if (!container) return;

  if (!filteredItems.length) {
    container.innerHTML = `
      <div style="padding: 28px 16px; text-align: center; color: var(--vd-text-muted, #5A6270);">
        <i class="ph-bold ph-magnifying-glass" style="font-size: 1.8rem; margin-bottom: 8px; opacity: 0.5;"></i>
        <div>No matching workspaces or services found</div>
        <small style="font-size: 0.78rem;">Try searching 'Mumbai', 'Coworking', 'GST', or 'Calculator'</small>
      </div>
    `;
    return;
  }

  let html = '';
  let currentType = '';

  filteredItems.forEach((item, index) => {
    if (item.type !== currentType) {
      currentType = item.type;
      html += `<div class="palette-group-title">${GROUP_LABELS[currentType]}</div>`;
    }

    html += `
      <div class="palette-item ${index === selectedIndex ? 'is-selected' : ''}" ${action('executePaletteItem', index)}>
        <div class="palette-item__left">
          <div class="palette-item__icon"><i class="ph-bold ${item.icon}"></i></div>
          <div>
            <span class="palette-item__title">${item.title}</span>
            <span class="palette-item__subtitle">${item.subtitle}</span>
          </div>
        </div>
        <span class="palette-item__badge">${item.type.toUpperCase()}</span>
      </div>
    `;
  });

  container.innerHTML = html;
  container.querySelector('.palette-item.is-selected')?.scrollIntoView({ block: 'nearest' });
}

export function handleCommandPaletteSearch(query) {
  const q = (query || '').toLowerCase().trim();
  filteredItems = q
    ? COMMAND_PALETTE_ITEMS.filter(
        (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.type.toLowerCase().includes(q),
      )
    : [...COMMAND_PALETTE_ITEMS];
  selectedIndex = 0;
  renderCommandPaletteItems();
}

export function executePaletteItem(index) {
  const item = filteredItems[index];
  if (item) {
    closeCommandPalette();
    item.run();
  }
}

export function openCommandPalette() {
  const modal = document.getElementById('commandPaletteModal');
  const input = document.getElementById('commandPaletteInput');
  if (!modal) return;

  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }

  filteredItems = [...COMMAND_PALETTE_ITEMS];
  selectedIndex = 0;
  renderCommandPaletteItems();
}

export function closeCommandPalette() {
  const modal = document.getElementById('commandPaletteModal');
  if (!modal) return;
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

export function closeCommandPaletteOnBackdrop(e) {
  if (e.target.id === 'commandPaletteModal') closeCommandPalette();
}

function isPaletteOpen() {
  return document.getElementById('commandPaletteModal')?.classList.contains('is-active');
}

/** Global shortcuts: Ctrl/Cmd+K toggles, Escape closes, arrows/Enter navigate. */
export function initCommandPalette() {
  filteredItems = [...COMMAND_PALETTE_ITEMS];
  selectedIndex = 0;

  listen(window, 'keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (isPaletteOpen()) closeCommandPalette();
      else openCommandPalette();
      return;
    }

    if (!isPaletteOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        selectedIndex = (selectedIndex + 1) % filteredItems.length;
        renderCommandPaletteItems();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
        renderCommandPaletteItems();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems.length > 0) executePaletteItem(selectedIndex);
    }
  });
}
