import { switchMobileNav } from '@/features/layout/mobileBottomDock.js';

/** Native-app style bottom navigation (mobile). */
export default function MobileAppBottomDock() {
  return (
    <nav className="mobile-app-bottom-dock" aria-label="Mobile Navigation">
      <button type="button" className="mobile-dock-btn active" onClick={() => switchMobileNav('home')} data-tab="home">
        <i className="ph-bold ph-house" />
        <span>Home</span>
      </button>
      <button type="button" className="mobile-dock-btn" onClick={() => switchMobileNav('search')} data-tab="search">
        <i className="ph-bold ph-magnifying-glass" />
        <span>Search</span>
      </button>
      <button type="button" className="mobile-dock-btn" onClick={() => switchMobileNav('bookings')} data-tab="bookings">
        <i className="ph-bold ph-presentation" />
        <span>Bookings</span>
      </button>
      <button type="button" className="mobile-dock-btn" onClick={() => switchMobileNav('services')} data-tab="services">
        <i className="ph-bold ph-squares-four" />
        <span>Services</span>
      </button>
      <button type="button" className="mobile-dock-btn" onClick={() => switchMobileNav('account')} data-tab="account">
        <i className="ph-bold ph-user-circle" />
        <span>Account</span>
      </button>
    </nav>
  );
}
