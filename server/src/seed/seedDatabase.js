// Fills MongoDB with the sample reports, claims and the demo DOSS account.
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

export async function ensureDossUser() {
  const existing = await User.findOne({ email: config.dossEmail });
  if (existing) return existing;
  return User.create({
    name: 'DOSS Office',
    email: config.dossEmail,
    passwordHash: await User.hashPassword(config.dossPassword),
  });
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

  await ensureDossUser();
  return { items: sampleItems.length, claims: sampleClaims.length };
}
