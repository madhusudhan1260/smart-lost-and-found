// The claim lifecycle – the core business rules of the project, enforced on the server:
//   submit → CLAIM_PENDING → accept (READY_FOR_COLLECTION) or reject → collect → resolve
// Every function returns { items, claims } containing the documents that changed,
// so the React app can update its state without reloading everything.
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import { nextId } from '../models/Counter.js';
import { STATUS } from '../config/constants.js';
import { daysBetween } from '../utils/dates.js';
import { pick } from '../utils/pick.js';
import HttpError from '../utils/HttpError.js';

const CLAIM_FIELDS = [
  'itemId', 'lostItemId', 'claimantName', 'rollNumber', 'contact',
  'reason', 'uniqueFeature', 'lostLocation', 'lostDate', 'additionalProof',
];

const findItem = async (id) => {
  const item = await Item.findById(id).select('+privateDetails');
  if (!item) throw new HttpError(404, `Report "${id}" was not found.`);
  return item;
};

const findClaim = async (id) => {
  const claim = await Claim.findById(id);
  if (!claim) throw new HttpError(404, `Claim "${id}" was not found.`);
  return claim;
};

const canBeClaimed = (item) => item.type === 'found' && [STATUS.FOUND, STATUS.CLAIM_PENDING].includes(item.status);

// Save several documents and return them as plain JSON
const saveAll = async (docs) => Promise.all(docs.filter(Boolean).map(async (doc) => (await doc.save()).toJSON()));

