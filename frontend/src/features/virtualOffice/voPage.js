import { showToast } from '@/features/ui/toast.js';

/* Virtual office landing page helpers: city market filter and "need" / city shortcuts into the lead card. */

export function filterVoMarkets(city, btn) {
  document.querySelectorAll('.vo-city-tab-btn').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.vo-market-card').forEach((card) => {
    if (city === 'all' || card.getAttribute('data-city') === city) {
      card.style.display = 'flex';
      card.classList.add('reveal');
    } else {
      card.style.display = 'none';
    }
  });
}

const NEED_PURPOSES = {
  incorporation: 'Company Incorporation',
  gst: 'GST Registration',
  mailing: 'Business Address & Mailing',
};

const NEED_LABELS = {
  incorporation: 'New Business / MCA Incorporation',
  gst: 'Business Expansion / GST PPOB & APOB',
  mailing: 'Corporate Business Address & Mailing',
};

function focusLeadCard(fieldId) {
  const leadCard = document.getElementById('voLeadCard');
  if (!leadCard) return;
  leadCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const field = document.getElementById(fieldId);
  if (field) setTimeout(() => field.focus(), 500);
}

export function selectVoNeed(needType) {
  const purposeSelect = document.getElementById('voHeroPurpose');
  if (purposeSelect && NEED_PURPOSES[needType]) purposeSelect.value = NEED_PURPOSES[needType];

  focusLeadCard('voHeroName');
  showToast('Plan Selected', `Configured for ${NEED_LABELS[needType] || needType}. Complete form for instant dispatch.`, 'info');
}

export function prefillVoCity(cityName) {
  const citySelect = document.getElementById('voHeroCity');
  if (citySelect) {
    for (let i = 0; i < citySelect.options.length; i++) {
      if (cityName.toLowerCase().includes(citySelect.options[i].value.toLowerCase())) {
        citySelect.selectedIndex = i;
        break;
      }
    }
  }

  focusLeadCard('voHeroPhone');
  showToast('Location Selected', `Selected ${cityName}. Best rate locked in quote.`, 'info');
}
