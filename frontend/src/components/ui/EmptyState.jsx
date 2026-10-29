// File: src/components/ui/EmptyState.jsx
// Purpose: Friendly message for empty lists, missing items and errors.
// Used by: components/items/ItemsBrowser.jsx, components/layout/ModeGate.jsx, pages/student/ClaimItem.jsx,
//          pages/doss/ClaimReview.jsx, pages/doss/DossClaims.jsx, pages/public/Home.jsx, pages/public/ItemDetails.jsx,
//          pages/student/MyClaims.jsx, pages/public/NotFound.jsx, pages/public/ResolvedItems.jsx, pages/public/SmartMatch.jsx,
//          pages/student/StudentDashboard.jsx

import Icon from './Icon';

// Friendly message for "no results", "not found" and error situations
export default function EmptyState({ icon = 'inbox', title, message, tone = 'neutral', children }) {
  return (
    <div className={`empty-state empty-state--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <span className="empty-state__icon"><Icon name={icon} /></span>
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {children && <div className="empty-state__actions">{children}</div>}
    </div>
  );
}
