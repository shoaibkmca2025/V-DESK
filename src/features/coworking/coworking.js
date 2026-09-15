import { showToast } from '@/features/ui/toast.js';

/* Coworking page (Worldmark Aerocity centre): gallery tabs, amenity filters and tour prefill. */

const GALLERY_ZONES = {
  lounge: {
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Executive Members Lounge',
    caption: 'Curated Breakout Lounge with Designer Furnishings & Natural Light',
    specs: 'Level 7 Worldmark 4 • Capacity: 60 Pax • High-Speed Dual Wi-Fi • Complimentary Artisan Beverages',
  },
  barista: {
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    tag: 'Serviced Barista Cafe',
    caption: 'Artisanal Coffee Bar with On-Demand Baristas & Gourmet Dining',
    specs: 'Single-Origin Espresso • Organic Loose-Leaf Teas • Infused Water • Daily Fresh Baked Goods',
  },
  reception: {
    img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    tag: 'Light Executive Reception',
    caption: 'Corporate Front Desk & Guest Greeting with Five-Star Hospitality',
    specs: 'Professional Concierge • Guest Sign-In Digital Tablet • Courier & Mail Intake Desk',
  },
  boardroom: {
    img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    tag: '4K AV Boardrooms',
    caption: 'Acoustically Treated Boardrooms with Dual-Screen Telepresence',
    specs: 'Cisco/Polycom 4K Codec • Digital Touch Whiteboards • Seating for 16 Pax • Catering Support',
  },
  cabins: {
    img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    tag: 'Private Executive Cabins',
    caption: 'Turnkey Soundproof Team Suites with Ergonomic Herman Miller Desks',
    specs: 'Keyless RFID Access • Dedicated Server VLAN • 2 to 30 Desks • Daily Housekeeping',
  },
  library: {
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Silent Coworking Library',
    caption: 'Distraction-Free Focus Enclave for High-Leverage Deep Work',
    specs: 'Zero-Noise Policy • Lumbar Task Chairs • Anti-Glare Desk Lighting • Power at Every Seat',
  },
};

export function switchCwGalleryTab(zone, btn) {
  const data = GALLERY_ZONES[zone];
  if (!data) return;

  document.querySelectorAll('.cw-gallery-tab-btn').forEach((t) => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const imgEl = document.getElementById('cwGalleryImg');
  if (imgEl) {
    imgEl.style.opacity = '0.3';
    setTimeout(() => {
      imgEl.src = data.img;
      imgEl.alt = data.caption;
      imgEl.style.opacity = '1';
    }, 200);
  }

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('cwGalleryTag', data.tag);
  setText('cwGalleryCaption', data.caption);
  setText('cwGallerySpecs', data.specs);
}

export function filterCwAmenities(category, btn) {
  document.querySelectorAll('.cw-amenities-filters .cw-filter-pill').forEach((p) => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.cw-amenity-card').forEach((card) => {
    card.style.display = category === 'all' || card.getAttribute('data-category') === category ? 'block' : 'none';
  });
}

export function prefillCwTour(solutionName) {
  const solutionSelect = document.getElementById('cwSolution');
  if (solutionSelect) {
    const wanted = solutionName.toLowerCase();
    for (let i = 0; i < solutionSelect.options.length; i++) {
      const option = solutionSelect.options[i];
      if (option.text.toLowerCase().includes(wanted) || wanted.includes(option.value.toLowerCase())) {
        solutionSelect.selectedIndex = i;
        break;
      }
    }
  }

  const tourCard = document.getElementById('cwTourCard');
  if (tourCard) {
    tourCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const nameInput = document.getElementById('cwName');
    if (nameInput) setTimeout(() => nameInput.focus(), 500);
  }

  showToast('Solution Selected', `Configured for ${solutionName}. Pick a tour date to confirm.`, 'info');
}
