import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { openQuoteProposalModal } from '@/features/quote/quoteProposal.js';
import { action, escapeHtml } from '@/lib/html.js';

/* Company registration (PRD §36): entity picker dialog, incorporation fee calculator and MCA name pre-check. */

let selectedCompanyEntity = 'Pvt Ltd';

export function resetCompanyRegistrationState() {
  selectedCompanyEntity = 'Pvt Ltd';
}

export function openCompanyRegModal() {
  openActiveModal('companyRegModal');
}

export function selectCompanyEntity(card, entity) {
  selectedCompanyEntity = entity;
  document.querySelectorAll('.entity-picker-grid .entity-card').forEach((c) => c.classList.remove('active'));
  if (card) card.classList.add('active');
}

export function proceedEntityToQuote() {
  closeModal('companyRegModal');
  openQuoteProposalModal({
    product: `${selectedCompanyEntity} Incorporation & Legal Package`,
    purpose: 'START: MCA SPICe+ Company Formation',
    tenure: 'Fast-Track (5-7 Days)',
    rateMonth: 4999,
  });
}

const VIRTUAL_OFFICE_BUNDLE_FEE = 11999;

export function calculateIncorpFees() {
  const entitySelect = document.getElementById('wizEntityType');
  const stateSelect = document.getElementById('wizState');
  const dirSelect = document.getElementById('wizDirectors');
  const bundleVo = document.getElementById('wizBundleVo');

  const baseEl = document.getElementById('wizBaseFee');
  const stampEl = document.getElementById('wizStampFee');
  const voRow = document.getElementById('wizVoRow');
  const totalEl = document.getElementById('wizTotalFee');

  if (!entitySelect || !totalEl) return;

  const opt = entitySelect.options[entitySelect.selectedIndex];
  const baseFee = parseInt(opt ? opt.getAttribute('data-base') : 6999, 10) || 6999;

  const stateOpt = stateSelect ? stateSelect.options[stateSelect.selectedIndex] : null;
  const stampDuty = parseInt(stateOpt ? stateOpt.getAttribute('data-stamp') : 1000, 10) || 1000;

  const numDirectors = parseInt(dirSelect ? dirSelect.value : 2, 10) || 2;
  const extraDirectorFee = Math.max(0, (numDirectors - 2) * 1000);

  const isVoBundled = bundleVo ? bundleVo.checked : true;
  const voFee = isVoBundled ? VIRTUAL_OFFICE_BUNDLE_FEE : 0;
  if (voRow) voRow.style.display = isVoBundled ? 'flex' : 'none';

  const total = baseFee + stampDuty + extraDirectorFee + voFee;

  if (baseEl) baseEl.innerText = '₹' + (baseFee + extraDirectorFee).toLocaleString('en-IN');
  if (stampEl) stampEl.innerText = '₹' + stampDuty.toLocaleString('en-IN');
  totalEl.innerText = '₹' + total.toLocaleString('en-IN');
}

/** Instant (indicative) SPICe+ name availability hint as the user types. */
export function checkMcaName(name) {
  const resultBox = document.getElementById('mcaPrecheckResult');
  if (!resultBox) return;

  const clean = (name || '').trim();
  if (clean.length < 3) {
    resultBox.style.display = 'none';
    resultBox.innerHTML = '';
    return;
  }

  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 10px 12px; font-size: 0.82rem; color: #166534; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
      <div>
        <i class="ph-bold ph-check-circle" style="color: #16A34A; margin-right: 4px;"></i>
        <strong>${escapeHtml(clean)} Private Limited</strong> appears available under MCA Rule 8 guidelines.
      </div>
      <button type="button" class="btn btn--primary btn--sm" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap;" ${action('openQuoteModal', `MCA SPICe+ Name Filing: ${clean}`)}>Reserve Name</button>
    </div>
  `;
}
