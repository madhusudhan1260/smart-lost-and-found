// File: src/pages/DossClaims.jsx
// Purpose: Page /doss/claims – all claims grouped in status tabs (DOSS mode).
// Used by: App.jsx

import { useMemo, useState } from 'react';
import { useItems } from '../context/ItemContext';
import useDebounce from '../hooks/useDebounce';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { MODES, STATUS } from '../data/constants';
import { searchClaims } from '../utils/searchUtils';
import { cx } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import ClaimCard from '../components/ClaimCard';
import ModeGate from '../components/ModeGate';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

// Each tab is a name + a test function (array of objects holding callbacks)
const TABS = [
  { key: 'pending', label: 'Pending', test: (claim) => claim.status === STATUS.CLAIM_PENDING, empty: 'No pending claims.' },
  { key: 'accepted', label: 'Ready for collection', test: (claim) => claim.status === STATUS.CLAIM_ACCEPTED, empty: 'No accepted claims waiting.' },
  { key: 'closed', label: 'Collected', test: (claim) => [STATUS.COLLECTED, STATUS.RESOLVED].includes(claim.status), empty: 'No collected items yet.' },
  { key: 'rejected', label: 'Rejected', test: (claim) => claim.status === STATUS.CLAIM_REJECTED, empty: 'No rejected claims.' },
  { key: 'all', label: 'All', test: () => true, empty: 'No claims yet.' },
];

function DossClaimsContent() {
  useDocumentTitle('Claims');
  const { claims, loading } = useItems();
  const [activeTab, setActiveTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);
  const debouncedQuery = useDebounce(query, 300);

  const tab = TABS.find((entry) => entry.key === activeTab) ?? TABS[0];

  const visibleClaims = useMemo(
    () =>
      searchClaims(claims.filter(tab.test), debouncedQuery)
        .sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)) * (newestFirst ? 1 : -1)),
    [claims, tab, debouncedQuery, newestFirst],
  );

  return (
    <>
      <PageHeader icon="fact_check" tone="yellow" eyebrow="DOSS" title="Ownership claims"
        subtitle="Open a claim to compare the claimant’s answers with the private details of the reports." />
      <div className="container page-body">
        <div className="claims-toolbar card">
          <div className="tabs" role="tablist" aria-label="Claim status">
            {TABS.map(({ key, label, test }) => (
              <button
                key={key}
                id={`claim-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                aria-controls="claims-tabpanel"
                className={cx('tab', activeTab === key && 'is-active')}
                onClick={() => setActiveTab(key)}
              >
                {label} <span className="tab__count">{claims.filter(test).length}</span>
              </button>
            ))}
          </div>
          <div className="claims-toolbar__row">
            <SearchBar
              id="claim-search"
              value={query}
              onChange={setQuery}
              placeholder="Search by name, roll number, contact or claim ID"
              ariaLabel="Search claims"
            />
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setNewestFirst((value) => !value)}>
              <Icon name="swap_vert" /> {newestFirst ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </div>

        <div id="claims-tabpanel" role="tabpanel" aria-labelledby={`claim-tab-${tab.key}`}>
          {loading ? (
            <LoadingSpinner />
          ) : visibleClaims.length === 0 ? (
            <EmptyState icon="inbox" title={debouncedQuery ? 'No claims match your search' : tab.empty} />
          ) : (
            <div className="claim-rows card">
              {visibleClaims.map((claim, index) => <ClaimCard key={claim.id} claim={claim} view="doss" index={index} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function DossClaims() {
  return (
    <ModeGate mode={MODES.DOSS}>
      <DossClaimsContent />
    </ModeGate>
  );
}
