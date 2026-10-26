import { animateSpring, createVelocityTracker, prefersReducedMotion, project, rubberband } from '@/lib/spring.js';
import { listen } from '@/lib/pageScope.js';
import { closeMobileNav } from './mobileDrawer.js';

/**
 * Swipe-to-close for the mobile navigation drawer.
 *
 * The panel tracks the finger one-to-one from wherever it was grabbed, resists past its open edge
 * instead of stopping dead, and on release continues at the speed of the flick: the resting point
 * is projected from that velocity, so a short fast swipe closes the drawer and a slow drag back
 * leaves it open. The spring is interruptible — grabbing the panel mid-flight picks it up at its
 * current position and speed rather than restarting.
 */

const CLOSE_RATIO = 0.4; // past this share of the width, a slow release still closes
const DIRECTION_THRESHOLD = 8; // px of movement before committing to a horizontal drag

let animation = null;

/*
 * The open panel is pinned by `transform: translateX(0) !important` in the legacy drawer styles,
 * so the live offset travels as a custom property that a single `is-dragging` rule applies.
 */
function setOffset(panel, overlay, x, width) {
  panel.classList.add('is-dragging');
  panel.style.setProperty('--drawer-x', `${x}px`);
  // The scrim dims in step with the panel, so the page behind comes back as it is pushed away.
  if (overlay) {
    overlay.classList.add('is-dragging');
    overlay.style.setProperty('--drawer-dim', String(Math.max(0, 1 - x / width)));
  }
}

function clearOffset(panel, overlay) {
  panel.classList.remove('is-dragging');
  panel.style.removeProperty('--drawer-x');
  panel.style.transition = '';
  if (overlay) {
    overlay.classList.remove('is-dragging');
    overlay.style.removeProperty('--drawer-dim');
  }
}

export function initDrawerGesture() {
  const drawer = document.getElementById('mobileDrawer');
  const panel = drawer?.querySelector('.mobile-drawer__panel');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (!drawer || !panel || !globalThis.PointerEvent) return;

  const tracker = createVelocityTracker();
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let offsetAtGrab = 0;
  let dragging = false;
  let decided = false;

  const isOpen = () => drawer.classList.contains('is-active');
  const width = () => panel.getBoundingClientRect().width || 320;

  const currentOffset = () => {
    const raw = panel.style.getPropertyValue('--drawer-x');
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
  };

  const settle = (to, velocity) => {
    const from = currentOffset();
    // A release that carried momentum earns a touch of overshoot; a slow drag settles flat.
    const damping = Math.abs(velocity) > 400 ? 0.82 : 1;
    animation = animateSpring({
      from,
      to,
      velocity,
      damping,
      response: 0.32,
      onUpdate: (value) => setOffset(panel, overlay, value, width()),
      onRest: () => {
        animation = null;
        if (to > 0) {
          closeMobileNav();
          clearOffset(panel, overlay);
        } else {
          clearOffset(panel, overlay);
        }
      },
    });
  };

  listen(panel, 'pointerdown', (event) => {
    if (!isOpen() || event.pointerType === 'mouse' || pointerId !== null) return;
    // Let scrollable content inside the drawer keep its own gesture.
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    decided = false;
    dragging = false;
    // Interrupting a running spring: carry on from the live position, never from the target.
    const live = animation?.stop();
    offsetAtGrab = live ? live.value : currentOffset();
    tracker.reset();
    tracker.add(event.clientX, event.timeStamp);
    animation = null;
  });

  listen(panel, 'pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (!decided) {
      if (Math.abs(dx) < DIRECTION_THRESHOLD && Math.abs(dy) < DIRECTION_THRESHOLD) return;
      // Vertical intent belongs to the drawer's own scrolling.
      if (Math.abs(dy) > Math.abs(dx)) {
        pointerId = null;
        return;
      }
      decided = true;
      dragging = true;
      panel.setPointerCapture(event.pointerId);
      panel.style.transition = 'none';
    }

    const raw = offsetAtGrab + dx;
    // Dragging the panel back past its open edge resists instead of tearing away.
    const x = raw >= 0 ? raw : -rubberband(-raw, width());
    tracker.add(event.clientX, event.timeStamp);
    setOffset(panel, overlay, x, width());
    event.preventDefault();
  });

  const release = (event) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragging) return;
    dragging = false;
    panel.style.transition = '';

    const velocity = tracker.velocity();
    const x = currentOffset();
    const w = width();

    if (prefersReducedMotion()) {
      const shouldClose = x + project(velocity) > w * CLOSE_RATIO;
      clearOffset(panel, overlay);
      if (shouldClose) closeMobileNav();
      return;
    }

    // Where the flick is heading decides the outcome, not where the finger happened to stop.
    const projected = x + project(velocity);
    const shouldClose = projected > w * CLOSE_RATIO;
    settle(shouldClose ? w : 0, velocity);
  };

  listen(panel, 'pointerup', release);
  listen(panel, 'pointercancel', release);
}
