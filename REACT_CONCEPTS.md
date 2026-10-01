# React Concepts — where each one is used

[← Back to README](README.md) · [JavaScript concepts](JAVASCRIPT_CONCEPTS.md) · [React concepts](REACT_CONCEPTS.md)

Paths are relative to `src/`.

---

### Components
Small function components in `components/` (33) and pages in `pages/` (15).

**Reuse instead of duplication:**
- `LostItems` and `FoundItems` → `<ItemsBrowser type="lost|found" />`
- `ReportLost` and `ReportFound` → `<ReportLayout type=... />` → `<ItemForm />`
- `ClaimCard` has two views: `view="student"` (tracker) and `view="doss"` (compact row)
- `StatusBadge` renders all 8 statuses from the `STATUS_META` table

### JSX
HTML-like syntax with `{expressions}`, e.g. `components/ItemCard.jsx`. It uses `className`, `htmlFor`, fragments `<>…</>`, and CSS variables through `style={{ '--delay': … }}`.

### Props
- Data in: `<ItemCard item={item} index={index} />`, `<ClaimReview claim={claim} foundItem={foundItem} lostItem={lostItem} />`, `<StatCard label value icon tone to />`
- `children`: `Modal`, `DashboardCard`, `EmptyState`, `FormField`, `ModeGate`, all providers

### State & `useState`
| State | Where |
|---|---|
| items, claims, loading, error | `context/ItemContext.jsx` |
| form values, submitting, saved item / claim | `components/ItemForm.jsx`, `components/ClaimForm.jsx` |
| errors & touched fields | `hooks/useFormState.js` |
| which modal is open, busy flag, rejection note | `pages/ClaimReview.jsx`, `pages/ItemDetails.jsx`, `pages/DossDashboard.jsx` |
| active tab, search text | `pages/DossClaims.jsx` |
| minimum match score (slider) | `pages/SmartMatch.jsx` |
| mobile menu open, scrolled | `components/Navbar.jsx` |

Functional updates such as `setClaims((previous) => [newClaim, ...previous])` avoid stale state.

### `useEffect`
| Purpose | Where |
|---|---|
| Load items + claims once on start | `context/ItemContext.jsx` |
| Scroll listener (with cleanup) | `components/Navbar.jsx` |
| `fetch` tips, then `setInterval` rotation (with cleanup) | `components/TipTicker.jsx` |
| Debounce timer (cleanup = `clearTimeout`) | `hooks/useDebounce.js` |
| Escape key + page-scroll lock + focus in the modal | `components/Modal.jsx` |
| `/` keyboard shortcut | `components/SearchBar.jsx` |
| Read `?q=` from the URL (Home search → list) | `components/ItemsBrowser.jsx` |
| Cancel the redirect timer on unmount | `components/ItemForm.jsx` |
| Page title, scroll to top, count-up animation | `useDocumentTitle.js`, `ScrollToTop.jsx`, `StatCard.jsx` |

### `useContext`
| Context | Provides | Used by |
|---|---|---|
| `ItemContext` | items, claims, myClaims, loading, error + actions `addItem`, `deleteItem`, `submitClaim`, `acceptClaim`, `rejectClaim`, `markCollected`, `markResolved`, `trackClaim`, `resetData`, `getItemById`, `getClaimById`, `getClaimsForItem` | almost every page |
| `ModeContext` | `mode`, `setMode`, `isDoss`, `isStudent` (the STUDENT / DOSS switch) | Navbar, ModeSwitcher, ModeGate, ItemCard, pages |
| `NotificationContext` | `notify(message, type)` (toasts) | forms and pages |

Components use the custom hooks `useItems()`, `useMode()` and `useNotification()`. Each wraps `useContext` and throws a clear error if used outside its provider. The providers wrap the app in `main.jsx`.

### `useMemo` (cache a computed value)
- The filtered + sorted list recalculates only when a filter or the debounced search changes: `components/ItemsBrowser.jsx`
- All dashboard numbers: `pages/DossDashboard.jsx`, `pages/StudentDashboard.jsx`, `pages/Home.jsx`
- Smart Match results: `pages/SmartMatch.jsx`, `pages/ItemDetails.jsx`, `components/ClaimForm.jsx` (linkable lost reports)
- `myClaims` and the context `value` object: `context/ItemContext.jsx`

### `useCallback` (cache a function)
- Every context action: `context/ItemContext.jsx`
- `notify` / `dismiss`: `context/NotificationContext.jsx`
- `setValue` / `removeValue`: `hooks/useLocalStorage.js`
- `handleFilterChange`: `components/ItemsBrowser.jsx`
- `closeModal`, passed to `<Modal>` and used in its effect dependencies: `pages/ClaimReview.jsx`, `pages/ItemDetails.jsx`, `pages/DossDashboard.jsx`

