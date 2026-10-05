import { addLead } from '@/features/crm/leadStore.js';
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
}
