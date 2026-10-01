// File: src/components/ScoreRing.jsx
// Purpose: Circular percentage indicator for match scores.
// Used by: components/MatchCard.jsx, components/MatchPairList.jsx, pages/ItemDetails.jsx,
//          pages/SmartMatch.jsx

import { getMatchLevel } from '../utils/matching';

// Circular percentage indicator drawn with a CSS conic-gradient
export default function ScoreRing({ score, size = 'md' }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const { tone } = getMatchLevel(safeScore);
  return (
    <div
      className={`score-ring score-ring--${tone} score-ring--${size}`}
      style={{ '--score': safeScore }}
      role="meter"
      aria-valuenow={safeScore}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuetext={`${safeScore}% match`}
      aria-label={`${safeScore} percent match`}
    >
      <span>{safeScore}<small>%</small></span>
    </div>
  );
}
