// File: src/pages/StudentDashboard.jsx
// Purpose: Student dashboard: my claims, possible matches and campus stats.
// Used by: App.jsx

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { CATEGORY_META, STATUS } from '../data/constants';
import { countBy, getItemStats, getTopMatchPairs, toSortedEntries } from '../utils/statistics';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import DashboardCard from '../components/DashboardCard';
import ClaimCard from '../components/ClaimCard';
import MatchPairList from '../components/MatchPairList';
import BarChart from '../components/BarChart';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

export default function StudentDashboard() {
  useDocumentTitle('Student Dashboard');
  const { items, myClaims, loading } = useItems();

  // Count my claims by status in one reduce() pass
  const myStats = useMemo(
    () =>
      myClaims.reduce(
        (stats, { status }) => {
          if (status === STATUS.CLAIM_PENDING) stats.pending += 1;
          else if (status === STATUS.CLAIM_ACCEPTED) stats.ready += 1;
          else if (status === STATUS.CLAIM_REJECTED) stats.rejected += 1;
          else stats.collected += 1; // COLLECTED or RESOLVED
          return stats;
        },
        { pending: 0, ready: 0, rejected: 0, collected: 0 },
      ),
    [myClaims],
  );

  const campus = useMemo(() => getItemStats(items), [items]);
  const pairs = useMemo(() => getTopMatchPairs(items, 5), [items]);
  const openFound = useMemo(
    () => toSortedEntries(countBy(items.filter((item) => item.type === 'found' && item.status === STATUS.FOUND), 'category')),
    [items],
  );

  if (loading) return <div className="container page-body"><LoadingSpinner /></div>;

  return (
    <>
      <PageHeader icon="school" tone="blue" eyebrow="Student mode" title="Student dashboard"
        subtitle="Your claims, possible matches and what is waiting at the DOSS office.">
        <Link to="/report-lost" className="btn btn--primary"><Icon name="add" /> Report Lost Item</Link>
        <Link to="/report-found" className="btn btn--outline"><Icon name="add" /> Report Found Item</Link>
      </PageHeader>

      <div className="container page-body">
        <section className="stat-grid" aria-label="My claims">
          <StatCard label="Claims pending" value={myStats.pending} icon="hourglass_top" tone="yellow" to="/my-claims" />
          <StatCard label="Ready for collection" value={myStats.ready} icon="storefront" tone="blue" to="/my-claims" />
          <StatCard label="Collected" value={myStats.collected} icon="handshake" tone="green" />
          <StatCard label="Rejected" value={myStats.rejected} icon="block" tone="red" />
        </section>

        <div className="two-col section">
          <DashboardCard title="My claims" icon="assignment_ind" action="All my claims" actionTo="/my-claims">
            {myClaims.length ? (
              <div className="claim-list claim-list--compact">
                {myClaims.slice(0, 2).map((claim, index) => <ClaimCard key={claim.id} claim={claim} index={index} />)}
              </div>
            ) : (
              <EmptyState icon="assignment_ind" title="No claims yet">
                <Link to="/found" className="btn btn--primary btn--sm">Browse found items</Link>
              </EmptyState>
            )}
          </DashboardCard>

          <div className="stack">
            <DashboardCard title="Possible matches" icon="join_inner" action="Smart Match" actionTo="/smart-match">
              <MatchPairList pairs={pairs} />
            </DashboardCard>
            <DashboardCard title="Unclaimed found items by category" icon="inventory_2" action="Found items" actionTo="/found">
              <BarChart data={openFound} colorFor={(label) => CATEGORY_META[label]?.color} emptyText="No unclaimed items." />
            </DashboardCard>
            <DashboardCard title="Campus at a glance" icon="insights">
              <ul className="glance">
                <li><strong>{campus.open}</strong> open reports</li>
                <li><strong>{campus.readyForCollection}</strong> items waiting at DOSS</li>
                <li><strong>{campus.resolved}</strong> cases resolved</li>
              </ul>
            </DashboardCard>
          </div>
        </div>
      </div>
    </>
  );
}
