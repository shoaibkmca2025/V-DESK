import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Section } from '@/components/ui/index.js';
import { LEAD_STATUSES, LEAD_TRANSITIONS } from '@/data/constants.js';
import { downloadLeadsCsv, fetchLeadStats, fetchLeads, updateLeadStatus } from '@/features/admin/adminApi.js';
import { exportLeadsToCSV } from '@/features/admin/leadActions.js';
import { fetchStaffProfile, isStaffSignedIn, signOutStaff } from '@/features/auth/staffSession.js';
import { calculateLeadScore, getLeads, setLeadStatus } from '@/features/crm/leadStore.js';
import { showToast } from '@/features/ui/toast.js';
import { isApiEnabled } from '@/lib/api.js';
import StaffSignIn from './StaffSignIn.jsx';

/**
 * Staff console.
 *
 * Signed in, it works on the live CRM through the API. Signed out — or on a build with no API —
 * it shows the enquiries stored in this browser, so the page is never an empty shell, and says
 * plainly which of the two it is showing.
 */

const STATUS_TONE = { NEW: 'is-warn', CONTACTED: '', QUALIFIED: 'is-good', PROPOSAL: '', WON: 'is-good', LOST: 'is-bad' };

/**
 * What this lead can become: where it is now, plus the moves the CRM allows from there. A closed
 * lead (won or lost) only lists itself, so the control is shown but cannot be changed.
 */
const statusOptions = (current) => [current, ...(LEAD_TRANSITIONS[current] ?? [])];

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

