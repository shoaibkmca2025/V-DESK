import { showToast } from '@/features/ui/toast.js';

/* Pricing tools: lease-vs-V-DESK ROI calculator (PRD §40), billing toggles and the team savings calculator. */

export function runCostCalculation() {
  const cityEl = document.getElementById('calcCity');
  if (!cityEl) return;
  const cityTier = cityEl.value || 'Tier-2';
  const service = document.getElementById('calcService')?.value ?? 'Virtual Office for GST';
  const teamEl = document.getElementById('calcTeamSlider');
  const team = teamEl ? parseInt(teamEl.value, 10) : 1;
  const durEl = document.getElementById('calcDuration');
  const duration = durEl ? parseInt(durEl.value, 10) : 12;
  const addonGST = document.getElementById('calcAddonGST')?.checked || false;
  const addonMeeting = document.getElementById('calcAddonMeeting')?.checked || false;

  const tierMultiplier = cityTier.includes('Tier-1') ? 1.6 : cityTier.includes('Tier-2') ? 1.0 : 0.75;

  let baseMonthly;
  switch (service) {
    case 'Coworking Dedicated Desks':
      baseMonthly = 5999 * tierMultiplier * Math.max(1, team * 0.4);
      break;
    case 'Private Office Cabin':
      baseMonthly = 11999 * tierMultiplier * Math.max(1, team * 0.25);
      break;
    case 'Hybrid Combo':
      baseMonthly = (1499 + 5999 * Math.max(1, team * 0.3)) * tierMultiplier;
      break;
    case 'Virtual Office for GST':
    default:
      baseMonthly = 1499 * tierMultiplier;
  }

  const durationDiscount = duration >= 24 ? 0.85 : duration >= 12 ? 0.8 : 1.0;
  let monthlyFinal = baseMonthly * durationDiscount;
  if (addonGST) monthlyFinal += 299;
  if (addonMeeting) monthlyFinal += 2999;

  const vdeskAnnual = Math.round(monthlyFinal * 12);

  // Traditional lease estimate
  let tradAnnual;
  if (service === 'Virtual Office for GST') {
    tradAnnual = tierMultiplier > 1 ? 1440000 : 720000;
  } else if (service === 'Coworking Dedicated Desks') {
    tradAnnual = Math.round(team * 15000 * tierMultiplier * 12);
  } else if (service === 'Private Office Cabin') {
    tradAnnual = Math.round(team * 20000 * tierMultiplier * 12);
  } else {
    tradAnnual = Math.round((team * 12000 + 120000) * tierMultiplier);
  }

  const savingsPercent = Math.max(0, Math.round((1 - vdeskAnnual / tradAnnual) * 100));
  const vdeskBarWidth = Math.max(5, Math.round((vdeskAnnual / tradAnnual) * 100));

  const estValEl = document.getElementById('vdeskEstVal');
  const savingsEl = document.getElementById('vdeskSavingsPercent');
  const tradEl = document.getElementById('tradLeaseVal');
  const fillBar = document.getElementById('vdeskFillBar');
  if (tradEl) tradEl.textContent = '₹' + tradAnnual.toLocaleString('en-IN') + ' / yr';
  if (estValEl) estValEl.textContent = '₹' + vdeskAnnual.toLocaleString('en-IN') + ' / yr';
  if (fillBar) fillBar.style.width = vdeskBarWidth + '%';
  if (savingsEl) savingsEl.textContent = savingsPercent + '%';

  // Micro-interaction bump
  if (estValEl) {
    estValEl.classList.remove('bump');
    void estValEl.offsetWidth;
    estValEl.classList.add('bump');
  }

  const planSum = document.getElementById('calcPlanSummary');
  const durSum = document.getElementById('calcDurationSummary');
  if (planSum) planSum.textContent = service;
  if (durSum) durSum.textContent = duration + ' Months';

  const addons = [];
  if (addonGST) addons.push('GST Filing');
  if (addonMeeting) addons.push('Meeting Room Bundle');
  const addSum = document.getElementById('calcAddonsSummary');
  if (addSum) addSum.textContent = addons.length ? addons.join(', ') : 'None';
}

export function updateTeamSlider(value) {
  const display = document.getElementById('calcTeamDisplay');
  if (display) display.textContent = value + ' Members';
  runCostCalculation();
}

export function setBillingTenure(tenure) {
  const annualBtn = document.getElementById('tenureAnnualBtn');
  const flexBtn = document.getElementById('tenureFlexibleBtn');

  if (tenure === 'annual') {
    annualBtn?.classList.add('active');
    flexBtn?.classList.remove('active');
    showToast('Annual Commitment Active', '20% operational discount applied to calculations.', 'info');
  } else {
    flexBtn?.classList.add('active');
    annualBtn?.classList.remove('active');
    showToast('Quarterly / Flexible Active', 'Standard monthly rate calculation applied.', 'info');
  }

  runCostCalculation();
}

/** Monthly / annual price switch on the plans matrix. */
export function toggleBillingCycle(cycle) {
  const isAnnual = cycle === 'annual';
  const monthlyBtn = document.getElementById('billingOptMonthly');
  const annualBtn = document.getElementById('billingOptAnnual');

  if (monthlyBtn && annualBtn) {
    annualBtn.classList.toggle('active', isAnnual);
    monthlyBtn.classList.toggle('active', !isAnnual);
  }

  document.querySelectorAll('.plan-price-val').forEach((el) => {
    const val = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
    if (val) el.innerText = '₹' + val;
  });
  document.querySelectorAll('.plan-period-label').forEach((el) => {
    el.innerText = isAnnual ? ' / year' : ' / month';
  });
  document.querySelectorAll('.plan-sub-label').forEach((el) => {
    el.innerText = isAnnual ? 'Includes 20% annual savings' : 'Billed monthly (cancel anytime)';
  });
}

/** Coworking flexi-pass vs traditional lease savings (coworking page). */
export function updateTeamSavings() {
  const sizeInput = document.getElementById('calcTeamSize');
  const schedInput = document.getElementById('calcSchedule');
  const sizeVal = document.getElementById('teamSizeVal');
  const tradEl = document.getElementById('tradCost');
  const vdeskEl = document.getElementById('vdeskCost');
  const savEl = document.getElementById('savingsCost');

  if (!sizeInput || !tradEl || !vdeskEl || !savEl) return;

  const teamSize = parseInt(sizeInput.value, 10) || 10;
  if (sizeVal) sizeVal.innerText = teamSize + ' Desks';

  const daysPerWeek = parseInt(schedInput ? schedInput.value : 3, 10) || 3;

  const tradTotal = teamSize * 12000;
  const passRate = teamSize >= 20 ? 249 : teamSize >= 10 ? 269 : 299;
  const vdeskMonthly = Math.round(teamSize * daysPerWeek * 4.33 * passRate);

  const netSavings = Math.max(0, tradTotal - vdeskMonthly);
  const percentSaved = Math.round((netSavings / tradTotal) * 100);

  const small = (suffix) => `<small style="font-size: 0.75rem; font-weight: 400;">${suffix}</small>`;
  tradEl.innerHTML = '₹' + tradTotal.toLocaleString('en-IN') + small('/mo');
  vdeskEl.innerHTML = '₹' + vdeskMonthly.toLocaleString('en-IN') + small('/mo');
  savEl.innerHTML = '₹' + netSavings.toLocaleString('en-IN') + small(`/mo (${percentSaved}%)`);
}
