// Unit test suite for statistics calculation utilities
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDossStats,
  getPercentage,
  getDailyCounts,
  getTopMatchPairs,
  getRecentActivity,
} from '../src/utils/statistics.js';

const mockItems = [
  { id: '1', type: 'lost', status: 'LOST', category: 'Electronics', date: '2026-03-01', createdAt: '2026-03-01T10:00:00Z' },
  { id: '2', type: 'found', status: 'FOUND', category: 'Electronics', date: '2026-03-01', createdAt: '2026-03-01T11:00:00Z' },
  { id: '3', type: 'found', status: 'READY_FOR_COLLECTION', category: 'Wallets', date: '2026-03-02', createdAt: '2026-03-02T12:00:00Z' },
  { id: '4', type: 'found', status: 'COLLECTED', category: 'Bags', date: '2026-03-02', createdAt: '2026-03-02T13:00:00Z', collectedAt: '2026-03-03T10:00:00Z' },
];

const mockClaims = [
  { id: 'CL-1', itemId: '2', status: 'CLAIM_PENDING', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'CL-2', itemId: '3', status: 'CLAIM_ACCEPTED', createdAt: '2026-03-02T14:00:00Z', acceptedAt: '2026-03-02T15:00:00Z' },
];

test('getDossStats aggregates items and claims accurately', () => {
  const stats = getDossStats(mockItems, mockClaims);
  assert.equal(stats.total, 4);
  assert.equal(stats.lost, 1);
  assert.equal(stats.found, 3);
  assert.equal(stats.readyForCollection, 1);
  assert.equal(stats.collected, 1);
  assert.equal(stats.claims.pending, 1);
  assert.equal(stats.claims.accepted, 1);
});

test('getPercentage calculates accurate rounded percentage', () => {
  assert.equal(getPercentage(1, 2), 50);
  assert.equal(getPercentage(1, 3), 33);
  assert.equal(getPercentage(0, 0), 0);
  assert.equal(getPercentage(5, 5), 100);
});

test('getDailyCounts returns requested number of days', () => {
  const daily = getDailyCounts(mockItems, 7);
  assert.equal(daily.length, 7);
  assert.ok(daily.every((d) => typeof d.lost === 'number' && typeof d.found === 'number'));
});

test('getRecentActivity generates formatted activity list', () => {
  const activity = getRecentActivity(mockItems, mockClaims, 5);
  assert.ok(Array.isArray(activity));
  assert.ok(activity.length > 0);
  assert.ok(activity[0].text);
});

test('getTopMatchPairs identifies top match candidates', () => {
  const pairs = getTopMatchPairs(mockItems, 2);
  assert.ok(Array.isArray(pairs));
});
