import { Link, useParams } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import { getGuide, GUIDES } from '@/data/guides.js';
import { copyToClipboard } from '@/features/ui/clipboard.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';
import NotFoundPage from '@/pages/not-found/NotFoundPage.jsx';

const RELATED_CTA = {
  GST: ['GST Registration', '/services/gst-registration'],
  Incorporation: ['Company Registration', '/services/company-registration'],
  Workspace: ['Coworking Spaces', '/coworking-spaces'],
  Compliance: ['Virtual Office', '/services/virtual-office'],
};

/** /resources/:slug — long-form guide with table of contents and related reads. */
export default function GuidePage() {
  const { slug } = useParams();
  const guide = getGuide(slug);
  if (!guide) return <NotFoundPage />;

  const related = GUIDES.filter((g) => g.slug !== guide.slug && g.category === guide.category).concat(GUIDES.filter((g) => g.slug !== guide.slug && g.category !== guide.category)).slice(0, 3);
  const [ctaLabel, ctaTo] = RELATED_CTA[guide.category];
  const meta = { title: `${guide.title} | V-DESK Resources`, description: guide.excerpt };

  return (
    <SiteLayout page="guide" meta={meta}>
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Resources', to: '/resources' }, { label: guide.category, to: '/resources' }, { label: guide.title }]} />

        <section className="ui-compact-hero" style={{ padding: '56px 0' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <div className="hero-badge-pill">
              <i className="ph-bold ph-book-open" />
              <span>
                {guide.category} • {guide.readTime} min read
              </span>
            </div>
            <h1 className="hero-luxury-title" style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.8rem)' }}>{guide.title}</h1>
            <p className="hero-luxury-desc">{guide.excerpt}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              <span>
                <i className="ph-bold ph-calendar" /> {new Date(guide.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              <span>
                <i className="ph-bold ph-seal-check" /> Reviewed by V-DESK Compliance Desk
              </span>
              <button type="button" className="btn btn--outline btn--sm" onClick={() => copyToClipboard(window.location.href, 'Guide link')}>
                <i className="ph-bold ph-share-network" /> Share
              </button>
            </div>
          </div>
        </section>

        <section className="section" style={{ padding: '60px 0', background: '#FFFFFF' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <nav aria-label="Table of contents" style={{ background: '#FAF8F3', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '18px 22px', marginBottom: '32px' }}>
              <strong style={{ color: '#081D40', display: 'block', marginBottom: '8px' }}>In this guide</strong>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '0.9rem', lineHeight: '1.9' }}>
                {guide.sections.map(([heading], i) => (
                  <li key={heading}>
                    <a href={`#section-${i + 1}`} style={{ color: '#081D40' }}>
                      {heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <article className="legal-modal__body" style={{ fontSize: '1rem', lineHeight: '1.8', color: '#26344A' }}>
              {guide.sections.map(([heading, body], i) => (
                <section key={heading} id={`section-${i + 1}`} style={{ marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '1.35rem', color: '#081D40', margin: '0 0 10px 0' }}>{heading}</h2>
                  <p style={{ margin: 0 }}>{body}</p>
                </section>
              ))}
            </article>
            <div style={{ background: '#081D40', borderRadius: '14px', padding: '26px', color: '#FFF', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginTop: '20px' }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#FFF' }}>Need this done for you?</strong>
                <div style={{ color: '#CBD5E1', fontSize: '0.88rem' }}>Our compliance desk handles the paperwork end-to-end.</div>
              </div>
              <Link to={ctaTo} className="btn btn--gold">
                {ctaLabel} <i className="ph-bold ph-arrow-right" />
              </Link>
            </div>
          </div>
        </section>

        <section className="section" style={{ padding: '50px 0', background: '#F8FAFC' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h3 style={{ color: '#081D40', marginBottom: '16px' }}>Related reading</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {related.map((g) => (
                <Link key={g.slug} to={`/resources/${g.slug}`} className="spotlight-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', display: 'block' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#C59239', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{g.category}</span>
                  <strong style={{ display: 'block', color: '#081D40', margin: '6px 0', lineHeight: '1.4' }}>{g.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{g.readTime} min read</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CtaStrip source={`Guide: ${guide.slug}`} />
      </main>
    </SiteLayout>
  );
}
