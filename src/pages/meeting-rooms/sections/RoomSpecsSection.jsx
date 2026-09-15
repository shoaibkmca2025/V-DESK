import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: SUITE HARDWARE & SPECIFICATIONS */
export default function RoomSpecsSection() {
  return (
    <section className="section room-specs" ref={rawStyle('background: #05132B; color: #FFFFFF; padding: 75px 0;')}>
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow" style={{ color: '#C59239' }}>
            <i className="ph-bold ph-monitor" />
            Audio-Visual Excellence
          </span>
          <h2 className="section__title" style={{ color: '#FFFFFF' }}>
            HIGH-CALIBRE HARDWARE
            <br />
            <span className="highlight-gold">STANDARD IN EVERY SUITE</span>
          </h2>
          <p className="section__desc" style={{ color: '#94A3B8' }}>
            Leave technical glitches behind with enterprise video conferencing calibrated for frictionless hybrid
            meetings.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '35px',
          }}
        >
          <div
            ref={rawStyle(
              'background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;',
            )}
          >
            <h4 style={{ color: '#C59239', fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>
              4K Ultra HD Display
            </h4>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
              65-inch to 85-inch Samsung commercial panels with AirPlay, Google Cast, and HDMI wireless dongles.
            </p>
          </div>
          <div
            ref={rawStyle(
              'background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;',
            )}
          >
            <h4 style={{ color: '#C59239', fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>
              Beamforming Mic Array
            </h4>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
              Echo-canceling ceiling microphones capturing voice crisply from any seat without background noise.
            </p>
          </div>
          <div
            ref={rawStyle(
              'background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;',
            )}
          >
            <h4 style={{ color: '#C59239', fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>
              360° AI Smart Camera
            </h4>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
              Intelligent active speaker framing automatically focuses on whoever is talking in the room.
            </p>
          </div>
          <div
            ref={rawStyle(
              'background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 24px;',
            )}
          >
            <h4 style={{ color: '#C59239', fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>
              Acoustic Soundproofing
            </h4>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
              Double-glazed acoustic glass partitions ensuring complete boardroom confidentiality and silence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
