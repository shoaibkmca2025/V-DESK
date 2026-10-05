import { useEffect, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { PAGES } from '@/config/pages.js';
import { asset } from '@/lib/assets.js';
import { rawStyle } from '@/lib/domRefs.js';

const BODY_STYLE =
  "background: #05132B; color: #FFFFFF; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Inter', sans-serif; text-align: center; padding: 20px;";

/** Friendly aliases for mistyped or shortened URLs (e.g. /coworking → /coworking-spaces). */
const ROUTE_ALIASES = {
  'virtual-office': '/virtual-office',
  coworking: '/coworking-spaces',
  'coworking-spaces': '/coworking-spaces',
  'meeting-rooms': '/meeting-rooms',
  locations: '/locations',
  pricing: '/pricing',
  'company-registration': '/company-registration',
  portal: '/portal',
  admin: '/admin',
  contact: '/contact',
};

/** 404 page (rendered without the site chrome, like the original standalone 404.html). */
export default function NotFoundPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = pathname.toLowerCase();
    const match = Object.entries(ROUTE_ALIASES).find(([key]) => path.includes(key));
    if (match && match[1] !== path) navigate(match[1], { replace: true });
  }, [pathname, navigate]);

  useLayoutEffect(() => {
    document.title = PAGES.notFound.title;
    document.documentElement.className = '';
    document.body.className = '';
    document.body.setAttribute('style', BODY_STYLE);
    return () => document.body.removeAttribute('style');
  }, []);

  return (
    <div
      ref={rawStyle(
        'max-width: 620px; background: #081D40; border: 1px solid rgba(197, 146, 57, 0.3); border-radius: 20px; padding: 48px 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);',
      )}
    >
      <Link to="/" style={{ display: 'inline-block', marginBottom: '24px' }}>
        <img
          src={asset('assets/vdesk-logo-compact-white.png')}
          alt="V-DESK"
          style={{ height: '48px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
        />
      </Link>
      <div
        style={{
          fontSize: '5rem',
          fontWeight: '800',
          color: '#C59239',
          lineHeight: '1',
          marginBottom: '12px',
          letterSpacing: '-0.03em',
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: '1.6rem', color: '#FFFFFF', margin: '0 0 12px 0' }}>Commercial Destination Not Found</h1>
      <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', margin: '0 0 28px 0' }}>
        The requested workspace route or document URL has moved, been archived, or requires verified portal access.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
        <Link
          to="/"
          className="btn btn--primary"
          style={{ background: '#C59239', color: '#05132B', borderColor: '#C59239', fontWeight: '700' }}
        >
          <i className="ph-bold ph-house" />
          Return to Homepage
        </Link>
        <Link
          to="/virtual-office"
          className="btn btn--outline"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }}
        >
          <i className="ph-bold ph-buildings" />
          Virtual Office
        </Link>
        <Link
          to="/coworking-spaces"
          className="btn btn--outline"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }}
        >
          <i className="ph-bold ph-laptop" />
          Coworking
        </Link>
        <Link to="/portal" className="btn btn--outline" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }}>
          <i className="ph-bold ph-user-circle" />
          Client Portal
        </Link>
      </div>
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '18px',
          fontSize: '0.8rem',
          color: '#64748B',
        }}
      >
        Need immediate assistance?{' '}
        <a
          href="https://wa.me/919876543210?text=Hi%20V-DESK,%20I%20reached%20a%20404%20link"
          style={{ color: '#10B981', textDecoration: 'none', fontWeight: '600' }}
        >
          <i className="ph-bold ph-whatsapp-logo" /> Connect with WhatsApp Concierge
        </a>
      </div>
    </div>
  );
}
