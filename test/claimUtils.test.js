// Unit test suite for claim utilities and business logic helpers
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canBeClaimed,
  statusAfterRejection,
  verifyClaim,
  getClaimTimeline,
} from '../src/utils/claimUtils.js';

test('canBeClaimed allows found items that are open or pending', () => {
  assert.equal(canBeClaimed({ type: 'found', status: 'FOUND' }), true);
  assert.equal(canBeClaimed({ type: 'found', status: 'CLAIM_PENDING' }), true);
  assert.equal(canBeClaimed({ type: 'found', status: 'READY_FOR_COLLECTION' }), false);
  assert.equal(canBeClaimed({ type: 'found', status: 'RESOLVED' }), false);
  assert.equal(canBeClaimed({ type: 'lost', status: 'LOST' }), false);
});

test('statusAfterRejection reverts to FOUND when no other claims remain', () => {
  const claims = [{ id: 'CL-1', itemId: 'item-1', status: 'CLAIM_REJECTED' }];
  assert.equal(statusAfterRejection('item-1', claims, 'CL-1'), 'FOUND');
});

test('statusAfterRejection stays CLAIM_PENDING when other claims remain', () => {
  const claims = [
    { id: 'CL-1', itemId: 'item-1', status: 'CLAIM_REJECTED' },
    { id: 'CL-2', itemId: 'item-1', status: 'CLAIM_PENDING' },
  ];
  assert.equal(statusAfterRejection('item-1', claims, 'CL-1'), 'CLAIM_PENDING');
});

test('verifyClaim scores evidence and evaluates consistency', () => {
  const claim = {
    uniqueFeature: 'Small scratch on the camera lens and white logo',
    additionalProof: 'Purchased on campus store',
    lostLocation: 'Library',
    lostDate: '2026-03-01',
  };
  const foundItem = {
    location: 'Library',
    date: '2026-03-02',
    privateDetails: 'White logo sticker and scratch on camera',
  };
  const result = verifyClaim(claim, foundItem);
  assert.ok(result.score >= 50);
  assert.equal(result.level.tone, 'green');
  assert.ok(result.checks.some((c) => c.label.includes('Unique feature')));
});

test('getClaimTimeline builds logical progression for accepted vs rejected claims', () => {
  const acceptedClaim = {
    status: 'CLAIM_ACCEPTED',
    createdAt: '2026-03-01T10:00:00Z',
    acceptedAt: '2026-03-02T10:00:00Z',
  };
  const acceptedTimeline = getClaimTimeline(acceptedClaim);
  assert.equal(acceptedTimeline[0].key, 'submitted');
  assert.equal(acceptedTimeline[0].done, true);
  assert.equal(acceptedTimeline[1].key, 'accepted');
  assert.equal(acceptedTimeline[1].done, true);

  const rejectedClaim = {
    status: 'CLAIM_REJECTED',
    createdAt: '2026-03-01T10:00:00Z',
    reviewedAt: '2026-03-02T10:00:00Z',
  };
  const rejectedTimeline = getClaimTimeline(rejectedClaim);
  assert.equal(rejectedTimeline[1].key, 'rejected');
  assert.equal(rejectedTimeline[1].failed, true);
});
