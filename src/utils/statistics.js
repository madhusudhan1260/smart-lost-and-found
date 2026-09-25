// Dashboard statistics calculated with filter(), map(), reduce() and sort().
import { STATUS, DEFAULT_MATCH_THRESHOLD } from '../data/constants';
import { daysAgoISO, parseLocalDate } from './dateUtils';
import { findMatches, isOpenForMatching } from './matching';

// One pass with reduce() builds all the item counters at once
export function getItemStats(items) {
  return items.reduce(
    (stats, item) => {
      stats.total += 1;
      stats[item.type] += 1; // item.type is 'lost' or 'found'
      if (item.type === 'found' && item.status === STATUS.READY_FOR_COLLECTION) stats.readyForCollection += 1;
      if (item.type === 'found' && item.status === STATUS.COLLECTED) stats.collected += 1;
      if (item.status === STATUS.RESOLVED) stats.resolved += 1;
      if (isOpenForMatching(item)) stats.open += 1;
      return stats;
    },
    { total: 0, lost: 0, found: 0, readyForCollection: 0, collected: 0, resolved: 0, open: 0 },
  );
}

export function getClaimStats(claims) {
  return claims.reduce(
    (stats, claim) => {
      stats.total += 1;
      switch (claim.status) {
        case STATUS.CLAIM_PENDING:
          stats.pending += 1;
          break;
        case STATUS.CLAIM_REJECTED:
          stats.rejected += 1;
          break;
        default:
          break;
      }
      if (claim.acceptedAt) stats.accepted += 1; // accepted at some point (may be collected now)
      return stats;
    },
    { total: 0, pending: 0, accepted: 0, rejected: 0 },
  );
}

// Everything the DOSS dashboard needs, combined into one object with spread
export const getDossStats = (items, claims) => ({
  ...getItemStats(items),
  claims: getClaimStats(claims),
});

// countBy(items, 'category') → { Electronics: 4, Books: 2, ... }
export function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] ?? 'Unknown';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

// { Books: 2, Keys: 5 } → [{ label: 'Keys', count: 5 }, { label: 'Books', count: 2 }]
export function toSortedEntries(counts, limit = Infinity) {
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getRecentItems(items, limit = 5) {
  return [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export const getPercentage = (part, total) => (total === 0 ? 0 : Math.round((part / total) * 100));

// Reports per day for the last `days` days (for the trend chart)
export function getDailyCounts(items, days = 7) {
  const result = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = daysAgoISO(offset);
    const dayItems = items.filter((item) => item.date === date);
    result.push({
      date,
      label: parseLocalDate(date).toLocaleDateString('en-IN', { weekday: 'short' }),
      lost: dayItems.filter((item) => item.type === 'lost').length,
      found: dayItems.filter((item) => item.type === 'found').length,
    });
  }
  return result;
}

// Best Smart Match for every open lost item (used on Home, Student and DOSS dashboards)
export function getTopMatchPairs(items, limit = 5, minScore = DEFAULT_MATCH_THRESHOLD) {
  return items
    .filter((item) => item.type === 'lost' && item.status === STATUS.LOST)
    .map((lost) => ({ lost, best: findMatches(lost, items, minScore)[0] ?? null }))
    .filter((entry) => entry.best !== null)
    .sort((a, b) => b.best.score - a.best.score)
    .slice(0, limit);
}

// A single timeline of everything that happened, newest first
export function getRecentActivity(items, claims, limit = 8) {
  const itemEvents = items.map((item) => ({
    id: `item-${item.id}`,
    at: item.createdAt,
    icon: item.type === 'lost' ? 'search' : 'inventory_2',
    text: `${item.type === 'lost' ? 'Lost' : 'Found'} report: ${item.name}`,
    link: `/items/${item.id}`,
  }));

  const claimEvents = claims.flatMap((claim) => {
    const events = [{ id: `${claim.id}-new`, at: claim.createdAt, icon: 'front_hand', text: `${claim.claimantName} submitted claim ${claim.id}` }];
    if (claim.reviewedAt) {
      const accepted = Boolean(claim.acceptedAt);
      events.push({
        id: `${claim.id}-review`,
        at: claim.reviewedAt,
        icon: accepted ? 'verified' : 'block',
        text: `Claim ${claim.id} ${accepted ? 'accepted' : 'rejected'}`,
      });
    }
    if (claim.collectedAt) {
      events.push({ id: `${claim.id}-collected`, at: claim.collectedAt, icon: 'handshake', text: `${claim.claimantName} collected the item` });
    }
    return events.map((event) => ({ ...event, link: `/doss/claims/${claim.id}` }));
  });

  return [...itemEvents, ...claimEvents]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
}
