import { showToast } from '@/features/ui/toast.js';

/* Progressive Web App: service worker registration and the install banner (#pwaInstallBanner). */

let deferredPwaPrompt = null;
let initialised = false;

/** Called once per app session. */
export function initPwaInstaller() {
  if (initialised) return;
  initialised = true;

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    const registerSW = () => {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .then((reg) => console.log('[V-DESK PWA] Service Worker registered with scope:', reg.scope))
        .catch((err) => console.log('[V-DESK PWA] Service Worker registration note:', err));
    };
    if (document.readyState === 'complete') registerSW();
    else window.addEventListener('load', registerSW, { once: true });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;

    setTimeout(() => {
      const banner = document.getElementById('pwaInstallBanner');
      let dismissed = false;
      try {
        dismissed = Boolean(sessionStorage.getItem('pwa_banner_dismissed'));
      } catch {
        /* storage unavailable */
      }
      if (banner && !dismissed) banner.classList.add('is-active');
    }, 3500);
  });
}

export function dismissPwaBanner() {
  document.getElementById('pwaInstallBanner')?.classList.remove('is-active');
  try {
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  } catch {
    /* storage unavailable */
  }
}

export function triggerPwaInstall() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('V-DESK App Installed ✓', 'Launched in dedicated standalone window.', 'success');
      }
      deferredPwaPrompt = null;
      dismissPwaBanner();
    });
  } else {
    showToast('V-DESK Progressive Web App', 'Bookmark or add to your home screen via browser menu.', 'info');
    dismissPwaBanner();
  }
}
