// File: src/services/itemService.js
// Purpose: REST API calls for items, claims and statistics (Express + MongoDB backend).
// Used by: context/ItemContext.jsx, components/ui/TipTicker.jsx
// Each function returns a Promise – the React code awaits them with async/await.
import { request } from './apiClient';

 ---------- ITEMS  (/api/items) ----------

export const getItems = () => request('/items');

export const getItem = (id) => request(`/items/${encodeURIComponent(id)}`);

export const addItem = (itemData) => request('/items', { method: 'POST', body: itemData });

export const updateItem = (id, changes) => request(`/items/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes });

export const deleteItem = (id) => request(`/items/${encodeURIComponent(id)}`, { method: 'DELETE' });

// DOSS workflow steps – each returns { items, claims } with the documents that changed
export const markCollected = (itemId) => request(`/items/${encodeURIComponent(itemId)}/collect`, { method: 'POST' });

export const markResolved = (itemId) => request(`/items/${encodeURIComponent(itemId)}/resolve`, { method: 'POST' });

 ---------- CLAIMS  (/api/claims) ----------

export const getClaims = () => request('/claims');

// Returns { claim, items }
export const addClaim = (claimData) => request('/claims', { method: 'POST', body: claimData });

export const acceptClaim = (claimId, reviewNote = '') =>
  request(`/claims/${encodeURIComponent(claimId)}/accept`, { method: 'POST', body: { reviewNote } });

export const rejectClaim = (claimId, reviewNote) =>
  request(`/claims/${encodeURIComponent(claimId)}/reject`, { method: 'POST', body: { reviewNote } });

// ---------- OTHER ----------

export const getStats = () => request('/stats');

// DOSS only: put the sample data back into MongoDB
export const resetAllData = () => request('/admin/reset', { method: 'POST' });

// A static file (not the API): campus tips from /public/data/campus-tips.json
export async function getCampusTips() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/campus-tips.json`);
  if (!response.ok) throw new Error(`Could not load tips (HTTP ${response.status})`);
  return response.json();
}
