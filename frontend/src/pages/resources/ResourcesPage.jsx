import { useState } from 'react';
import { Link } from 'react-router';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import SectionHeader from '@/components/page/SectionHeader.jsx';
import { GUIDE_CATEGORIES, GUIDES } from '@/data/guides.js';

const CATEGORY_ICON = { GST: 'ph-receipt', Incorporation: 'ph-certificate', Workspace: 'ph-laptop', Compliance: 'ph-shield-check' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** /resources — knowledge centre index (PRD §9.1 blog/guides). */
export default function ResourcesPage() {
  const [category, setCategory] = useState('All');
  const list = GUIDES.filter((g) => category === 'All' || g.category === category);

  return (
    <main id="main-content" className="ui-page">
      <PageHero
        id="resourcesHero"
        badge="Knowledge Centre"
        badgeIcon="ph-book-open"
        title="Guides on GST, Incorporation"
        highlight="& Modern Workspaces"
        description="Practical, regulation-aware guides written by our compliance desk — the same answers we give clients every day."
        stats={[
          [String(GUIDES.length), 'Guides'],
          ['CA / CS', 'Reviewed'],
          ['2026', 'Rules Updated'],
          ['Free', 'Always'],
        ]}
        actions={
          <Link to="/faqs" className="btn btn--outline btn--lg">
            <i className="ph-bold ph-question" />
            Browse FAQs
          </Link>
        }
      />

      <section className="section" style={{ padding: '60px 0', background: '#F8FAFC' }}>
        <div className="container">
          <div className="cw-amenities-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
            {GUIDE_CATEGORIES.map((c) => (
              <button key={c} type="button" className={c === category ? 'cw-filter-pill active' : 'cw-filter-pill'} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {list.map((guide) => (
              <article key={guide.slug} className="knowledge__card spotlight-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '26px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(197,146,57,0.12)', color: '#C59239', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <i className={`ph-bold ${CATEGORY_ICON[guide.category]}`} /> {guide.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{guide.readTime} min read</span>
                </div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: '700', color: '#081D40', margin: '0 0 10px 0', lineHeight: '1.35' }}>
                  <Link to={`/resources/${guide.slug}`} style={{ color: 'inherit' }}>
                    {guide.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', margin: '0 0 18px 0', flexGrow: 1 }}>{guide.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{formatDate(guide.date)}</span>
                  <Link to={`/resources/${guide.slug}`} className="btn btn--ghost btn--sm">
                    Read Guide <i className="ph-bold ph-arrow-right" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '60px 0', background: '#FFFFFF' }}>
        <div className="container">
          <SectionHeader eyebrow="Still Have Questions?" title="Talk to our" highlight="compliance desk" description="Our CA/CS team answers regulatory questions on WhatsApp within business hours." />
        </div>
      </section>

      <CtaStrip source="Resources" />
    </main>
  );
}
