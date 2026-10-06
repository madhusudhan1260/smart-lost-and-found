# JavaScript Concepts — where and why each one is used

[← Back to README](README.md) · [JavaScript concepts](JAVASCRIPT_CONCEPTS.md) · [React concepts](REACT_CONCEPTS.md)

Each concept lists **1. File**, **2. Why it is used** and **3. an example from this project**. Paths are relative to `src/`. Functions are named so you can find them quickly with Ctrl/Cmd+F.

> 💡 Most pure-JavaScript logic lives in `utils/` and `services/`. Those files do **not** import React, so you can explain them as plain JavaScript.

---

## Basics

### 1. Variables, `let` and `const`
- **File:** everywhere. Good examples: `utils/helpers.js`, `utils/statistics.js`.
- **Why:** `const` is the default, for values that are never reassigned. `let` is used only when a value changes, such as a counter or a loop variable.
- **Example** (`helpers.js → createIdGenerator`, `generateId`):
  ```js
  let counter = 0;            // changes on every call
  let id = next();            // reassigned inside a while loop
  const nextItemId = createIdGenerator('LF');
  ```

### 2. Data types
- **File:** `data/initialItems.js`, `utils/validation.js`
- **Why:** each report mixes strings, numbers, booleans, `null`, objects and arrays. `typeof` checks a value before calling `.trim()` on it.
- **Example:**
  ```js
  image: null,                                                   // null
  const text = typeof value === 'string' ? value.trim() : value; // typeof
  matched: points > 0,                                           // boolean
  ```

### 3. Operators
- **File:** `utils/matching.js`, `utils/dateUtils.js`, `components/StatCard.jsx`
- **Why:** score maths, date maths, the 12-hour clock and the easing curve.
- **Example:**
  ```js
  const points = Math.round(factor.ratio * max);   // * and Math
  const hour12 = hours % 12 || 12;                 // % and ||
  const eased = 1 - (1 - progress) ** 3;           // ** exponent
  return isEmail || isPhone ? '' : 'Enter a valid email…'; // logical OR + ternary
  ```

### 4. `if / else`
- **File:** `utils/matching.js → compareDates`
- **Why:** turns a gap in days into a date score.
- **Example:**
  ```js
  if (gap < -1) return 0;       // found before it was lost → impossible
  if (days <= 1) return 1;
  if (days <= 3) return 0.7;
  ```

### 5. `switch`
- **Files:** `utils/validation.js → validateField / validateClaimField`, `utils/dateUtils.js → isInDateRange`, `utils/statistics.js → getClaimStats`, `pages/ItemDetails.jsx → getDossAction`
- **Why:** picks one rule per field name, date range or status.
- **Example:**
  ```js
  switch (item.status) {
    case STATUS.READY_FOR_COLLECTION: return { key: 'collect', label: 'Mark as collected' };
    case STATUS.COLLECTED:            return { key: 'resolve', label: 'Mark as resolved' };
    default:                          return null;
  }
  ```

### 6. `for` loops
- **Files:** `utils/statistics.js → getDailyCounts` (classic `for`), `utils/dateUtils.js → timeAgo` and `utils/validation.js → validateItemForm` (`for...of`)
- **Why:** builds 7 days of chart data; checks time units from largest to smallest; validates every form field.
- **Example:**
  ```js
  for (let offset = days - 1; offset >= 0; offset--) { ... }
  for (const field of Object.keys(values)) { ... }
  ```

### 7. `while` loop
- **File:** `utils/helpers.js → generateId`
- **Why:** keeps generating a new ID until it is not already used. We don't know in advance how many tries it will take, so `while` fits.
- **Example:**
  ```js
  while (existingIds.includes(id)) { id = next(); }
  ```

## Functions

### 8. Functions & parameters
- **File:** `utils/matching.js → calculateMatchScore(lostItem, foundItem)`, `utils/claimUtils.js → verifyClaim(claim, foundItem, lostItem)`
- **Why:** reusable, named logic that takes inputs and returns a result.

