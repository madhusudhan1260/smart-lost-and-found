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

describe('roles: student, DOSS and super admin', () => {
  let adminToken;
  let studentToken;
  const loginAs = (email, password, portal) => api.post('/api/auth/login').send({ email, password, portal });

  before(async () => {
    adminToken = (await loginAs(config.adminEmail, config.adminPassword, 'superadmin')).body.token;
    studentToken = (await loginAs(config.studentEmail, config.studentPassword, 'student')).body.token;
  });

  test('each login tab only accepts its own kind of account', async () => {
    const wrongTab = await loginAs(config.studentEmail, config.studentPassword, 'doss');
    assert.equal(wrongTab.status, 403);
    assert.match(wrongTab.body.error, /Student tab/);
    assert.equal((await loginAs(config.dossEmail, config.dossPassword, 'superadmin')).status, 403);
    assert.equal((await loginAs(config.adminEmail, config.adminPassword, 'doss')).status, 200); // admin may use DOSS tab
  });

  test('students can sign up, but never as staff', async () => {
    const res = await api.post('/api/auth/register').send({
      name: 'Priya Nair', email: 'priya.nair@college.edu', rollNumber: '22ece-017', password: 'Priya2024', role: 'superadmin',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'student');
    assert.equal(res.body.user.rollNumber, '22ECE017');

    const again = await api.post('/api/auth/register').send({
      name: 'Priya Nair', email: 'PRIYA.NAIR@college.edu', rollNumber: '22ECE017', password: 'Priya2024',
    });
    assert.equal(again.status, 409);

    const weak = await api.post('/api/auth/register').send({ name: 'Weak Pass', email: 'weak@college.edu', rollNumber: '22CSE099', password: '123' });
    assert.equal(weak.status, 400);
    assert.ok(weak.body.details.password);
  });

  test('a student token cannot do DOSS work', async () => {
    const res = await api.post('/api/claims/CL-3001/accept').set('Authorization', `Bearer ${studentToken}`);
    assert.equal(res.status, 403);
    const items = await api.get('/api/items/LF-2001').set('Authorization', `Bearer ${studentToken}`);
    assert.equal(items.body.privateDetails, undefined);
  });

  test('only the super admin manages accounts', async () => {
    assert.equal((await api.get('/api/users').set('Authorization', `Bearer ${token}`)).status, 403);

    const created = await api.post('/api/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Anita Rao', email: 'anita.rao@college.edu', password: 'Staff2024', role: 'doss' });
    assert.equal(created.status, 201);

    const list = await api.get('/api/users?role=doss').set('Authorization', `Bearer ${adminToken}`);
    assert.ok(list.body.some((user) => user.email === 'anita.rao@college.edu'));
    assert.ok(list.body.every((user) => user.passwordHash === undefined));

    // Disabled accounts cannot log in
    await api.patch(`/api/users/${created.body.id}`).set('Authorization', `Bearer ${adminToken}`).send({ active: false });
    assert.equal((await loginAs('anita.rao@college.edu', 'Staff2024')).status, 403);

    const deleted = await api.delete(`/api/users/${created.body.id}`).set('Authorization', `Bearer ${adminToken}`);
    assert.equal(deleted.status, 200);
  });

  test('the super admin cannot lock themselves out', async () => {
    const me = await api.get('/api/auth/me').set('Authorization', `Bearer ${adminToken}`);
    const res = await api.patch(`/api/users/${me.body.user.id}`).set('Authorization', `Bearer ${adminToken}`).send({ active: false });
    assert.equal(res.status, 400);
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

  test('accepting one claim auto-rejects competing pending claims for that item', async () => {
    // Create a new found item to test competing claims
    const foundRes = await api.post('/api/items').send({
      type: 'found',
      name: 'Competing Test Backpack',
      category: 'Bags',
      color: 'Navy Blue',
      description: 'Found navy blue backpack near seminar hall.',
      location: 'Seminar Hall',
      date: today(),
      contactName: 'Hall Guard',
      contact: 'guard@college.edu',
    });
    const testItemId = foundRes.body.id;

    // Submit claim 1
    const claim1Res = await api.post('/api/claims').send(validClaim({
      itemId: testItemId,
      lostItemId: null,
      claimantName: 'Claimant One',
      rollNumber: '22-CSE-088', // test delimiter normalization
      contact: 'claimant1@college.edu',
      lostDate: today(),
    }));
    assert.equal(claim1Res.status, 201);
    assert.equal(claim1Res.body.claim.rollNumber, '22CSE088');
    const c1Id = claim1Res.body.claim.id;

    // Submit claim 2 (competing)
    const claim2Res = await api.post('/api/claims').send(validClaim({
      itemId: testItemId,
      lostItemId: null,
      claimantName: 'Claimant Two',
      rollNumber: '22ECE099',
      contact: 'claimant2@college.edu',
      lostDate: today(),
    }));
    assert.equal(claim2Res.status, 201);
    const c2Id = claim2Res.body.claim.id;

    // DOSS accepts claim 1
    const acceptRes = await api.post(`/api/claims/${c1Id}/accept`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reviewNote: 'Claimant 1 verified' });
    assert.equal(acceptRes.status, 200);

    // Verify claim 1 accepted
    const c1After = await api.get(`/api/claims/${c1Id}`).set('Authorization', `Bearer ${token}`);
    assert.equal(c1After.body.status, 'CLAIM_ACCEPTED');

    // Verify claim 2 auto-rejected
    const c2After = await api.get(`/api/claims/${c2Id}`).set('Authorization', `Bearer ${token}`);
    assert.equal(c2After.body.status, 'CLAIM_REJECTED');
    assert.match(c2After.body.reviewNote, /Another claim/);
  });

  test('GET /api/claims/:id?populate=items populates full item documents for DOSS', async () => {
    const res = await api.get('/api/claims/CL-3001?populate=items').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.itemId);
    assert.equal(typeof res.body.itemId, 'object');
    assert.ok(res.body.itemId.name);
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

describe('admin reset', () => {
  test('POST /api/admin/reset restores sample data when authenticated', async () => {
    assert.equal((await api.post('/api/admin/reset')).status, 401);
    const res = await api.post('/api/admin/reset').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Demo data restored.');
    assert.ok(res.body.items > 0);
  });
});
