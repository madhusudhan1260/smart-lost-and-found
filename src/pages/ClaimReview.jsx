// File: src/pages/ClaimReview.jsx
// Purpose: Page /doss/claims/:claimId – accept, reject, collect, resolve (DOSS mode).
// Used by: App.jsx

import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { MODES, STATUS } from '../data/constants';
import { formatDateTime } from '../utils/dateUtils';
import PageHeader from '../components/PageHeader';
import ClaimReviewPanel from '../components/ClaimReview';
import ClaimCard from '../components/ClaimCard';
import StatusBadge from '../components/StatusBadge';
import ModeGate from '../components/ModeGate';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';

const MIN_REASON_LENGTH = 5;

function ClaimReviewContent() {
  const { claimId } = useParams(); // /doss/claims/:claimId
  const navigate = useNavigate();
  const { claims, loading, getClaimById, getItemById, acceptClaim, rejectClaim, markCollected, markResolved } = useItems();
  const { notify } = useNotification();

  const [modal, setModal] = useState(null); // 'accept' | 'reject' | 'collect' | 'resolve'
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const claim = getClaimById(claimId);
  const foundItem = claim ? getItemById(claim.itemId) : null;
  const lostItem = claim?.lostItemId ? getItemById(claim.lostItemId) : null;
  useDocumentTitle(claim ? `Review ${claim.id}` : 'Claim review');

  const closeModal = useCallback(() => {
    setModal(null);
    setNote('');
  }, []);

  if (loading) return <div className="container page-body"><LoadingSpinner label="Loading claim…" /></div>;

  if (!claim || !foundItem) {
    return (
      <div className="container page-body">
        <EmptyState icon="search_off" tone="error" title="Claim not found"
          message={`There is no claim with ID "${claimId}", or its item was deleted.`}>
          <Link to="/doss/claims" className="btn btn--primary">Back to claims</Link>
        </EmptyState>
      </div>
    );
  }

  const otherClaims = claims.filter((entry) => entry.itemId === claim.itemId && entry.id !== claim.id);

  // Map each modal to the context action + the toast message
  const ACTIONS = {
    accept: { run: () => acceptClaim(claim.id, note.trim()), message: 'Claim accepted by DOSS.' },
    reject: { run: () => rejectClaim(claim.id, note.trim()), message: 'Claim rejected.' },
    collect: { run: () => markCollected(foundItem.id), message: 'Item marked as collected.' },
    resolve: { run: () => markResolved(foundItem.id), message: 'Item marked as resolved.' },
  };

  const handleConfirm = async () => {
    if (modal === 'reject' && note.trim().length < MIN_REASON_LENGTH) {
      notify('Please give a short reason for rejecting the claim.', 'error');
      return;
    }
    setBusy(true);
    try {
      await ACTIONS[modal].run();
      notify(ACTIONS[modal].message, modal === 'reject' ? 'info' : 'success');
      closeModal();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const MODAL_TEXT = {
    accept: { title: 'Accept this claim?', confirm: 'Accept claim', tone: 'primary' },
    reject: { title: 'Reject this claim?', confirm: 'Reject claim', tone: 'danger' },
    collect: { title: 'Mark as collected?', confirm: 'Mark as collected', tone: 'primary' },
    resolve: { title: 'Mark as resolved?', confirm: 'Mark as resolved', tone: 'primary' },
  };

  return (
    <>
      <PageHeader icon="rule" tone="yellow" eyebrow={`Claim ${claim.id}`} title="Claim Review"
        subtitle={`${claim.claimantName} says “${foundItem.name}” belongs to them. Submitted ${formatDateTime(claim.createdAt)}.`}>
        <StatusBadge status={claim.status} />
      </PageHeader>

      <div className="container page-body">
        <button type="button" className="btn btn--text back-btn" onClick={() => navigate(-1)}>
          <Icon name="arrow_back" /> Back
        </button>

        {/* The action bar changes with the claim status */}
        <div className="action-bar card">
          {claim.status === STATUS.CLAIM_PENDING && (
            <>
              <p><Icon name="gavel" /> Compare the answers below, then decide.</p>
              <div className="action-bar__buttons">
                <button type="button" className="btn btn--danger-outline" onClick={() => setModal('reject')}>
                  <Icon name="close" /> Reject claim
                </button>
                <button type="button" className="btn btn--success" onClick={() => setModal('accept')}>
                  <Icon name="check" /> Accept claim
                </button>
              </div>
            </>
          )}
          {claim.status === STATUS.CLAIM_ACCEPTED && (
            <>
              <p><Icon name="storefront" className="tone-text--blue" /> Accepted {formatDateTime(claim.acceptedAt)} · <strong>Ready for collection</strong></p>
              <div className="action-bar__buttons">
                <button type="button" className="btn btn--outline" onClick={() => window.print()}>
                  <Icon name="print" /> Print handover slip
                </button>
                <button type="button" className="btn btn--primary" onClick={() => setModal('collect')}>
                  <Icon name="handshake" /> Mark as collected
                </button>
              </div>
            </>
          )}
          {claim.status === STATUS.COLLECTED && (
            <>
              <p><Icon name="handshake" className="tone-text--green" /> Collected {formatDateTime(claim.collectedAt)}</p>
              <button type="button" className="btn btn--primary" onClick={() => setModal('resolve')}>
                <Icon name="task_alt" /> Mark as resolved
              </button>
            </>
          )}
          {claim.status === STATUS.RESOLVED && (
            <p><Icon name="task_alt" className="tone-text--green" /> Case resolved {formatDateTime(claim.resolvedAt)}. Collected {formatDateTime(claim.collectedAt)}.</p>
          )}
          {claim.status === STATUS.CLAIM_REJECTED && (
            <p><Icon name="block" className="tone-text--red" /> Rejected {formatDateTime(claim.reviewedAt)} – “{claim.reviewNote}”</p>
          )}
        </div>

        <ClaimReviewPanel claim={claim} foundItem={foundItem} lostItem={lostItem} />

        {otherClaims.length > 0 && (
          <section className="section">
            <h2 className="section-title"><Icon name="group" /> Other claims for this item</h2>
            <div className="claim-rows card">
              {otherClaims.map((entry, index) => <ClaimCard key={entry.id} claim={entry} view="doss" index={index} />)}
            </div>
          </section>
        )}
      </div>

      <Modal
        isOpen={Boolean(modal)}
        title={MODAL_TEXT[modal]?.title}
        confirmText={MODAL_TEXT[modal]?.confirm}
        tone={MODAL_TEXT[modal]?.tone}
        busy={busy}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      >
        {modal === 'accept' && (
          <>
            <p>Are you sure you want to accept this ownership claim?</p>
            <p className="muted small">{claim.claimantName} will be told to collect the item from the DOSS Office with their student ID.
              {otherClaims.some((entry) => entry.status === STATUS.CLAIM_PENDING) && ' Other pending claims for this item will be rejected automatically.'}</p>
          </>
        )}
        {(modal === 'accept' || modal === 'reject') && (
          <div className="form-field">
            <label htmlFor="review-note">{modal === 'reject' ? 'Reason for rejection *' : 'Note (optional)'}</label>
            <textarea id="review-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)}
              placeholder={modal === 'reject' ? 'e.g. The described marks do not match the item.' : 'e.g. Engraving verified.'} />
          </div>
        )}
        {modal === 'collect' && <p>Confirm that <strong>{claim.claimantName}</strong> showed their student ID and collected <strong>{foundItem.name}</strong>. The date and time will be recorded.</p>}
        {modal === 'resolve' && <p>This closes the case for <strong>{foundItem.name}</strong>{lostItem ? ' and the linked lost report' : ''}.</p>}
      </Modal>
    </>
  );
}

export default function ClaimReview() {
  return (
    <ModeGate mode={MODES.DOSS}>
      <ClaimReviewContent />
    </ModeGate>
  );
}
