// File: src/pages/NotFound.jsx
// Purpose: Page shown for any unknown URL (404).
// Used by: App.jsx

import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Icon from '../components/Icon';

const SUGGESTIONS = [
  { to: '/found', icon: 'inventory_2', label: 'Browse found items' },
  { to: '/lost', icon: 'search', label: 'Browse lost items' },
  { to: '/smart-match', icon: 'join_inner', label: 'Try Smart Match' },
  { to: '/dashboard', icon: 'space_dashboard', label: 'Open the dashboard' },
];

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page-body">
      <EmptyState icon="explore_off" title="404 – This page got lost too" message="The page you are looking for does not exist.">
        <Link to="/" className="btn btn--primary">Go home</Link>
      </EmptyState>
      <ul className="notfound-links" aria-label="Popular pages">
        {SUGGESTIONS.map(({ to, icon, label }) => (
          <li key={to}><Link to={to}><Icon name={icon} /> {label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
