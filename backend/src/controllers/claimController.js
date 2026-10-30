// Handlers for /api/claims
import Claim, { PUBLIC_CLAIM_FIELDS } from '../models/Claim.js';
import { STAFF_ITEM_FIELDS, toPublicItem } from '../models/Item.js';
import { isDoss } from '../middleware/auth.js';
import HttpError from '../utils/HttpError.js';
import { acceptClaim, rejectClaim, submitClaim } from '../services/claimWorkflow.js';

// GET /api/claims?status=CLAIM_PENDING
// DOSS gets every field; everyone else only sees statuses (enough for counts and "My Claims").
export async function listClaims(req, res) {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  const query = Claim.find(filter).sort({ createdAt: -1 });
  if (!isDoss(req)) query.select(PUBLIC_CLAIM_FIELDS);
  res.json(await query);
}

// GET /api/claims/:id   (?populate=items adds the full item documents – DOSS only)
export async function getClaim(req, res) {
  const query = Claim.findById(req.params.id);
  if (!isDoss(req)) {
    query.select(PUBLIC_CLAIM_FIELDS);
  } else if (req.query.populate === 'items') {
    // populate() replaces the stored item IDs with the item documents themselves
    query.populate({ path: 'itemId', select: STAFF_ITEM_FIELDS }).populate({ path: 'lostItemId', select: STAFF_ITEM_FIELDS });
  }
  const claim = await query;
  if (!claim) throw new HttpError(404, `Claim "${req.params.id}" was not found.`);
  res.json(claim);
}

// POST /api/claims  – "This is my item"
export async function createClaim(req, res) {
  const { claim, items } = await submitClaim(req.body);
  // Send back only public fields of the items: the claimant never sees the
  // finder's private details, name or contact – only DOSS staff do
  res.status(201).json({ claim, items: items.map(toPublicItem) });
}

// POST /api/claims/:id/accept  { reviewNote }
export async function accept(req, res) {
  res.json(await acceptClaim(req.params.id, req.body?.reviewNote));
}

// POST /api/claims/:id/reject  { reviewNote }   (a reason is required)
export async function reject(req, res) {
  res.json(await rejectClaim(req.params.id, req.body?.reviewNote));
}
