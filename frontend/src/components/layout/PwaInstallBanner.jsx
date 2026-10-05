import { dismissPwaBanner, triggerPwaInstall } from '@/features/pwa/pwaInstaller.js';

/** Progressive Web App install prompt. */
export default function PwaInstallBanner() {
  return (
    <div className="pwa-install-banner" id="pwaInstallBanner">
      <div className="pwa-banner-icon">
        <i className="ph-bold ph-device-mobile" />
      </div>
      <div className="pwa-banner-content">
        <h5>Install V-DESK Platform</h5>
        <p>Fast offline access, booking notifications & quick search.</p>
      </div>
      <div className="pwa-banner-actions">
        <button
          className="btn btn--gold btn--sm"
          onClick={() => triggerPwaInstall()}
          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
        >
          Install
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => dismissPwaBanner()}
          style={{ padding: '6px', fontSize: '0.75rem', color: '#94A3B8' }}
        >
          <i className="ph-bold ph-x" />
        </button>
      </div>
    </div>
  );
}
