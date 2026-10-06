// File: src/utils/claimUtils.js
// Used by: components/ClaimReview.jsx, components/ClaimTimeline.jsx, components/ItemCard.jsx,
//          components/MatchCard.jsx, context/ItemContext.jsx, pages/ClaimItem.jsx,
//          pages/ItemDetails.jsx
// Business rules for ownership claims.
// Pure JavaScript – no React – so every rule can be explained on its own.
import { NEARBY_LOCATIONS, STATUS } from '../data/constants';
import { daysBetween } from './dateUtils';
import { calculateMatchScore, extractKeywords, getCommonKeywords, keywordSimilarity } from './matching';

// Only found items that nobody has collected yet can be claimed
export const canBeClaimed = (item) =>
  item?.type === 'found' && [STATUS.FOUND, STATUS.CLAIM_PENDING].includes(item.status);

// After a claim is rejected: if other claims are still waiting the item stays
// "claim pending", otherwise it goes back to being a normal found item.
export function statusAfterRejection(itemId, claims, rejectedClaimId) {
  const othersPending = claims.some(
    (claim) => claim.itemId === itemId && claim.id !== rejectedClaimId && claim.status === STATUS.CLAIM_PENDING,
  );
  return othersPending ? STATUS.CLAIM_PENDING : STATUS.FOUND;
}

// Was this claim ever accepted? (it may have moved on to collected / resolved since)
export const wasAccepted = (claim) => Boolean(claim.acceptedAt);

/**
 * Helps DOSS compare the claimant's answers with the PRIVATE details
 * that the finder (and the owner's lost report) gave. DOSS still decides.
 * Returns { checks: [...], score: 0-100, level: {label, tone} }
 */
export function verifyClaim(claim, foundItem, lostItem = null) {
  if (!claim || !foundItem) {
    return {
      checks: [],
      score: 0,
      level: { label: 'Weak evidence', tone: 'red' },
    };
  }

  const privateText = [foundItem?.privateDetails, lostItem?.privateDetails].filter(Boolean).join(' ');
  const claimWords = extractKeywords(`${claim.uniqueFeature ?? ''} ${claim.additionalProof ?? ''}`);
  const privateWords = extractKeywords(privateText);
  const sharedWords = getCommonKeywords(claimWords, privateWords);
  const featureRatio = keywordSimilarity(claimWords, privateWords);

  const nearby = NEARBY_LOCATIONS[claim.lostLocation] ?? [];
  const sameLocation = Boolean(claim.lostLocation && foundItem.location && claim.lostLocation === foundItem.location);
  const dateGap = (claim.lostDate && foundItem.date) ? daysBetween(claim.lostDate, foundItem.date) : 999; // positive → found after loss

  const checks = [
    {
      label: 'Unique feature matches private details',
      weight: 50,
      ratio: featureRatio >= 0.5 ? 1 : featureRatio >= 0.25 ? 0.5 : 0,
      detail: sharedWords.length
        ? `Shared words: ${sharedWords.slice(0, 5).join(', ')}`
        : 'No overlap with the private details',
    },
    {
      label: 'Location is consistent',
      weight: 20,
      ratio: sameLocation ? 1 : nearby.includes(foundItem.location) ? 0.5 : 0,
      detail: `Lost at ${claim.lostLocation || 'unknown'} · found at ${foundItem.location || 'unknown'}`,
    },
    {
      label: 'Dates are consistent',
      weight: 15,
      ratio: dateGap >= -1 && dateGap <= 14 ? 1 : 0,
      detail:
        dateGap >= 0
          ? `Found ${dateGap} day(s) after the claimed loss date`
          : `Claimed loss date is ${Math.abs(dateGap)} day(s) after it was found`,
    },
    {
      label: 'Linked to a matching lost report',
      weight: 15,
      ratio: lostItem ? (calculateMatchScore(lostItem, foundItem) >= 50 ? 1 : 0.5) : 0,
      detail: lostItem
        ? `Lost report ${lostItem.id} scores ${calculateMatchScore(lostItem, foundItem)}% with this item`
        : 'No lost report was linked',
    },
  ];

  const score = Math.round(checks.reduce((total, check) => total + check.ratio * check.weight, 0));
  const level =
    score >= 70
      ? { label: 'Strong evidence', tone: 'green' }
      : score >= 40
        ? { label: 'Some evidence', tone: 'yellow' }
        : { label: 'Weak evidence', tone: 'red' };

  return { checks, score, level };
}

// Steps for the claim progress tracker shown to the student
export function getClaimTimeline(claim) {
  if (!claim) return [];
  const rejected = claim.status === STATUS.CLAIM_REJECTED;

  const steps = [
    { key: 'submitted', label: 'Claim submitted', at: claim.createdAt },
    rejected
      ? { key: 'rejected', label: 'Claim rejected', at: claim.reviewedAt, failed: true }
      : { key: 'accepted', label: 'Accepted by DOSS', at: claim.acceptedAt },
    ...(rejected
      ? []
      : [
          { key: 'collected', label: 'Collected', at: claim.collectedAt },
          { key: 'resolved', label: 'Case resolved', at: claim.resolvedAt },
        ]),
  ];

  // A step is "done" when it has a timestamp; the first unfinished step is "current"
  const currentIndex = steps.findIndex((step) => !step.at);
  return steps.map((step, index) => ({ ...step, done: Boolean(step.at), current: index === currentIndex }));
}
