import { liveCentreRef } from '@/features/catalog/catalogApi.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { addLead } from '@/features/crm/leadStore.js';
import { createQuote } from '@/features/pricing/pricingApi.js';
import { closeModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';
import { getWizardState } from '@/features/wizard/setupWizard.js';

/* "Get Instant Quote" dialog (#quoteModal): opened from CTAs across the site with a source label. */

const QUOTE_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Nashik', 'Hyderabad', 'Noida', 'Gurgaon', 'Chennai'];

let quoteSource = '';

function quoteTitleFor(source) {
  if (source && source.includes('Virtual Office')) return 'Virtual Office Quote';
  if (source && source.includes('Coworking')) return 'Coworking Quote';
  if (source && source.includes('Meeting')) return 'Meeting Room Quote';
  if (source && source.includes('Registration')) return 'Registration Quote';
  if (source && source.includes('Trademark')) return 'Trademark Quote';
  if (source && source.includes('Location:')) return source.replace('Location: ', '');
  return 'Get Instant Quote';
}

function quoteServiceFor(source) {
  if (source && source.includes('Coworking')) return 'Coworking';
  if (source && source.includes('Meeting')) return 'Meeting Rooms';
  if (source && source.includes('Private Office')) return 'Private Office';
  if (source && source.includes('GST')) return 'GST Registration';
  if ((source && source.includes('Company')) || source.includes('Incorporation')) return 'Company Registration';
  if (source && source.includes('Trademark')) return 'Trademark';
  if (source && source.includes('Calculator')) {
    const calcPlan = document.getElementById('calcPlanSummary')?.textContent || '';
    if (calcPlan.includes('Coworking')) return 'Coworking';
    if (calcPlan.includes('Private Office')) return 'Private Office';
  }
  return 'Virtual Office';
}

export function openQuoteModal(source = '') {
  quoteSource = source || 'Unknown';
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.add('open', 'active');
  document.body.style.overflow = 'hidden';

  const title = document.getElementById('modalQuoteTitle');
  const citySelect = document.getElementById('mqCity');
  const serviceSelect = document.getElementById('mqService');

  if (title) title.textContent = quoteTitleFor(source);

  if (citySelect) {
    const matchedCity = QUOTE_CITIES.find((c) => source.includes(c));
    if (matchedCity) {
      citySelect.value = matchedCity;
    } else {
      const wizMatch = QUOTE_CITIES.find((c) => getWizardState().city.includes(c));
      if (wizMatch) citySelect.value = wizMatch;
    }
  }

  if (serviceSelect) serviceSelect.value = quoteServiceFor(source);

  setTimeout(() => {
    document.getElementById('mqName')?.focus();
  }, 80);
}

export function openConsultationModal() {
  openQuoteModal('Free Consultation');
}

export function handleModalQuoteSubmit(e) {
  e.preventDefault();
  const value = (id) => document.getElementById(id);
  const nameEl = value('mqName');
  const phoneEl = value('mqMobile');
  const emailEl = value('mqEmail');
  const cityEl = value('mqCity');
  const serviceEl = value('mqService');
  const companyEl = value('mqCompany');
  const messageEl = value('mqMessage');

  const lead = addLead({
    name: nameEl ? nameEl.value.trim() : '',
    mobile: phoneEl ? phoneEl.value.trim() : '',
    email: emailEl ? emailEl.value.trim() : '',
    city: cityEl ? cityEl.value : 'General',
    service: serviceEl ? serviceEl.value : 'Virtual Office',
    company: companyEl ? companyEl.value.trim() : '',
    notes: messageEl ? messageEl.value.trim() : '',
    source: 'Quote Modal — ' + (quoteSource || 'Direct'),
  });
  e.target.reset();
  closeModal('quoteModal');
  showToast(`✓ Quote request received — ${lead.id}. We'll reach out within 15 minutes.`);
  priceQuoteOnServer(lead);
}

/**
 * Also asks the API to price and save the enquiry as a quote, so the advisor opens a priced
 * proposal (VDQ-…) instead of re-keying it. The visitor's confirmation does not depend on it:
 * the enquiry is already recorded by `addLead`.
 */
function priceQuoteOnServer(lead) {
  /*
   * Only a virtual office can be priced from an enquiry form — a boardroom or an incorporation
   * needs details this form does not ask for. And it is priced against a centre in the city the
   * visitor actually chose: a Mumbai enquiry must never come back priced for Nashik.
   */
  if (!/virtual office/i.test(lead.service ?? '')) return;
  const centre = catalog.locations.find((location) => location.city === lead.city);
  const centreRef = centre?.ref ?? liveCentreRef(centre?.id, catalog);
  if (!centreRef) return;

  createQuote({
    name: lead.name,
    company: lead.company,
    item: { product: 'virtual_office', centreRef, tenure: 'annual' },
  })
    .then((quote) => {
      if (quote?.ref) console.info('[V-DESK] quote saved:', quote.ref);
    })
    .catch((error) => console.warn('[V-DESK] quote not priced on the API:', error.code));
}
