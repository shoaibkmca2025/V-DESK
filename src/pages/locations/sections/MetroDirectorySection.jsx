import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: 10 METROS INTERACTIVE DIRECTORY */
export default function MetroDirectorySection() {
  return (
    <section
      className="section dark-luxury-section"
      id="metroGrid"
      ref={rawStyle('padding: 70px 0; background: #05132B !important;')}
    >
      <div className="container">
        <div className="section__header section__header--center">
          <span className="hero-badge-pill" style={{ marginBottom: '12px' }}>
            <i className="ph-bold ph-map-trifold" />
            Pan-India Commercial Hubs
          </span>
          <h2 className="section__title" ref={rawStyle('color: #FFFFFF !important;')}>
            PRIME CORPORATE ADDRESSES
            <br />
            <span className="highlight-gold">VERIFIED & GST COMPLIANT</span>
          </h2>
          <p className="section__desc" ref={rawStyle('color: #CBD5E1 !important;')}>
            Each centre is situated in recognized central business districts with dedicated mailrooms, meeting rooms,
            and on-site staff.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '40px',
          }}
        >
          <div className="metro-hub-card" style={{ border: '2px solid #C59239' }}>
            <div ref={rawStyle('height: 180px; background: #081D40; position: relative; overflow: hidden;')}>
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80"
                alt="Nashik HQ"
                id="loc_nsk"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#C59239',
                  color: '#05132B',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                }}
              >
                Flagship HQ
              </span>
              <span
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(5,19,43,0.85)',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                RERA & Municipal Approved
              </span>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Western Region HQ
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#081D40', margin: '4px 0 8px 0' }}>Nashik Flagship Campus</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
                Business Bay, Level 4, College Road, Nashik 422005. Sovereign owned facility.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  ✓ 100% GST Guaranteed
                </span>
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  4K Boardroom
                </span>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>From</span>
                  <strong style={{ fontSize: '1.2rem', color: '#081D40' }}>
                    ₹999<small style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748B' }}>/mo</small>
                  </strong>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() =>
                    openCheckoutModal({ item: 'Virtual Office - Nashik HQ', amount: 11988, city: 'Nashik' })
                  }
                >
                  Select HQ
                </button>
              </div>
            </div>
          </div>
          <div className="metro-hub-card">
            <div ref={rawStyle('height: 180px; background: #081D40; position: relative; overflow: hidden;')}>
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80"
                alt="Mumbai BKC"
                id="loc_mum"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                ref={rawStyle(
                  'position: absolute; top: 12px; left: 12px; background: #081D40; color: #FFF; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;',
                )}
              >
                Financial Capital
              </span>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Maharashtra Metros
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#081D40', margin: '4px 0 8px 0' }}>
                Mumbai — Bandra Kurla Complex (BKC)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
                G Block, BKC Business Centre, Bandra East, Mumbai 400051. 2 min to Metro.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  ✓ Grade-A Glass Tower
                </span>
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  MCA Compliant
                </span>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>From</span>
                  <strong style={{ fontSize: '1.2rem', color: '#081D40' }}>
                    ₹1,999<small style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748B' }}>/mo</small>
                  </strong>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() =>
                    openCheckoutModal({ item: 'Virtual Office - Mumbai BKC', amount: 23988, city: 'Mumbai' })
                  }
                >
                  Select BKC
                </button>
              </div>
            </div>
          </div>
          <div className="metro-hub-card">
            <div ref={rawStyle('height: 180px; background: #081D40; position: relative; overflow: hidden;')}>
              <img
                src="https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80"
                alt="Delhi Connaught Place"
                id="loc_del"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                ref={rawStyle(
                  'position: absolute; top: 12px; left: 12px; background: #081D40; color: #FFF; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;',
                )}
              >
                National Capital
              </span>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Northern Tech Corridor
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#081D40', margin: '4px 0 8px 0' }}>Delhi — Connaught Place</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
                Statesman House, Barakhamba Road, Connaught Place, New Delhi 110001.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  ✓ Central CBD
                </span>
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Physical Signage
                </span>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>From</span>
                  <strong style={{ fontSize: '1.2rem', color: '#081D40' }}>
                    ₹1,799<small style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748B' }}>/mo</small>
                  </strong>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => openCheckoutModal({ item: 'Virtual Office - Delhi CP', amount: 21588, city: 'Delhi' })}
                >
                  Select CP
                </button>
              </div>
            </div>
          </div>
          <div className="metro-hub-card">
            <div ref={rawStyle('height: 180px; background: #081D40; position: relative; overflow: hidden;')}>
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80"
                alt="Bangalore Koramangala"
                id="loc_blr"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                ref={rawStyle(
                  'position: absolute; top: 12px; left: 12px; background: #081D40; color: #FFF; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;',
                )}
              >
                Silicon Valley Hub
              </span>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Southern Corridor
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#081D40', margin: '4px 0 8px 0' }}>Bangalore — Koramangala</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
                80ft Road, 4th Block, Koramangala, Bengaluru 560034. VC & startup epicenter.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  ✓ 100% GST Approval
                </span>
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Tech Hub
                </span>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>From</span>
                  <strong style={{ fontSize: '1.2rem', color: '#081D40' }}>
                    ₹1,599<small style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748B' }}>/mo</small>
                  </strong>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() =>
                    openCheckoutModal({ item: 'Virtual Office - Bangalore', amount: 19188, city: 'Bangalore' })
                  }
                >
                  Select BLR
                </button>
              </div>
            </div>
          </div>
          <div className="metro-hub-card">
            <div ref={rawStyle('height: 180px; background: #081D40; position: relative; overflow: hidden;')}>
              <img
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80"
                alt="Pune Baner"
                id="loc_pne"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                ref={rawStyle(
                  'position: absolute; top: 12px; left: 12px; background: #081D40; color: #FFF; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;',
                )}
              >
                Automotive & IT
              </span>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Maharashtra Tech
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#081D40', margin: '4px 0 8px 0' }}>Pune — Baner High Street</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
                Palladium Business Park, Baner, Pune 411045. Direct Mumbai highway connectivity.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  ✓ IT Park Zoning
                </span>
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Mail Forwarding
                </span>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>From</span>
                  <strong style={{ fontSize: '1.2rem', color: '#081D40' }}>
                    ₹1,299<small style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748B' }}>/mo</small>
                  </strong>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => openCheckoutModal({ item: 'Virtual Office - Pune', amount: 15588, city: 'Pune' })}
                >
                  Select Pune
                </button>
              </div>
            </div>
          </div>
          <div className="metro-hub-card">
            <div ref={rawStyle('height: 180px; background: #081D40; position: relative; overflow: hidden;')}>
              <img
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&auto=format&fit=crop&q=80"
                alt="Hyderabad HITEC City"
                id="loc_hyd"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                ref={rawStyle(
                  'position: absolute; top: 12px; left: 12px; background: #081D40; color: #FFF; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;',
                )}
              >
                Pharma & Tech
              </span>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Telangana Hub
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#081D40', margin: '4px 0 8px 0' }}>Hyderabad — HITEC City</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
                Cyber Towers, Hitec City, Madhapur, Hyderabad 500081.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  ✓ Bio & IT Corridor
                </span>
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Meeting Suites
                </span>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>From</span>
                  <strong style={{ fontSize: '1.2rem', color: '#081D40' }}>
                    ₹1,399<small style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748B' }}>/mo</small>
                  </strong>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() =>
                    openCheckoutModal({ item: 'Virtual Office - Hyderabad', amount: 16788, city: 'Hyderabad' })
                  }
                >
                  Select HYD
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
