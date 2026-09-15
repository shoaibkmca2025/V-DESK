import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { closeModal, openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';

/* Digital KYC (PRD §46–47). Nothing sensitive is written to localStorage. */

export function resetKycState() {}

export function switchKycTab(tabName, btn) {
  document.querySelectorAll('.kyc-tab-btn').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.kyc-pane').forEach((p) => p.classList.remove('active'));
  document.getElementById(`kycPane${tabName}`)?.classList.add('active');
}

export function openDigitalKycModal() {
  if (openActiveModal('digitalKycModal')) trackSearchEvent('kyc_started');
}

export function simulateKycDocUpload(input, docType) {
  const file = input?.files?.[0];
  if (!file) return;
  showToast('Document Uploaded', `${docType} (${file.name}) received securely.`, 'success');
  trackSearchEvent('document_uploaded', { docType, fileName: file.name });
}

export function submitKycApplication() {
  const consent = document.getElementById('kycConsentCheckbox')?.checked;
  if (!consent) {
    showToast('Consent Required', 'Please confirm statutory verification consent', 'info');
    return;
  }

  showToast('KYC Application Submitted', 'Compliance team will verify documents within 4 working hours.', 'success');
  closeModal('digitalKycModal');
  trackSearchEvent('kyc_submitted');
}
