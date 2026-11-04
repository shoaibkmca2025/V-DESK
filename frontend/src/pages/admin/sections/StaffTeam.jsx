import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/index.js';
import { createStaffUser, fetchStaffUsers, issueStaffSetupCode, setStaffStatus } from '@/features/admin/adminApi.js';
import { showToast } from '@/features/ui/toast.js';

/**
 * Team — staff accounts, for whoever holds users:manage (super admins).
 *
 * Adding someone never involves a password (ADR-012): the API makes a one-time setup code, shown here once, which
 * the admin passes on. The new staff member signs in with it, chooses their own password and sets up their
 * authenticator app. A forgotten password works the same way — "New setup code".
 */

const ROLES = [
  ['SALES_EXEC', 'Sales executive'],
  ['SALES_MANAGER', 'Sales manager'],
  ['OPS_ADMIN', 'Operations admin'],
  ['FINANCE', 'Finance'],
  ['COMPLIANCE', 'Compliance'],
  ['CONTENT', 'Content'],
  ['SUPER_ADMIN', 'Super admin'],
];
const roleLabel = (role) => ROLES.find(([key]) => key === role)?.[1] ?? role;

const formatWhen = (value) =>
  new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function accountState(user) {
  if (user.status !== 'active') return ['Disabled', 'is-bad'];
  if (!user.passwordSet) {
    const expired = user.setupCodeExpiresAt && new Date(user.setupCodeExpiresAt) <= new Date();
    return expired ? ['Setup code expired', 'is-bad'] : ['Waiting for first sign-in', 'is-warn'];
  }
  return user.mfaEnabled ? ['Active', 'is-good'] : ['Active · no authenticator yet', 'is-warn'];
}

/** The code, once. Copying is offered because it is long; the admin passes it on by phone or in person. */
function SetupCodeCard({ issued, onDone }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(issued.setupCode);
      showToast('Copied', 'Send it to them directly — not in a group chat.', 'success');
    } catch {
      showToast('Could not copy', 'Select the code and copy it by hand.', 'warning');
    }
  }
  return (
    <div className="ui-card ui-setup-code" role="status">
      <h3>One-time setup code for {issued.name}</h3>
      <p>
        Give this to <strong>{issued.email}</strong>. They sign in on this page with their email and this code, then
        choose their own password. It works once and expires {formatWhen(issued.setupCodeExpiresAt)}.
      </p>
      <code className="ui-setup-code__value">{issued.setupCode}</code>
      <p className="ui-table__sub">This is the only time the code is shown. If it is lost, issue a new one.</p>
      <div className="ui-actions">
        <Button variant="outline" icon="ph-copy" onClick={copy}>
          Copy code
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export default function StaffTeam({ me }) {
  const [users, setUsers] = useState(null);
  const [issued, setIssued] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => setUsers(await fetchStaffUsers()), []);
  useEffect(() => {
    load();
  }, [load]);

  async function addStaff(event) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = Object.fromEntries(new FormData(formEl).entries());
    setBusy(true);
    setError(null);
    try {
      setIssued(await createStaffUser(form));
      formEl.reset();
      load();
    } catch (err) {
      setError(err.code === 'EMAIL_TAKEN' ? 'There is already an account with that email.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function newCode(user) {
    const sure = globalThis.confirm?.(
      `Issue a new setup code for ${user.name}? Their current password stops working and they are signed out everywhere.`,
    );
    if (sure === false) return;
    try {
      setIssued(await issueStaffSetupCode(user.ref));
      load();
    } catch (err) {
      showToast('Could not issue a code', err.message, 'warning');
    }
  }

  async function toggleStatus(user) {
    const next = user.status === 'active' ? 'disabled' : 'active';
    try {
      await setStaffStatus(user.ref, next);
      showToast(next === 'active' ? 'Account enabled' : 'Account disabled', user.email, 'success');
      load();
    } catch (err) {
      showToast('Could not change the account', err.message, 'warning');
    }
  }

  return (
    <div className="ui-team">
      <div className="ui-admin-toolbar">
        <h2 className="ui-team__title">Team</h2>
        <span className="ui-table__sub">{users ? `${users.length} staff accounts` : 'Loading…'}</span>
      </div>

      {issued && <SetupCodeCard issued={issued} onDone={() => setIssued(null)} />}

      <form className="ui-card ui-team__add" onSubmit={addStaff}>
        <h3>Add a staff member</h3>
        <div className="ui-team__fields">
          <div className="ui-field">
            <label htmlFor="teamName">Name</label>
            <input id="teamName" name="name" required maxLength={120} autoComplete="off" />
          </div>
          <div className="ui-field">
            <label htmlFor="teamEmail">Work email</label>
            <input id="teamEmail" name="email" type="email" required autoComplete="off" placeholder="name@vdesk.in" />
          </div>
          <div className="ui-field">
            <label htmlFor="teamRole">Role</label>
            <select id="teamRole" name="role" className="ui-select" defaultValue="SALES_EXEC">
              {ROLES.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <p className="ui-field__error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create account & get setup code'}
        </Button>
      </form>

      {users && users.length > 0 && (
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">Person</th>
                <th scope="col">Role</th>
                <th scope="col">Account</th>
                <th scope="col" className="ui-table__actions">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const [label, tone] = accountState(user);
                const isMe = user.ref === me?.ref;
                return (
                  <tr key={user.ref}>
                    <td>
                      <strong>{user.name}</strong>
                      {isMe ? ' (you)' : ''}
                      <br />
                      <span className="ui-table__sub">{user.email}</span>
                    </td>
                    <td>{roleLabel(user.role)}</td>
                    <td>
                      <span className={`ui-badge ${tone}`}>{label}</span>
                    </td>
                    <td className="ui-table__actions">
                      {isMe ? (
                        <span className="ui-table__sub">Your own account</span>
                      ) : (
                        <div className="ui-actions">
                          <Button variant="outline" size="sm" onClick={() => newCode(user)}>
                            New setup code
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleStatus(user)}>
                            {user.status === 'active' ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
