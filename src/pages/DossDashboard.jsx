// File: src/pages/DossDashboard.jsx
// Purpose: DOSS dashboard: statistics, pending claims, collection and charts.
// Used by: App.jsx

import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { CATEGORY_META, STATUS } from '../data/constants';
import {
  countBy, getDailyCounts, getDossStats, getPercentage, getRecentActivity, getTopMatchPairs, toSortedEntries,
} from '../utils/statistics';
import { formatDate, timeAgo } from '../utils/dateUtils';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import DashboardCard from '../components/DashboardCard';
import ClaimCard from '../components/ClaimCard';
import MatchPairList from '../components/MatchPairList';
import BarChart from '../components/BarChart';
import ItemImage from '../components/ItemImage';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

export default function DossDashboard() {
  useDocumentTitle('DOSS Dashboard');
  const { items, claims, loading, markCollected, resetData } = useItems();
  const { notify } = useNotification();
  const [modal, setModal] = useState(null); // { type: 'collect', item } | { type: 'reset' }
  const [busy, setBusy] = useState(false);

  // Every number below is DERIVED from items + claims (nothing is stored twice)
  const stats = useMemo(() => getDossStats(items, claims), [items, claims]);
  const pendingClaims = useMemo(
    () => claims.filter((claim) => claim.status === STATUS.CLAIM_PENDING)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), // oldest first = waiting longest
    [claims],
  );
  // Only FOUND items are physically waiting at the DOSS office
  const readyItems = useMemo(
    () => items.filter((item) => item.type === 'found' && item.status === STATUS.READY_FOR_COLLECTION),
    [items],
  );
  const categories = useMemo(() => toSortedEntries(countBy(items, 'category'), 6), [items]);
  const dailyCounts = useMemo(() => getDailyCounts(items, 7), [items]);
  const pairs = useMemo(() => getTopMatchPairs(items, 4), [items]);
  const activity = useMemo(() => getRecentActivity(items, claims, 7), [items, claims]);

  const maxDaily = Math.max(1, ...dailyCounts.map((day) => day.lost + day.found));
  const closedCount = stats.collected + stats.resolved;
  const recoveryRate = getPercentage(closedCount, stats.found);

  const closeModal = useCallback(() => setModal(null), []);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      if (modal.type === 'collect') {
        await markCollected(modal.item.id);
        notify('Item marked as collected.', 'success');
      } else {
        await resetData();
        notify('Demo data restored.', 'info');
      }
      setModal(null);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container page-body"><LoadingSpinner label="Crunching the numbers…" /></div>;

  return (
    <>
      <PageHeader icon="shield_person" tone="blue" eyebrow="DOSS mode" title="DOSS dashboard"
        subtitle="Review ownership claims, hand over items and track every case until it is resolved.">
        <Link to="/doss/claims" className="btn btn--primary"><Icon name="fact_check" /> Review claims ({stats.claims.pending})</Link>
        <button type="button" className="btn btn--text" onClick={() => setModal({ type: 'reset' })}>
          <Icon name="restart_alt" /> Reset demo data
        </button>
      </PageHeader>

      <div className="container page-body">
        <section className="stat-grid stat-grid--dense" aria-label="Summary">
          <StatCard label="Total Reports" value={stats.total} icon="folder_open" tone="grey" />
          <StatCard label="Lost Items" value={stats.lost} icon="search" tone="blue" to="/lost" />
          <StatCard label="Found Items" value={stats.found} icon="inventory_2" tone="green" to="/found" />
          <StatCard label="Pending Claims" value={stats.claims.pending} icon="hourglass_top" tone="yellow" to="/doss/claims" />
          <StatCard label="Accepted Claims" value={stats.claims.accepted} icon="verified" tone="green" />
          <StatCard label="Rejected Claims" value={stats.claims.rejected} icon="block" tone="red" />
          <StatCard label="Ready for Collection" value={stats.readyForCollection} icon="storefront" tone="blue" />
          <StatCard label="Collected Items" value={stats.collected} icon="handshake" tone="green" to="/resolved" />
          <StatCard label="Resolved Cases" value={stats.resolved} icon="task_alt" tone="green" to="/resolved" />
        </section>

        <div className="two-col section">
          <DashboardCard title="Pending claims" icon="fact_check" action="All claims" actionTo="/doss/claims">
            {pendingClaims.length ? (
              <div className="claim-rows">
                {pendingClaims.map((claim, index) => <ClaimCard key={claim.id} claim={claim} view="doss" index={index} />)}
              </div>
            ) : (
              <p className="muted">No pending claims.</p>
            )}
          </DashboardCard>

          <DashboardCard title="Ready for collection" icon="storefront">
            {readyItems.length ? (
              <ul className="ready-list">
                {readyItems.map((item) => (
                  <li key={item.id}>
                    <ItemImage item={item} className="ready-list__image" />
                    <Link to={`/items/${item.id}`} className="ready-list__name">
                      <strong>{item.name}</strong>
                      <small className="muted">Claim {item.claimId ?? '—'} · found {formatDate(item.date)}</small>
                    </Link>
                    <button type="button" className="btn btn--tonal btn--sm" onClick={() => setModal({ type: 'collect', item })}>
                      <Icon name="handshake" /> Mark as collected
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Nothing is waiting for collection.</p>
            )}
          </DashboardCard>
        </div>

        <div className="three-col section">
          <DashboardCard title="Recovery rate" icon="donut_large">
            <div className="donut" style={{ '--value': recoveryRate }} role="img" aria-label={`${recoveryRate}% of found items returned`}>
              <div className="donut__center"><strong>{recoveryRate}%</strong><small>returned</small></div>
            </div>
            <p className="muted small center-text">{closedCount} of {stats.found} found items are back with their owners.</p>
          </DashboardCard>

          <DashboardCard title="Reports – last 7 days" icon="bar_chart">
            <div className="column-chart" role="img" aria-label="Reports per day for the last 7 days">
              {dailyCounts.map(({ date, label, lost, found }, index) => (
                <div key={date} className="column-chart__col" title={`${formatDate(date)}: ${lost} lost, ${found} found`}>
                  <div className="column-chart__stack" style={{ animationDelay: `${index * 60}ms` }}>
                    <span className="column-chart__found" style={{ height: `${(found / maxDaily) * 100}%` }} />
                    <span className="column-chart__lost" style={{ height: `${(lost / maxDaily) * 100}%` }} />
                  </div>
                  <small>{label}</small>
                </div>
              ))}
            </div>
            <ul className="legend">
              <li><span className="legend__dot legend__dot--blue" /> Lost</li>
              <li><span className="legend__dot legend__dot--green" /> Found</li>
            </ul>
          </DashboardCard>

          <DashboardCard title="Reports by category" icon="category">
            <BarChart data={categories} colorFor={(label) => CATEGORY_META[label]?.color}
              linkFor={(label) => `/found?category=${encodeURIComponent(label)}`} />
          </DashboardCard>
        </div>

        <div className="two-col section">
          <DashboardCard title="Smart Match suggestions" icon="join_inner" action="Smart Match" actionTo="/smart-match">
            <MatchPairList pairs={pairs} />
          </DashboardCard>
          <DashboardCard title="Recent activity" icon="history">
            <ul className="activity">
              {activity.map((event) => (
                <li key={event.id}>
                  <span className="activity__icon"><Icon name={event.icon} /></span>
                  <Link to={event.link}>{event.text}</Link>
                  <small className="muted">{timeAgo(event.at)}</small>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </div>
      </div>

      <Modal
        isOpen={Boolean(modal)}
        title={modal?.type === 'collect' ? 'Mark as collected?' : 'Reset demo data?'}
        confirmText={modal?.type === 'collect' ? 'Mark as collected' : 'Reset data'}
        tone={modal?.type === 'collect' ? 'primary' : 'danger'}
        busy={busy}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      >
        {modal?.type === 'collect' ? (
          <p>Confirm that the owner collected <strong>{modal.item.name}</strong> after showing their student ID. The collection date and time will be saved.</p>
        ) : (
          <p>All reports and claims will be replaced with the original sample data.</p>
        )}
      </Modal>
    </>
  );
}
