# Team roles and individual contributions

[← Back to README](../README.md) · [Architecture](ARCHITECTURE.md) · [Database design](DATABASE.md) · [API details](API.md)

Fill in the names before submission. Every member should be able to explain their own role **and** the full flow at the end of this page.

| # | Role | Member | GitHub username |
|---|---|---|---|
| 1 | React frontend development | ______________ | ______________ |
| 2 | Express / Node.js backend and REST APIs | ______________ | ______________ |
| 3 | MongoDB and database | ______________ | ______________ |
| 4 | Authentication, integration and testing | ______________ | ______________ |

---

## 1. React frontend development

**Responsible for:** every screen, reusable components, routing, client-side validation, Smart Match, and the Google-inspired responsive design.

**Main files:**
- `frontend/src/pages/{public,student,doss,auth,admin}/*` – Home, Lost/Found lists, report forms, item details, claim form, My Claims, Smart Match, both dashboards, Claim Review, Login, Manage accounts
- `frontend/src/components/{layout,ui,items,claims,matching}/*` – Navbar, Modal, StatCard, ItemCard, ItemForm, ClaimForm, ClaimReview, MatchCard …
- `frontend/src/hooks/*` – useLocalStorage, useDebounce, useFormState
- `frontend/src/utils/matching.js` (Smart Match), `validation.js`, `searchUtils.js`, `statistics.js`
- `frontend/src/styles/*.css` (imported by `frontend/src/index.css`), `frontend/src/App.jsx` (lazy-loaded routes)

**Demo:** search and filters, the report form with live validation and photo upload, Smart Match scores, mobile layout.

**Be ready to explain:** components and props, `useState`/`useEffect`/`useMemo`/`useCallback`/`useRef`, Context, React Router (`/items/:id`), controlled forms, conditional rendering, the Smart Match weights, debouncing.

---

## 2. Express / Node.js backend and REST APIs

**Responsible for:** the Express server, REST endpoints, controllers, the claim workflow rules and error handling.

**Main files:**
- `backend/src/app.js` – middleware order (CORS → JSON → routes → 404 → error handler)
- `backend/src/index.js` – connect to MongoDB, then `listen(5050)`
- `backend/src/routes/*` – URL + HTTP method → controller
- `backend/src/controllers/*` – items, claims, auth, stats, admin
- `backend/src/services/claimWorkflow.js` – submit / accept / reject / collect / resolve
- `backend/src/middleware/errorHandler.js`, `backend/src/utils/HttpError.js`, `pick.js`

**Demo:** `curl` or Thunder Client/Postman calls from [API.md](API.md): a 201 create, a 400 with field errors, a 409 duplicate claim, a 404.

**Be ready to explain:** what REST is (resources + HTTP verbs), GET vs POST vs PATCH vs DELETE, status codes, middleware and `next()`, why business rules live on the server, how Express 5 forwards errors from `async` handlers.

---

## 3. MongoDB and database

**Responsible for:** the database design, Mongoose schemas and validation, indexes, relationships, seeding and aggregation.

**Main files:**
- `backend/src/models/Item.js`, `Claim.js`, `User.js`, `Counter.js`
- `backend/src/config/db.js` – connection
- `backend/src/seed/*` – sample data and `seedDatabase()`
- `backend/src/controllers/statsController.js` – `aggregate` + `$group`
- [DATABASE.md](DATABASE.md) – ER diagram and field tables

**Demo:** open `mongosh` (or MongoDB Compass), run `db.items.find(...)`, show a claim document change from `CLAIM_PENDING` to `RESOLVED` after the UI workflow, and show `db.users` storing only a bcrypt hash.

**Be ready to explain:** documents vs rows, collections, schema validation, `required`/`enum`/`match`, `select: false`, indexes, referencing vs embedding, `populate()`, the atomic `$inc` counter, the aggregation pipeline.

---

## 4. Authentication, integration and testing

**Responsible for:** DOSS staff login, protecting routes, connecting React to the API, and automated tests.

**Main files:**
- `backend/src/middleware/auth.js` – `signToken`, `requireDoss`, `optionalAuth`
- `backend/src/controllers/authController.js`, `backend/src/models/User.js` (bcrypt)
- `frontend/src/services/apiClient.js` – `fetch` wrapper, adds `Authorization: Bearer <token>`, `ApiError`
- `frontend/src/services/itemService.js`, `authService.js`
- `frontend/src/context/AuthContext.jsx`, `frontend/src/pages/auth/Login.jsx`, `frontend/src/pages/admin/AdminUsers.jsx`, `frontend/src/context/ModeContext.jsx`, `backend/src/middleware/loginLimiter.js`
- `vite.config.js` (`/api` proxy), root `package.json` (`npm run dev` starts both)
- `backend/tests/api.test.js` (25 API tests), `frontend/tests/*.test.js` (frontend unit tests)

**Demo:** wrong password → error; correct login → DOSS dashboard; refresh stays logged in; logout; calling a DOSS route without a token returns 401; run `npm run test:backend` and `npm test`.

**Be ready to explain:** JWT (header.payload.signature, expiry), hashing vs encryption (bcrypt), why the frontend hiding something is not security, CORS, the Vite proxy, how an error from MongoDB reaches a toast in React, what the tests check.

---

## The complete flow everyone should know

1. A student fills in **Report Lost Item** → `ItemForm` validates → `itemService.addItem()` → `POST /api/items`.
2. Express runs `createItem` → Mongoose validates → MongoDB saves the document with id `LF-1013`.
3. Another student opens the found item and clicks **This is my item** → `POST /api/claims` → status `CLAIM_PENDING`.
4. DOSS logs in (`POST /api/auth/login` → JWT) → opens Claim Review, which uses the private details only DOSS receives → **Accept** → `POST /api/claims/:id/accept`.
5. The server updates the claim and items in MongoDB and returns the changed documents → React merges them into `ItemContext` → every page re-renders.
6. The student sees **Ready for collection**; DOSS marks it **Collected**, then **Resolved**.

```
React (pages → context → services/apiClient)  ──HTTP JSON──▶  Express (routes → controllers → workflow → models)  ──Mongoose──▶  MongoDB
```

## Contribution evidence

The GitHub history shows who did what: https://github.com/madhusudhan1260/smart-lost-and-found/commits/main

```bash
git shortlog -sn                 # commits per member
git log --author="name" --stat   # files one member changed
```
