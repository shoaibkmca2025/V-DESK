import { useNavigate } from 'react-router';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { asset } from '@/lib/assets.js';

/** Marketplace workspace card — same look as the coworking marketplace grid. "Book" goes to /checkout. */
export default function WorkspaceCard({ workspace: w }) {
  const navigate = useNavigate();
  const book = () => navigate(`/checkout?item=${encodeURIComponent(w.name)}&amount=${w.priceMonth}&city=${encodeURIComponent(w.city)}&hub=${encodeURIComponent(w.locality)}`);

  return (
    <div className="workspace-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
        <img src={asset(w.image)} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#081D40', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{w.type}</span>
        <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#C59239', fontSize: '0.75rem', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ★ {w.rating} <small style={{ color: '#FFF', fontWeight: '400' }}>({w.reviews})</small>
        </span>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
          <i className="ph-bold ph-map-pin" /> {w.city} • {w.locality}
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#081D40', margin: '0 0 8px 0', lineHeight: '1.3' }}>{w.name}</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 14px 0', lineHeight: '1.4' }}>{w.address}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          <span style={{ background: '#F1F5F9', color: '#334155', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
            <i className="ph-bold ph-users" /> {w.capacity} Pax
          </span>
          {w.amenities.slice(0, 3).map((a) => (
            <span key={a} style={{ background: '#F1F5F9', color: '#334155', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px' }}>
              {a}
            </span>
          ))}
          <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>✓ GST Ready</span>
        </div>
        <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Starting from</span>
            <strong style={{ fontSize: '1.2rem', color: '#081D40' }}>
              ₹{(w.type === 'Meeting Rooms' ? w.priceHour : w.priceMonth).toLocaleString('en-IN')}
              <small style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748B' }}>{w.type === 'Meeting Rooms' ? '/hr' : '/mo'}</small>
            </strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--outline btn--sm" style={{ padding: '6px 10px', fontSize: '0.78rem' }} onClick={() => openQuoteModal(`Schedule Tour: ${w.name}`)}>
              Tour
            </button>
            <button className="btn btn--primary btn--sm" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={book}>
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
