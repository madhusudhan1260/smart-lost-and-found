// Unit test suite for search and filter utilities
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyFilters,
  hasActiveFilters,
  searchClaims,
  DEFAULT_FILTERS,
} from '../src/utils/searchUtils.js';

const mockItems = [
  { id: '1', name: 'Black iPhone 15', category: 'Electronics', location: 'Library', color: 'Black', status: 'FOUND', date: '2026-03-01', createdAt: '2026-03-01T10:00:00Z', description: 'Left on desk' },
  { id: '2', name: 'Blue Backpack', category: 'Bags', location: 'Cafeteria', color: 'Blue', status: 'FOUND', date: '2026-03-02', createdAt: '2026-03-02T11:00:00Z', description: 'Found on chair' },
  { id: '3', name: 'Leather Wallet', category: 'Wallets', location: 'Library', color: 'Brown', status: 'RESOLVED', date: '2026-03-03', createdAt: '2026-03-03T12:00:00Z', description: 'With cards inside' },
];

test('applyFilters filters items by text search keyword', () => {
  const results = applyFilters(mockItems, { ...DEFAULT_FILTERS, search: 'iphone' });
  assert.equal(results.length, 1);
  assert.equal(results[0].name, 'Black iPhone 15');
});

test('applyFilters filters items by category', () => {
  const results = applyFilters(mockItems, { ...DEFAULT_FILTERS, category: 'Bags' });
  assert.equal(results.length, 1);
  assert.equal(results[0].name, 'Blue Backpack');
});

test('applyFilters filters items by location', () => {
  const results = applyFilters(mockItems, { ...DEFAULT_FILTERS, location: 'Library' });
  assert.equal(results.length, 2);
});

test('applyFilters filters items by status', () => {
  const results = applyFilters(mockItems, { ...DEFAULT_FILTERS, status: 'FOUND' });
  assert.equal(results.length, 2);
});

test('applyFilters sorts items alphabetically and by date', () => {
  const aToZ = applyFilters(mockItems, { ...DEFAULT_FILTERS, sortBy: 'az' });
  assert.equal(aToZ[0].name, 'Black iPhone 15');
  assert.equal(aToZ[1].name, 'Blue Backpack');
  assert.equal(aToZ[2].name, 'Leather Wallet');

  const zToA = applyFilters(mockItems, { ...DEFAULT_FILTERS, sortBy: 'za' });
  assert.equal(zToA[0].name, 'Leather Wallet');
});

test('hasActiveFilters detects custom filters', () => {
  assert.equal(hasActiveFilters(DEFAULT_FILTERS), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, search: 'laptop' }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, category: 'Electronics' }), true);
});

test('searchClaims searches claims by claimant name, roll number, and ID', () => {
  const claims = [
    { id: 'CL-3001', claimantName: 'Aarav Patel', rollNumber: '22CSE011', contact: 'aarav@college.edu' },
    { id: 'CL-3002', claimantName: 'Sneha Reddy', rollNumber: '22ECE042', contact: 'sneha@college.edu' },
  ];
  assert.equal(searchClaims(claims, 'aarav').length, 1);
  assert.equal(searchClaims(claims, '22ECE').length, 1);
  assert.equal(searchClaims(claims, 'CL-3001').length, 1);
  assert.equal(searchClaims(claims, 'unknown').length, 0);
});
