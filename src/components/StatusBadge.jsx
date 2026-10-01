// File: src/components/StatusBadge.jsx
// Purpose: Coloured pill for every item / claim status.
// Used by: components/ClaimCard.jsx, components/ClaimForm.jsx, components/ClaimReview.jsx,
//          components/ItemCard.jsx, components/MatchCard.jsx, pages/ClaimItem.jsx,
//          pages/ClaimReview.jsx, pages/Home.jsx, pages/ItemDetails.jsx, pages/ResolvedItems.jsx,
//          pages/SmartMatch.jsx

import { STATUS_META } from '../data/constants';
import Icon from './Icon';

// Coloured pill for any item or claim status (LOST, FOUND, CLAIM_PENDING ...)
export default function StatusBadge({ status, size = 'md' }) {
  const meta = STATUS_META[status] ?? { label: status, tone: 'grey', icon: 'help' };
  return (
    <span className={`status-badge status-badge--${meta.tone} status-badge--${size}`}>
      <Icon name={meta.icon} />
      {meta.label}
    </span>
  );
}

export function TypeChip({ type }) {
  return <span className={`type-chip type-chip--${type}`}>{type === 'lost' ? 'Lost report' : 'Found report'}</span>;
}
