// File: src/components/MatchCard.jsx
// Purpose: One Smart Match result with its score and matching factors.
// Used by: pages/SmartMatch.jsx

import { Link } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { canBeClaimed } from '../utils/claimUtils';
import { getMatchLevel } from '../utils/matching';
import { formatDate } from '../utils/dateUtils';
import { cx } from '../utils/helpers';
import ItemImage from './ItemImage';
import ScoreRing from './ScoreRing';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

// One possible match: "87% Match" + ✓ Same category, ✓ Same colour...
export default function MatchCard({ match, rank }) {
  const { isStudent } = useMode();
  const { item, score, factors } = match;
  const level = getMatchLevel(score);

  return (
    <article className="match-card card" style={{ '--delay': `${rank * 60}ms` }}>
      <div className="match-card__head">
        <ItemImage item={item} className="match-card__image" />
        <div className="match-card__info">
          <div className="match-card__title-row">
            <span className="match-card__rank">#{rank + 1}</span>
            <h3>{item.name}</h3>
          </div>
          <ul className="match-card__meta">
            <li><Icon name="sell" /> {item.category}</li>
            <li><Icon name="location_on" /> {item.location}</li>
            <li><Icon name="calendar_today" /> {formatDate(item.date)}</li>
            <li><StatusBadge status={item.status} size="sm" /></li>
          </ul>
        </div>
        <div className="match-card__score">
          <ScoreRing score={score} />
          <span className={`match-level match-level--${level.tone}`}>{score}% Match</span>
        </div>
      </div>

      <p className="factor-title">Possible matching factors</p>
      <ul className="factor-list">
        {factors.map((factor) => (
          <li key={factor.key} className={cx('factor', factor.matched && 'factor--matched')} title={factor.detail}>
            <Icon name={factor.matched ? 'check' : 'close'} />
            <span className="factor__text">
              <strong>{factor.matched ? factor.summary : factor.label}</strong>
              <small>{factor.detail}</small>
            </span>
            <span className="factor__points">{factor.points}/{factor.max}</span>
          </li>
        ))}
      </ul>

      <div className="match-card__footer">
        <Link to={`/items/${item.id}`} className="btn btn--text btn--sm">View details</Link>
        {isStudent && canBeClaimed(item) && (
          <Link to={`/items/${item.id}/claim`} className="btn btn--tonal btn--sm">
            <Icon name="front_hand" /> This is my item
          </Link>
        )}
      </div>
    </article>
  );
}