### 9. Arrow functions
- **Files:** everywhere, e.g. `services/itemService.js`, `utils/helpers.js`
- **Why:** short functions and callbacks.
- **Example:** `const wait = (ms = NETWORK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));`

### 10. Default parameters
- **Files:** `utils/matching.js`, `utils/storage.js`, `hooks/useDebounce.js`, `context/NotificationContext.jsx`
- **Why:** sensible values when an argument is left out.
- **Example:**
  ```js
  function findMatches(sourceItem, allItems, minScore = DEFAULT_MATCH_THRESHOLD)
  function readFromStorage(key, fallback = null, storage = window.localStorage)
  const notify = (message, type = 'success', duration = 3500) => ...
  ```

### 11. Rest parameters
- **Files:** `utils/helpers.js → cx`, `data/initialItems.js → createSeedItem`
- **Why:** accepts any number of CSS classes, or collects the "remaining" fields of an object.
- **Example:**
  ```js
  export const cx = (...classNames) => classNames.filter(Boolean).join(' ');
  function createSeedItem({ id, type, daysAgo, time, handedTo, extra = {}, ...details }) { ... }
  ```

### 12. Callbacks
- **Files:** every array method, `setTimeout`, `FileReader.onload` in `utils/imageUtils.js`, component props like `onConfirm`
- **Example:** `reader.onload = () => resolve(reader.result);`

### 13. Higher-order functions
- **Files:** `utils/searchUtils.js → createItemFilter`, `utils/helpers.js → createIdGenerator`, `hooks/useFormState.js → fieldProps` (returns a ref callback)
- **Why:** functions that **return** or **receive** functions.
- **Example:**
  ```js
  const predicate = createItemFilter(filters); // returns a function
  items.filter(predicate);                     // filter receives a function
  ```

### 14. Scope
- **Files:** `utils/matching.js` (module-private `STOP_WORDS`, `compareColors`), `utils/statistics.js` (block-scoped `let offset`)
- **Why:** helpers that are not exported stay private to their module, and block variables exist only inside their loop.

### 15. Closures
- **Files:** `utils/helpers.js → createIdGenerator`, `utils/searchUtils.js → createItemFilter`, `components/TipTicker.jsx` (`cancelled` flag)
- **Why:** an inner function remembers variables of the outer function after it returns.
- **Example:**
  ```js
  function createIdGenerator(prefix) {
    let counter = 0;              // private, survives between calls
    return function nextId() { counter += 1; return `${prefix}-...${counter}`; };
  }
  ```

## Strings, objects & arrays

### 16. Template literals
- **Files:** everywhere: messages, IDs, routes, CSS classes
- **Example:** `` throw new Error(`Cannot update: ${label} "${id}" does not exist`); `` and `` navigate(`/items/${newItem.id}`) ``

### 17. Destructuring
- **Files:** `components/ItemCard.jsx`, `utils/matching.js`, `utils/dateUtils.js`, all hooks
- **Example:**
  ```js
  const { id, type, name, category, location, date, status } = item;           // object
  const [year, month, day] = dateString.split('-').map(Number);                   // array
  const [lostItem, foundItem] = sourceItem.type === 'lost' ? [a, b] : [b, a];     // swap
  const [itemData, claimData] = await Promise.all([getItems(), getClaims()]);     // Promise.all
  ```

### 18. Spread operator
- **Files:** `services/itemService.js → updateRecord`, `context/ItemContext.jsx`, `hooks/useFormState.js`, `components/BarChart.jsx`
- **Why:** creates updated copies without mutating state (important in React), and merges objects and arrays.
- **Example:**
  ```js
  const updated = { ...records[index], ...changes, updatedAt: new Date().toISOString() };
  setValues((previous) => ({ ...previous, [name]: value }));
  saveAll(STORAGE_KEYS.CLAIMS, [newClaim, ...claims]);
  Math.max(...data.map((entry) => entry.count));
  ```

