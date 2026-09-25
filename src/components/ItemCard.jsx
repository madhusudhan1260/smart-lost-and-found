import { Link } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { canBeClaimed } from '../utils/claimUtils';
import { formatDate } from '../utils/dateUtils';
import ItemImage from './ItemImage';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

// One report as a card. Private verification details are NEVER shown here.
export default function ItemCard({ item, index = 0 }) {
  const { isStudent } = useMode();
  const { id, type, name, category, location, date, status } = item; // DESTRUCTURING
  const showClaimButton = isStudent && canBeClaimed(item);

  return (
    <article className="item-card" style={{ '--delay': `${Math.min(index, 12) * 40}ms` }}>
      <Link to={`/items/${id}`} className="item-card__media" tabIndex={-1} aria-hidden="true">
        <ItemImage item={item} />
      </Link>

      <div className="item-card__body">
        <div className="item-card__top">
          <span className="item-card__category">{category}</span>
          <StatusBadge status={status} size="sm" />
        </div>
        <h3 className="item-card__title">
          <Link to={`/items/${id}`}>{name}</Link>
        </h3>
        <ul className="item-card__meta">
          <li><Icon name="location_on" /> {location}</li>
          <li><Icon name="calendar_today" /> {type === 'lost' ? 'Lost' : 'Found'} {formatDate(date)}</li>
        </ul>
      </div>

      <div className="item-card__actions">
        <Link to={`/items/${id}`} className="btn btn--text btn--sm">View details</Link>
        {showClaimButton ? (
          <Link to={`/items/${id}/claim`} className="btn btn--tonal btn--sm">
            <Icon name="front_hand" /> This is my item
          </Link>
        ) : type === 'lost' && status === 'LOST' ? (
          <Link to={`/smart-match/${id}`} className="btn btn--text btn--sm">
            <Icon name="join_inner" /> Smart Match
          </Link>
        ) : null}
      </div>
    </article>
  );
}
