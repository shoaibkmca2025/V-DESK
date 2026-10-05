import { closeModal } from '@/features/modals/modalManager.js';
import { listen } from '@/lib/pageScope.js';
import { closeMobileNav } from './mobileDrawer.js';

/** Escape closes the primary dialogs; wizard choice cards are keyboard operable. */
export function initAccessibility() {
  listen(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('quoteModal');
      closeModal('adminModal');
      closeModal('commandPaletteModal');
      closeMobileNav();
    }
  });

  document.querySelectorAll('.wizard__choice').forEach((choice) => {
    if (!choice.hasAttribute('tabindex')) choice.setAttribute('tabindex', '0');
    if (!choice.hasAttribute('role')) choice.setAttribute('role', 'button');
    listen(choice, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        choice.click();
      }
    });
  });
}
