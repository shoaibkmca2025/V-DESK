import { LEGAL_DOCUMENTS } from '@/content/legal.js';

export function switchLegalTab(tab) {
  const doc = LEGAL_DOCUMENTS[tab] || LEGAL_DOCUMENTS.privacy;

  document.querySelectorAll('.legal-tab, .legal-modal__tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('id') === `tabBtn-${tab}` || btn.dataset.tab === tab);
  });

  const titleEl = document.getElementById('legalModalTitle');
  const bodyEl = document.getElementById('legalModalBody');
  if (titleEl) titleEl.textContent = doc.title;
  if (bodyEl) {
    bodyEl.innerHTML = doc.content;
    bodyEl.scrollTop = 0;
  }
}

export function openLegalModal(tab) {
  const modal = document.getElementById('legalModal');
  if (!modal) return;
  modal.classList.add('open', 'active');
  document.body.style.overflow = 'hidden';
  switchLegalTab(tab || 'privacy');
}
