// File: src/pages/public/NotFound.jsx
// Purpose: Page shown for any unknown URL (404).
// Used by: App.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Icon from '../../components/ui/Icon';
import SearchBar from '../../components/items/SearchBar';

const SUGGESTIONS = [
  { to: '/found', icon: 'inventory_2', label: 'Browse found items' },
  { to: '/lost', icon: 'search', label: 'Browse lost items' },
  { to: '/smart-match', icon: 'join_inner', label: 'Try Smart Match' },
  { to: '/dashboard', icon: 'space_dashboard', label: 'Open the dashboard' },
];

export default function NotFound() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  return (
    <div className="container page-body">
      <EmptyState icon="explore_off" title="404 – This page got lost too" message="The page you are looking for does not exist.">
        <Link to="/" className="btn btn--primary">Go home</Link>
        <Link to="/found" className="btn btn--outline">Browse found items</Link>
      </EmptyState>
      <div className="notfound-search">
        <SearchBar id="notfound-search" value={query} onChange={setQuery}
          onSubmit={(text) => text.trim() && navigate(`/found?q=${encodeURIComponent(text.trim())}`)}
          placeholder="Looking for an item? Search found items" ariaLabel="Search found items" />
      </div>
      <ul className="notfound-links" aria-label="Popular pages">
        {SUGGESTIONS.map(({ to, icon, label }) => (
          <li key={to}><Link to={to}><Icon name={icon} /> {label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
