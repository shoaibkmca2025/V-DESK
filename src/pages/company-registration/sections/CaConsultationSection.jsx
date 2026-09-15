import { showToast } from '@/features/ui/toast.js';
import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: DIRECT CA CONSULTATION FORM */
export default function CaConsultationSection() {
  return (
    <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
      <div className="container">
        <div
          ref={rawStyle(
            'max-width: 760px; margin: 0 auto; background: #081D40; color: #FFFFFF; border-radius: 16px; padding: 40px; box-shadow: 0 16px 36px rgba(8,29,64,0.15);',
          )}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ color: '#C59239', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
              <i className="ph-bold ph-phone-call" /> 1-on-1 Legal Strategy Call
            </span>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.8rem', margin: '8px 0' }}>
              Consult a Senior Chartered Accountant
            </h3>
            <p style={{ color: '#CBD5E1', fontSize: '0.9rem', margin: '0' }}>
              Discuss equity distribution, director appointment, trademark protection, and tax structuring before
              incorporating.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              showToast('CA Consultation Booked', 'Our corporate CA will call you within 2 hours.', 'success');
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Your Full Name"
                required
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
              />
              <input
                type="tel"
                className="form-input"
                placeholder="Phone Number / WhatsApp"
                required
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <input
                type="email"
                className="form-input"
                placeholder="Work Email"
                required
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
              />
              <select
                className="form-select"
                ref={rawStyle('background: #081D40; border-color: rgba(255,255,255,0.2); color: #fff;')}
              >
                <option value="pvt">Pvt Ltd Structuring</option>
                <option value="llp">LLP Partnership Advisory</option>
                <option value="fdi">Foreign Direct Investment (FDI)</option>
                <option value="tax">Tax Optimization Strategy</option>
              </select>
            </div>
            <button type="submit" className="btn btn--gold btn--full btn--lg">
              <i className="ph-bold ph-calendar-check" />
              Book Priority CA Consultation →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
