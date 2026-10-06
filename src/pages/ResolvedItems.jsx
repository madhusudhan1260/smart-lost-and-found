// File: src/pages/ResolvedItems.jsx
// Purpose: Page /resolved – collected and resolved cases.
// Used by: App.jsx

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { STATUS } from '../data/constants';
import { formatDateTime } from '../utils/dateUtils';
import { getPercentage } from '../utils/statistics';
import StatCard from '../components/StatCard';
import { cx } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import ItemImage from '../components/ItemImage';
import StatusBadge, { TypeChip } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const FILTERS = [
  { key: 'all', label: 'All closed' },
  { key: STATUS.COLLECTED, label: 'Collected' },
  { key: STATUS.RESOLVED, label: 'Resolved' },
];

// The most recent "closing" time of a case
const closedAt = (item) => item.resolvedAt ?? item.collectedAt ?? item.updatedAt ?? item.createdAt;

export default function ResolvedItems() {
  useDocumentTitle('Resolved Cases');
  const { items, claims, loading } = useItems();
  const [filter, setFilter] = useState('all');

  const closedItems = useMemo(
    () =>
      items
        .filter((item) => [STATUS.COLLECTED, STATUS.RESOLVED].includes(item.status))
        .filter((item) => filter === 'all' || item.status === filter)
        .sort((a, b) => new Date(closedAt(b)) - new Date(closedAt(a))),
    [items, filter],
  );

  // Summary numbers with filter / reduce
  const summary = useMemo(() => {
    const closed = items.filter((item) => [STATUS.COLLECTED, STATUS.RESOLVED].includes(item.status));
    const returned = closed.filter((item) => item.type === 'found' && item.collectedAt);
    const totalDays = returned.reduce(
      (sum, item) => sum + (new Date(item.collectedAt) - new Date(item.createdAt)) / (24 * 60 * 60 * 1000), 0);
    const foundCount = items.filter((item) => item.type === 'found').length;
    return {
      closed: closed.length,
      collected: closed.filter((item) => item.collectedAt).length,
      averageDays: returned.length ? Math.round(totalDays / returned.length) : 0,
      returnRate: getPercentage(returned.length, foundCount),
    };
  }, [items]);

  // Who collected it? Look up the claim for found items
  const claimantFor = (item) =>
    claims.find((claim) => claim.itemId === item.id || claim.lostItemId === item.id)?.claimantName ?? '—';

  return (
    <>
      <PageHeader icon="task_alt" tone="green" eyebrow="History" title="Resolved cases"
        subtitle="Items that were collected by their owners, and cases DOSS has closed." />
      <div className="container page-body">
        <section className="stat-grid resolved-stats" aria-label="Summary">
          <StatCard label="Cases closed" value={summary.closed} icon="task_alt" tone="green" />
          <StatCard label="Collected by owners" value={summary.collected} icon="handshake" tone="blue" />
          <StatCard label="Avg. days to return" value={summary.averageDays} icon="timer" tone="yellow" />
          <StatCard label="% of found items returned" value={summary.returnRate} icon="percent" tone="red" />
        </section>

        <div className="segmented" role="toolbar" aria-label="Filter resolved cases by status">
          {FILTERS.map(({ key, label }) => (
            <button key={key} type="button" className={cx('segmented__item', filter === key && 'is-active')}
              onClick={() => setFilter(key)} aria-pressed={filter === key}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : closedItems.length === 0 ? (
          <EmptyState icon="task_alt" title="No resolved cases." message="Cases appear here once an item is collected.">
            <Link to="/found" className="btn btn--primary">View found items</Link>
          </EmptyState>
        ) : (
          <div className="card table-wrap">
            <table className="table table--stack" aria-label="Resolved and collected items history">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Report</th>
                  <th scope="col">Returned to</th>
                  <th scope="col">Collected</th>
                  <th scope="col">Resolved</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {closedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/items/${item.id}`} className="table-item" aria-label={`View details for ${item.name}`}>
                        <ItemImage item={item} className="table-item__image" />
                        <span><strong>{item.name}</strong><small className="muted">{item.location}</small></span>
                      </Link>
                    </td>
                    <td data-label="Report"><TypeChip type={item.type} /></td>
                    <td data-label="Returned to">{claimantFor(item)}</td>
                    <td className="muted" data-label="Collected">{formatDateTime(item.collectedAt)}</td>
                    <td className="muted" data-label="Resolved">{formatDateTime(item.resolvedAt)}</td>
                    <td data-label="Status"><StatusBadge status={item.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
