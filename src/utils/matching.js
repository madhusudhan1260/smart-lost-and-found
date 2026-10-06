// File: src/utils/matching.js
// Used by: components/ClaimForm.jsx, components/MatchCard.jsx, components/ScoreRing.jsx,
//          pages/ItemDetails.jsx, pages/SmartMatch.jsx, utils/claimUtils.js, utils/statistics.js
// SMART MATCH ALGORITHM
// Compares a LOST item with a FOUND item and gives a score from 0 to 100.
// Plain JavaScript only: strings, arrays, objects, Date and a little maths. No AI / ML.
import { NEARBY_LOCATIONS, STATUS, DEFAULT_MATCH_THRESHOLD } from '../data/constants';
import { daysBetween } from './dateUtils';

// Maximum points for every factor (they add up to 100)
export const MATCH_WEIGHTS = {
  category: 20,
  name: 25,
  color: 15,
  location: 20,
  date: 10,
  description: 10,
};

// Common words that say nothing about the item itself
const STOP_WORDS = [
  'a', 'an', 'the', 'and', 'or', 'with', 'of', 'in', 'on', 'at', 'to', 'for', 'my',
  'is', 'it', 'its', 'has', 'have', 'was', 'near', 'from', 'by', 'this', 'that',
  'some', 'very', 'one', 'lost', 'found', 'left', 'item', 'there', 'inside', 'had',
  'are', 'were', 'which', 'when', 'where', 'also', 'just', 'can', 'you', 'your', 'our',
];

// "Black iPhone 15, transparent case!" → ['black', 'iphone', '15', 'transparent', 'case']
export function extractKeywords(text = '', minLength = 3) {
  if (typeof text !== 'string' || !text.trim()) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // remove punctuation with a regular expression
    .split(/\s+/);

  const keywords = words.filter((word) => word.length >= minLength && !STOP_WORDS.includes(word));
  return [...new Set(keywords)]; // remove duplicates
}

// "phone" and "iphone" count as the same word; very short words must match exactly
const isSimilarWord = (wordA, wordB) =>
  wordA === wordB ||
  (wordA.length >= 4 && wordB.length >= 4 && (wordA.includes(wordB) || wordB.includes(wordA)));

export function getCommonKeywords(wordsA, wordsB) {
  return wordsA.filter((word) => wordsB.some((other) => isSimilarWord(word, other)));
}

// 0 → nothing in common, 1 → every keyword of the shorter list appears in the other
export function keywordSimilarity(wordsA, wordsB) {
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const common = getCommonKeywords(wordsA, wordsB);
  return Math.min(1, common.length / Math.min(wordsA.length, wordsB.length));
}

function compareColors(colorA = '', colorB = '') {
  const a = String(colorA ?? '').toLowerCase().trim();
  const b = String(colorB ?? '').toLowerCase().trim();
  if (!a || !b) return 0;
  if (a === b) return 1;

  // Partial match: "Dark Blue" vs "Blue", ignoring connectors like "and"
  const wordsA = a.split(/[\s/-]+/).filter((word) => word.length >= 3 && !['and', 'the', 'with'].includes(word));
  const wordsB = b.split(/[\s/-]+/).filter((word) => word.length >= 3 && !['and', 'the', 'with'].includes(word));
  return wordsA.some((word) => wordsB.includes(word)) ? 0.5 : 0;
}

function compareLocations(locationA = '', locationB = '') {
  const locA = String(locationA ?? '').trim();
  const locB = String(locationB ?? '').trim();
  if (!locA || !locB) return 0;
  if (locA.toLowerCase() === locB.toLowerCase()) return 1;
  const nearby = NEARBY_LOCATIONS[locA] ?? [];
  return nearby.some((place) => place.toLowerCase() === locB.toLowerCase()) ? 0.5 : 0;
}

// The closer the dates, the higher the score.
function compareDates(lostDate, foundDate) {
  const gap = daysBetween(lostDate, foundDate); // positive → found AFTER it was lost

  // Found long before it was lost? Then it cannot be the same item.
  // (1 day of tolerance because people mis-remember dates.)
  if (gap < -1) return 0;

  const days = Math.abs(gap);
  if (days <= 1) return 1;
  if (days <= 3) return 0.7;
  if (days <= 7) return 0.4;
  if (days <= 14) return 0.2;
  return 0;
}

function describeDateGap(lostDate, foundDate) {
  const gap = daysBetween(lostDate, foundDate);
  if (gap === 0) return 'Reported on the same day';
  if (gap < 0) return `Found ${Math.abs(gap)} day(s) before the loss date`;
  return `Found ${gap} day${gap > 1 ? 's' : ''} after it was lost`;
}

