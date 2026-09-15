import { useId } from 'react';
import { CITIES } from '@/data/cities.js';
import { addLead } from '@/features/crm/leadStore.js';
import { showToast } from '@/features/ui/toast.js';

/** Hero lead-capture card (same markup as the pricing / locations hero forms). Saves a CRM lead. */
export default function LeadCard({ ribbon = 'INSTANT QUOTE', title, subtitle, service, city, source, cta = 'Request Quote →' }) {
  const uid = useId();

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (!/^\d{10}$/.test(data.mobile || '')) {
      showToast('Phone Number Required', 'Please enter a valid 10-digit mobile or WhatsApp number.', 'warning');
      return;
    }
    const lead = addLead({ ...data, company: '', source });
    form.reset();
    showToast('Request Received ✓', `Reference ${lead.id}. Our advisor will reach out on WhatsApp within 15 minutes.`, 'success');
  }

  return (
    <div className="hero-lead-card">
      <div className="hero-card-ribbon">
        <i className="ph-bold ph-lightning" /> {ribbon}
      </div>
      <div className="hero-card-header">
        <h3>
          <i className="ph-bold ph-paper-plane-tilt" />
          {title}
        </h3>
        <p>{subtitle}</p>
      </div>
      <form className="hero-lead-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={`${uid}-name`}>Full Name *</label>
          <input type="text" id={`${uid}-name`} name="name" className="form-control" placeholder="e.g. Priya Kulkarni" required />
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-mobile`}>Mobile / WhatsApp *</label>
          <input type="tel" id={`${uid}-mobile`} name="mobile" className="form-control" placeholder="10-digit mobile number" pattern="[0-9]{10}" required />
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-email`}>Work Email *</label>
          <input type="email" id={`${uid}-email`} name="email" className="form-control" placeholder="name@company.in" required />
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-service`}>Requirement *</label>
          <select id={`${uid}-service`} name="service" className="form-control" defaultValue={service || 'Virtual Office'}>
            <option value="Virtual Office">Virtual Office (GST / MCA)</option>
            <option value="GST Registration">GST Registration</option>
            <option value="Company Registration">Company Registration</option>
            <option value="Coworking">Coworking Desks</option>
            <option value="Private Office">Private Office Cabin</option>
            <option value="Meeting Rooms">Meeting Rooms</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-city`}>Target City *</label>
          <select id={`${uid}-city`} name="city" className="form-control" defaultValue={city || 'Mumbai'}>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name} ({c.localities[0]})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn--gold btn--full" style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}>
          <i className="ph-bold ph-paper-plane-tilt" />
          {cta}
        </button>
      </form>
    </div>
  );
}
