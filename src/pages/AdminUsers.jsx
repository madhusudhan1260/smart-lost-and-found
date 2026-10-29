// File: src/pages/AdminUsers.jsx
// Purpose: Page /admin/users – the super admin adds, disables and removes accounts.
// Used by: App.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import * as userService from '../services/userService';
import { ROLE_META, ROLES } from '../data/constants';
import { validateAccount } from '../utils/authValidation';
import { timeAgo } from '../utils/dateUtils';
import { cx } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: ROLES.STUDENT, label: 'Students' },
  { key: ROLES.DOSS, label: 'DOSS staff' },
  { key: ROLES.SUPER_ADMIN, label: 'Super Admins' },
];

const EMPTY_ACCOUNT = { name: '', email: '', role: ROLES.DOSS, rollNumber: '', password: '' };

// A readable random password for new staff accounts, e.g. "Kite-4821-Moon"
const WORDS = ['Kite', 'Moon', 'River', 'Cedar', 'Lotus', 'Amber', 'Pearl', 'Tiger', 'Coral', 'Maple'];
const randomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];
const generatePassword = () => `${randomWord()}-${1000 + Math.floor(Math.random() * 9000)}-${randomWord()}`;

export default function AdminUsers() {
  useDocumentTitle('Manage accounts');
  const { user: me, isSuperAdmin, checking } = useAuth();
  const { notify } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_ACCOUNT);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setUsers(await userService.getUsers());
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  const counts = useMemo(
    () => users.reduce(
      (total, account) => {
        total[account.role] += 1;
        if (!account.active) total.disabled += 1;
        return total;
      },
      { student: 0, doss: 0, superadmin: 0, disabled: 0 },
    ),
    [users],
  );

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    return users
      .filter((account) => filter === 'all' || account.role === filter)
      .filter((account) => !text || [account.name, account.email, account.rollNumber].some((v) => v?.toLowerCase().includes(text)));
  }, [users, filter, search]);

  if (checking) return <LoadingSpinner />;
  if (!isSuperAdmin) {
    return (
      <div className="container page-body">
        <EmptyState icon="admin_panel_settings" title="Super Admins only" message="Sign in with a Super Admin account to manage staff and student accounts.">
          <Link to="/login?role=superadmin&next=/admin/users" className="btn btn--primary">Sign in as Super Admin</Link>
        </EmptyState>
      </div>
    );
  }

  const setField = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
    if (formErrors[name]) setFormErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const found = validateAccount(form, { needsRoll: form.role === ROLES.STUDENT });
    setFormErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const created = await userService.createUser({ ...form, name: form.name.trim(), email: form.email.trim() });
      setUsers((current) => [created, ...current]);
      notify(`${ROLE_META[created.role].label} account created for ${created.email}`, 'success');
      setForm(EMPTY_ACCOUNT);
    } catch (err) {
      if (err.details) setFormErrors(err.details);
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const replaceUser = (updated) => setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));

  const toggleActive = async (account) => {
    setBusyId(account.id);
    try {
      const updated = await userService.updateUser(account.id, { active: !account.active });
      replaceUser(updated);
      notify(`${updated.email} ${updated.active ? 'enabled' : 'disabled'}`, 'info');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (account, role) => {
    setBusyId(account.id);
    try {
      replaceUser(await userService.updateUser(account.id, { role }));
      notify(`${account.email} is now ${ROLE_META[role].label}`, 'info');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setBusyId(toDelete.id);
    try {
      await userService.deleteUser(toDelete.id);
      setUsers((current) => current.filter((u) => u.id !== toDelete.id));
      notify(`Deleted ${toDelete.email}`, 'info');
      setToDelete(null);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader icon="admin_panel_settings" tone="red" eyebrow="Super Admin" title="Manage accounts"
        subtitle="Create DOSS staff logins, disable accounts that should no longer sign in, and keep roles up to date." />
      <div className="container page-body">
        <section className="stat-grid" aria-label="Accounts summary">
          <StatCard label="Students" value={counts.student} icon="school" tone="blue" />
          <StatCard label="DOSS staff" value={counts.doss} icon="shield_person" tone="green" />
          <StatCard label="Super Admins" value={counts.superadmin} icon="admin_panel_settings" tone="red" />
          <StatCard label="Disabled" value={counts.disabled} icon="block" tone="yellow" />
        </section>

        <div className="admin-layout">
          <section className="card admin-users">
            <div className="admin-users__toolbar">
              <div className="segmented segmented--small" role="toolbar" aria-label="Filter accounts by role">
                {FILTERS.map(({ key, label }) => (
                  <button key={key} type="button" className={cx('segmented__item', filter === key && 'is-active')}
                    aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
                ))}
              </div>
              <label className="admin-users__search">
                <span className="sr-only">Search accounts</span>
                <Icon name="search" />
                <input type="search" placeholder="Search name, email or roll no." value={search} onChange={(e) => setSearch(e.target.value)} />
              </label>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : loadError ? (
              <EmptyState icon="cloud_off" tone="error" title="Could not load accounts" message={loadError}>
                <button type="button" className="btn btn--outline" onClick={load}>Try again</button>
              </EmptyState>
            ) : visible.length === 0 ? (
              <EmptyState icon="person_search" title="No accounts match" message="Try another filter or search." />
            ) : (
              <div className="table-wrap">
                <table className="table table--stack" aria-label="Accounts">
                  <thead>
                    <tr>
                      <th scope="col">Account</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Last sign-in</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((account) => {
                      const isMe = account.id === me?.id;
                      return (
                        <tr key={account.id} className={cx(!account.active && 'is-disabled')}>
                          <td>
                            <div className="account-cell">
                              <span className={`account-cell__avatar tone--${ROLE_META[account.role].tone}`} aria-hidden="true">
                                {account.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                              </span>
                              <span>
                                <strong>{account.name}{isMe && <span className="muted"> (you)</span>}</strong>
                                <small className="muted">{account.email}{account.rollNumber && ` · ${account.rollNumber}`}</small>
                              </span>
                            </div>
                          </td>
                          <td data-label="Role">
                            <select className="role-select" value={account.role} disabled={isMe || busyId === account.id}
                              onChange={(e) => changeRole(account, e.target.value)} aria-label={`Role for ${account.email}`}>
                              {Object.values(ROLES).map((role) => <option key={role} value={role}>{ROLE_META[role].label}</option>)}
                            </select>
                          </td>
                          <td data-label="Status">
                            <span className={`status-badge status-badge--${account.active ? 'green' : 'grey'}`}>
                              <Icon name={account.active ? 'check_circle' : 'block'} /> {account.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="muted" data-label="Last sign-in">{account.lastLoginAt ? timeAgo(account.lastLoginAt) : 'Never'}</td>
                          <td className="account-actions">
                            {!isMe && (
                              <>
                                <button type="button" className="btn btn--sm btn--outline" disabled={busyId === account.id} onClick={() => toggleActive(account)}>
                                  {account.active ? 'Disable' : 'Enable'}
                                </button>
                                <button type="button" className="icon-btn" aria-label={`Delete ${account.email}`} onClick={() => setToDelete(account)}>
                                  <Icon name="delete" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="card admin-create">
            <h2><Icon name="person_add" /> Add an account</h2>
            <p className="muted small">Share the password with the person privately. They can sign in straight away.</p>
            <form className="auth__form" onSubmit={handleCreate} noValidate>
              <div className="form-field">
                <label htmlFor="new-role">Role</label>
                <select id="new-role" value={form.role} onChange={setField('role')}>
                  <option value={ROLES.DOSS}>DOSS staff</option>
                  <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                  <option value={ROLES.STUDENT}>Student</option>
                </select>
              </div>
              <AdminField id="new-name" label="Full name" error={formErrors.name}>
                <input id="new-name" value={form.name} onChange={setField('name')} className={cx(formErrors.name && 'has-error')} autoComplete="off" />
              </AdminField>
              <AdminField id="new-email" label="Email" error={formErrors.email}>
                <input id="new-email" type="email" value={form.email} onChange={setField('email')} className={cx(formErrors.email && 'has-error')} autoComplete="off" />
              </AdminField>
              {form.role === ROLES.STUDENT && (
                <AdminField id="new-roll" label="Roll number / USN" error={formErrors.rollNumber}>
                  <input id="new-roll" value={form.rollNumber} onChange={setField('rollNumber')} className={cx(formErrors.rollNumber && 'has-error')} />
                </AdminField>
              )}
              <AdminField id="new-password" label="Temporary password" error={formErrors.password}>
                <div className="auth__password">
                  <input id="new-password" value={form.password} onChange={setField('password')} className={cx(formErrors.password && 'has-error')} autoComplete="new-password" />
                  <button type="button" className="auth__eye" aria-label="Generate a password"
                    onClick={() => { setForm((c) => ({ ...c, password: generatePassword() })); setFormErrors((c) => ({ ...c, password: undefined })); }}>
                    <Icon name="casino" />
                  </button>
                </div>
              </AdminField>
              <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
                {saving ? 'Creating…' : <><Icon name="person_add" /> Create account</>}
              </button>
            </form>
          </aside>
        </div>
      </div>

      <Modal isOpen={Boolean(toDelete)} title="Delete this account?" tone="danger" confirmText="Delete account"
        busy={busyId === toDelete?.id} onConfirm={confirmDelete} onCancel={() => setToDelete(null)}>
        <p><strong>{toDelete?.name}</strong> ({toDelete?.email}) will no longer be able to sign in. Reports and claims they made stay on record.</p>
      </Modal>
    </>
  );
}

function AdminField({ id, label, error, children }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