export default function AdminDashboard() {
  const [signedIn, setSignedIn] = useState(() => isStaffSignedIn());
  const [staff, setStaff] = useState(null);
  const [apiLeads, setApiLeads] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [localLeads, setLocalLeads] = useState(() => getLeads());

  const load = useCallback(async () => {
    if (!signedIn) return;
    const [leads, leadStats, profile] = await Promise.all([fetchLeads({ limit: 50 }), fetchLeadStats(), fetchStaffProfile()]);
    setApiLeads(leads ?? null);
    setStats(leadStats ?? null);
    setStaff(profile ?? null);
    if (!leads && !profile) {
      // The token is no longer accepted.
      setSignedIn(false);
    }
  }, [signedIn]);

  useEffect(() => {
    load();
  }, [load]);

  const live = Array.isArray(apiLeads);
  const leads = live ? apiLeads : localLeads;
  /*
   * Roles differ: an operations admin may read the pipeline but not move it. Showing a control the
   * API will refuse is worse than not showing it, so the status is a badge unless this account can
   * actually change it. Local data is always editable — it is this browser's own.
   */
  const canEditStatus = live ? Boolean(staff?.permissions?.includes('leads:write')) : true;

  const filtered = useMemo(
    () => (filter === 'all' ? leads : leads.filter((lead) => lead.status === filter)),
    [filter, leads],
  );

  const counts = useMemo(() => {
    // The API answers { total, byStatus, bySource }; the local store is a plain list.
    if (stats?.byStatus) {
      return {
        total: stats.total ?? 0,
        new: stats.byStatus.NEW ?? 0,
        qualified: stats.byStatus.QUALIFIED ?? 0,
        won: stats.byStatus.WON ?? 0,
      };
    }
    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === 'NEW').length,
      qualified: leads.filter((lead) => lead.status === 'QUALIFIED').length,
      won: leads.filter((lead) => lead.status === 'WON').length,
    };
  }, [leads, stats]);

  async function changeStatus(lead, status) {
    const ref = lead.ref ?? lead.id;
    if (live) {
      try {
        await updateLeadStatus(ref, status);
        showToast('Status updated', `${ref} is now ${status.toLowerCase()}.`, 'success');
        load();
      } catch (error) {
        const message =
          error.status === 403 ? 'Your account can view enquiries but not change them.' : error.message;
        showToast('Could not update', message, 'warning');
        load();
      }
      return;
    }
    setLeadStatus(ref, status);
    setLocalLeads(getLeads());
  }

  async function signOut() {
    await signOutStaff();
    setSignedIn(false);
    setApiLeads(null);
    setStaff(null);
  }

  return (
    <>
      <section className="ui-portal-head">
        <div className="ui-container">
          <div className="ui-portal-head__row">
            <div>
              <span className="ui-portal-head__eyebrow">Staff console</span>
              <h1 className="ui-portal-head__title">Enquiries</h1>
              <p className="ui-portal-head__meta">
                {live
                  ? `Live CRM${staff?.name ? ` · signed in as ${staff.name}` : ''}`
                  : isApiEnabled()
                    ? 'Showing enquiries saved in this browser — sign in for the live CRM'
                    : 'Showing enquiries saved in this browser'}
              </p>
            </div>
            <div className="ui-actions">
              <Button variant="outline" icon="ph-download-simple" onClick={() => (live ? downloadLeadsCsv() : exportLeadsToCSV())}>
                Export CSV
              </Button>
              {live ? (
                <>
                  <Button variant="ghost" icon="ph-arrows-clockwise" onClick={load}>
                    Refresh
                  </Button>
                  <Button variant="ghost" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          <div className="ui-portal-stats">
            <div className="ui-portal-stat">
              <span className="ui-portal-stat__label">All enquiries</span>
              <strong className="ui-portal-stat__value">{counts.total ?? 0}</strong>
            </div>
            <div className="ui-portal-stat">
              <span className="ui-portal-stat__label">New</span>
              <strong className="ui-portal-stat__value is-warn">{counts.new ?? 0}</strong>
              <span className="ui-portal-stat__hint">Waiting for a first call</span>
            </div>
            <div className="ui-portal-stat">
              <span className="ui-portal-stat__label">Qualified</span>
              <strong className="ui-portal-stat__value">{counts.qualified ?? 0}</strong>
            </div>
            <div className="ui-portal-stat">
              <span className="ui-portal-stat__label">Won</span>
              <strong className="ui-portal-stat__value is-good">{counts.won ?? 0}</strong>
            </div>
          </div>
        </div>
      </section>

      {!live && isApiEnabled() && (
        <Section tone="tint" tight>
          <StaffSignIn onSignedIn={() => setSignedIn(true)} />
        </Section>
      )}

      <Section tone="white" tight>
        <div className="ui-admin-toolbar">
          <div className="ui-chips ui-chips--left">
            {['all', ...LEAD_STATUSES].map((status) => (
              <button
                key={status}
                type="button"
                className={filter === status ? 'ui-filter is-on' : 'ui-filter'}
                onClick={() => setFilter(status)}
                aria-pressed={filter === status}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ').toLowerCase()}
              </button>
            ))}
          </div>
          <span className="ui-table__sub">
            {filtered.length} of {leads.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="ui-card ui-empty">
            <h3>No enquiries here</h3>
            <p>Nothing matches this filter yet.</p>
          </div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Enquiry</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Wants</th>
                  <th scope="col">Score</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="ui-table__actions">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const ref = lead.ref ?? lead.id;
                  const score = lead.score ?? calculateLeadScore(lead);
                  return (
                    <tr key={ref}>
                      <td>
                        <strong>{lead.name}</strong>
                        <br />
                        <span className="ui-table__sub">
                          {ref} · {formatDate(lead.createdAt)}
                        </span>
                      </td>
                      <td>
                        {lead.mobile ? <a href={`tel:${lead.mobile}`}>{lead.mobile}</a> : '—'}
                        <br />
                        <span className="ui-table__sub">{lead.email ?? '—'}</span>
                      </td>
                      <td>
                        {lead.service ?? '—'}
                        <br />
                        <span className="ui-table__sub">{lead.city ?? lead.source ?? ''}</span>
                      </td>
                      <td>
                        <span className={`ui-badge ${score >= 75 ? 'is-good' : score >= 55 ? 'is-warn' : ''}`}>{score}</span>
                      </td>
                      <td>
                        {canEditStatus ? (
                          <>
                            <label className="ui-visually-hidden" htmlFor={`status-${ref}`}>
                              Status for {lead.name}
                            </label>
                            <select
                              id={`status-${ref}`}
                              className="ui-select"
                              value={lead.status}
                              onChange={(event) => changeStatus(lead, event.target.value)}
                              disabled={statusOptions(lead.status).length === 1}
                            >
                              {statusOptions(lead.status).map((status) => (
                                <option key={status} value={status}>
                                  {status.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <span className={`ui-badge ${STATUS_TONE[lead.status] ?? ''}`}>
                            {lead.status.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        )}
                      </td>
                      <td className="ui-table__actions">
                        {lead.mobile ? (
                          <a className="ui-btn ui-btn--outline ui-btn--sm" href={`tel:${lead.mobile}`}>
                            Call
                          </a>
                        ) : (
                          <span className="ui-table__sub">No number</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="ui-note">
          {live
            ? canEditStatus
              ? 'Status changes are saved to the CRM straight away.'
              : 'Your account can view the pipeline; changing a status needs the leads:write permission.'
            : 'These enquiries are stored in this browser only.'}
        </p>
      </Section>
    </>
  );
}