// ---------- STEP 3: a student submits "This is my item" ----------
export async function submitClaim(body) {
  const data = pick(body, CLAIM_FIELDS);
  const item = await findItem(data.itemId);
  if (!canBeClaimed(item)) throw new HttpError(409, 'This item can no longer be claimed.');

  const duplicate = await Claim.exists({
    itemId: item._id,
    status: STATUS.CLAIM_PENDING,
    contact: new RegExp(`^${String(data.contact ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });
  if (duplicate) throw new HttpError(409, 'You already have a pending claim for this item.');

  // You cannot lose something more than a day after it was found
  if (data.lostDate && daysBetween(item.date, data.lostDate) > 1) {
    throw new HttpError(400, 'Please check the highlighted fields.', {
      lostDate: `This item was found on ${item.date} – it must have been lost before that.`,
    });
  }

  let lostItem = null;
  if (data.lostItemId) {
    lostItem = await findItem(data.lostItemId);
    if (lostItem.type !== 'lost' || lostItem.status !== STATUS.LOST) {
      throw new HttpError(400, 'The linked lost report is not open any more.');
    }
  } else {
    data.lostItemId = null;
  }

  const claim = new Claim({ ...data, status: STATUS.CLAIM_PENDING });
  await claim.validate(); // check the answers before using up an ID number
  claim._id = await nextId('claim');

  item.status = STATUS.CLAIM_PENDING;
  if (lostItem) lostItem.status = STATUS.CLAIM_PENDING;

  const [savedClaim] = await saveAll([claim]);
  const items = await saveAll([item, lostItem]);
  return { claim: savedClaim, items };
}

// ---------- STEP 5: DOSS accepts – other pending claims for the item are rejected ----------
export async function acceptClaim(claimId, reviewNote = '') {
  const claim = await findClaim(claimId);
  if (claim.status !== STATUS.CLAIM_PENDING) throw new HttpError(409, 'This claim has already been reviewed.');

  const now = new Date();
  const item = await findItem(claim.itemId);
  const lostItem = claim.lostItemId ? await Item.findById(claim.lostItemId).select('+privateDetails') : null;
  const competing = await Claim.find({ itemId: claim.itemId, _id: { $ne: claim._id }, status: STATUS.CLAIM_PENDING });
  const competingLost = await Item.find({ _id: { $in: competing.map((entry) => entry.lostItemId).filter(Boolean) } })
    .select('+privateDetails');

  Object.assign(claim, { status: STATUS.CLAIM_ACCEPTED, reviewedAt: now, acceptedAt: now, reviewNote: String(reviewNote).trim() });
  competing.forEach((entry) => Object.assign(entry, {
    status: STATUS.CLAIM_REJECTED, reviewedAt: now, reviewNote: 'Another claim for this item was verified by DOSS.',
  }));
  Object.assign(item, { status: STATUS.READY_FOR_COLLECTION, claimId: claim._id });
  if (lostItem) lostItem.status = STATUS.READY_FOR_COLLECTION;
  competingLost.forEach((entry) => { entry.status = STATUS.LOST; });

  return {
    claims: await saveAll([claim, ...competing]),
    items: await saveAll([item, lostItem, ...competingLost]),
  };
}

export async function rejectClaim(claimId, reviewNote = '') {
  const note = String(reviewNote).trim();
  if (note.length < 5) {
    throw new HttpError(400, 'Please give a short reason for rejecting the claim.', { reviewNote: 'At least 5 characters' });
  }
  const claim = await findClaim(claimId);
  if (claim.status !== STATUS.CLAIM_PENDING) throw new HttpError(409, 'This claim has already been reviewed.');

  const item = await findItem(claim.itemId);
  const lostItem = claim.lostItemId ? await Item.findById(claim.lostItemId).select('+privateDetails') : null;
  const othersPending = await Claim.exists({ itemId: claim.itemId, _id: { $ne: claim._id }, status: STATUS.CLAIM_PENDING });

  Object.assign(claim, { status: STATUS.CLAIM_REJECTED, reviewedAt: new Date(), reviewNote: note });
  item.status = othersPending ? STATUS.CLAIM_PENDING : STATUS.FOUND;
  if (lostItem) lostItem.status = STATUS.LOST;

  return { claims: await saveAll([claim]), items: await saveAll([item, lostItem]) };
}

// ---------- STEP 6: the owner collected the item from the DOSS office ----------
export async function markCollected(itemId) {
  const item = await findItem(itemId);
  const claim = await Claim.findOne({ itemId, status: STATUS.CLAIM_ACCEPTED });
  if (!claim) throw new HttpError(409, 'There is no accepted claim for this item.');

  const now = new Date();
  const lostItem = claim.lostItemId ? await Item.findById(claim.lostItemId).select('+privateDetails') : null;
  Object.assign(claim, { status: STATUS.COLLECTED, collectedAt: now });
  Object.assign(item, { status: STATUS.COLLECTED, collectedAt: now });
  if (lostItem) Object.assign(lostItem, { status: STATUS.COLLECTED, collectedAt: now });

  return { claims: await saveAll([claim]), items: await saveAll([item, lostItem]) };
}

// Close the case: a collected found item, or a lost report whose owner got it back
export async function markResolved(itemId) {
  const item = await findItem(itemId);
  const allowed = item.type === 'found' ? [STATUS.COLLECTED] : [STATUS.LOST, STATUS.COLLECTED];
  if (!allowed.includes(item.status)) {
    throw new HttpError(409, `A ${item.type} report with status ${item.status} cannot be resolved yet.`);
  }

  const now = new Date();
  const claim = await Claim.findOne({ $or: [{ itemId }, { lostItemId: itemId }], status: STATUS.COLLECTED });
  const linkedId = claim && (claim.itemId === itemId ? claim.lostItemId : claim.itemId);
  const linked = linkedId ? await Item.findById(linkedId).select('+privateDetails') : null;

  Object.assign(item, { status: STATUS.RESOLVED, resolvedAt: now });
  if (claim) Object.assign(claim, { status: STATUS.RESOLVED, resolvedAt: now });
  if (linked) Object.assign(linked, { status: STATUS.RESOLVED, resolvedAt: now });

  return { claims: await saveAll([claim]), items: await saveAll([item, linked]) };
}
