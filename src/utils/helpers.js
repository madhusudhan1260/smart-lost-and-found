// File: src/utils/helpers.js
// Used by: components/ClaimTimeline.jsx, components/Icon.jsx, components/ImageUploader.jsx,
//          components/ItemForm.jsx, components/ItemImage.jsx, components/ItemsBrowser.jsx,
//          components/MatchCard.jsx, components/ModeSwitcher.jsx, components/Navbar.jsx,
//          components/ReportLayout.jsx, context/ItemContext.jsx, pages/DossClaims.jsx,
//          pages/Home.jsx, pages/ItemDetails.jsx, pages/ResolvedItems.jsx, pages/SmartMatch.jsx,
//          services/itemService.js
// General-purpose helper functions.
import { CATEGORY_META, NAME_ICONS } from '../data/constants';

// CLOSURE: `counter` is private to createIdGenerator but survives between calls
// of the returned function, so two IDs created in the same millisecond still differ.
function createIdGenerator(prefix) {
  let counter = 0;

  return function nextId() {
    counter += 1;
    const timePart = Date.now().toString(36).toUpperCase().slice(-5);
    const randPart = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `${prefix}-${timePart}${counter}${randPart}`;
  };
}

const nextItemId = createIdGenerator('LF');
const nextClaimId = createIdGenerator('CL');

// Keep generating until we get an ID that is not already used
export function generateId(kind, existingIds = []) {
  const next = kind === 'claim' ? nextClaimId : nextItemId;
  let id = next();
  while (existingIds.includes(id)) {
    id = next();
  }
  return id;
}

// REST PARAMETERS: join any number of CSS class names, skipping falsy ones
// cx('card', isActive && 'card--active') → "card card--active"
export const cx = (...classNames) => classNames.filter(Boolean).join(' ');

export const pluralize = (count, word, plural) => {
  const num = Number(count) || 0;
  const pluralForm =
    plural ??
    (word.endsWith('y') && !/[aeiou]y$/i.test(word)
      ? `${word.slice(0, -1)}ies`
      : /(?:s|sh|ch|x|z)$/i.test(word)
        ? `${word}es`
        : `${word}s`);
  return `${num} ${num === 1 ? word : pluralForm}`;
};

// Pick an icon: a specific one if the name matches (laptop, bottle...), else the category icon
export function getItemIcon({ name = '', category }) {
  const specific = NAME_ICONS.find(({ pattern }) => pattern.test(name));
  return specific?.icon ?? CATEGORY_META[category]?.icon ?? 'category';
}

// Replace one object inside an array (matched by id) without mutating the array
export const replaceById = (list, updated) =>
  list.map((entry) => (entry.id === updated.id ? updated : entry));

// Apply several updated objects to a list: reduce() replaces them one by one
export const mergeUpdates = (list, updatedRecords) =>
  updatedRecords.reduce((current, updated) => replaceById(current, updated), list);
