/**
 * Every status a lead can hold (PRD §42), in admin table dropdown order. Same pipeline as the backend
 * (docs/backend/modules.md §3.5) — change both together.
 */
export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

/** Statuses saved by earlier builds, renamed when leads are read from localStorage. */
export const LEGACY_LEAD_STATUSES = { PROPOSAL_SENT: 'PROPOSAL', FOLLOW_UP: 'CONTACTED', CONVERTED: 'WON' };

/** Kanban pipeline stages: every status except LOST. Clicking a card advances it to the next stage. */
export const PIPELINE_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];

export const BOOKING_STATES = ['available', 'hold', 'payment_pending', 'confirmed', 'checked_in', 'completed', 'cancelled'];

export const GST_RATE = 0.18;

/**
 * The only status moves the CRM accepts: one step forward, or LOST from any open stage.
 * Mirrors LEAD_TRANSITIONS in backend/src/modules/crm/crm.constants.js, which is the authority —
 * the console offers these so staff are never shown a move the API will reject with a 409.
 */
export const LEAD_TRANSITIONS = Object.freeze({
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['PROPOSAL', 'LOST'],
  PROPOSAL: ['NEGOTIATION', 'LOST'],
  NEGOTIATION: ['WON', 'LOST'],
  WON: [],
  LOST: [],
});
