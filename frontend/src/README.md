# Frontend guide (`src/`)

Start here when you want to learn the React app or change something in it.

## How the app starts

``
index.html → main.jsx → providers (context/) → App.jsx (routes) → pages/ → components/
``

1. `main.jsx` wraps the app in `BrowserRouter` and the four context providers.
2. `App.jsx` maps every URL to a page.
3. A page reads shared data with hooks such as `useItems()` and `useAuth()`, and builds the screen from components.
4. Components call `utils/` for plain JavaScript logic. Data is loaded and saved through `services/`.

## Folders

| Folder | What is inside | Open it when you want to… |
|---|---|---|
| `pages/public/` | Home, LostItems, FoundItems, ItemDetails, SmartMatch, ResolvedItems, NotFound | change a page everyone can see |
| `pages/student/` | ReportLost, ReportFound, ClaimItem, MyClaims, StudentDashboard | change a student screen |
| `pages/doss/` | DossDashboard, DossClaims, ClaimReview | change a DOSS staff screen |
| `pages/auth/` | Login (sign in + student sign-up) | change the login page |
| `pages/admin/` | AdminUsers | change account management |
| `components/layout/` | Navbar, Footer, AccountMenu, ModeSwitcher, ModeGate, PageHeader, Breadcrumbs, ReportLayout, scroll helpers, KeyboardShortcuts | change what surrounds every page |
| `components/ui/` | Icon, Modal, Lightbox, Notification, EmptyState, LoadingSpinner, StatusBadge, StatCard, DashboardCard, BarChart, ScoreRing, Highlight, TipTicker, FormField | change a small building block used everywhere |
| `components/items/` | ItemCard, ItemImage, ItemsBrowser, SearchBar, FilterPanel, ActiveFilters, ItemForm, ImageUploader | change how reports are listed, searched or entered |
| `components/claims/` | ClaimForm, ClaimCard, ClaimTimeline, ClaimReview, CollectionInstructions | change the ownership-claim flow |
| `components/matching/` | MatchCard, MatchPairList | change how Smart Match results look |
| `context/` | AuthContext, ModeContext, ItemContext, NotificationContext | change shared state (login, mode, data, toasts) |
| `services/` | apiClient, authService, itemService, userService | change how the app talks to the API |
| `hooks/` | useLocalStorage, useDebounce, useFormState, useDocumentTitle, useOnlineStatus, useRipple | reuse stateful logic |
| `utils/` | matching, claimUtils, searchUtils, statistics, validation, authValidation, dateUtils, helpers, imageUtils, storage | change rules and calculations (no React, unit-tested in `frontend/tests/`) |
| `data/constants.js` | categories, locations, statuses, roles, storage keys | add a category, location or status |
| `styles/` | tokens → base → controls → components → pages → animations → responsive → enhancements → auth → admin | change colours or layout |
| `assets/` | logo | change the logo |

## Common changes

| I want to… | Edit |
|---|---|
| Change the brand colours | `styles/tokens.css` (`--blue`, `--green`, …) |
| Add a new page | create it in the right `pages/<role>/` folder, then add a `<Route>` in `App.jsx` (lazy import) |
| Add a navbar link | `STUDENT_LINKS` / `DOSS_LINKS` in `components/layout/Navbar.jsx` |
| Add a category or campus location | `data/constants.js` **and** `backend/src`/config/constants.js` (the API validates them too) |
| Change Smart Match scoring | `MATCH_WEIGHTS` in `utils/matching.js`, then run `npm test` |
| Change a form rule | `utils/validation.js` or `utils/authValidation.js` (keep it the same as the server model) |
| Call a new API endpoint | add a function to the matching file in `services/` |
| Change the login page | `pages/auth/Login.jsx` + `styles/auth.css` |
| Change a phone layout | `styles/responsive.css` |

## Rules of thumb

- Logic that does not need React goes in `utils/` and gets a test in `frontend/tests/`.
- Components receive data through props; only pages and a few layout pieces read context.
- Never trust the browser: every rule in `utils/validation.js` is checked again by the API.
- Run `npm test`, `npm run lint` and `npm run build` before pushing.
