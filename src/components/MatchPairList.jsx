import { Link } from 'react-router-dom';
import ItemImage from './ItemImage';
import ScoreRing from './ScoreRing';
import Icon from './Icon';

// Compact list of "lost item ↔ best found item" pairs from Smart Match
export default function MatchPairList({ pairs, emptyText = 'No possible matches right now.' }) {
  if (pairs.length === 0) return <p className="muted">{emptyText}</p>;

  return (
    <ul className="pair-list">
      {pairs.map(({ lost, best }) => (
        <li key={lost.id}>
          <Link to={`/smart-match/${lost.id}`} className="pair">
            <ItemImage item={lost} className="pair__image" />
            <span className="pair__names">
              <strong>{lost.name}</strong>
              <small className="muted"><Icon name="sync_alt" /> {best.item.name} · {best.item.location}</small>
            </span>
            <ScoreRing score={best.score} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
