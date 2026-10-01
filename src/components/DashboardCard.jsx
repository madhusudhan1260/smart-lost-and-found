// File: src/components/DashboardCard.jsx
// Purpose: White card with a title row, used for every dashboard panel.
// Used by: pages/DossDashboard.jsx, pages/Home.jsx, pages/StudentDashboard.jsx

import { Link } from 'react-router-dom';
import Icon from './Icon';

// White card with a title row and an optional "View all" link – used on every dashboard
export default function DashboardCard({ title, icon, action, actionTo, className = '', children }) {
  return (
    <section className={`card dash-card ${className}`}>
      <div className="dash-card__head">
        <h2>
          {icon && <Icon name={icon} className="dash-card__icon" />}
          {title}
        </h2>
        {action && actionTo && (
          <Link to={actionTo} className="link-arrow">
            {action} <Icon name="arrow_forward" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
