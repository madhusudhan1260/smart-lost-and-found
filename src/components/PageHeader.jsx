// File: src/components/PageHeader.jsx
// Purpose: Title area at the top of each page.
// Used by: components/ReportLayout.jsx, pages/ClaimItem.jsx, pages/ClaimReview.jsx,
//          pages/DossClaims.jsx, pages/DossDashboard.jsx, pages/FoundItems.jsx,
//          pages/LostItems.jsx, pages/MyClaims.jsx, pages/ResolvedItems.jsx, pages/SmartMatch.jsx,
//          pages/StudentDashboard.jsx

import Icon from './Icon';

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
