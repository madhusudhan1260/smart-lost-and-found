// Handlers for /api/items  (CRUD for lost and found reports)
import Item, { STAFF_ITEM_FIELDS, toPublicItem } from '../models/Item.js';
import Claim from '../models/Claim.js';
import { nextId } from '../models/Counter.js';
import { STATUS } from '../config/constants.js';
import { isDoss } from '../middleware/auth.js';
import { pick } from '../utils/pick.js';
import HttpError from '../utils/HttpError.js';
import { markCollected, markResolved } from '../services/claimWorkflow.js';

// Fields a student may send when reporting an item (status, _id etc. are set by the server)
const CREATE_FIELDS = [
  'type', 'name', 'category', 'color', 'description', 'location', 'date', 'time',
  'privateDetails', 'additionalInfo', 'contactName', 'contact', 'image', 'handedTo',
];
// Fields DOSS may correct later
const UPDATE_FIELDS = CREATE_FIELDS.filter((field) => field !== 'type');

// Escape text before putting it inside a regular expression
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/items?type=found&status=FOUND&category=Keys&location=Library&search=black
export async function listItems(req, res) {
  const { type, status, category, location, search } = req.query;
  const filter = {};
  // String(...) so a query value can never be an object like { $ne: ... } (NoSQL injection)
  if (type) filter.type = String(type);
  if (status) filter.status = String(status);
  if (category) filter.category = String(category);
  if (location) filter.location = String(location);
  if (search) {
    const pattern = new RegExp(escapeRegExp(String(search).trim()), 'i');
    filter.$or = [{ name: pattern }, { description: pattern }, { color: pattern }, { location: pattern }, { category: pattern }];
  }

  // Private details and the reporter's name/contact only for logged-in DOSS staff
  const query = Item.find(filter).sort({ createdAt: -1 });
  if (isDoss(req)) query.select(STAFF_ITEM_FIELDS);
  const items = await query;
  res.json(items);
}

// GET /api/items/:id
export async function getItem(req, res) {
  const query = Item.findById(req.params.id);
  if (isDoss(req)) query.select(STAFF_ITEM_FIELDS);
  const item = await query;
  if (!item) throw new HttpError(404, `Report "${req.params.id}" was not found.`);
  res.json(item);
}

// POST /api/items  – a student reports a lost or found item
export async function createItem(req, res) {
  const data = pick(req.body, CREATE_FIELDS);
  const item = new Item({ ...data, status: data.type === 'found' ? STATUS.FOUND : STATUS.LOST });
  if (item.type !== 'found') item.handedTo = undefined;
  await item.validate(); // 400 with field messages if anything is wrong
  item._id = await nextId(item.type === 'found' ? 'found' : 'lost');
  await item.save();

  // The response never contains the private details or the reporter's name and contact
  res.status(201).json(toPublicItem(item));
}

// PATCH /api/items/:id  – DOSS corrects a report's details
export async function updateItem(req, res) {
  const changes = pick(req.body, UPDATE_FIELDS);
  if (Object.keys(changes).length === 0) throw new HttpError(400, 'Nothing to update.');
  const item = await Item.findById(req.params.id).select(STAFF_ITEM_FIELDS);
  if (!item) throw new HttpError(404, `Report "${req.params.id}" was not found.`);
  item.set(changes);
  await item.save();
  res.json(item);
}

// DELETE /api/items/:id  – DOSS removes a report (and the claims made on it)
export async function deleteItem(req, res) {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) throw new HttpError(404, `Report "${req.params.id}" was not found.`);
  const { deletedCount } = await Claim.deleteMany({ itemId: item._id });
  await Claim.updateMany({ lostItemId: item._id }, { $set: { lostItemId: null } });
  res.json({ id: item._id, deletedClaims: deletedCount });
}

// POST /api/items/:id/collect  and  /resolve  – DOSS workflow steps
export async function collectItem(req, res) {
  res.json(await markCollected(req.params.id));
}

export async function resolveItem(req, res) {
  res.json(await markResolved(req.params.id));
}
