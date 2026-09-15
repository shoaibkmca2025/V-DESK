import { Link } from 'react-router';

/** Slim contact bar above the header. */
export default function TopUtilityBar() {
  return (
    <div className="ui-topbar">
      <div className="ui-container ui-topbar__inner">
        <span className="ui-topbar__note">
          <i className="ph-bold ph-shield-check" /> GST & MCA compliant addresses in 10+ cities
        </span>
        <div className="ui-topbar__links">
          <a href="tel:+919876543210">
            <i className="ph-bold ph-phone-call" /> +91 98765 43210
          </a>
          <a href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20assistance" target="_blank" rel="noopener">
            <i className="ph-bold ph-whatsapp-logo" /> WhatsApp
          </a>
          <Link to="/portal">
            <i className="ph-bold ph-user-circle" /> My Account
          </Link>
        </div>
      </div>
    </div>
  );
}
