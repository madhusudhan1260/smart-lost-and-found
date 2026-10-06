// File: src/utils/searchUtils.js
// Used by: components/ItemsBrowser.jsx, pages/DossClaims.jsx
// Search, filter and sort logic for the Lost Items / Found Items pages.
import { isInDateRange } from './dateUtils';

export const DEFAULT_FILTERS = {
  search: '',
  category: 'all',
  location: 'all',
  dateRange: 'all',
  status: 'all',
  sortBy: 'newest',
};

// Only PUBLIC fields are searchable – privateDetails must never leak through search
const SEARCHABLE_FIELDS = ['name', 'category', 'location', 'description', 'color'];

// HIGHER-ORDER FUNCTION + CLOSURE:
// returns a new function that "remembers" the filters and tests one item at a time.
export function createItemFilter({ search = '', category, location, dateRange, status }) {
  const searchWords = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return (item) => {
    const searchableText = SEARCHABLE_FIELDS.map((field) => item[field] ?? '').join(' ').toLowerCase();

    // every() → all typed words must appear somewhere in the item
    const matchesSearch = searchWords.every((word) => searchableText.includes(word));
    const matchesCategory = category === 'all' || item.category === category;
    const matchesLocation = location === 'all' || item.location === location;
    const matchesStatus = status === 'all' || item.status === status;
    const matchesDate = isInDateRange(item.date, dateRange);

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesDate;
  };
}

// Combine the date and time of an item into a real Date for comparison
const itemTimestamp = (item) => {
  if (!item) return 0;
  if (!item.date) return item.createdAt ? new Date(item.createdAt).getTime() || 0 : 0;
  const time = new Date(`${item.date}T${item.time || '00:00'}`).getTime();
  return isNaN(time) ? (item.createdAt ? new Date(item.createdAt).getTime() || 0 : 0) : time;
};

// An object of compare functions – sortItems() picks one by name
const SORTERS = {
  newest: (a, b) => itemTimestamp(b) - itemTimestamp(a),
  oldest: (a, b) => itemTimestamp(a) - itemTimestamp(b),
  az: (a, b) => a.name.localeCompare(b.name),
  za: (a, b) => b.name.localeCompare(a.name),
};

export function sortItems(items, sortBy = 'newest') {
  if (!Array.isArray(items)) return [];
  const compare = SORTERS[sortBy] ?? SORTERS.newest;
  return [...items].sort(compare); // copy first – sort() changes the original array
}

export function applyFilters(items, filters) {
  if (!Array.isArray(items)) return [];
  return sortItems(items.filter(createItemFilter(filters)), filters?.sortBy);
}

// some() → true if at least one filter differs from its default (sorting is ignored)
export function hasActiveFilters(filters) {
  return Object.keys(DEFAULT_FILTERS).some(
    (key) => key !== 'sortBy' && filters[key] !== DEFAULT_FILTERS[key],
  );
}

// Search claims by claimant name, roll number, contact or claim ID (DOSS claims page)
export function searchClaims(claims, query = '') {
  if (!Array.isArray(claims)) return [];
  const text = typeof query === 'string' ? query.trim().toLowerCase() : '';
  if (!text) return claims;
  return claims.filter(({ id, claimantName, rollNumber, contact }) =>
    [id, claimantName, rollNumber, contact].some((value) => value?.toLowerCase().includes(text)),
  );
}
