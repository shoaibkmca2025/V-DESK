import { openCommandPalette } from '@/features/commandPalette/commandPalette.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';
import { openCustomerPortal } from '@/features/portal/customerPortal.js';
import { scrollToSection } from '@/features/ui/scroll.js';

/** Native-app style bottom navigation on mobile (PRD §64). */
export function switchMobileNav(tab) {
  document.querySelectorAll('.mobile-app-bottom-dock .mobile-dock-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  if (tab === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tab === 'search') {
    openCommandPalette();
  } else if (tab === 'bookings') {
    openMeetingBookingModal();
  } else if (tab === 'services') {
    scrollToSection('#voConfigurator');
  } else if (tab === 'account') {
    openCustomerPortal();
  }
}
