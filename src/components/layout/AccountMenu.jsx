// File: src/components/layout/AccountMenu.jsx
// Purpose: "Sign in" button for guests, or the signed-in user's avatar with a small menu.
// Used by: components/layout/Navbar.jsx

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLE_META, ROLES } from '../../data/constants';
import Icon from '../ui/Icon';

const initials = (name = '') => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
    const handleKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return (
      <Link to={`/login?next=${next}`} className="btn btn--sm btn--outline account-signin">
        <Icon name="login" /> Sign in
      </Link>
    );
  }

  const meta = ROLE_META[user.role];
  const handleSignOut = () => {
    setOpen(false);
    logout();
    notify('Signed out', 'info', 2000);
    navigate('/');
  };

  return (
    <div className="account" ref={menuRef}>
      <button type="button" className={`account__button tone--${meta.tone}`} onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu" aria-expanded={open} aria-label={`Account menu for ${user.name}`}>
        {initials(user.name)}
      </button>
      {open && (
        <div className="account__menu" role="menu">
          <div className="account__who">
            <strong>{user.name}</strong>
            <span className="muted small">{user.email}</span>
            <span className={`status-badge status-badge--${meta.tone}`}><Icon name={meta.icon} /> {meta.label}</span>
          </div>
          {user.role === ROLES.SUPER_ADMIN && (
            <Link to="/admin/users" role="menuitem" className="account__item" onClick={() => setOpen(false)}>
              <Icon name="manage_accounts" /> Manage accounts
            </Link>
          )}
          {user.role === ROLES.STUDENT && (
            <Link to="/my-claims" role="menuitem" className="account__item" onClick={() => setOpen(false)}>
              <Icon name="assignment_ind" /> My claims
            </Link>
          )}
          <button type="button" role="menuitem" className="account__item" onClick={handleSignOut}>
            <Icon name="logout" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
