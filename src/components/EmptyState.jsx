// File: src/components/EmptyState.jsx
// Purpose: Friendly message for empty lists, missing items and errors.
// Used by: components/ItemsBrowser.jsx, components/ModeGate.jsx, pages/ClaimItem.jsx,
//          pages/ClaimReview.jsx, pages/DossClaims.jsx, pages/Home.jsx, pages/ItemDetails.jsx,
//          pages/MyClaims.jsx, pages/NotFound.jsx, pages/ResolvedItems.jsx, pages/SmartMatch.jsx,
//          pages/StudentDashboard.jsx

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