### 19. Arrays & objects
- **Files:** `data/constants.js` (`CATEGORIES`, `LOCATIONS`, `STATUS_META`, `NEARBY_LOCATIONS` lookup object), `pages/DossClaims.jsx` (`TABS`: an array of objects holding test functions)

### 20. `map()`
- **Files:** every list render (`ItemsBrowser.jsx`, `DossDashboard.jsx`), `utils/matching.js` (ratio → points), `data/initialItems.js` (build seed items)
- **Example:** `visibleItems.map((item, index) => <ItemCard key={item.id} item={item} index={index} />)`

### 21. `filter()`
- **Files:** `components/ItemsBrowser.jsx` (by type), `utils/searchUtils.js` (search/filter), `context/ItemContext.jsx` (competing claims), `pages/DossDashboard.jsx` (pending claims)
- **Why:** keeps only the reports/claims that meet a condition.
- **Example:** `claims.filter((claim) => claim.status === STATUS.CLAIM_PENDING)`

### 22. `find()`
- **Files:** `context/ItemContext.jsx → getItemById / getClaimById`, `pages/MyClaims.jsx` (track by ID), `utils/helpers.js → getItemIcon`
- **Example:** `items.find((item) => item.id === id)`

### 23. `findIndex()`
- **Files:** `services/itemService.js → updateRecord`, `utils/claimUtils.js → getClaimTimeline`
- **Why:** finds the position of the record to replace, or the first unfinished step of the timeline.
- **Example:** `const currentIndex = steps.findIndex((step) => !step.at);`

### 24. `some()`
- **Files:** `utils/claimUtils.js → statusAfterRejection`, `context/ItemContext.jsx → submitClaim` (duplicate claim?), `utils/searchUtils.js → hasActiveFilters / searchClaims`, `services/itemService.js → deleteItem`
- **Example:** `claims.some((claim) => claim.itemId === itemId && claim.status === STATUS.CLAIM_PENDING)`

### 25. `every()`
- **Files:** `utils/validation.js → isFormValid`, `utils/searchUtils.js → createItemFilter`
- **Why:** a form is valid only if **every** error is empty, and a result must contain **every** typed word.
- **Example:** `Object.values(errors).every((message) => !message)`

### 26. `reduce()`
- **Files:** `utils/statistics.js → getItemStats, getClaimStats, countBy`, `utils/matching.js → sumPoints`, `utils/claimUtils.js → verifyClaim`, `utils/helpers.js → mergeUpdates`, `pages/StudentDashboard.jsx`
- **Why:** turns an array into one value: counters for the dashboard, total points, merged state.
- **Example:**
  ```js
  items.reduce((stats, item) => { stats.total += 1; stats[item.type] += 1; return stats; },
               { total: 0, lost: 0, found: 0, ... });
  ```

### 27. `sort()`
- **Files:** `utils/searchUtils.js → sortItems` (Newest, Oldest, A–Z, Z–A), `utils/matching.js → findMatches` (highest score first), `utils/statistics.js`, `pages/DossDashboard.jsx` (oldest claim first)
- **Why:** orders lists. We copy the array first (`[...items].sort()`), because `sort()` changes the original.
- **Example:** `za: (a, b) => b.name.localeCompare(a.name)`

### 28. `includes()`
- **Files:** `utils/searchUtils.js` (search text), `utils/matching.js` (stop-words, nearby places), `utils/claimUtils.js → canBeClaimed`, `utils/helpers.js → generateId`
- **Example:** `[STATUS.FOUND, STATUS.CLAIM_PENDING].includes(item.status)`