### `useRef`
| Purpose | Where |
|---|---|
| Focus the first invalid field after submit | `hooks/useFormState.js` (`fieldRefs`) |
| Focus the confirm button when a modal opens | `components/Modal.jsx` |
| Focus the search box with `/` | `components/SearchBar.jsx` |
| Reset the hidden file input | `components/ImageUploader.jsx` |
| Store the redirect timer ID without re-rendering | `components/ItemForm.jsx` |
| Remember the initial value | `hooks/useLocalStorage.js` |

### Custom hooks
| Hook | Purpose |
|---|---|
| `useLocalStorage(key, initial, 'local' \| 'session')` → `[value, setValue, removeValue]` | read / write / update / remove persistent data |
| `useDebounce(value, delay)` | debounced search |
| `useFormState({ values, setValues, validateOne })` | shared form logic for the report form and the claim form |
| `useDocumentTitle(title)` | browser tab title |
| `useItems()`, `useMode()`, `useNotification()` | context access |
| `useCountUp(target)` (inside `StatCard.jsx`) | animated numbers |

### React Router
- `<BrowserRouter>` in `main.jsx`; `<Routes>` / `<Route>` in `App.jsx` (14 routes + 404)
- **Dynamic routes:**
  - `/items/:id` and `/items/:id/claim`: `useParams()` in `ItemDetails.jsx`, `ClaimItem.jsx`
  - `/doss/claims/:claimId`: `ClaimReview.jsx`
  - `/smart-match/:id`: `SmartMatch.jsx`
- **Mode-based route:** `/dashboard` renders `<DossDashboard/>` or `<StudentDashboard/>` depending on `isDoss`
- **Navigation:** `useNavigate()` for the redirect after a report, back (`navigate(-1)`), the mode switch and the Smart Match picker
- **Query string:** `useSearchParams()` reads `?q=` from the Home search (`ItemsBrowser.jsx`)
- `<NavLink>` with active styling in `Navbar.jsx` and `ReportLayout.jsx`
- `useLocation()` replays the page animation (`App.jsx`) and scrolls to top (`ScrollToTop.jsx`)

### Controlled components & form validation
- Every input's `value` comes from state and `onChange` updates it (`hooks/useFormState.js → handleChange`)
- Validation runs on blur, live after the first visit, and fully on submit. It uses `noValidate` plus our own rules in `utils/validation.js`
- The search boxes, filter selects, range slider, reject-reason textarea and track-claim input are all controlled too

### Conditional rendering
- **Early returns:** `if (loading) return <LoadingSpinner/>` / `if (!item) return <EmptyState/>` (all detail pages)
- **Mode-based UI:**
  - Navbar links change with the mode
  - "This is my item" appears only in Student mode for claimable items
  - The private-details box appears only in DOSS mode
  - `ModeGate` guards mode-specific pages
- **Status-based UI:**
  - The action bar in `pages/ClaimReview.jsx` changes with the claim status
  - Accepted / pending / rejected / collected messages in `ClaimCard.jsx`
- The success view replaces the form after a report or claim is submitted

### List rendering & keys
- `items.map(item => <ItemCard key={item.id} … />)` and `claims.map(claim => <ClaimCard key={claim.id} … />)`, keyed by unique IDs, never the index
- Other lists: filter options, tabs, timeline steps, verification checks, chart bars, activity feed, table rows
- `key={type}` on `<ItemForm>` resets the form when switching lost/found
- `key={location.pathname}` on `<main>` replays the page animation

### Event handling
| Event | Where |
|---|---|
| `onClick` | buttons, mode switch |
| `onChange` / `onBlur` | inputs |
| `onSubmit` + `preventDefault()` | forms, search bar, track-claim |
| `onDragOver` / `onDrop` | `ImageUploader.jsx` |
| `onMouseDown` on the backdrop | `Modal.jsx` |
| Global `keydown` / `scroll` listeners | `SearchBar.jsx`, `Modal.jsx`, `Navbar.jsx` |

### Component communication
- **Parent → child:** props
- **Child → parent:** callbacks:
  - `FilterPanel` → `onFilterChange`
  - `ImageUploader` → `onChange` / `onError`
  - `Modal` → `onConfirm` / `onCancel`
  - `SearchBar` → `onSubmit`
  - `ModeSwitcher` → `onSwitch` (closes the mobile menu)
- **Across the app:** Context. A student submits a claim in `ClaimForm`, then the DOSS dashboard count, the Navbar badge and My Claims all update, because they read the same `claims` state.
- **Through the URL:** route params and `?q=`

### Portals
`createPortal` renders `Modal` into `document.body`, above the whole page (`components/Modal.jsx`).

### Strict Mode
`<StrictMode>` in `main.jsx` helps catch side-effect bugs during development.
