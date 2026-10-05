import { Link } from 'react-router';
import { HOME_DRAWER_NAV, SITE_DRAWER_NAV } from '@/config/navigation.js';
import { openCommandPalette } from '@/features/commandPalette/commandPalette.js';
import { closeMobileNav } from '@/features/layout/mobileDrawer.js';
import { openConsultationModal, openQuoteModal } from '@/features/quote/quoteModal.js';
import { asset } from '@/lib/assets.js';

/** Off-canvas navigation for tablets and phones. */
export default function MobileDrawer({ page }) {
  const isHome = page === 'home';
  const items = isHome ? HOME_DRAWER_NAV : SITE_DRAWER_NAV;

  return (
    <div className="mobile-drawer" id="mobileDrawer" aria-hidden="true">
      <div className="mobile-drawer__overlay" id="mobileDrawerOverlay" />
      <div className="mobile-drawer__panel">
        <div className="mobile-drawer__header">
          <div className="mobile-drawer__brand">
            {isHome ? (
              <a href="#top" className="mobile-drawer__brand-link" onClick={() => closeMobileNav()}>
                <img src={asset('assets/vdesk-logo-compact-white.png')} alt="V-DESK Workspace & Consulting LLP" className="mobile-drawer__full-logo" />
              </a>
            ) : (
              <Link to="/" className="mobile-drawer__brand-link" onClick={() => closeMobileNav()}>
                <img src={asset('assets/vdesk-logo-compact-white.png')} alt="V-DESK Workspace & Consulting LLP" className="mobile-drawer__full-logo" />
              </Link>
            )}
          </div>
          <button
            className="mobile-drawer__close"
            id="mobileDrawerClose"
            aria-label="Close Navigation Menu"
            onClick={isHome ? undefined : () => closeMobileNav()}
          >
            <i className="ph-bold ph-x" />
          </button>
        </div>
        <div className="mobile-drawer__body">
          <button
            className="mobile-search-btn"
            onClick={() => {
              closeMobileNav();
              openCommandPalette();
            }}
          >
            <i className="ph-bold ph-magnifying-glass" />
            <span>Search Cities & Workspaces...</span>
            <kbd>Ctrl+K</kbd>
          </button>
          <nav className="mobile-nav" aria-label="Mobile Navigation">
            <ul className="mobile-nav__list">
              {items.map((item) => {
                if (item.heading) {
                  return (
                    <li key={item.heading} className="mobile-nav__heading">
                      {item.heading}
                    </li>
                  );
                }
                const className = item.active || item.page === page ? 'mobile-nav__link active' : 'mobile-nav__link';
                const content = (
                  <>
                    <i className={`ph-bold ${item.icon}`} />
                    {item.label}
                  </>
                );
                return (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to} className={className} onClick={() => closeMobileNav()}>
                        {content}
                      </Link>
                    ) : (
                      <a href={item.href} className={className} onClick={() => closeMobileNav()}>
                        {content}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mobile-drawer__ctas">
            <button
              className="btn btn--gold btn--full"
              onClick={() => {
                openQuoteModal('Mobile Drawer');
                closeMobileNav();
              }}
            >
              <i className="ph-bold ph-paper-plane-tilt" />
              Get Instant Quote
            </button>
            <button
              className="btn btn--outline btn--full"
              onClick={() => {
                openConsultationModal();
                closeMobileNav();
              }}
            >
              <i className="ph-bold ph-calendar-check" />
              Book Free Consultation
            </button>
            <div className="mobile-drawer__quick-links">
              <a href="tel:+919876543210" className="btn btn--glass btn--sm">
                <i className="ph-bold ph-phone-call" />
                Call Us
              </a>
              <a href="https://wa.me/919876543210?text=Hi%20V-DESK" target="_blank" rel="noopener" className="btn btn--glass btn--sm">
                <i className="ph-bold ph-whatsapp-logo" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
