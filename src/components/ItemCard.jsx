// File: src/components/ItemCard.jsx
// Purpose: One lost/found report shown as a card in the lists.
// Used by: components/ItemsBrowser.jsx, pages/Home.jsx

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useMode } from '../context/ModeContext';
import { STATUS } from '../data/constants';
import { canBeClaimed } from '../utils/claimUtils';
import { findMatches, isOpenForMatching } from '../utils/matching';
import { formatDate, timeAgo } from '../utils/dateUtils';
import ItemImage from './ItemImage';
import StatusBadge from './StatusBadge';
import Icon from './Icon';
import Highlight from './Highlight';

// One report as a card. Private verification details are NEVER shown here.
export default function ItemCard({ item, index = 0, highlight = '' }) {
  const { isStudent } = useMode();
  const { items } = useItems();
  const { id, type, name, category, location, date, status, createdAt } = item; // DESTRUCTURING
  // Reported in the last 24 hours → show a "New" label
  const isNew = Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
  // How many reports of the opposite type could be this item (only for open reports)
  const matchCount = useMemo(
    () => (isOpenForMatching(item) ? findMatches(item, items).length : 0),
    [item, items],
  );
  const showClaimButton = isStudent && canBeClaimed(item);

  return (
    <article className="item-card" style={{ '--delay': `${Math.min(index, 12) * 40}ms` }}>
      <Link to={`/items/${id}`} className="item-card__media" tabIndex={-1} aria-hidden="true">
        <ItemImage item={item} />
        {isNew && <span className="new-badge">New</span>}
      </Link>

      <div className="item-card__body">
        <div className="item-card__top">
          <span className="item-card__category">{category}</span>
          <StatusBadge status={status} size="sm" />
        </div>
        <h3 className="item-card__title">
          <Link to={`/items/${id}`}><Highlight text={name} query={highlight} /></Link>
        </h3>
        <ul className="item-card__meta">
          <li><Icon name="location_on" /> {location}</li>
          <li><Icon name="calendar_today" /> {type === 'lost' ? 'Lost' : 'Found'} {formatDate(date)}</li>
          <li className="item-card__ago"><Icon name="schedule" /> Reported {timeAgo(createdAt)}</li>
        </ul>
        {matchCount > 0 && (
          <Link to={`/smart-match/${id}`} className="match-chip">
            <Icon name="join_inner" /> {matchCount} possible match{matchCount > 1 ? 'es' : ''}
          </Link>
        )}
      </div>

      <div className="item-card__actions">
        <Link to={`/items/${id}`} className="btn btn--text btn--sm">View details</Link>
        {showClaimButton ? (
          <Link to={`/items/${id}/claim`} className="btn btn--tonal btn--sm">
            <Icon name="front_hand" /> This is my item
          </Link>
        ) : type === 'lost' && status === STATUS.LOST ? (
          <Link to={`/smart-match/${id}`} className="btn btn--text btn--sm">
            <Icon name="join_inner" /> Smart Match
          </Link>
        ) : null}
      </div>
    </article>
  );
}