// Short "✓ Same category" style texts shown on match cards
const FULL_MATCH_TEXT = {
  category: 'Same category',
  name: 'Similar item name',
  color: 'Same colour',
  location: 'Same location',
  date: 'Similar date',
  description: 'Matching description',
};
const PARTIAL_MATCH_TEXT = {
  ...FULL_MATCH_TEXT,
  color: 'Similar colour',
  location: 'Nearby location',
  name: 'Partly similar name',
  date: 'Close date',
  description: 'Some shared keywords',
};

// Detailed, factor-by-factor comparison (shown on the Smart Match page)
export function getMatchBreakdown(lostItem, foundItem) {
  if (!lostItem || !foundItem) return [];
  const lostNameWords = extractKeywords(lostItem.name, 2);
  const foundNameWords = extractKeywords(foundItem.name, 2);
  const lostDescWords = extractKeywords(lostItem.description);
  const foundDescWords = extractKeywords(foundItem.description);
  const sharedDescWords = getCommonKeywords(lostDescWords, foundDescWords);

  const locationRatio = compareLocations(lostItem.location, foundItem.location);
  const colorRatio = compareColors(lostItem.color, foundItem.color);

  const factors = [
    {
      key: 'category',
      label: 'Category',
      ratio: lostItem.category === foundItem.category ? 1 : 0,
      detail:
        lostItem.category === foundItem.category
          ? `Both are ${lostItem.category}`
          : `${lostItem.category} vs ${foundItem.category}`,
    },
    {
      key: 'name',
      label: 'Item name',
      ratio: keywordSimilarity(lostNameWords, foundNameWords),
      detail: `"${lostItem.name}" vs "${foundItem.name}"`,
    },
    {
      key: 'color',
      label: 'Colour',
      ratio: colorRatio,
      detail:
        colorRatio === 1
          ? `Same colour: ${foundItem.color}`
          : `${lostItem.color} vs ${foundItem.color}`,
    },
    {
      key: 'location',
      label: 'Location',
      ratio: locationRatio,
      detail:
        locationRatio === 1
          ? `Same place: ${foundItem.location}`
          : locationRatio > 0
            ? `Nearby: ${lostItem.location} ↔ ${foundItem.location}`
            : `${lostItem.location} vs ${foundItem.location}`,
    },
    {
      key: 'date',
      label: 'Date',
      ratio: compareDates(lostItem.date, foundItem.date),
      detail: describeDateGap(lostItem.date, foundItem.date),
    },
    {
      key: 'description',
      label: 'Description',
      ratio: keywordSimilarity(lostDescWords, foundDescWords),
      detail: sharedDescWords.length
        ? `Shared words: ${sharedDescWords.slice(0, 4).join(', ')}`
        : 'No common keywords',
    },
  ];

  // Convert each ratio (0–1) into points using the weights table
  return factors.map((factor) => {
    const max = MATCH_WEIGHTS[factor.key];
    const points = Math.round(factor.ratio * max);
    const summary = factor.ratio === 1 ? FULL_MATCH_TEXT[factor.key] : PARTIAL_MATCH_TEXT[factor.key];
    return { ...factor, max, points, matched: points > 0, summary };
  });
}

const sumPoints = (factors) => factors.reduce((total, factor) => total + factor.points, 0);

// The main reusable function: returns a number from 0 to 100
export function calculateMatchScore(lostItem, foundItem) {
  if (!lostItem || !foundItem) return 0;
  const score = sumPoints(getMatchBreakdown(lostItem, foundItem));
  return Math.max(0, Math.min(100, score));
}

// Only reports that are still "waiting" take part in matching:
// a lost item nobody has found yet, or a found item nobody has collected yet.
const OPEN_STATUSES = [STATUS.LOST, STATUS.FOUND, STATUS.CLAIM_PENDING];
export const isOpenForMatching = (item) => OPEN_STATUSES.includes(item.status);

// Works from either side: a lost item is compared with found items and vice versa.
// Returns [{ item, score, factors }] sorted from highest to lowest score.
export function findMatches(sourceItem, allItems, minScore = DEFAULT_MATCH_THRESHOLD) {
  if (!sourceItem || !Array.isArray(allItems)) return [];
  const oppositeType = sourceItem.type === 'lost' ? 'found' : 'lost';

  return allItems
    .filter(
      (other) => other.type === oppositeType && isOpenForMatching(other) && other.id !== sourceItem.id,
    )
    .map((other) => {
      // Destructuring swap so the lost item is always the first argument
      const [lostItem, foundItem] = sourceItem.type === 'lost' ? [sourceItem, other] : [other, sourceItem];
      const factors = getMatchBreakdown(lostItem, foundItem);
      const score = Math.max(0, Math.min(100, sumPoints(factors)));
      return { item: other, score, factors };
    })
    .filter((match) => match.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

export function getMatchLevel(score) {
  if (score >= 75) return { label: 'Strong match', tone: 'high' };
  if (score >= 50) return { label: 'Good match', tone: 'medium' };
  return { label: 'Possible match', tone: 'low' };
}
