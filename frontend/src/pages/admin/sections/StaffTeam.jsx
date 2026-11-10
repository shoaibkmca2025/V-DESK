import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/index.js';
import { createStaffUser, fetchStaffUsers, setStaffPassword, setStaffStatus } from '@/features/admin/adminApi.js';
import { passwordProblem } from '@/features/auth/staffSession.js';
import { showToast } from '@/features/ui/toast.js';

/**
 * Team — staff accounts, for whoever holds users:manage (super admins).
 *
 * Adding someone means choosing their first password here and telling them what it is. The password is turned
 * into a key in this browser before it is sent (ADR-013), so the API never receives it. A forgotten password
 * works the same way — "Set new password".
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
  if (!user.passwordSet) return ['No password set', 'is-bad'];
  return ['Active', 'is-good'];
}

/** Repeats the password the admin just set, so it can be passed on before leaving the page. */
function PasswordSetCard({ issued, onDone }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(issued.password);
      showToast('Copied', 'Send it to them directly — not in a group chat.', 'success');
    } catch {
      showToast('Could not copy', 'Select the password and copy it by hand.', 'warning');
    }
  }
  return (
    <div className="ui-card ui-setup-code" role="status">
      <h3>Password set for {issued.name}</h3>
      <p>
        Give this to <strong>{issued.email}</strong>. They sign in on this page with their email and this
        password, and can change it afterwards from their account.
      </p>
      <code className="ui-setup-code__value">{issued.password}</code>
      <p className="ui-table__sub">It is not shown again. If it is lost, set a new one.</p>
      <div className="ui-actions">
        <Button variant="outline" icon="ph-copy" onClick={copy}>
          Copy password
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
      const created = await createStaffUser(form);
      setIssued({ ...created, name: form.name, email: form.email, password: form.password });
      formEl.reset();
      load();
    } catch (err) {
      setError(err.code === 'EMAIL_TAKEN' ? 'There is already an account with that email.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function newPassword(user) {
    const password = globalThis.prompt?.(
      `New password for ${user.name} (at least 12 characters, with letters and numbers).
Their current password stops working and they are signed out everywhere.`,
    );
    if (!password) return;
    const problem = passwordProblem(password);
    if (problem) {
      showToast('That password will not do', problem, 'warning');
      return;
    }
    try {
      await setStaffPassword(user.ref, user.email, password);
      setIssued({ name: user.name, email: user.email, password });
      load();
    } catch (err) {
      showToast('Could not set the password', err.message, 'warning');
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

      {issued && <PasswordSetCard issued={issued} onDone={() => setIssued(null)} />}

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
            <label htmlFor="teamPassword">First password</label>
            <input
              id="teamPassword"
              name="password"
              type="text"
              required
              minLength={12}
              autoComplete="off"
              spellCheck={false}
              placeholder="at least 12 characters, with letters and numbers"
            />
            <p className="ui-table__sub">Shown as you type so you can pass it on. They can change it later.</p>
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
          {busy ? 'Creating…' : 'Create account'}
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
                          <Button variant="outline" size="sm" onClick={() => newPassword(user)}>
                            Set new password
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
