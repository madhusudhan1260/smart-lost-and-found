// Fills MongoDB with the sample reports, claims and the demo accounts.
// Used by `npm run seed` and by POST /api/admin/reset ("Reset demo data" button).
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Counter from '../models/Counter.js';
import User from '../models/User.js';
import { config } from '../config/env.js';
import sampleItems from './sampleItems.js';
import sampleClaims from './sampleClaims.js';

// "LF-1012" → 12 (the highest number used so the counters continue after it)
const highestNumber = (ids, base) => Math.max(0, ...ids.map((id) => Number(id.split('-')[1]) - base));

// The seed files use "id"; MongoDB stores it as "_id"
const toDocument = ({ id, ...fields }) => ({ _id: id, ...fields });

// One demo account per login tab. Existing accounts are left alone.
const DEMO_USERS = [
  { name: 'DOSS Office', email: config.dossEmail, password: config.dossPassword, role: 'doss' },
  { name: 'Super Admin', email: config.adminEmail, password: config.adminPassword, role: 'superadmin' },
  { name: 'Rahul Sharma', email: config.studentEmail, password: config.studentPassword, role: 'student', rollNumber: '22CSE031' },
];

export async function ensureDemoUsers() {
  for (const { password, ...fields } of DEMO_USERS) {
    const existing = await User.findOne({ email: fields.email });
    if (!existing) await User.create({ ...fields, passwordHash: await User.hashPassword(password) });
  }
}

export async function seedDatabase() {
  await Promise.all([Item.deleteMany({}), Claim.deleteMany({}), Counter.deleteMany({})]);

  // timestamps: false keeps the createdAt values from the sample data
  await Item.insertMany(sampleItems.map(toDocument), { timestamps: false });
  await Claim.insertMany(sampleClaims.map(toDocument), { timestamps: false });

  const lostIds = sampleItems.filter((item) => item.type === 'lost').map((item) => item.id);
  const foundIds = sampleItems.filter((item) => item.type === 'found').map((item) => item.id);
  await Counter.insertMany([
    { _id: 'lost', seq: highestNumber(lostIds, 1000) },
    { _id: 'found', seq: highestNumber(foundIds, 2000) },
    { _id: 'claim', seq: highestNumber(sampleClaims.map((claim) => claim.id), 3000) },
  ]);

  await ensureDemoUsers();
  return { items: sampleItems.length, claims: sampleClaims.length };
}
