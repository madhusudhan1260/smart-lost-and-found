// File: src/components/layout/PageHeader.jsx
// Purpose: Title area at the top of each page.
// Used by: components/layout/ReportLayout.jsx, pages/student/ClaimItem.jsx, pages/doss/ClaimReview.jsx,
//          pages/doss/DossClaims.jsx, pages/doss/DossDashboard.jsx, pages/public/FoundItems.jsx,
//          pages/public/LostItems.jsx, pages/student/MyClaims.jsx, pages/public/ResolvedItems.jsx, pages/public/SmartMatch.jsx,
//          pages/student/StudentDashboard.jsx

import Icon from '../ui/Icon';

// Title area at the top of each page
export default function PageHeader({ icon, eyebrow, title, subtitle, tone = 'blue', children }) {
  return (
    <header className="page-header">
      <div className="container page-header__inner">
        <div className="page-header__text">
          {icon && <span className={`page-header__icon tone--${tone}`}><Icon name={icon} /></span>}
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="page-header__actions">{children}</div>}
      </div>
    </header>
  );
}
