// Purpose: "Home › Found items › Black iPhone" trail at the top of detail pages.
// Used by: pages/ItemDetails.jsx, pages/ClaimItem.jsx

import { Link } from 'react-router-dom';
import Icon from './Icon';

// crumbs: [{ label, to }] – the last crumb is the current page (no link)
export default function Breadcrumbs({ crumbs }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map(({ label, to }, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={label}>
              {isLast ? <span aria-current="page">{label}</span> : <Link to={to}>{label}</Link>}
              {!isLast && <Icon name="chevron_right" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
