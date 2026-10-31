// File: src/components/ui/StatusBadge.jsx
// Purpose: Coloured pill for every item / claim status.
// Used by: components/claims/ClaimCard.jsx, components/claims/ClaimForm.jsx, components/claims/ClaimReview.jsx,
//          components/items/ItemCard.jsx, components/matching/MatchCard.jsx, pages/student/ClaimItem.jsx,
//          pages/doss/ClaimReview.jsx, pages/public/Home.jsx, pages/public/ItemDetails.jsx, pages/public/ResolvedItems.jsx,
//          pages/public/SmartMatch.jsx

import { STATUS_META } from '../../data/constants';
import Icon from './Icon';

// Coloured pill for any item or claim status (LOST, FOUND, CLAIM_PENDING ...)
export default function StatusBadge({ status, size = 'md' }) {
  const meta = STATUS_META[status] ?? { label: status, tone: 'grey', icon: 'help' };
  return (
    <span
      className={`status-badge status-badge--${meta.tone} status-badge--${size}`}
      title={meta.hint ? `${meta.label} – ${meta.hint}` : `Status: ${meta.label}`}
      aria-label={`Status: ${meta.label}`}
    >
      <Icon name={meta.icon} />
      {meta.label}
    </span>
  );
}

export function TypeChip({ type }) {
  const label = type === 'lost' ? 'Lost report' : 'Found report';
  return (
    <span
      className={`type-chip type-chip--${type}`}
      title={label}
      aria-label={label}
    >
      {label}
    </span>
  );
}
