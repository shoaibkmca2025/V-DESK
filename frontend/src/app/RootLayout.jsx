import { Fragment, useEffect } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router';
import { useScrollRestoration } from '@/hooks/useScrollRestoration.js';
import { setNavigator } from '@/lib/navigation.js';

/**
 * Router root. Each pathname renders a fresh page tree (keyed Fragment) so every page starts from
 * its pristine markup and state, exactly like a full page load on the original site.
 */
export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  useScrollRestoration();

  return <Fragment key={location.pathname}>{outlet}</Fragment>;
}
