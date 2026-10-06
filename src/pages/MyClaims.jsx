// File: src/pages/MyClaims.jsx
// Purpose: Page /my-claims – the student's claims and their status.
// Used by: App.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { MODES, STATUS } from '../data/constants';
import { cx } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import ClaimCard from '../components/ClaimCard';
import ModeGate from '../components/ModeGate';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

// Claim IDs look like CL-3001 or CL-ABC12 – checked with a regular expression
// Filter tabs: name + test function
const CLAIM_FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'open', label: 'In progress', test: (claim) => [STATUS.CLAIM_PENDING, STATUS.CLAIM_ACCEPTED].includes(claim.status) },
  { key: 'closed', label: 'Closed', test: (claim) => [STATUS.COLLECTED, STATUS.RESOLVED, STATUS.CLAIM_REJECTED].includes(claim.status) },
];

const CLAIM_ID_PATTERN = /^CL-[A-Z0-9]{3,10}$/;

function MyClaimsContent() {
  useDocumentTitle('My Claims');
  const { myClaims, claims, loading, trackClaim } = useItems();
  const { notify } = useNotification();
  const [claimIdInput, setClaimIdInput] = useState('');
  const [filterKey, setFilterKey] = useState('all');
  const activeFilter = CLAIM_FILTERS.find((entry) => entry.key === filterKey) ?? CLAIM_FILTERS[0];
  const shownClaims = myClaims.filter(activeFilter.test);

  // Follow a claim that was made on another device
  const handleTrack = (event) => {
    event.preventDefault();
    const claimId = claimIdInput.trim().toUpperCase();

    if (!CLAIM_ID_PATTERN.test(claimId)) {
      notify('Enter a valid claim ID, e.g. CL-3001', 'error');
      return;
    }
    const claim = claims.find((entry) => entry.id === claimId);
    if (!claim) {
      notify(`No claim found with ID ${claimId}`, 'error');
      return;
    }
    trackClaim(claimId);
    setClaimIdInput('');
    notify(`Now tracking claim ${claimId}`, 'info');
  };

  return (
    <>
      <PageHeader icon="assignment_ind" tone="blue" eyebrow="Student" title="My Claims"
        subtitle="Track the status of every ownership claim you have made from this device.">
        <form className="track-form" onSubmit={handleTrack}>
          <label htmlFor="track-claim" className="sr-only">Claim ID</label>
          <input id="track-claim" value={claimIdInput} onChange={(event) => setClaimIdInput(event.target.value)} placeholder="Track by claim ID, e.g. CL-3001" />
          <button type="submit" className="btn btn--outline">Track</button>
        </form>
      </PageHeader>

      <div className="container page-body">
        {loading ? (
          <LoadingSpinner label="Loading your claims…" />
        ) : myClaims.length === 0 ? (
          <EmptyState icon="assignment_ind" title="You have not claimed any items yet."
            message="Found your item in the list? Open it and click “This is my item”.">
            <Link to="/found" className="btn btn--primary">Browse found items</Link>
          </EmptyState>
        ) : (
          <>
            <div className="segmented" role="group" aria-label="Filter claims">
              {CLAIM_FILTERS.map(({ key, label, test }) => (
                <button key={key} type="button" className={cx('segmented__item', filterKey === key && 'is-active')}
                  onClick={() => setFilterKey(key)} aria-pressed={filterKey === key}>
                  {label} <span className="tab__count">{myClaims.filter(test).length}</span>
                </button>
              ))}
            </div>
            {shownClaims.length === 0 && <p className="muted">No claims in this group.</p>}
            <div className="claim-list">
              {shownClaims.map((claim, index) => <ClaimCard key={claim.id} claim={claim} index={index} />)}
            </div>
          </>
        )}
        <p className="muted small center-text"><Icon name="info" /> There is no login – claims are remembered in this browser’s localStorage.</p>
      </div>
    </>
  );
}

export default function MyClaims() {
  return (
    <ModeGate mode={MODES.STUDENT}>
      <MyClaimsContent />
    </ModeGate>
  );
}