### 29. Optional chaining `?.`
- **Files:** `context/ItemContext.jsx`, `pages/ClaimReview.jsx`, `components/ModeSwitcher.jsx`, `utils/helpers.js`
- **Why:** safely reads values that might be `null` or `undefined`.
- **Example:** `claim?.lostItemId`, `specific?.icon`, `onSwitch?.()`, `event.dataTransfer.files?.[0]`

### 30. Nullish coalescing `??`
- **Files:** `utils/matching.js`, `utils/statistics.js`, `pages/ResolvedItems.jsx`
- **Why:** a default only when the value is `null` or `undefined` (unlike `||`, it keeps `0` and `''`).
- **Example:** `const closedAt = (item) => item.resolvedAt ?? item.collectedAt ?? item.updatedAt ?? item.createdAt;`

### 31. Ternary operator
- **Files:** everywhere, especially JSX
- **Example:** `score >= 70 ? { label: 'Strong evidence' } : score >= 40 ? { label: 'Some evidence' } : { label: 'Weak evidence' }`

## Modules

### 32. Modules, `import` / `export`
- **Files:** every file
- **Why:** each file has one responsibility, and the code is shared with named exports (`export function calculateMatchScore`), default exports (`export default function useDebounce`) and a namespace import (`import * as itemService from '../services/itemService'`).

## Built-in objects

### 33. `Date`
- **Files:** `utils/dateUtils.js` (`toISODate`, `daysBetween`, `formatDateTime`, `timeAgo`), `utils/validation.js`, `utils/claimUtils.js`, `data/initialItems.js`
- **Why:** date filters, the "lost after it was found?" check, collection timestamps, and sample data relative to today.
- **Example:** `Math.round((parseLocalDate(dateB) - parseLocalDate(dateA)) / MS_PER_DAY)`

### 34. JSON
- **Files:** `utils/storage.js`, `services/itemService.js → getCampusTips`
- **Example:** `JSON.parse(raw)`, `storage.setItem(key, JSON.stringify(value))`, `response.json()`

### 35. localStorage
- **Files:** `utils/storage.js`, `services/itemService.js`, `hooks/useLocalStorage.js`
- **Why:** keeps items, claims, the mode, "my claims" and drafts after a refresh.

### 36. sessionStorage
- **File:** `components/ItemsBrowser.jsx` → `useLocalStorage(key, DEFAULT_FILTERS, 'session')`
- **Why:** filters survive opening an item and coming back, but reset when the tab is closed.

### 37. Regular expressions
- **Files:** `utils/validation.js → PATTERNS`, `utils/matching.js → extractKeywords`, `data/constants.js → NAME_ICONS`, `pages/MyClaims.jsx → CLAIM_ID_PATTERN`
- **Example:**
  ```js
  phone: /^(\+91)?[6-9]\d{9}$/,
  rollNumber: /^[A-Z0-9]{6,12}$/i,
  .replace(/[^a-z0-9\s]/g, ' ')                  // strip punctuation
  { pattern: /laptop|macbook|notebook pc/i, icon: 'laptop_mac' }
  ```

## Asynchronous JavaScript

### 38. Promises
- **Files:** `services/itemService.js → wait`, `utils/imageUtils.js → readFileAsDataURL / loadImage`, `context/ItemContext.jsx` (`Promise.all`), `components/TipTicker.jsx` (`.then().catch()`)
- **Example:** `new Promise((resolve, reject) => { reader.onload = () => resolve(reader.result); ... })`

### 39. `async` / `await`
- **Files:** every service function, all context actions (`submitClaim`, `acceptClaim`…), form submit handlers, `utils/imageUtils.js → compressImage`
- **Example:**
  ```js
  export async function updateClaim(id, changes) {
    await wait();
    return updateRecord(STORAGE_KEYS.CLAIMS, initialClaims, id, changes, 'claim');
  }
  ```

### 40. `fetch()`
- **File:** `services/itemService.js → getCampusTips` (used by `components/TipTicker.jsx`)
- **Why:** a real HTTP request to `public/data/campus-tips.json`, checking `response.ok`.

