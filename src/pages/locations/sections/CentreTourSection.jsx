import { showToast } from '@/features/ui/toast.js';

/** SECTION: SCHEDULE A CENTRE TOUR */
export default function CentreTourSection() {
  return (
    <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
      <div className="container">
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: '#FAF8F3',
            border: '1px solid #E8E2D8',
            borderRadius: '16px',
            padding: '36px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ color: '#081D40', fontSize: '1.6rem', margin: '0 0 6px 0' }}>
              Schedule an In-Person Centre Tour
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0' }}>
              Visit any of our commercial towers, review physical signage infrastructure, and meet our on-site
              compliance team.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              showToast(
                'Tour Scheduled',
                'Our centre manager will send calendar invite and guest entry pass.',
                'success',
              );
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <select className="form-select" required>
                <option value="nsk">Nashik HQ — College Road</option>
                <option value="mum">Mumbai — BKC</option>
                <option value="del">Delhi — Connaught Place</option>
                <option value="blr">Bangalore — Koramangala</option>
                <option value="pne">Pune — Baner</option>
                <option value="hyd">Hyderabad — HITEC City</option>
              </select>
              <input type="date" className="form-input" required />
              <input type="text" className="form-input" placeholder="Your Name" required />
              <input type="tel" className="form-input" placeholder="Phone / WhatsApp" required />
            </div>
            <button type="submit" className="btn btn--primary btn--full">
              <i className="ph-bold ph-calendar-plus" />
              Confirm In-Person Centre Tour →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
