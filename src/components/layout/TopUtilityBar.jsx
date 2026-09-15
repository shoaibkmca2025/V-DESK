import { navigateTo } from '@/lib/navigation.js';

/** Announcement / contact utility bar above the header. */
export default function TopUtilityBar() {
  return (
    <div className="top-utility-bar">
      <div className="container top-utility-container">
        <div className="top-utility-left">
          <span className="utility-badge">
            <i className="ph-bold ph-shield-check" />
            GST & MCA Compliant
          </span>
          <span className="utility-text">India's Premier Virtual Office & Business Infrastructure Network</span>
        </div>
        <div className="top-utility-right">
          <a href="tel:+919876543210" className="top-utility-link">
            <i className="ph-bold ph-phone-call" />
            +91 98765 43210
          </a>
          <a
            href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20need%20assistance%20with%20workspace%20infrastructure"
            target="_blank"
            rel="noopener"
            className="top-utility-link whatsapp-link"
          >
            <i className="ph-bold ph-whatsapp-logo" />
            WhatsApp
          </a>
          <button className="top-utility-btn" onClick={() => navigateTo('/portal')}>
            <i className="ph-bold ph-user-circle" /> Client Portal
          </button>
          <button className="top-utility-btn" onClick={() => navigateTo('/meeting-rooms')}>
            <i className="ph-bold ph-presentation" /> Book Room
          </button>
          <button className="top-utility-btn" onClick={() => navigateTo('/locations')}>
            <i className="ph-bold ph-map-pin" /> All Locations
          </button>
          <button className="top-utility-btn" onClick={() => navigateTo('/admin')}>
            <i className="ph-bold ph-gear-six" /> Admin CRM
          </button>
        </div>
      </div>
    </div>
  );
}
