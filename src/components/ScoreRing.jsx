// File: src/components/ScoreRing.jsx
// Purpose: Circular percentage indicator for match scores.
// Used by: components/MatchCard.jsx, components/MatchPairList.jsx, pages/ItemDetails.jsx,
//          pages/SmartMatch.jsx

import { getMatchLevel } from '../utils/matching';

// Circular percentage indicator drawn with a CSS conic-gradient
export default function ScoreRing({ score, size = 'md' }) {
  const { tone } = getMatchLevel(score);
  return (
    <div
      className={`score-ring score-ring--${tone} score-ring--${size}`}
      style={{ '--score': score }}
      role="img"
      aria-label={`${score} percent match`}
    >
      <span>{score}<small>%</small></span>
    </div>
  );
}
