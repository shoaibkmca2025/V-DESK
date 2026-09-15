import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';

/** SECTION: ROOM CALIBRE SHOWCASE */
export default function RoomShowcaseSection() {
  return (
    <section className="section" style={{ padding: '70px 0', background: '#F8FAFC' }}>
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-layout" />
            Room Tiers
          </span>
          <h2 className="section__title">
            DESIGNED FOR EVERY
            <br />
            <span className="highlight-gold">EXECUTIVE FORMAT</span>
          </h2>
          <p className="section__desc">Compare room layouts, acoustic dampening, and presentation equipment.</p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginTop: '35px',
          }}
        >
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Interviews & 1-on-1s
            </span>
            <h3 style={{ fontSize: '1.25rem', color: '#081D40', margin: '4px 0 8px 0' }}>4-Pax Focus Huddle</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
              Compact, soundproof pods for quick brainstorms, technical screenings, and legal signoffs.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.6rem', color: '#081D40' }}>₹499</strong>
              <span style={{ color: '#64748B', fontSize: '0.82rem' }}> / hour</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 20px 0',
                fontSize: '0.82rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 50-inch 4K Smart Display
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Magnetic whiteboard wall
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> High-speed guest Wi-Fi
              </li>
            </ul>
            <button className="btn btn--outline btn--sm btn--full" onClick={() => openMeetingBookingModal()}>
              Reserve 4-Pax
            </button>
          </div>
          <div className="entity-card" style={{ border: '2px solid #C59239' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#C59239', fontWeight: '700' }}>
              Most Popular
            </span>
            <h3 style={{ fontSize: '1.25rem', color: '#081D40', margin: '4px 0 8px 0' }}>8-Pax Conference Room</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
              The workhorse suite for quarterly business reviews, client presentations, and hybrid team standups.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.6rem', color: '#081D40' }}>₹799</strong>
              <span style={{ color: '#64748B', fontSize: '0.82rem' }}> / hour</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 20px 0',
                fontSize: '0.82rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 65-inch Samsung Commercial 4K
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> AI Speaker-Tracking Bar
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Wireless Screen Mirroring (ClickShare)
              </li>
            </ul>
            <button className="btn btn--primary btn--sm btn--full" onClick={() => openMeetingBookingModal()}>
              Reserve 8-Pax
            </button>
          </div>
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Executive Calibre
            </span>
            <h3 style={{ fontSize: '1.25rem', color: '#081D40', margin: '4px 0 8px 0' }}>12-Pax Executive Boardroom</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
              Mahogany conference tables, Italian leather swivel chairs, and studio-grade video conferencing.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.6rem', color: '#081D40' }}>₹1,199</strong>
              <span style={{ color: '#64748B', fontSize: '0.82rem' }}> / hour</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 20px 0',
                fontSize: '0.82rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Dual 75-inch 4K Video Walls
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Ceiling Beamforming Mic Array
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Receptionist Welcome & Tea Service
              </li>
            </ul>
            <button className="btn btn--outline btn--sm btn--full" onClick={() => openMeetingBookingModal()}>
              Reserve Boardroom
            </button>
          </div>
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Workshops & Seminars
            </span>
            <h3 style={{ fontSize: '1.25rem', color: '#081D40', margin: '4px 0 8px 0' }}>
              20-Pax Training Amphitheater
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
              Modular classroom layout with podium, handheld wireless mics, and high-lumen laser projection.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.6rem', color: '#081D40' }}>₹1,999</strong>
              <span style={{ color: '#64748B', fontSize: '0.82rem' }}> / hour</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 20px 0',
                fontSize: '0.82rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 4K Laser Projection System
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Dual Lapel & Handheld Mics
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Half-Day & Full-Day Package Discs
              </li>
            </ul>
            <button className="btn btn--outline btn--sm btn--full" onClick={() => openMeetingBookingModal()}>
              Reserve Training Suite
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
