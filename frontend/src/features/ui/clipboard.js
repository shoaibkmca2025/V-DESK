import { escapeHtml } from '@/lib/html.js';
import { showToast } from './toast.js';

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } catch {
    showToast('Failed to copy. Please copy manually.');
  }
  document.body.removeChild(textarea);
}

export function copyToClipboard(text, label = 'Copied') {
  const cleanLabel = label && label.length > 0 ? label : 'Item';

  // Floating confirmation banner
  let banner = document.querySelector('.toast-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'toast-banner';
    Object.assign(banner.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#05132B',
      color: '#FFFFFF',
      border: '1px solid #C59239',
      borderRadius: '8px',
      padding: '12px 18px',
      zIndex: '999999',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    });
    document.body.appendChild(banner);
  }
  banner.innerHTML = `<i class="ph-bold ph-check" style="color: #10B981;"></i> <strong>${escapeHtml(cleanLabel)} Copied to Clipboard!</strong> <span style="font-size: 0.8rem; color: #94A3B8;">(${escapeHtml(text)})</span>`;
  banner.style.display = 'flex';

  setTimeout(() => {
    if (banner && banner.parentNode) banner.style.display = 'none';
  }, 3000);

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
  showToast(`${cleanLabel} Copied!`, text, 'success');
}
