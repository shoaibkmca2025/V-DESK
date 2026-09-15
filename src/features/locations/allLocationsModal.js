import { closeModal } from '@/features/modals/modalManager.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { showToast } from '@/features/ui/toast.js';
import { filterLocationsByCity } from './locationExplorer.js';

/* "All cities & states" coverage dialog (#allLocationsModal). */

export function filterModalStates(query) {
  const q = (query || '').toLowerCase().trim();
  document.querySelectorAll('#modalMetroGrid .state-pill, #modalStatesPillContainer .state-pill').forEach((pill) => {
    pill.style.display = pill.textContent.toLowerCase().includes(q) ? 'inline-flex' : 'none';
  });
}

export function openAllLocationsModal() {
  const modal = document.getElementById('allLocationsModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const filterInput = document.getElementById('modalStateFilterInput');
  if (filterInput) {
    filterInput.value = '';
    filterModalStates('');
    setTimeout(() => filterInput.focus(), 100);
  }
}

export function closeAllLocationsModal() {
  closeModal('allLocationsModal');
}

export function filterCityFromModal(city) {
  closeAllLocationsModal();
  document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' });
  filterLocationsByCity(city);
  showToast('Location Selected', `Viewing verified V-DESK workspace hubs in ${city}.`, 'info');
}

export function selectStateFromModal(stateName) {
  closeAllLocationsModal();
  openQuoteModal(`State Coverage: ${stateName}`);
  showToast('State Selection', `Requesting Grade-A commercial NOC address in ${stateName}.`, 'info');
}
