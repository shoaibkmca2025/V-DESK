import { Fragment } from 'react';
import { Link } from 'react-router';
import { FOOTER_COLUMNS } from '@/config/navigation.js';
import { handleFooterRateRequest } from '@/features/layout/footer.js';
import { openLegalModal } from '@/features/legal/legalModal.js';
import { filterLocationsByCity } from '@/features/locations/locationExplorer.js';
import { smoothScrollToTop } from '@/features/ui/scroll.js';
import { asset } from '@/lib/assets.js';

const LEGAL_LINKS = [
  ['terms', 'Terms of Service'],
  ['privacy', 'Privacy Policy'],
  ['refund', 'Refund Policy'],
  ['compliance', 'GST/MCA Compliance'],
];

function FooterLink({ link, isHome }) {
  const onClick = link.city ? () => filterLocationsByCity(link.city) : undefined;
  const content = (
    <>
      <i className="ph-bold ph-caret-right" />
      {link.label}
    </>
  );
  return isHome ? (
    <a href={link.href} className="footer__link" onClick={onClick}>
      {content}
    </a>
  ) : (
    <Link to={link.to} className="footer__link" onClick={onClick}>
      {content}
    </Link>
  );
}

export default function SiteFooter({ page }) {
  const isHome = page === 'home';

  return (
    <footer className="site-footer" id="siteFooter">
      <div className="footer__shimmer-beam" aria-hidden="true" />
      <div className="footer__mesh-grid" aria-hidden="true" />
      <div className="footer__aurora footer__aurora--1" aria-hidden="true" />
      <div className="footer__aurora footer__aurora--2" aria-hidden="true" />
      <div className="footer__aurora footer__aurora--3" aria-hidden="true" />
      <div className="footer__star footer__star--1" aria-hidden="true" />
      <div className="footer__star footer__star--2" aria-hidden="true" />
      <div className="footer__star footer__star--3" aria-hidden="true" />
      <div className="footer__star footer__star--4" aria-hidden="true" />
      <div className="footer__star footer__star--5" aria-hidden="true" />
      <div className="container">
        <div className="footer__grid">
          <div className="footer__col-brand">
            <div className="footer-brand-wrap">
              <a href="#top" className="footer-logo-card" aria-label="V-DESK Home">
                <img src={asset('assets/vdesk-logo.svg')} alt="V-DESK Workspace & Consulting LLP" className="footer-logo__img" />
                <span className="card-glare" aria-hidden="true" />
              </a>
              <div className="footer__live-status">
                <span className="status-indicator">
                  <span className="status-ping" />
                  <span className="status-dot" />
                </span>
                <span>
                  <strong>Operational Network Active</strong> • 10+ Prime Metros
                </span>
              </div>
              <p className="footer__brand-desc">
                V-DESK Workspace & Consulting LLP is India's premier business infrastructure platform, uniting verified
                virtual offices, coworking, private cabins and enterprise compliance across 10+ prime commercial hubs.
              </p>
              <div className="footer__badge">
                <i className="ph-bold ph-shield-check" />
                <span>LLPIN: AAY-9842 • MCA & GST Authorized Network</span>
              </div>
              <div className="footer__rate-desk">
                <div className="footer__rate-header">
                  <span className="footer__rate-tag">
                    <i className="ph-bold ph-lightning" />
                    2026 Rate Matrix
                  </span>
                  <span className="footer__rate-sub">Instant Dispatch</span>
                </div>
                <form className="footer__rate-form" onSubmit={(event) => handleFooterRateRequest(event)}>
                  <div className="footer__rate-input-group">
                    <input
                      type="tel"
                      id="footerRatePhone"
                      className="footer__rate-input"
                      placeholder="Enter WhatsApp No."
                      pattern="[0-9]{10}"
                      required
                    />{' '}
                    <button type="submit" className="footer__rate-btn" aria-label="Get Rate Matrix">
                      <i className="ph-bold ph-arrow-right" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="footer__col">
              <h4 className="footer__heading">
                <i className={`ph-bold ${column.icon}`} /> {column.heading}
              </h4>
              <ul className="footer__nav">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} isHome={isHome} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer__col footer__col-contact">
            <h4 className="footer__heading">
              <i className="ph-bold ph-headset" /> Direct Desk
            </h4>
            <div className="footer__contact-cards">
              <a href="tel:+919876543210" className="footer-contact-item">
                <div className="contact-item__icon">
                  <i className="ph-bold ph-phone-call" />
                </div>
                <div className="contact-item__info">
                  <span className="contact-item__label">Direct Helpline</span>{' '}
                  <span className="contact-item__val">+91 98765 43210</span>
                </div>
              </a>{' '}
              <a
                href="https://wa.me/919876543210?text=Hi%20V-DESK"
                target="_blank"
                rel="noopener"
                className="footer-contact-item footer-contact-item--whatsapp"
              >
                <div className="contact-item__icon">
                  <i className="ph-bold ph-whatsapp-logo" />
                </div>
                <div className="contact-item__info">
                  <span className="contact-item__label">WhatsApp Concierge</span>{' '}
                  <span className="contact-item__val">Instant Connect</span>
                </div>
              </a>{' '}
              <a href="mailto:contact@vdeskworkspace.com" className="footer-contact-item">
                <div className="contact-item__icon">
                  <i className="ph-bold ph-envelope" />
                </div>
                <div className="contact-item__info">
                  <span className="contact-item__label">Official Inquiries</span>{' '}
                  <span className="contact-item__val">contact@vdeskworkspace.com</span>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="footer__bottom-left">
            <span>© 2026 V-DESK Workspace & Consulting LLP. All Rights Reserved.</span>{' '}
            <span className="footer__divider">•</span> <span>Government Registered Commercial Network</span>
          </div>
          <div className="footer__bottom-links">
            {LEGAL_LINKS.map(([tab, label], index) => (
              <Fragment key={tab}>
                {index > 0 && (
                  <>
                    {' '}
                    <span className="footer__divider">•</span>{' '}
                  </>
                )}
                <button type="button" className="footer__legal-btn" onClick={() => openLegalModal(tab)}>
                  {label}
                </button>
              </Fragment>
            ))}
          </div>
          <button className="footer__scroll-top" onClick={() => smoothScrollToTop()} aria-label="Scroll back to top">
            <i className="ph-bold ph-arrow-up" />
          </button>
        </div>
      </div>
    </footer>
  );
}
