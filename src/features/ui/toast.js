import { escapeHtml } from '@/lib/html.js';

/** Toast notification stack (bottom-right on desktop). */
export function showToast(title, desc = '', type = 'info') {
  let container = document.getElementById('toastContainer') || document.getElementById('toastStack');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'vd-toast-container';
    document.body.appendChild(container);
  }

  // Auto-detect status type if not explicitly overridden
  if (type === 'info' && typeof title === 'string') {
    const lower = title.toLowerCase();
    if (title.startsWith('✓') || lower.includes('success') || lower.includes('received') || lower.includes('copied')) {
      type = 'success';
    } else if (lower.includes('error') || lower.includes('fail') || lower.includes('invalid')) {
      type = 'error';
    }
  }

  const toast = document.createElement('div');
  toast.className = `vd-toast ${type}`;

  let iconClass = 'ph-info';
  if (type === 'success') iconClass = 'ph-check-circle';
  if (type === 'error') iconClass = 'ph-warning-circle';

  toast.innerHTML = `
    <i class="ph-bold ${iconClass} vd-toast__icon"></i>
    <div class="vd-toast__body">
      <div class="vd-toast__title">${escapeHtml(title)}</div>
      ${desc ? `<div class="vd-toast__desc">${escapeHtml(desc)}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
