import { Link, useParams } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import { LEGAL_DOCUMENTS } from '@/content/legal.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';

export const LEGAL_ROUTES = {
  privacy: { path: 'privacy', label: 'Privacy Policy', icon: 'ph-lock-key' },
  terms: { path: 'terms', label: 'Terms of Service', icon: 'ph-scroll' },
  refund: { path: 'refund-policy', label: 'Refund Policy', icon: 'ph-arrow-u-up-left' },
  compliance: { path: 'compliance', label: 'GST / MCA Compliance', icon: 'ph-seal-check' },
};

const BY_PATH = Object.fromEntries(Object.entries(LEGAL_ROUTES).map(([key, r]) => [r.path, key]));

/** /legal/:doc — full-page version of the legal documents (also shown in the footer dialog). */
export default function LegalPage() {
  const { doc } = useParams();
  const key = BY_PATH[doc];
  const content = key && LEGAL_DOCUMENTS[key];
  if (!content) return <NotFoundPage />;

  const meta = { title: `${content.title} | V-DESK`, description: `${LEGAL_ROUTES[key].label} of V-DESK Workspace & Consulting LLP.` };
  const updated = '15 September 2026';

  return (
    <SiteLayout page="legal" meta={meta}>
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Legal' }, { label: LEGAL_ROUTES[key].label }]} />
        <section className="ui-compact-hero" style={{ padding: '48px 0' }}>
          <div className="container" style={{ maxWidth: '960px' }}>
            <div className="hero-badge-pill">
              <i className={`ph-bold ${LEGAL_ROUTES[key].icon}`} />
              <span>Legal & Compliance</span>
            </div>
            <h1 className="hero-luxury-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>{content.title}</h1>
            <p className="hero-luxury-desc" style={{ marginBottom: 0 }}>
              V-DESK Workspace & Consulting LLP (LLPIN AAY-9842) • Last updated {updated}
            </p>
          </div>
        </section>

        <section className="section" style={{ padding: '56px 0', background: '#FFFFFF' }}>
          <div className="container" style={{ maxWidth: '960px', display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '32px', alignItems: 'start' }}>
            <nav aria-label="Legal documents" style={{ position: 'sticky', top: '100px', background: '#FAF8F3', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '16px' }}>
              <strong style={{ color: '#081D40', display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Documents</strong>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '6px' }}>
                {Object.entries(LEGAL_ROUTES).map(([k, r]) => (
                  <li key={k}>
                    <Link to={`/legal/${r.path}`} className={k === key ? 'btn btn--primary btn--sm btn--full' : 'btn btn--ghost btn--sm btn--full'} style={{ justifyContent: 'flex-start' }}>
                      <i className={`ph-bold ${r.icon}`} /> {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <article className="legal-modal__body" style={{ fontSize: '0.98rem', lineHeight: '1.8', color: '#26344A' }} dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
