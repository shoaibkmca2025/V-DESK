/** Every status a lead can hold in the CRM (table dropdown order). */
export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'FOLLOW_UP', 'CONVERTED', 'LOST', 'PROPOSAL', 'WON'];

/** Statuses offered in the admin lead table dropdown. */
export const LEAD_TABLE_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'FOLLOW_UP', 'CONVERTED', 'LOST'];

/** Kanban pipeline stages (PRD §42). Clicking a card advances it to the next stage. */
export const PIPELINE_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON'];

export const BOOKING_STATES = ['available', 'hold', 'payment_pending', 'confirmed', 'checked_in', 'completed', 'cancelled'];

export const GST_RATE = 0.18;
