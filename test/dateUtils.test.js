// Test suite for dateUtils helper functions
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toISODate,
  daysAgoISO,
  daysBetween,
  isFutureDate,
  formatDate,
  formatDateTime,
  formatTime,
  timeAgo,
  isInDateRange,
  isWithinHours,
  isoHoursAgo,
  isoDaysAgo,
} from '../src/utils/dateUtils.js';

test('toISODate converts Date object to YYYY-MM-DD', () => {
  const d = new Date(2026, 2, 15); // March 15, 2026
  assert.equal(toISODate(d), '2026-03-15');
});

test('daysAgoISO computes expected date in past', () => {
  assert.equal(typeof daysAgoISO(5), 'string');
  assert.match(daysAgoISO(5), /^\d{4}-\d{2}-\d{2}$/);
});

test('daysBetween correctly calculates signed days between dates', () => {
  assert.equal(daysBetween('2026-03-10', '2026-03-15'), 5);
  assert.equal(daysBetween('2026-03-15', '2026-03-10'), -5);
  assert.equal(daysBetween('2026-03-10', '2026-03-10'), 0);
});

test('isFutureDate correctly flags future and past dates', () => {
  assert.equal(isFutureDate('2099-01-01'), true);
  assert.equal(isFutureDate('2000-01-01'), false);
});

test('formatDate handles valid, invalid, and custom fallback', () => {
  assert.match(formatDate('2026-03-15'), /15.*Mar.*2026/);
  assert.equal(formatDate('', 'N/A'), 'N/A');
  assert.equal(formatDate('invalid-date', 'N/A'), 'N/A');
});

test('formatDateTime formats ISO strings properly', () => {
  assert.equal(formatDateTime(''), '—');
  assert.equal(formatDateTime(null), '—');
  assert.equal(formatDateTime('invalid'), '—');
  const formatted = formatDateTime(new Date().toISOString());
  assert.ok(formatted.length > 5);
});

test('formatTime converts 24-hour time to 12-hour AM/PM string', () => {
  assert.equal(formatTime('14:30'), '2:30 PM');
  assert.equal(formatTime('09:05'), '9:05 AM');
  assert.equal(formatTime('00:00'), '12:00 AM');
  assert.equal(formatTime('12:00'), '12:00 PM');
  assert.equal(formatTime(''), '');
  assert.equal(formatTime('invalid'), '');
});

test('timeAgo returns readable relative time descriptions', () => {
  assert.equal(timeAgo(''), '—');
  assert.equal(timeAgo('invalid'), '—');
  assert.equal(timeAgo(new Date().toISOString()), 'just now');
  assert.match(timeAgo(isoDaysAgo(2)), /2 days ago/);
  assert.match(timeAgo(isoHoursAgo(3)), /3 hours ago/);
});

test('isInDateRange correctly checks date filters', () => {
  const today = toISODate();
  const past3Days = daysAgoISO(3);
  const past40Days = daysAgoISO(40);

  assert.equal(isInDateRange(today, 'today'), true);
  assert.equal(isInDateRange(past3Days, 'week'), true);
  assert.equal(isInDateRange(past40Days, 'week'), false);
  assert.equal(isInDateRange(past40Days, 'older'), true);
  assert.equal(isInDateRange(today, 'all'), true);
});

test('isWithinHours checks threshold against current time', () => {
  const oneHourAgo = isoHoursAgo(1);
  const tenHoursAgo = isoHoursAgo(10);
  assert.equal(isWithinHours(oneHourAgo, 2), true);
  assert.equal(isWithinHours(tenHoursAgo, 2), false);
});
