import { beforeEach, describe, expect, it } from 'vitest';
import { LEAD_STATUSES, PIPELINE_STAGES } from '@/data/constants.js';
import { addLead, calculateLeadScore, getLeads, setLeadStatus } from '@/features/crm/leadStore.js';

describe('leadStore', () => {
  beforeEach(() => localStorage.clear());

  it('seeds a demo pipeline on first use', () => {
    expect(getLeads()).toHaveLength(4);
  });

  it('seeds demo leads only with known statuses', () => {
    for (const lead of getLeads()) expect(LEAD_STATUSES).toContain(lead.status);
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

  it('renames statuses saved by earlier builds and persists the change', () => {
    const old = ['PROPOSAL_SENT', 'FOLLOW_UP', 'CONVERTED', 'LOST'].map((status, i) => ({ id: `VD-OLD-${i}`, status }));
    localStorage.setItem('VDESK_LEADS', JSON.stringify(old));

    expect(getLeads().map((l) => l.status)).toEqual(['PROPOSAL', 'CONTACTED', 'WON', 'LOST']);
    expect(JSON.parse(localStorage.getItem('VDESK_LEADS')).map((l) => l.status)).toEqual([
      'PROPOSAL',
      'CONTACTED',
      'WON',
      'LOST',
    ]);
  });

  it('shows every pipeline status except LOST on the kanban board', () => {
    expect(PIPELINE_STAGES).toEqual(LEAD_STATUSES.filter((s) => s !== 'LOST'));
  });

  it('scores corporate leads higher', () => {
    expect(calculateLeadScore({ email: 'a@gmail.com' })).toBe(40);
    expect(calculateLeadScore({ email: 'a@corp.com', company: 'Corp', status: 'QUALIFIED' })).toBe(80);
  });

  it('adds the phone bonus for leads with a mobile number', () => {
    expect(calculateLeadScore({ mobile: '9876543210' })).toBe(60);
    expect(calculateLeadScore({ mobile: '9876543210', email: 'a@corp.com', company: 'Corp', status: 'QUALIFIED' })).toBe(100);
  });
});
