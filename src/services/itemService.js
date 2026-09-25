// MOCK SERVICE LAYER
// Pretends to be a backend API. The data really lives in localStorage, but every
// function returns a Promise (after a small delay) just like a real HTTP call would.
// Later this file could be swapped for real fetch() calls without touching the UI.
import initialItems from '../data/initialItems';
import initialClaims from '../data/initialClaims';
import { STORAGE_KEYS } from '../data/constants';
import { readFromStorage, writeToStorage } from '../utils/storage';
import { generateId } from '../utils/helpers';

const NETWORK_DELAY_MS = 350;

// A Promise that resolves after `ms` milliseconds (simulated network latency)
const wait = (ms = NETWORK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- generic helpers for one "table" (items or claims) ----------

function loadAll(key, seedData) {
  const saved = readFromStorage(key);
  if (Array.isArray(saved)) return saved;

  // First visit: seed localStorage with the sample data
  writeToStorage(key, seedData);
  return seedData;
}

function saveAll(key, records) {
  const saved = writeToStorage(key, records);
  if (!saved) {
    throw new Error('Could not save to browser storage. It may be full – try a smaller image.');
  }
}

function updateRecord(key, seedData, id, changes, label) {
  const records = loadAll(key, seedData);
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) throw new Error(`Cannot update: ${label} "${id}" does not exist`);

  // SPREAD: keep the old fields, overwrite only the changed ones
  const updated = { ...records[index], ...changes, updatedAt: new Date().toISOString() };
  const copy = [...records];
  copy[index] = updated;
  saveAll(key, copy);
  return updated;
}

// ---------- ITEMS ----------

export async function getItems() {
  await wait();
  return loadAll(STORAGE_KEYS.ITEMS, initialItems);
}

export async function addItem(itemData) {
  await wait();
  const items = loadAll(STORAGE_KEYS.ITEMS, initialItems);

  const newItem = {
    ...itemData,
    id: generateId('item', items.map((item) => item.id)),
    status: itemData.type === 'lost' ? 'LOST' : 'FOUND',
    createdAt: new Date().toISOString(),
  };

  saveAll(STORAGE_KEYS.ITEMS, [newItem, ...items]);
  return newItem;
}

export async function updateItem(id, changes) {
  await wait();
  return updateRecord(STORAGE_KEYS.ITEMS, initialItems, id, changes, 'report');
}

export async function deleteItem(id) {
  await wait();
  const items = loadAll(STORAGE_KEYS.ITEMS, initialItems);
  if (!items.some((item) => item.id === id)) {
    throw new Error(`Cannot delete: report "${id}" does not exist`);
  }
  saveAll(STORAGE_KEYS.ITEMS, items.filter((item) => item.id !== id));
  return id;
}

// ---------- CLAIMS ----------

export async function getClaims() {
  await wait();
  return loadAll(STORAGE_KEYS.CLAIMS, initialClaims);
}

export async function addClaim(claimData) {
  await wait();
  const claims = loadAll(STORAGE_KEYS.CLAIMS, initialClaims);

  const newClaim = {
    ...claimData,
    id: generateId('claim', claims.map((claim) => claim.id)),
    status: 'CLAIM_PENDING',
    createdAt: new Date().toISOString(),
  };

  saveAll(STORAGE_KEYS.CLAIMS, [newClaim, ...claims]);
  return newClaim;
}

export async function updateClaim(id, changes) {
  await wait();
  return updateRecord(STORAGE_KEYS.CLAIMS, initialClaims, id, changes, 'claim');
}

// ---------- DEMO helpers ----------

export async function resetAllData() {
  await wait();
  saveAll(STORAGE_KEYS.ITEMS, initialItems);
  saveAll(STORAGE_KEYS.CLAIMS, initialClaims);
  return { items: initialItems, claims: initialClaims };
}

// A real network request with fetch(): loads campus tips from /public/data/campus-tips.json
export async function getCampusTips() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/campus-tips.json`);
  if (!response.ok) throw new Error(`Could not load tips (HTTP ${response.status})`);
  return response.json();
}
