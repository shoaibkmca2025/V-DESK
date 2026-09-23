import { Link } from 'react-router';
import { FOOTER_COLUMNS } from '@/config/navigation.js';
import { asset } from '@/lib/assets.js';

const LEGAL_LINKS = [
  ['/legal/terms', 'Terms'],
  ['/legal/privacy', 'Privacy'],
  ['/legal/refund-policy', 'Refund Policy'],
  ['/legal/compliance', 'GST/MCA Compliance'],
];

/** Site footer: brand + contact, four link columns, legal row. */
export default function SiteFooter() {
  return (
    <footer className="ui-footer" id="siteFooter">
      <div className="ui-container">
        <div className="ui-footer__grid">
          <div className="ui-footer__brand">
            <Link to="/" className="ui-footer__logo" aria-label="V-DESK Home">
              <img src={asset('assets/vdesk-logo-compact-white.png')} alt="V-DESK Workspace & Consulting LLP" />
            </Link>
            <p>Virtual offices, coworking, meeting rooms and company registration across 10+ Indian cities.</p>
            <ul className="ui-footer__contact">
              <li>
                <a href="tel:+919876543210">
                  <i className="ph-bold ph-phone-call" /> +91 98765 43210
                </a>
              </li>
              <li>
                <a href="https://wa.me/919876543210?text=Hi%20V-DESK" target="_blank" rel="noopener">
                  <i className="ph-bold ph-whatsapp-logo" /> Chat on WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:contact@vdeskworkspace.com">
                  <i className="ph-bold ph-envelope" /> contact@vdeskworkspace.com
                </a>
              </li>
            </ul>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} className="ui-footer__col" aria-label={column.heading}>
              <h4>{column.heading}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="ui-footer__bottom">
          <span>© 2026 V-DESK Workspace & Consulting LLP • LLPIN AAY-9842</span>
          <nav aria-label="Legal">
            {LEGAL_LINKS.map(([to, label]) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
