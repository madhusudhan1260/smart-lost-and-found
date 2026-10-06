// File: src/components/ClaimTimeline.jsx
// Purpose: Progress tracker: Submitted → Accepted → Collected → Resolved.
// Used by: components/ClaimCard.jsx

import { getClaimTimeline } from '../utils/claimUtils';
import { formatDateTime } from '../utils/dateUtils';
import { cx } from '../utils/helpers';
import Icon from './Icon';

// Horizontal progress tracker: Submitted → Accepted → Collected → Resolved
export default function ClaimTimeline({ claim }) {
  const steps = getClaimTimeline(claim);

  return (
    <ol className="timeline" aria-label="Claim status timeline">
      {steps.map((step) => (
        <li
          key={step.key}
          className={cx('timeline__step', step.done && 'is-done', step.current && 'is-current', step.failed && 'is-failed')}
          aria-current={step.current ? 'step' : undefined}
        >
          <span className="timeline__dot">
            <Icon name={step.failed ? 'close' : step.done ? 'check' : 'more_horiz'} />
          </span>
          <span className="timeline__label">{step.label}</span>
          <span className="timeline__time">{step.at ? formatDateTime(step.at) : step.current ? 'Waiting…' : ''}</span>
        </li>
      ))}
    </ol>
  );
}
