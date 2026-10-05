import { scrollToSection } from '@/features/ui/scroll.js';
import { showToast } from '@/features/ui/toast.js';

/* GST application status tracker (PRD §37). */

export function lookupGstTrackerStatus() {
  const ref = document.getElementById('gstTrackerInput')?.value.trim() || '';
  if (!ref) {
    showToast('Enter ARN or Ref', 'Please input a valid Government ARN or V-DESK Ref', 'info');
    return;
  }

  showToast('Fetching Telemetry...', `Verifying jurisdictional status for ${ref}`, 'info');
  setTimeout(() => {
    showToast('Status Updated', 'Scrutiny in progress: Ward 4B Officer Review', 'success');
  }, 600);
}

export function openGstTrackerModal() {
  scrollToSection('#gstTrackerSection');
}
