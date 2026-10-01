// File: src/components/Navbar.jsx
// Purpose: Top navigation bar; links change with the current mode.
// Used by: App.jsx

import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { useItems } from '../context/ItemContext';
import { STATUS } from '../data/constants';
import { cx } from '../utils/helpers';
import logo from '../assets/logo.svg';
import ModeSwitcher from './ModeSwitcher';
import Icon from './Icon';

// Different links for each mode (conditional rendering driven by data)
const STUDENT_LINKS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/lost', label: 'Lost Items', icon: 'search' },
  { to: '/found', label: 'Found Items', icon: 'inventory_2' },
  { to: '/smart-match', label: 'Smart Match', icon: 'join_inner' },
  { to: '/my-claims', label: 'My Claims', icon: 'assignment_ind' },
  { to: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
];

const DOSS_LINKS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/lost', label: 'Lost Items', icon: 'search' },
  { to: '/found', label: 'Found Items', icon: 'inventory_2' },
  { to: '/doss/claims', label: 'Claims', icon: 'fact_check', badge: 'pending' },
  { to: '/resolved', label: 'Resolved', icon: 'task_alt' },
  { to: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
];

export default function Navbar() {
  const { isDoss } = useMode();
  const { claims } = useItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = isDoss ? DOSS_LINKS : STUDENT_LINKS;
  const pendingCount = claims.filter((claim) => claim.status === STATUS.CLAIM_PENDING).length;

  // Add a thin shadow once the page is scrolled
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={cx('navbar', scrolled && 'navbar--scrolled', isDoss && 'navbar--doss')}>
      <nav className="navbar__inner container" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src={logo} alt="" className="brand__logo" width="34" height="34" />
          <span className="brand__text">
            Smart <strong>Lost &amp; Found</strong>
          </span>
        </Link>

        <ul id="navbar-nav-links" className={cx('navbar__links', menuOpen && 'is-open')}>
          {links.map(({ to, label, icon, end, badge }) => (
            <li key={to}>
              <NavLink to={to} end={end} onClick={closeMenu} className={({ isActive }) => cx('nav-link', isActive && 'is-active')}>
                <Icon name={icon} className="nav-link__icon" />
                {label}
                {badge === 'pending' && pendingCount > 0 && (
                  <span className="nav-badge" aria-label={`${pendingCount} pending`}>{pendingCount}</span>
                )}
              </NavLink>
            </li>
          ))}
          <li className="navbar__mode-mobile">
            <ModeSwitcher onSwitch={closeMenu} />
          </li>
        </ul>

        <div className="navbar__actions">
          <div className="navbar__mode-desktop">
            <ModeSwitcher />
          </div>
          <button
            type="button"
            className="icon-btn navbar__menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="navbar-nav-links"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </nav>
      {isDoss && (
        <div className="mode-banner">
          <Icon name="shield_person" /> DOSS mode · you can see private verification details and review claims
        </div>
      )}
    </header>
  );
}
