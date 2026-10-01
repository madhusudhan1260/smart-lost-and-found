# 🔎 Smart Lost & Found
### College Campus Lost & Found Management System

A React.js + JavaScript microproject (3rd-year B.Tech CSE) that manages the **complete lost-and-found lifecycle** on a college campus: reporting, searching, smart matching, ownership claims, verification by the DOSS office, collection and case closure.

> React 19 · Vite · React Router · plain JavaScript (ES6+) · localStorage · **no backend, no login**

---

## Contents

- [⚡ Quick demo (5 minutes)](#quick-demo-5-minutes)
- [1. Problem statement](#1-problem-statement)
- [2. Objective](#2-objective)
- [3. Features](#3-features)
- [4. Student workflow](#4-student-workflow)
- [5. DOSS workflow](#5-doss-workflow)
- [6. Technology stack](#6-technology-stack)
- [7. Architecture](#7-architecture)
- [8. Folder structure](#8-folder-structure)
- [9. Smart Match algorithm (`src/utils/matching.js`)](#9-smart-match-algorithm-srcutilsmatchingjs)
- [10. Data flow example: "Accept claim"](#10-data-flow-example-accept-claim)
- [11. localStorage](#11-localstorage)
- [12. JavaScript & React concepts](#12-javascript--react-concepts)
- [13. Installation & running](#13-installation--running)
- [14. Limitations](#14-limitations)
- [15. Future improvements](#15-future-improvements)
- [16. Viva questions](#16-viva-questions)

## ⚡ Quick demo (5 minutes)

The sample data is set up so you can show the whole workflow straight away:

| Step | Mode | Do this | You should see |
|---|---|---|---|
| 1 | Student | **Found Items → Black iPhone → This is my item** | The claim form |
| 2 | Student | Unique feature: *"There are three small scratches on the bottom-right corner of the back case."* Link the lost report **iPhone 15**, then submit | **Claim pending** |
| 3 | DOSS | **Dashboard → Pending claims → Black iPhone** | Claim Review with **Strong evidence** |
| 4 | DOSS | **Accept claim** → confirm | **Ready for collection** |
| 5 | Student | **My Claims** | "Claim accepted" + Collection instructions |
| 6 | DOSS | **Mark as collected** → **Mark as resolved** | The case appears in **Resolved** |
| 7 | Any | Refresh the page | Everything is still there (localStorage) |

**Smart Match:** open **Smart Match → Leather Wallet** to see an 84% match with every factor explained.

**Weak claim:** in DOSS mode, claim **CL-3003** (black wallet) shows **Weak evidence**. That is why it was rejected.

To start over: **DOSS Dashboard → Reset demo data**.

## 1. Problem statement

Students lose phones, ID cards, wallets, keys, laptops and books on campus every day. Today this is handled through WhatsApp groups and notice boards:

- Posts get buried, so owners never see that their item was found.
- There is no search, and nobody compares "lost" posts with "found" posts.
- **Anyone can say "that's mine"**. There is no check that the person claiming an item is the real owner.
- The office that keeps found items (DOSS) has no record of who collected what, or when.

## 2. Objective

Build a working web application where:

1. Students report lost and found items, keeping some **identifying details private**.
2. Anyone can search, filter and sort reports.
3. A **Smart Match** algorithm (plain JavaScript) scores how likely a lost and a found report are the same item.
4. A student who sees their item submits an **ownership claim with proof**.
5. **DOSS** compares the claim with the private details, then **accepts or rejects** it.
6. The student sees the result and **collection instructions**. DOSS marks the item **collected**, then **resolved**.

## 3. Features

| Area | Features |
|---|---|
| **Mode switch** | `[ STUDENT ] [ DOSS ]` toggle in the top bar. **Not a login**: just two interfaces for the two roles. Saved in localStorage. |
| **Home** | Google-style hero with a large search box, Report Lost / Report Found buttons, live statistics, rotating campus tips (`fetch` + `setInterval`), recent lost & found items, possible matches, My Claims (student) / Pending Claims (DOSS). |
| **Report forms** | Controlled inputs, live validation with regular expressions, image upload with preview and compression (FileReader + canvas), **private verification details**, auto-saved draft, success screen and redirect. |
| **Lost / Found lists** | Debounced search, filters (category, location, date, status), sorting (Newest, Oldest, A–Z, Z–A), skeleton loading, empty states. Private details are never searchable. |
| **Item details** | Public details. DOSS mode also shows private details, the claims for this item and actions (mark collected / resolved / delete). |
| **Claim system** | "This is my item" → claim form (why it's yours, unique feature not publicly mentioned, where & when you lost it, extra proof, optional link to your lost report). Status becomes **CLAIM_PENDING**, never auto-approved. |
| **My Claims** | Progress tracker (Submitted → Accepted → Collected → Resolved), accepted / rejected messages, collection instructions, "track by claim ID". |
| **DOSS dashboard** | 9 live statistics, pending-claims queue, ready-for-collection list, recovery-rate donut, 7-day chart, category chart, Smart Match suggestions, recent-activity timeline, reset demo data. |
| **Claim review** | Found report, linked lost report, the claimant's answers and all private details side by side, plus a **verification helper** that scores the evidence. Accept (with confirmation modal) or Reject (a reason is required). |
| **Collection** | Mark as collected (timestamp saved) → Mark as resolved (closes the found item, the linked lost report and the claim). |
| **Resolved cases** | Table of collected / resolved cases with who collected them and when. |
| **Smart Match** | 0–100 score, "✓ Same category / ✓ Same colour…" factors, sorted highest first, minimum-score slider. |
| **UX** | Google-inspired design, toasts (snackbars), confirmation modals, loading & empty states, responsive layout, keyboard support (`/` to search, `Esc` closes dialogs). |

## 4. Student workflow

```
Report Lost Item ──► status LOST
                         │
          (someone else) Report Found Item ──► status FOUND
                         │
     Student opens the found item ──► [ THIS IS MY ITEM ]
                         │
            Claim form with proof ──► CLAIM_PENDING   (nothing is approved automatically)
                         │
          My Claims shows ──► Claim accepted / Claim rejected
                         │
       If accepted ──► READY_FOR_COLLECTION + collection instructions
                         │ (student goes to the DOSS office with their ID)
                    COLLECTED ──► RESOLVED
```

Try it with the sample data: open **Found Items → Black iPhone → This is my item**. For the unique feature, write *"There are three small scratches on the bottom-right corner of the back case."*

## 5. DOSS workflow

1. Switch to **DOSS** mode. The dashboard shows *Pending claims: 3*.
2. Open a claim → **Claim Review** page.
3. Compare: found report (with the finder's private notes) · lost report (with the owner's private notes) · claimant's answers · verification helper.
4. **Accept claim** → "Are you sure you want to accept this ownership claim?" → the item becomes **READY_FOR_COLLECTION**. Other pending claims for the same item are rejected automatically.
   *or* **Reject claim** → a reason is required → the item goes back to **FOUND**.
5. When the student collects the item: **Mark as collected** (date and time saved) → **COLLECTED**.
6. **Mark as resolved** → **RESOLVED**. The case appears under **Resolved cases**.

### Status reference

| Status | Colour | Meaning |
|---|---|---|
| `LOST` | Blue | Lost report, not found yet |
| `FOUND` | Green | Found item waiting for its owner |
| `CLAIM_PENDING` | Yellow | Someone claimed it, DOSS is reviewing |
| `CLAIM_ACCEPTED` | Green | (claim) DOSS verified the owner |
| `CLAIM_REJECTED` | Red | (claim) Proof did not match |
| `READY_FOR_COLLECTION` | Blue | (item) Waiting at the DOSS office |
| `COLLECTED` | Green | Owner picked it up |
| `RESOLVED` | Green | Case closed |

Items and claims each have their own status. `CLAIM_ACCEPTED` / `CLAIM_REJECTED` belong to a **claim**, and `READY_FOR_COLLECTION` belongs to an **item**.

## 6. Technology stack

| Technology | Use |
|---|---|
| React 19 | UI components and hooks |
| Vite | Dev server and build |
| React Router 7 | Pages and dynamic routes |
| JavaScript ES6+ | All logic. **No TypeScript.** |
| HTML5 + CSS3 | Hand-written Google-inspired design system (no UI library) |
| localStorage / sessionStorage | Persistence |
| `material-symbols`, `@fontsource/roboto` | Icons and font, **bundled locally** so the demo works offline |

## 7. Architecture

```
┌──────────────── UI (React) ────────────────┐
│  pages/   →  components/                    │
│      │  useItems() / useMode() / useNotification()
│      ▼                                       │
│  context/ItemContext  (items + claims + workflow actions)
│  context/ModeContext  (STUDENT / DOSS)      │
└──────┬──────────────────────────────────────┘
       │ async calls (Promises)
       ▼
services/itemService.js  (mock API with a simulated network delay)
       │ JSON.stringify / JSON.parse
       ▼
localStorage  (lf_v2_items, lf_v2_claims)

utils/  → pure JavaScript used everywhere:
  matching.js · claimUtils.js · validation.js · searchUtils.js · statistics.js · dateUtils.js …
```

- **Pages** only arrange components.
- **Context** holds the shared state and the workflow (submit / accept / reject / collect / resolve).
- **Service** is the only file that touches storage for items and claims.
- **Utils** contain the logic you explain in the viva. They do not import React, so each can be understood alone.

## 8. Folder structure

```
lost_and_found/
├── index.html
├── public/
│   ├── favicon.svg
│   └── data/campus-tips.json          ← loaded with fetch()
└── src/
    ├── main.jsx                       ← Router + providers + fonts
    ├── App.jsx                        ← all routes
    ├── index.css                      ← design system, animations, responsive rules
    ├── assets/logo.svg
    ├── components/
    │   ├── Navbar  ModeSwitcher  ModeGate  Footer  PageHeader  ScrollToTop  Icon
    │   ├── ItemCard  ItemImage  StatusBadge  SearchBar  FilterPanel  ItemsBrowser
    │   ├── ItemForm  FormField  ImageUploader  ReportLayout
    │   ├── ClaimForm  ClaimCard  ClaimTimeline  ClaimReview  CollectionInstructions
    │   ├── MatchCard  MatchPairList  ScoreRing  BarChart  StatCard  DashboardCard
    │   └── Modal  Notification  LoadingSpinner  EmptyState  TipTicker
    ├── pages/
    │   ├── Home  LostItems  FoundItems  ReportLost  ReportFound  ItemDetails
    │   ├── ClaimItem  MyClaims  SmartMatch  StudentDashboard
    │   └── DossDashboard  DossClaims  ClaimReview  ResolvedItems  NotFound
    ├── context/     ItemContext.jsx  ModeContext.jsx  NotificationContext.jsx
    ├── hooks/       useLocalStorage.js  useDebounce.js  useFormState.js  useDocumentTitle.js
    ├── services/    itemService.js
    ├── utils/       matching.js  claimUtils.js  validation.js  searchUtils.js  statistics.js
    │                dateUtils.js  storage.js  imageUtils.js  helpers.js
    └── data/        constants.js  initialItems.js (25)  initialClaims.js (7)
```

### Routes

| Route | Page | Mode |
|---|---|---|
| `/` | Home | both |
| `/lost`, `/found` | Lost / Found lists | both |
| `/items/:id` | Item details | both (DOSS sees private info) |
| `/smart-match`, `/smart-match/:id` | Smart Match | both |
| `/dashboard` | StudentDashboard **or** DossDashboard | depends on mode |
| `/resolved` | Resolved cases | both |
| `/report-lost`, `/report-found` | Report forms | Student |
| `/items/:id/claim` | Claim form | Student |
| `/my-claims` | My claims | Student |
| `/doss/claims` | Claims queue | DOSS |
| `/doss/claims/:claimId` | Claim Review | DOSS |

## 9. Smart Match algorithm (`src/utils/matching.js`)

`calculateMatchScore(lostItem, foundItem)` returns **0–100**. Each factor gives a ratio from 0 to 1, which is multiplied by its weight:

| Factor | Weight | How the ratio is calculated |
|---|---|---|
| Category | 20 | same → 1, else 0 |
| Item name | 25 | keyword similarity of the names |
| Colour | 15 | same → 1; a shared word ("Dark Blue" / "Blue") → 0.5 |
| Location | 20 | same → 1; a **nearby** place (`NEARBY_LOCATIONS` table) → 0.5 |
| Date | 10 | ≤1 day → 1, ≤3 → 0.7, ≤7 → 0.4, ≤14 → 0.2; found long *before* it was lost → 0 |
| Description | 10 | keyword similarity of the descriptions |

**Keyword similarity:**

1. `extractKeywords()` lower-cases the text, removes punctuation with `/[^a-z0-9\s]/g`, splits on spaces, drops stop-words and removes duplicates with `new Set`.
2. `getCommonKeywords()` finds shared words ("phone" ≈ "iphone").
3. The ratio is `common ÷ shorter list length`.

**Worked example.** Lost "Leather Wallet" vs found "Brown Wallet":

| Factor | Points | Why |
|---|---|---|
| Category | 20 | Both are Wallets |
| Name | 13 | "wallet" shared, 1 of 2 words |
| Colour | 15 | Brown = Brown |
| Location | 20 | Cafeteria = Cafeteria |
| Date | 10 | 1 day apart |
| Description | 6 | brown, leather, wallet |
| **Total** | **84% Match** | |

`findMatches(item, allItems, minScore)` works from either side (lost → found, found → lost). It only compares **open** reports: `filter → map(score) → filter(≥ threshold) → sort(desc)`.

### Claim verification helper (`src/utils/claimUtils.js → verifyClaim`)

This helps DOSS decide; it never decides automatically. It checks:

| Check | Weight | How |
|---|---|---|
| The claimant's unique feature vs the **private details** of the found and lost reports | 50 | keyword overlap |
| Location consistent | 20 | same place or nearby |
| Dates consistent | 15 | lost before found, within 14 days |
| Linked lost report exists and matches | 15 | Smart Match ≥ 50 |

It returns *Strong / Some / Weak evidence* with a percentage.

## 10. Data flow example: "Accept claim"

1. `ClaimReview.jsx` shows a modal. On confirm it calls `acceptClaim(claimId, note)` from `ItemContext`.
2. `acceptClaim` finds the claim with `find()` and the competing pending claims with `filter()`.
3. It calls `itemService.updateClaim()` and `itemService.updateItem()` in parallel with `Promise.all`:
   - claim → `CLAIM_ACCEPTED`, and `acceptedAt` is saved
   - found item and linked lost report → `READY_FOR_COLLECTION`
   - competing claims → `CLAIM_REJECTED`
4. Each service call waits (simulated network), reads localStorage, updates the record with the spread operator, and writes it back.
5. The context merges the returned objects into state (`mergeUpdates` uses `reduce`). React re-renders every page that uses `useItems()`: the dashboard counts, My Claims, the badges.
6. A toast says "Claim accepted by DOSS."

## 11. localStorage

localStorage stores **strings only**, so all data goes through `JSON.stringify()` and `JSON.parse()` in `utils/storage.js`. Every call is in `try/catch`, because storage can be full, blocked, or hold corrupted JSON.

| Key | Where | Contents |
|---|---|---|
| `lf_v2_items` | `itemService` | all 25+ reports |
| `lf_v2_claims` | `itemService` | all claims (status, review note, acceptedAt, collectedAt, resolvedAt) |
| `lf_v2_mode` | `ModeContext` via `useLocalStorage` | `"student"` / `"doss"` |
| `lf_v2_my_claims` | `ItemContext` via `useLocalStorage` | IDs of claims made from this browser ("My Claims" without login) |
| `lf_v2_draft_lost` / `_found` | `ItemForm` via `useLocalStorage` | unsaved form (removed after submit) |
| `lf_v2_filters_lost` / `_found` | `ItemsBrowser` via `useLocalStorage(…, 'session')` | search / filter / sort, in **sessionStorage** |

- **First visit:** the service finds no data and **seeds** the sample items (25 initial records) and claims (7 initial records).
- **Refresh:** everything is read back directly from localStorage, preserving all live edits and submitted claims.
- **Start over:** use **DOSS dashboard → Reset demo data** (`resetAllData()` in `itemService.js`), which purges user changes and reseeds original fixtures.
- **Quota resilience:** Base64 images are compressed to ≤640px JPEG before persistence to prevent reaching the ~5 MB browser quota.
- **Defensive parsing:** `readFromStorage()` and `writeToStorage()` gracefully handle `QuotaExceededError` and corrupted JSON strings by returning safe fallbacks.

## 12. JavaScript & React concepts

- **[JAVASCRIPT_CONCEPTS.md](JAVASCRIPT_CONCEPTS.md)**: every concept, with the file, why it is used, and a small example.
- **[REACT_CONCEPTS.md](REACT_CONCEPTS.md)**: every React concept and exactly where it is used.

## 13. Installation & running

Requirements: **Node.js 18+** and npm.

```bash
# Clone the repository
git clone https://github.com/madhusudhan1260/smart-lost-and-found.git
cd smart-lost-and-found

# Verify Node.js version (Node 18+ required)
node -v

# Install dependencies and start the development server
npm install
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>).

| Command | Purpose | Output / Notes |
|---|---|---|
| `npm run dev` | Start local Vite development server with HMR | Spawns local dev server at `http://localhost:5173` |
| `npm run build` | Compile and bundle production assets | Generates optimized minified assets into `dist/` |
| `npm run preview` | Locally preview the generated production build | Verifies production behavior before deployment |
| `npm run lint` | Fast static analysis using oxlint | Checks hooks rules, component exports, and unused variables |

The icons and font are bundled, so the app works **without internet** once `npm install` is done.

## 14. Limitations

- **No real authentication.** The Student / DOSS switch is only a demo of two roles, and anyone can switch.
- Data lives in **one browser**, so two students on two laptops do not see each other's reports.
- "My Claims" is tied to the browser (claim IDs in localStorage). It can also track a claim by its ID.
- Smart Match and the verification helper use keyword overlap. They do not understand synonyms ("cellphone" vs "mobile").
- localStorage holds only about 5 MB, which limits how many photos can be stored.

## 15. Future improvements

- A real backend (Node.js + Express + MongoDB, or Firebase) shared by all students
- College SSO login with real roles (student / DOSS staff)
- Email / SMS notifications when a claim is accepted or a strong match appears
- A QR code on the collection slip, scanned at the DOSS counter
- A synonym dictionary and fuzzy matching (Levenshtein distance) for Smart Match
- Image similarity as an extra match factor
- Audit log / export of resolved cases for the DOSS office (CSV / PDF)
- Unit tests for `utils/` with Vitest

## 16. Viva questions

**Q1. Is the Student/DOSS switch a login?**
No. It is a UI mode stored in localStorage through `ModeContext`. It shows two interfaces of the same data so the full workflow can be demonstrated on one computer. A real system would add authentication.

**Q2. Why keep some details private?**
If every detail were public, anyone could copy them into a claim. The owner (in the lost report) and the finder (in the found report) each keep private details. Only DOSS sees them, and it compares them with the claimant's answer.

**Q3. Why isn't a claim approved automatically?**
Ownership affects valuables such as phones and wallets. The verification helper only *suggests* evidence strength, and a DOSS staff member makes the decision. That is the human-in-the-loop part of the design.

**Q4. What happens when two students claim the same item?**
Both claims are `CLAIM_PENDING`. When DOSS accepts one, `acceptClaim` uses `filter()` to find the others and rejects them with the note "Another claim for this item was verified by DOSS."

**Q5. Explain `calculateMatchScore`.**
It compares six factors. Each gives a ratio from 0 to 1, which is multiplied by its weight (20/25/15/20/10/10), and the points are added with `reduce`. See section 9.

**Q6. Where do you use `async/await` and why a mock service?**
All `itemService` functions are `async` and `await` a `wait()` Promise that simulates network delay. The UI treats them like a real API: loading states, `try/catch/finally` and error toasts. Later they can be replaced with `fetch()` calls to a real backend without changing the pages.

**Q7. What is `Promise.all` doing in `acceptClaim`?**
It runs several updates in parallel (the claim, the found item, the lost report, the competing claims) and waits until all of them finish before updating state.

**Q8. What is debouncing?**
It waits until the user stops typing before running the search. `useDebounce` starts a `setTimeout` on every keystroke and clears the previous one in the effect cleanup. It is used on the item lists and the DOSS claim search.

**Q9. What is a closure in your project?**
`createIdGenerator(prefix)` returns `nextId()`, which remembers a private `counter` between calls. `createItemFilter(filters)` returns a function that remembers the chosen filters.

**Q10. localStorage vs sessionStorage?**
localStorage keeps data until it is cleared; we use it for reports, claims, mode and drafts. sessionStorage is cleared when the tab closes; we use it for list filters.

**Q11. Why `JSON.stringify` / `JSON.parse`?**
Storage only accepts strings. `stringify` converts objects to strings and `parse` converts them back.

**Q12. How do you stop private details leaking?**
`searchUtils.js` only searches the `SEARCHABLE_FIELDS` array, which does not include `privateDetails`. The cards and the details page show private details only when `isDoss` is true.

**Q13. `useMemo` vs `useCallback`?**
`useMemo` caches a computed *value*: the filtered list, the dashboard statistics, match results. `useCallback` caches a *function*: context actions like `acceptClaim`, so consumers don't get a new function on every render.

**Q14. What does the `useFormState` custom hook do?**
Both the report form and the claim form need the same logic: controlled values, touched fields, live validation on blur, and focusing the first invalid field (via `useRef`). The hook shares that logic instead of duplicating it.

**Q15. How does validation check "lost after found"?**
`validateClaimField('lostDate', …, { foundDate })` uses `daysBetween()` from `dateUtils`. If the claimed loss date is more than a day after the item was found, it returns an error message.

**Q16. Why are there two statuses for accepted?**
A **claim** becomes `CLAIM_ACCEPTED`, while the **item** becomes `READY_FOR_COLLECTION`. They are different objects: a claim is about a person's request, and the item's status tells DOSS where the physical object is.

**Q17. How is an image stored without a server?**
`FileReader.readAsDataURL` (wrapped in a Promise) reads the file, a canvas resizes it, and the Base64 data URL is saved inside the item object.

**Q18. Why do list items need `key`?**
So React can tell which element is which between renders. We use unique IDs such as `item.id` and `claim.id`, not the array index.

**Q19. How do dynamic routes work?**
`/items/:id` and `/doss/claims/:claimId`: `useParams()` reads the ID from the URL, and `find()` gets the record.

**Q20. What if localStorage is full?**
`writeToStorage` catches the error and returns `false`. The service then throws a friendly error, and the page shows it in a red toast without crashing.
