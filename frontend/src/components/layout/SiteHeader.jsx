import { Link } from 'react-router';
import { HEADER_NAV } from '@/config/navigation.js';
import { openCommandPalette } from '@/features/commandPalette/commandPalette.js';
import { openCompanyRegModal } from '@/features/companyRegistration/companyRegistration.js';
import { openEnterpriseSuiteModal } from '@/features/enterprise/enterpriseSuite.js';
import { openGstTrackerModal } from '@/features/gst/gstTracker.js';
import { openDigitalKycModal } from '@/features/kyc/kyc.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { asset } from '@/lib/assets.js';

const NAV_ACTIONS = { openCompanyRegModal, openEnterpriseSuiteModal, openGstTrackerModal, openDigitalKycModal };

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Renders a nav target: in-page anchor (`href`), route (`to`) or dialog (`action`). */
function NavTarget({ target, className, children, ...rest }) {
  if (target.to) {
    return (
      <Link to={target.to} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  if (target.action) {
    return (
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          NAV_ACTIONS[target.action]();
        }}
        className={className}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <a href={target.href} className={className} {...rest}>
      {children}
    </a>
  );
}

/** Picks the homepage or site-wide variant of a nav entry. */
function targetFor(entry, isHome) {
  return (isHome ? entry.home : entry.site) ?? entry;
}

export default function SiteHeader({ page }) {
  const isHome = page === 'home';

  return (
    <header className="site-header" id="siteHeader">
      <div className="container header-container">
        <NavTarget target={isHome ? { href: '#top' } : { to: '/' }} className="header-logo" aria-label="V-DESK Home">
          <img src={asset('assets/vdesk-logo-compact.png')} alt="V-DESK Workspace & Consulting LLP" className="header-logo__full-img" />
        </NavTarget>
        <nav className="header-nav" id="desktopNav" aria-label="Main Navigation">
          <ul className="header-nav__list">
            {HEADER_NAV.filter((entry) => !entry.hiddenOn?.includes(page)).map((entry) => (
              <li key={entry.label} className={cx('header-nav__item', entry.dropdown && 'header-nav__item--has-dropdown')}>
                <NavTarget
                  target={targetFor(entry, isHome)}
                  className={cx('header-nav__link', entry.activeOn?.includes(page) && 'active')}
                >
                  {entry.label}
                  {entry.dropdown && <i className="ph-bold ph-caret-down" />}
                </NavTarget>
                {entry.dropdown && (
                  <ul className="header-nav__dropdown">
                    {entry.dropdown.map((item) => (
                      <li key={item.title}>
                        <NavTarget
                          target={targetFor(item, isHome)}
                          className={cx('dropdown-item', item.activeOn?.includes(page) && 'active')}
                        >
                          <i className={`ph-bold ${item.icon}`} />
                          <div>
                            <strong>{item.title}</strong>
                            <span>{item.subtitle}</span>
                          </div>
                        </NavTarget>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          <button className="header-search-trigger" onClick={() => openCommandPalette()} aria-label="Quick Search (Ctrl+K)">
            <i className="ph-bold ph-magnifying-glass" /> <span className="search-label">Quick Search</span>{' '}
            <kbd className="search-kbd">⌘K</kbd>
          </button>
          {isHome ? (
            <Link to="/contact" className="header-contact-link">
              <i className="ph-bold ph-whatsapp-logo" /> <span>Contact</span>
            </Link>
          ) : (
            <a
              href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20a%20workspace%20quote"
              target="_blank"
              rel="noopener"
              className={cx('header-contact-link', page === 'contact' && 'active')}
            >
              <i className="ph-bold ph-whatsapp-logo" /> <span>Contact</span>
            </a>
          )}
          <button className="btn btn--gold btn--sm header-btn-quote" onClick={() => openQuoteModal('Navbar Header')}>
            <i className="ph-bold ph-paper-plane-tilt" /> Get a Quote
          </button>
          <button className="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle Navigation Menu" aria-expanded="false">
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>
    </header>
  );
}
