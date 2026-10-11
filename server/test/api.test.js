// Integration tests for the REST API (Node's built-in test runner + supertest).
// They use a SEPARATE database, so the demo data is never touched.
// Run:  cd server && npm test        (MongoDB must be running)
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_lost_found_test';

// Import after setting the environment so the app picks up the test settings
const { default: request } = await import('supertest');
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/config/db.js');
const { seedDatabase } = await import('../src/seed/seedDatabase.js');
const { config } = await import('../src/config/env.js');

const api = request(app);
let token;

const today = () => new Date().toISOString().slice(0, 10);

const validLostItem = () => ({
  type: 'lost',
  name: 'Lenovo Charger',
  category: 'Electronics',
  color: 'Black',
  description: 'Black Lenovo 65W laptop charger with a round pin.',
  location: 'Library',
  date: today(),
  privateDetails: 'Green tape around the cable near the plug.',
  contactName: 'Test Student',
  contact: 'test.student@college.edu',
});

const validClaim = (overrides = {}) => ({
  itemId: 'LF-2001',
  lostItemId: 'LF-1001',
  claimantName: 'Rahul Sharma',
  rollNumber: '22cse031',
  contact: 'rahul.sharma@college.edu',
  reason: 'It is my iPhone 15, I lost it in the library.',
  uniqueFeature: 'Three small scratches on the bottom-right corner.',
  lostLocation: 'Library',
  lostDate: '2000-01-01', // replaced below with a real date
  ...overrides,
});

before(async () => {
  await connectDB(process.env.MONGODB_URI);
  await seedDatabase();
  const res = await api.post('/api/auth/login').send({ email: config.dossEmail, password: config.dossPassword });
  token = res.body.token;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('health and errors', () => {
  test('GET /api/health reports the database is connected', async () => {
    const res = await api.get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.database, 'connected');
  });

  test('unknown routes return 404 JSON', async () => {
    const res = await api.get('/api/does-not-exist');
    assert.equal(res.status, 404);
    assert.match(res.body.error, /Route not found/);
  });
});

describe('authentication', () => {
  test('wrong password is rejected with 401', async () => {
    const res = await api.post('/api/auth/login').send({ email: config.dossEmail, password: 'wrong' });
    assert.equal(res.status, 401);
  });

  test('login returns a JWT and never the password hash', async () => {
    assert.ok(token);
    const res = await api.get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, config.dossEmail);
    assert.equal(res.body.user.passwordHash, undefined);
  });

  test('DOSS-only routes need a token', async () => {
    const res = await api.post('/api/claims/CL-3001/accept');
    assert.equal(res.status, 401);
  });
});

describe('items (CRUD)', () => {
  test('public list hides private details, DOSS list includes them', async () => {
    const publicRes = await api.get('/api/items?type=found');
    assert.equal(publicRes.status, 200);
    assert.ok(publicRes.body.length > 0);
    assert.ok(publicRes.body.every((item) => item.privateDetails === undefined));

    const dossRes = await api.get('/api/items/LF-2001').set('Authorization', `Bearer ${token}`);
    assert.ok(dossRes.body.privateDetails.length > 0);
  });

  test('search filters by text', async () => {
    const res = await api.get('/api/items?search=iphone');
    assert.ok(res.body.every((item) => /iphone/i.test(`${item.name} ${item.description}`)));
  });

  test('invalid report → 400 with a message per field', async () => {
    const res = await api.post('/api/items').send({ type: 'lost', name: 'x', date: '2099-01-01' });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.name);
    assert.ok(res.body.details.date);
    assert.ok(res.body.details.privateDetails);
  });

  test('create → the server sets id and status, ignores a status sent by the client', async () => {
    const res = await api.post('/api/items').send({ ...validLostItem(), status: 'RESOLVED' });
    assert.equal(res.status, 201);
    assert.match(res.body.id, /^LF-1\d{3}$/);
    assert.equal(res.body.status, 'LOST');
    assert.equal(res.body.privateDetails, undefined);
  });

  test('update and delete need DOSS', async () => {
    const created = await api.post('/api/items').send(validLostItem());
    const id = created.body.id;

    assert.equal((await api.patch(`/api/items/${id}`).send({ color: 'Grey' })).status, 401);

    const updated = await api.patch(`/api/items/${id}`).set('Authorization', `Bearer ${token}`).send({ color: 'Grey' });
    assert.equal(updated.body.color, 'Grey');

    const deleted = await api.delete(`/api/items/${id}`).set('Authorization', `Bearer ${token}`);
    assert.equal(deleted.status, 200);
    assert.equal((await api.get(`/api/items/${id}`)).status, 404);
  });
});

describe('claim workflow', () => {
  let claimId;

  test('student submits a claim → item becomes CLAIM_PENDING', async () => {
    const found = await api.get('/api/items/LF-2001');
    const res = await api.post('/api/claims').send(validClaim({ lostDate: found.body.date }));
    assert.equal(res.status, 201);
    claimId = res.body.claim.id;
    assert.equal(res.body.claim.status, 'CLAIM_PENDING');
    assert.equal(res.body.claim.rollNumber, '22CSE031'); // stored in upper case
    assert.ok(res.body.items.some((item) => item.id === 'LF-2001' && item.status === 'CLAIM_PENDING'));
  });

  test('the same student cannot claim the same item twice', async () => {
    const found = await api.get('/api/items/LF-2001');
    const res = await api.post('/api/claims').send(validClaim({ lostDate: found.body.date, lostItemId: null, contact: 'RAHUL.SHARMA@college.edu' }));
    assert.equal(res.status, 409);
  });

  test('public claim list hides personal details', async () => {
    const res = await api.get('/api/claims');
    assert.ok(res.body.every((claim) => claim.contact === undefined && claim.uniqueFeature === undefined));
  });

  test('reject needs a reason', async () => {
    const res = await api.post('/api/claims/CL-3007/reject').set('Authorization', `Bearer ${token}`).send({});
    assert.equal(res.status, 400);
  });

  test('accept → collect → resolve', async () => {
    const accepted = await api.post(`/api/claims/${claimId}/accept`).set('Authorization', `Bearer ${token}`).send({ reviewNote: 'Matches' });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.body.claims[0].status, 'CLAIM_ACCEPTED');
    assert.ok(accepted.body.items.some((item) => item.id === 'LF-2001' && item.status === 'READY_FOR_COLLECTION'));

    const again = await api.post(`/api/claims/${claimId}/accept`).set('Authorization', `Bearer ${token}`);
    assert.equal(again.status, 409); // cannot review twice

    const collected = await api.post('/api/items/LF-2001/collect').set('Authorization', `Bearer ${token}`);
    assert.equal(collected.body.claims[0].status, 'COLLECTED');
    assert.ok(collected.body.items[0].collectedAt);

    const resolved = await api.post('/api/items/LF-2001/resolve').set('Authorization', `Bearer ${token}`);
    assert.equal(resolved.body.claims[0].status, 'RESOLVED');
    assert.ok(resolved.body.items.every((item) => item.status === 'RESOLVED'));
  });

  test('a resolved item cannot be claimed', async () => {
    const res = await api.post('/api/claims').send(validClaim({ lostDate: today(), lostItemId: null, contact: 'other@college.edu' }));
    assert.equal(res.status, 409);
  });
});

describe('statistics (aggregation)', () => {
  test('GET /api/stats counts items and claims', async () => {
    const res = await api.get('/api/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.items.total, res.body.items.lost + res.body.items.found);
    assert.ok(res.body.claims.RESOLVED >= 1);
  });
});
