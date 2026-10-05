import { GST_RATE } from '@/data/constants.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { openDigitalKycModal } from '@/features/kyc/kyc.js';
import { openQuoteProposalModal } from '@/features/quote/quoteProposal.js';
import { showToast } from '@/features/ui/toast.js';
import { escapeHtml } from '@/lib/html.js';

/*
 * Virtual office setup configurator (PRD §24–29, §55).
 * Price = base centre rate + location adjustment + add-ons − annual discount + 18% GST.
 */

const ADDON_MONTHLY = { gst: 350, mail: 299, meetingCredits: 999 };
const INCORPORATION_ONE_TIME = 2999;
const ANNUAL_DISCOUNT = 0.2;

function createConfigState() {
  return {
    city: 'Nashik',
    centreId: 'NSK-001',
    purpose: 'GST Registration',
    tenure: 'annual',
    basePrice: 1249,
    addons: { gst: true, incorporation: false, mail: true, meetingCredits: false },
  };
}

let voConfigState = createConfigState();

export function resetVoConfigState() {
  voConfigState = createConfigState();
}

export function handleVoCityChange(city) {
  voConfigState.city = city;
  const centreSelect = document.getElementById('voCentreSelect');
  if (!centreSelect) return;

  const matches = catalog.locations.filter((l) => l.city.toLowerCase() === city.toLowerCase());
  if (matches.length > 0) {
    centreSelect.innerHTML = matches.map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.fullName)}</option>`).join('');
    voConfigState.centreId = matches[0].id;
    voConfigState.basePrice = matches[0].vo_price;
  }
  updateVoDynamicPrice();
}

export function handleVoCentreChange(centreId) {
  voConfigState.centreId = centreId;
  const loc = catalog.locations.find((l) => l.id === centreId);
  if (loc) voConfigState.basePrice = loc.vo_price;
  updateVoDynamicPrice();
}

export function selectVoPurpose(btn, purpose) {
  voConfigState.purpose = purpose;
  document.querySelectorAll('.vo-purpose-grid .vo-purpose-btn').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const sub = document.getElementById('voSummarySubtitle');
  if (sub) sub.textContent = `Configured for ${purpose} & Commercial Compliance`;
  updateVoDynamicPrice();
}

export function setVoTenure(tenure) {
  voConfigState.tenure = tenure;
  const mBtn = document.getElementById('voTenureMonthly');
  const aBtn = document.getElementById('voTenureAnnual');
  if (mBtn && aBtn) {
    mBtn.classList.toggle('active', tenure === 'monthly');
    aBtn.classList.toggle('active', tenure === 'annual');
  }
  updateVoDynamicPrice();
}

export function updateVoDynamicPrice() {
  const checkbox = (id, fallback) => {
    const el = document.getElementById(id);
    return el ? el.checked : fallback;
  };
  const { addons } = voConfigState;
  addons.gst = checkbox('voAddonGst', true);
  addons.incorporation = checkbox('voAddonIncorporation', false);
  addons.mail = checkbox('voAddonMail', true);
  addons.meetingCredits = checkbox('voAddonMeetingCredits', false);

  const cityData = catalog.cityPricing[voConfigState.city] || { mult: 1.0, adj: 0, label: 'Standard Rate' };

  let monthlyAddons = 0;
  if (addons.gst) monthlyAddons += ADDON_MONTHLY.gst;
  if (addons.mail) monthlyAddons += ADDON_MONTHLY.mail;
  if (addons.meetingCredits) monthlyAddons += ADDON_MONTHLY.meetingCredits;
  const oneTimeAddon = addons.incorporation ? INCORPORATION_ONE_TIME : 0;

  const basePricePerMonth = voConfigState.basePrice;
  const locationAdj = cityData.adj;
  const effectiveMonthly = basePricePerMonth + locationAdj + monthlyAddons;

  const isAnnual = voConfigState.tenure === 'annual';
  const months = isAnnual ? 12 : 1;

  const subtotal = effectiveMonthly * months + oneTimeAddon;
  const discount = isAnnual ? Math.round(subtotal * ANNUAL_DISCOUNT) : 0;
  const discountedSubtotal = subtotal - discount;
  const taxes = Math.round(discountedSubtotal * GST_RATE);
  const finalTotal = discountedSubtotal + taxes;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('voSummaryTitle', `${voConfigState.city} Setup`);
  setText('voCalcBase', `₹${basePricePerMonth.toLocaleString('en-IN')} / mo`);
  setText('voCalcLocationAdj', locationAdj > 0 ? `+₹${locationAdj} / mo (${cityData.label})` : `Included (${cityData.label})`);
  setText('voCalcAddons', `₹${monthlyAddons.toLocaleString('en-IN')} / mo${oneTimeAddon > 0 ? ' + ₹' + oneTimeAddon + ' (one-time)' : ''}`);

  const discountRow = document.getElementById('voDiscountRow');
  if (discountRow) discountRow.style.display = isAnnual ? 'flex' : 'none';
  setText('voCalcDiscount', `-₹${discount.toLocaleString('en-IN')}`);
  setText('voCalcTaxes', `₹${taxes.toLocaleString('en-IN')}`);
  setText('voCalcTotal', `₹${finalTotal.toLocaleString('en-IN')}`);
  setText('voCalcPeriod', isAnnual ? 'for 12 Months (All-Inclusive)' : 'for 1 Month (All-Inclusive)');
}

export function proceedVoToKyc() {
  openDigitalKycModal();
  showToast('Package Configured', `Ready for KYC verification for ${voConfigState.city} Virtual Office.`, 'info');
}

export function generateVoFormalQuote() {
  openQuoteProposalModal({
    product: `${voConfigState.city} Virtual Office Platform`,
    purpose: voConfigState.purpose,
    tenure: voConfigState.tenure === 'annual' ? '12 Months' : '1 Month',
    rateMonth: voConfigState.basePrice,
  });
}
