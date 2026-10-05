import { beforeEach, describe, expect, it } from 'vitest';
import { addLead, calculateLeadScore, getLeads, setLeadStatus } from '@/features/crm/leadStore.js';

describe('leadStore', () => {
  beforeEach(() => localStorage.clear());

  it('seeds a demo pipeline on first use', () => {
    expect(getLeads()).toHaveLength(4);
  });

  it('adds website leads at the top with status NEW', () => {
    const lead = addLead({ name: 'Test', mobile: '9876543210', source: 'Quote Modal' });
    expect(lead.status).toBe('NEW');
    expect(getLeads()[0].id).toBe(lead.id);
    expect(JSON.parse(localStorage.getItem('VDESK_LEADS'))[0].id).toBe(lead.id);
  });

  it('updates status', () => {
    const lead = addLead({ name: 'Test' });
    expect(setLeadStatus(lead.id, 'QUALIFIED').status).toBe('QUALIFIED');
    expect(setLeadStatus('missing', 'WON')).toBeNull();
  });

  it('scores corporate leads higher', () => {
    expect(calculateLeadScore({ email: 'a@gmail.com' })).toBe(40);
    expect(calculateLeadScore({ email: 'a@corp.com', company: 'Corp', status: 'QUALIFIED' })).toBe(80);
  });
});
