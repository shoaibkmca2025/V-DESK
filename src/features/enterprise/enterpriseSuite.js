import { GST_RATE } from '@/data/constants.js';
import { addLead } from '@/features/crm/leadStore.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';

/* P2 enterprise platform (PRD §63, §75): multi-city bulk desk estimator + RFP capture. */

const BASE_RATE_PER_DESK = 7999;
const MARKET_RATE_PER_DESK = 16000;

function createEnterpriseState() {
  return { desks: 50, cities: ['Mumbai', 'Bangalore'], tenure: 12 };
}

let enterpriseState = createEnterpriseState();

export function resetEnterpriseState() {
  enterpriseState = createEnterpriseState();
}

function bulkDiscountFor(desks) {
  if (desks >= 200) return 0.35;
  if (desks >= 100) return 0.25;
  if (desks >= 50) return 0.15;
  return 0.05;
}

export function calculateEnterpriseQuote() {
  const { desks } = enterpriseState;
  const bulkDiscountRate = bulkDiscountFor(desks);

  const netPerDeskMonthly = Math.round(BASE_RATE_PER_DESK * (1 - bulkDiscountRate));
  const totalAnnualGross = netPerDeskMonthly * desks * 12;
  const grandAnnualTotal = totalAnnualGross + Math.round(totalAnnualGross * GST_RATE);

  const tradMarketCost = Math.round(desks * MARKET_RATE_PER_DESK * 12 * 1.18);
  const enterpriseSavings = tradMarketCost - grandAnnualTotal;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('entMonthlyRate', '₹' + netPerDeskMonthly.toLocaleString('en-IN') + ' / seat / mo');
  setText('entDiscountRate', Math.round(bulkDiscountRate * 100) + '% Enterprise Bulk Rebate');
  setText('entTotalAnnual', '₹' + grandAnnualTotal.toLocaleString('en-IN') + ' / yr');
  setText('entSavingsAnnual', '₹' + enterpriseSavings.toLocaleString('en-IN') + ' Savings');
  setText('entCitiesSelected', enterpriseState.cities.join(', '));
}

export function openEnterpriseSuiteModal() {
  if (!document.getElementById('enterpriseSuiteModal')) return;
  calculateEnterpriseQuote();
  openActiveModal('enterpriseSuiteModal');
}

export function toggleEnterpriseCity(city, btn) {
  if (enterpriseState.cities.includes(city)) {
    if (enterpriseState.cities.length <= 1) {
      showToast('Minimum 1 City', 'Select at least one commercial hub for your enterprise package.', 'info');
      return;
    }
    enterpriseState.cities = enterpriseState.cities.filter((c) => c !== city);
    btn.classList.remove('active');
  } else {
    enterpriseState.cities.push(city);
    btn.classList.add('active');
  }
  calculateEnterpriseQuote();
}

export function handleEnterpriseDeskChange(val) {
  enterpriseState.desks = parseInt(val, 10);
  const display = document.getElementById('entDeskCountDisplay');
  if (display) display.textContent = val + ' Desks / Cabins';
  calculateEnterpriseQuote();
}

export function submitEnterpriseRfp(e) {
  if (e) e.preventDefault();
  const valueOf = (id, fallback) => document.getElementById(id)?.value || fallback;

  const lead = addLead({
    name: valueOf('entContactName', 'Enterprise Client'),
    mobile: valueOf('entContactPhone', '+91 98765 43210'),
    email: valueOf('entContactEmail', 'procurement@corp.in'),
    company: valueOf('entCompanyName', 'Fortune Enterprise'),
    city: enterpriseState.cities.join(' & '),
    service: `Enterprise Bulk (${enterpriseState.desks} Desks)`,
    source: 'Enterprise RFP Portal',
  });

  closeModal('enterpriseSuiteModal');
  showToast('Enterprise RFP Dispatched ✓', `Reference #${lead.id}. Dedicated Key Account Director assigned within 30 minutes.`, 'success');
}
