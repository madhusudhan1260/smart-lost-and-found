// Test suite for matching algorithm utilities
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractKeywords,
  getCommonKeywords,
  keywordSimilarity,
  calculateMatchScore,
  getMatchLevel,
  isOpenForMatching,
  getMatchBreakdown,
  findMatches,
} from '../src/utils/matching.js';
import { STATUS } from '../src/data/constants.js';

test('extractKeywords removes stop words, punctuation, and deduplicates', () => {
  const words = extractKeywords('A black iPhone 15, with transparent case! iPhone');
  assert.ok(words.includes('black'));
  assert.ok(words.includes('iphone'));
  assert.ok(words.includes('transparent'));
  assert.ok(words.includes('case'));
  assert.ok(!words.includes('with'));
  assert.ok(!words.includes('the'));
  assert.equal(words.filter((w) => w === 'iphone').length, 1);
});

test('extractKeywords handles empty and invalid inputs gracefully', () => {
  assert.deepEqual(extractKeywords(''), []);
  assert.deepEqual(extractKeywords(null), []);
  assert.deepEqual(extractKeywords(undefined), []);
  assert.deepEqual(extractKeywords(123), []);
});

test('getCommonKeywords returns shared keywords', () => {
  const common = getCommonKeywords(['iphone', 'black'], ['black', 'case']);
  assert.deepEqual(common, ['black']);
});

test('keywordSimilarity calculates accurate overlap ratio', () => {
  const listA = ['iphone', 'black'];
  const listB = ['black', 'phone', 'case'];
  const score = keywordSimilarity(listA, listB);
  assert.ok(score > 0);
  assert.equal(keywordSimilarity([], ['test']), 0);
  assert.equal(keywordSimilarity(['test'], []), 0);
});

test('getMatchBreakdown returns array of scored factors', () => {
  const factors = getMatchBreakdown(
    { name: 'iPhone', category: 'Electronics', color: 'Black', location: 'Library', date: '2026-03-01' },
    { name: 'iPhone', category: 'Electronics', color: 'Black', location: 'Library', date: '2026-03-01' },
  );
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(factors.some((f) => f.matched));
});

test('calculateMatchScore gives high score for identical items', () => {
  const lost = {
    id: 'lost-1',
    type: 'lost',
    category: 'Electronics',
    name: 'Blue Umbrella',
    color: 'Blue',
    location: 'Library 2nd Floor',
    date: '2026-03-01',
    description: 'Foldable blue umbrella with wooden handle',
    status: STATUS.LOST,
  };
  const found = {
    id: 'found-1',
    type: 'found',
    category: 'Electronics',
    name: 'Blue Umbrella',
    color: 'Blue',
    location: 'Library 2nd Floor',
    date: '2026-03-01',
    description: 'Foldable blue umbrella with wooden handle',
    status: STATUS.FOUND,
  };

  const score = calculateMatchScore(lost, found);
  assert.ok(score >= 80, `Expected score >= 80, got ${score}`);
});

test('calculateMatchScore handles null or missing arguments safely', () => {
  assert.equal(calculateMatchScore(null, {}), 0);
  assert.equal(calculateMatchScore({}, null), 0);
});

test('getMatchLevel returns proper labels and tones', () => {
  assert.equal(getMatchLevel(85).tone, 'high');
  assert.equal(getMatchLevel(60).tone, 'medium');
  assert.equal(getMatchLevel(30).tone, 'low');
});

test('isOpenForMatching correctly identifies active statuses', () => {
  assert.equal(isOpenForMatching({ status: STATUS.LOST }), true);
  assert.equal(isOpenForMatching({ status: STATUS.FOUND }), true);
  assert.equal(isOpenForMatching({ status: STATUS.RESOLVED }), false);
  assert.equal(isOpenForMatching({ status: STATUS.COLLECTED }), false);
});

test('findMatches guards against non-array input', () => {
  assert.deepEqual(findMatches({ type: 'lost' }, null), []);
  assert.deepEqual(findMatches(null, []), []);
});
