// File: src/components/ClaimCard.jsx
// Purpose: Shows one ownership claim (student tracker view or compact DOSS row).
// Used by: pages/ClaimReview.jsx, pages/DossClaims.jsx, pages/DossDashboard.jsx, pages/Home.jsx,
//          pages/ItemDetails.jsx, pages/MyClaims.jsx, pages/StudentDashboard.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { STATUS } from '../data/constants';
import { formatDateTime, timeAgo } from '../utils/dateUtils';
import ItemImage from './ItemImage';
import StatusBadge from './StatusBadge';
import ClaimTimeline from './ClaimTimeline';
import CollectionInstructions from './CollectionInstructions';
import Modal from './Modal';
import Icon from './Icon';

/**
 * One claim.
 *  view="student" → progress tracker + accepted / rejected message
 *  view="doss"    → compact row with a Review button
 */
export default function ClaimCard({ claim, view = 'student', index = 0 }) {
  const { getItemById } = useItems();
  const [showInstructions, setShowInstructions] = useState(false);
  const item = getItemById(claim.itemId);
  const isAccepted = claim.status === STATUS.CLAIM_ACCEPTED;

  if (!item) return null; // the report may have been deleted

  if (view === 'doss') {
    return (
      <Link to={`/doss/claims/${claim.id}`} className="claim-row" style={{ '--delay': `${index * 40}ms` }}>
        <ItemImage item={item} className="claim-row__image" />
        <span className="claim-row__main">
          <strong>{item.name}</strong>
          <small className="muted">{claim.claimantName} · {claim.rollNumber} · {timeAgo(claim.createdAt)}</small>
        </span>
        <StatusBadge status={claim.status} size="sm" />
        <Icon name="chevron_right" className="claim-row__arrow" />
      </Link>
    );
  }

  return (
    <article className="claim-card card" style={{ '--delay': `${index * 60}ms` }}>
      <div className="claim-card__head">
        <ItemImage item={item} className="claim-card__image" />
        <div className="claim-card__info">
          <p className="muted">Claim <code>{claim.id}</code> · submitted {formatDateTime(claim.createdAt)}</p>
          <h3><Link to={`/items/${item.id}`}>{item.name}</Link></h3>
          <p className="muted">Found at {item.location}</p>
        </div>
        <StatusBadge status={isAccepted ? STATUS.READY_FOR_COLLECTION : claim.status} />
      </div>

      <ClaimTimeline claim={claim} />

      {/* Conditional rendering: a different message for each outcome */}
      {isAccepted && (
        <div className="notice notice--green">
          <Icon name="verified" filled />
          <div>
            <strong>Claim accepted</strong>
            <p>Your ownership claim has been accepted by DOSS. Please collect your item from the DOSS Office. Bring your student ID for verification.</p>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowInstructions(true)}>
              <Icon name="list_alt" /> Collection instructions
            </button>
          </div>
        </div>
      )}
      {claim.status === STATUS.CLAIM_PENDING && (
        <div className="notice notice--yellow">
          <Icon name="hourglass_top" />
          <p>DOSS is reviewing your claim. They compare your answers with private details that only the real owner would know.</p>
        </div>
      )}
      {claim.status === STATUS.CLAIM_REJECTED && (
        <div className="notice notice--red">
          <Icon name="block" />
          <div>
            <strong>Claim rejected</strong>
            <p>{claim.reviewNote || 'The details did not match the item.'} If you think this is a mistake, visit the DOSS Office.</p>
          </div>
        </div>
      )}
      {[STATUS.COLLECTED, STATUS.RESOLVED].includes(claim.status) && (
        <div className="notice notice--green">
          <Icon name="handshake" />
          <p>Collected on {formatDateTime(claim.collectedAt)}. We are glad you got it back!</p>
        </div>
      )}

      <Modal
        isOpen={showInstructions}
        title="Collection instructions"
        confirmText="Got it"
        hideCancel
        onConfirm={() => setShowInstructions(false)}
        onCancel={() => setShowInstructions(false)}
      >
        <CollectionInstructions claimId={claim.id} />
      </Modal>
    </article>
  );
}
