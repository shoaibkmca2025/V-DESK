import { addLead } from '@/features/crm/leadStore.js';
import { showToast } from '@/features/ui/toast.js';

/* Lead capture forms across the site. Every submission becomes a CRM lead (POST /api/leads). */

const WHATSAPP_NUMBER = '919876543210';

function field(id, fallback = '') {
  const el = document.getElementById(id);
  const value = el?.value?.trim?.() ?? el?.value;
  return value || fallback;
}

function resetForm(id) {
  document.getElementById(id)?.reset();
}

function hasValidPhone(phone, message) {
  if (phone && phone.length >= 10) return true;
  showToast('Phone Number Required', message, 'warning');
  return false;
}

/** After a successful submission, offers to continue the conversation on WhatsApp. */
function offerWhatsAppFollowUp(question, message, delay = 700) {
  setTimeout(() => {
    try {
      if (window.confirm(question)) {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch {
      /* non-blocking */
    }
  }, delay);
}

/** Contact section form on the homepage. */
export function handleContactSubmit(e) {
  e.preventDefault();
  const lead = addLead({
    name: document.getElementById('cfName')?.value || '',
    mobile: document.getElementById('cfMobile')?.value || '',
    email: document.getElementById('cfEmail')?.value || '',
    city: 'Contact Page',
    service: 'General Enquiry',
    company: '',
    notes: document.getElementById('cfMessage')?.value || '',
    source: 'Contact Form',
  });
  e.target.reset();
  showToast(`✓ Message received — ${lead.id}. Our strategist will connect shortly.`);
}

export function handleHomeHeroConsultSubmit(e) {
  if (e) e.preventDefault();
  const name = field('homeHeroName', 'Valued Client');
  const phone = field('homeHeroPhone');
  const email = field('homeHeroEmail');
  const service = field('homeHeroService', 'Virtual Office Platform');
  const city = field('homeHeroCity', 'Delhi NCR');

  if (!hasValidPhone(phone, 'Please enter a valid 10-digit mobile or WhatsApp number.')) return;

  addLead({ name, mobile: phone, email, city, service, source: 'Homepage Split Hero Lead Engine' });

  showToast('Consultation Requested ✓', `Thank you ${name}! Our senior workspace advisor will connect on WhatsApp (+91 ${phone}) within 15 minutes.`, 'success');

  offerWhatsAppFollowUp(
    'Would you like to connect with your dedicated V-DESK advisor on WhatsApp now?',
    `Hi V-DESK Team,\n\nI just requested an instant workspace proposal:\n• Name: ${name}\n• Service: ${service}\n• City: ${city}\n• Phone: +91 ${phone}\n\nPlease share the available commercial centres and pricing.`,
  );

  resetForm('homeHeroConsultForm');
}

export function handleVoHeroLeadSubmit(e) {
  if (e) e.preventDefault();
  const name = field('voHeroName', 'Valued Client');
  const phone = field('voHeroPhone');
  const email = field('voHeroEmail');
  const purpose = field('voHeroPurpose', 'GST Registration');
  const city = field('voHeroCity', 'Delhi NCR');

  if (!phone || phone.length < 10) {
    showToast('Invalid Phone Number', 'Please enter a valid 10-digit mobile or WhatsApp number.', 'warning');
    return;
  }

  addLead({ name, mobile: phone, email, city, service: purpose, source: 'Virtual Office Split Hero Form (myHQ Standard)' });

  showToast('Quote Request Received ✓', `Thank you ${name}! Our Senior CA Consultant will reach out on WhatsApp (+91 ${phone}) within 15 minutes.`, 'success');

  offerWhatsAppFollowUp(
    'Would you like to connect with our Senior Virtual Office Consultant directly on WhatsApp now?',
    `Hi V-DESK Compliance Team,\n\nI just requested an instant quote for:\n• Name: ${name}\n• Purpose: ${purpose}\n• Target City: ${city}\n• Phone: +91 ${phone}\n\nPlease share the approved commercial centre list and lowest price quote.`,
    800,
  );

  resetForm('voHeroLeadForm');
}

export function handleMrReserveCardSubmit(e) {
  if (e) e.preventDefault();
  const name = field('mrHeroName', 'Valued Client');
  const phone = field('mrHeroPhone');
  const city = field('mrHeroCity', 'Delhi NCR');
  const roomType = field('mrHeroType', 'Conference Room (8 Pax)');
  const date = field('mrHeroDate', 'Upcoming');
  const slot = '02:00 PM - 04:00 PM';
  const duration = field('mrHeroDuration', '2 Hours');

  if (!hasValidPhone(phone, 'Please enter a valid 10-digit mobile number for room reservation hold.')) return;

  addLead({ name, mobile: phone, city, service: `Meeting Room: ${roomType} (${duration})`, source: 'Meeting Rooms Hero Reservation Engine' });

  showToast('Room Hold Initiated ✓', `Room slot held for 15 minutes. Our concierge will reach out to ${phone} with access code.`, 'success');

  offerWhatsAppFollowUp(
    'Connect with Meeting Room Concierge on WhatsApp for instant confirmation pass?',
    `Hi V-DESK Concierge,\n\nI have initiated an instant boardroom reservation:\n• Name: ${name}\n• Room: ${roomType}\n• City: ${city}\n• Date: ${date} (${slot}, ${duration})\n• Phone: +91 ${phone}\n\nPlease confirm availability and payment pass.`,
  );

  resetForm('mrReserveForm');
}

export function handleLocInquirySubmit(e) {
  if (e) e.preventDefault();
  const name = field('locHeroName', 'Valued Client');
  const phone = field('locHeroPhone');
  const city = field('locHeroCity', 'Delhi NCR');
  const service = field('locHeroService', 'Virtual Office (GST/MCA)');

  if (!hasValidPhone(phone, 'Please enter a valid 10-digit mobile or WhatsApp number.')) return;

  addLead({ name, mobile: phone, city, service, source: 'Locations Hub RFP Engine' });

  showToast('Commercial Hub RFP Received ✓', `Proposal for ${city} commercial towers will be shared on WhatsApp (+91 ${phone}) in 15 mins.`, 'success');

  offerWhatsAppFollowUp(
    'Would you like to connect with our Commercial Tower Specialist on WhatsApp now?',
    `Hi V-DESK Team,\n\nI need verified Grade-A commercial tower details for:\n• Target City: ${city}\n• Service: ${service}\n• Name: ${name}\n• Phone: +91 ${phone}\n\nPlease share inventory and floor plan details.`,
  );

  resetForm('locLeadForm');
}

export function handleContactAdvisorySubmit(e) {
  if (e) e.preventDefault();
  const name = field('ctAdvName', 'Valued Client');
  const phone = field('ctAdvPhone');
  const email = field('ctAdvEmail');
  const company = field('ctAdvCompany', 'Startup / Enterprise');
  const service = field('ctAdvService', 'Virtual Office for GST');
  const city = field('ctAdvCity', 'Delhi NCR');
  const message = field('ctAdvMessage', 'General Advisory Request');

  if (!hasValidPhone(phone, 'Please enter a valid 10-digit mobile number.')) return;

  addLead({ name, mobile: phone, email, company, city, service, notes: message, source: 'Contact VIP Concierge Advisory Desk' });

  showToast('Advisory Request Dispatched ✓', `Thank you ${name}! Senior CA on duty will respond with customized proposal within 20 mins.`, 'success');

  offerWhatsAppFollowUp(
    'Would you like to speak with our Senior CA on duty via WhatsApp now?',
    `Hi V-DESK Senior Advisory Desk,\n\nI just submitted an advisory consultation request:\n• Name: ${name}\n• Company: ${company}\n• Service: ${service}\n• City: ${city}\n• Phone: +91 ${phone}\n• Notes: ${message}\n\nPlease share the proposal.`,
  );

  resetForm('contactAdvisoryForm');
}

/** Coworking centre tour booking (Worldmark Aerocity). */
export function handleCwTourSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = field('cwName');
  const phone = field('cwPhone');
  const email = field('cwEmail');
  const solution = field('cwSolution', 'Private Serviced Office');
  const teamSize = field('cwTeamSize', '1 Person');
  const date = field('cwDate');

  if (!name || !phone || !email || !date) {
    showToast('Incomplete Details', 'Please complete all required fields to confirm your tour.', 'warning');
    return false;
  }

  addLead({
    name,
    mobile: '+91 ' + phone,
    email,
    city: 'Delhi NCR',
    service: `Centre Tour: ${solution}`,
    company: '',
    notes: `Team size: ${teamSize} • Preferred date: ${date} • Centre: Worldmark Aerocity (Level 7, Towers 4 & 6)`,
    source: 'Worldmark Aerocity Centre Tour',
  });

  showToast('Tour Scheduled!', `Your visit for ${date} is registered. Our Centre Concierge will call you in < 15 mins.`, 'success');

  resetForm('cwTourForm');

  offerWhatsAppFollowUp(
    'Tour scheduled! Would you like to connect directly with the Worldmark Aerocity Concierge on WhatsApp for instant directions and calendar invite?',
    `Hi V-DESK Concierge, I just scheduled a tour for ${solution} (${teamSize}) at Worldmark Aerocity on ${date}. My name is ${name}.`,
    1000,
  );

  return false;
}
