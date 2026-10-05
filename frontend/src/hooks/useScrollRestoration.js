import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

const positions = new Map();

/**
 * Scroll behaviour of a multi-page site on top of client-side routing:
 * new pages start at the top (or at the #hash target), back/forward restores the previous position.
 * Scrolling is instant so the CSS `scroll-behavior: smooth` does not animate page changes.
 */
export function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const keyRef = useRef(location.key);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const onScroll = () => positions.set(keyRef.current, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    keyRef.current = location.key;

    if (navigationType === 'POP' && positions.has(location.key)) {
      window.scrollTo({ top: positions.get(location.key), left: 0, behavior: 'instant' });
      return;
    }

    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.key, location.hash, navigationType]);
}
