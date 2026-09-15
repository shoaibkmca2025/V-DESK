/* Business Setup Wizard (PRD §38) — five steps ending with a recommended bundle. */

let wizardState = createWizardState();

function createWizardState() {
  return { entity: 'Private Limited Company', city: 'Nashik (Flagship)', step: 1 };
}

export function resetWizardState() {
  wizardState = createWizardState();
}

export function getWizardState() {
  return wizardState;
}

export function selectWizardChoice(field, value, btn) {
  wizardState[field] = value;
  btn.closest('.wizard__choices').querySelectorAll('.wizard__choice').forEach((c) => c.classList.remove('selected'));
  btn.classList.add('selected');
}

export function navigateWizard(step) {
  wizardState.step = step;

  document.querySelectorAll('.wizard__pane').forEach((p) => p.classList.remove('active'));
  document.getElementById('wizPane' + step)?.classList.add('active');

  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById('wizNode' + i);
    const line = document.getElementById('wizLine' + (i - 1));
    if (node) {
      if (i < step) {
        node.classList.add('completed');
        node.classList.remove('active');
        node.innerHTML = '✓';
      } else if (i === step) {
        node.classList.add('active');
        node.classList.remove('completed');
        node.innerHTML = i;
      } else {
        node.classList.remove('active', 'completed');
        node.innerHTML = i;
      }
    }
    if (line) line.classList.toggle('completed', i <= step);
  }
}

/** Makes the progress nodes clickable/keyboard operable. */
export function initWizard() {
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById('wizNode' + i);
    if (!node) continue;
    node.style.cursor = 'pointer';
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', `Navigate to Step ${i}`);
    node.onclick = () => navigateWizard(i);
    node.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateWizard(i);
      }
    };
  }
}

export function generateWizardRecommendation() {
  const checked = (id) => document.getElementById(id)?.checked;
  const urgency = document.getElementById('wizUrgency')?.value || 'This Week';

  const services = [];
  let cost = 0;
  if (checked('wizReqVO')) { services.push('Virtual Office'); cost += 14988; }
  if (checked('wizReqGST')) { services.push('GST Registration'); cost += 1999; }
  if (checked('wizReqReg')) { services.push('Company Incorporation'); cost += 4999; }
  if (checked('wizReqTM')) { services.push('Trademark Registration'); cost += 1999; }
  if (checked('wizReqCW')) { services.push('Coworking Access'); cost += 9999; }
  if (checked('wizReqMR')) { services.push('Meeting Room Credits'); cost += 4999; }

  if (services.length === 0) services.push('Virtual Office');
  if (cost === 0) cost = 14988;

  // Bundle discount
  if (services.length >= 3) cost = Math.round(cost * 0.85);

  const time = urgency.includes('24') ? '24 Working Hours' : urgency.includes('Week') ? '3 – 5 Working Days' : '7 – 10 Working Days';

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('recBundleHeading', services.join(' + '));
  setText(
    'recBundleDesc',
    `Complete turnkey package including ${services.slice(0, 3).join(', ').toLowerCase()}${services.length > 3 ? ' and more' : ''} — with dedicated CA support and guaranteed activation.`,
  );
  setText('recCost', '₹' + cost.toLocaleString('en-IN') + ' (All-Inclusive)');
  setText('recTime', time);
  setText('recCity', wizardState.city);

  navigateWizard(5);
}