### 41. `try / catch / finally`
| Situation handled | Where |
|---|---|
| Loading data | `context/ItemContext.jsx → loadData` (`finally` turns loading off) |
| Invalid form / save errors | `components/ItemForm.jsx`, `components/ClaimForm.jsx` |
| Invalid claim (already reviewed, cannot be claimed, duplicate) | thrown in `ItemContext`, caught in the pages |
| Missing item / claim | service throws, and pages show a "not found" state |
| localStorage errors | `utils/storage.js` |
| Image errors | `components/ImageUploader.jsx` |

### 42. `setTimeout()`
- **Files:** fake network delay (`itemService.js`), debounce (`useDebounce.js`), redirect after a report (`ItemForm.jsx`). Toasts now close when their countdown animation ends (`Notification.jsx → onAnimationEnd`), so hovering pauses them.

### 43. `setInterval()`
- **File:** `components/TipTicker.jsx`
- **Why:** rotates the campus tips every 5 s. `clearInterval` in the effect cleanup stops it when leaving the page.

### 44. Debouncing
- **Files:** `hooks/useDebounce.js`, used in `components/ItemsBrowser.jsx` (350 ms) and `pages/DossClaims.jsx` (300 ms)
- **Why:** filtering runs once after the user pauses typing, not on every key. The list shows "Searching…" in between.

---

### Extras worth mentioning
| Concept | Where |
|---|---|
| `new Set` to remove duplicates | `utils/matching.js → extractKeywords` |
| `Object.entries / keys / values / fromEntries` | `utils/statistics.js`, `components/ItemForm.jsx → trimValues`, `hooks/useFormState.js` |
| `Array.prototype.flatMap` | `utils/statistics.js → getRecentActivity` |
| `String.padStart`, `localeCompare`, `toLocaleString` | `utils/dateUtils.js`, `utils/searchUtils.js` |
| `requestAnimationFrame` | count-up numbers in `components/StatCard.jsx` |
| FileReader + Canvas API | `utils/imageUtils.js` |
| Event listeners + cleanup | scroll (`Navbar.jsx`), keydown (`SearchBar.jsx`, `Modal.jsx`) |

---

## Testing Strategy & Pure Functions

### 45. Pure Functions & Deterministic Unit Testing
- **Files:** `src/utils/matching.js`, `src/utils/validation.js`, `src/utils/dateUtils.js`, `src/utils/helpers.js`, `src/utils/statistics.js`
- **Why:** The codebase isolates business logic into pure JavaScript functions with zero DOM or React dependencies. A pure function always produces the same output for identical inputs and causes no side effects.
- **Key Testable Modules:**
  1. **Matching Logic (`utils/matching.js`):**
     - `calculateMatchScore(lostItem, foundItem)`: Verify weighted calculation sums to $\le 100$, clamp score ranges $[0, 100]$, and test nearby location bonuses.
     - `compareColors(color1, color2)`: Verify multi-word color sets (e.g. `'black and blue'` matches `'blue'`).
  2. **Form Validation (`utils/validation.js`):**
     - `validateField(name, value)`: Test email format, campus roll number pattern (`USN` / letters + digits), and mandatory string length limits.
     - `validateClaimField(name, value)`: Test proof validation and answer requirements.
  3. **Date Utilities (`utils/dateUtils.js`):**
     - `parseLocalDate(dateString)`: Verify parsing of ISO date strings without UTC day-shift bugs.
     - `formatTime(dateString)`: Test 12-hour AM/PM formatting and single-digit minute padding (`:05`).
  4. **Helper Utilities (`utils/helpers.js`):**
     - `generateId(prefix, existingIds)`: Verify non-collision uniqueness and random entropy.
     - `pluralize(count, singular, plural)`: Verify edge cases for 0 count and custom plural forms.
