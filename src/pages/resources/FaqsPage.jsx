import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import CtaStrip from '@/components/page/CtaStrip.jsx';
import FaqAccordion from '@/components/page/FaqAccordion.jsx';
import PageHero from '@/components/page/PageHero.jsx';
import { FAQ_GROUPS } from '@/data/faqs.js';

/** /faqs — searchable, grouped FAQ page. */
export default function FaqsPage() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_GROUPS;
    return FAQ_GROUPS.map((g) => ({ ...g, items: g.items.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(q)) })).filter((g) => g.items.length);
  }, [query]);
  const total = FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0);

  return (
    <main id="main-content" className="ui-page">
      <PageHero
        id="faqsHero"
        badge="Help Centre"
        badgeIcon="ph-question"
        title="Frequently Asked"
        highlight="Questions"
        description="Everything about virtual offices, GST, workspaces, billing and KYC — answered by the team that handles it."
        stats={[
          [String(total), 'Answers'],
          [String(FAQ_GROUPS.length), 'Topics'],
          ['< 15 min', 'Expert Response'],
          ['24h', 'Document SLA'],
        ]}
        actions={
          <Link to="/resources" className="btn btn--outline btn--lg">
            <i className="ph-bold ph-book-open" />
            Read the Guides
          </Link>
        }
      />

      <section className="section" style={{ padding: '60px 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
            <input type="search" className="form-input" placeholder="Search questions, e.g. physical verification" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search FAQs" style={{ flex: 1 }} />
            {query && (
              <button type="button" className="btn btn--outline" onClick={() => setQuery('')}>
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
            {FAQ_GROUPS.map((g) => (
              <a key={g.id} href={`#faq-${g.id}`} className="btn btn--outline btn--sm">
                <i className={`ph-bold ${g.icon}`} /> {g.title}
              </a>
            ))}
          </div>
          {groups.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: '#FFFFFF', border: '1px dashed #C59239', borderRadius: '12px' }}>
              <h3 style={{ color: '#081D40' }}>We couldn't find an exact match.</h3>
              <p style={{ color: '#64748B' }}>Try a different keyword or ask our expert on WhatsApp.</p>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.id} id={`faq-${g.id}`} style={{ marginBottom: '40px' }}>
              <h2 style={{ color: '#081D40', fontSize: '1.3rem', marginBottom: '14px' }}>
                <i className={`ph-bold ${g.icon}`} style={{ color: '#C59239' }} /> {g.title}
              </h2>
              <FaqAccordion items={g.items} openFirst={false} />
            </div>
          ))}
        </div>
      </section>

      <CtaStrip title="Didn't find your answer?" text="Our compliance desk replies on WhatsApp within 15 minutes during business hours." source="FAQs" />
    </main>
  );
}
