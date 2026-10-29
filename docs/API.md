# REST API details

[← Back to README](../README.md) · [Architecture](ARCHITECTURE.md) · [Database design](DATABASE.md) · [Team roles](TEAM_ROLES.md)

- **Base URL (development):** `http://localhost:5050/api` – the React app calls `/api/...` and Vite forwards it.
- **Format:** JSON request and response bodies (`Content-Type: application/json`).
- **Authentication:** DOSS-only routes need `Authorization: Bearer <token>` from `POST /api/auth/login`. Students never log in.
- **Errors:** always `{ "error": "message", "details": { "field": "message" } }` (details only for validation errors).

## Endpoint summary

| Method | Path | Access | Purpose | Success |
|---|---|---|---|---|
| GET | `/api/health` | Public | API + database status | 200 |
| POST | `/api/auth/login` | Public | Sign in (student, DOSS or super admin) → JWT | 200 |
| POST | `/api/auth/register` | Public | Student sign-up → JWT | 201 |
| GET | `/api/auth/me` | Any account | Who is logged in | 200 |
| GET | `/api/items` | Public* | List reports (filters below) | 200 |
| GET | `/api/items/:id` | Public* | One report | 200 |
| POST | `/api/items` | Public | **Create** a lost/found report | 201 |
| PATCH | `/api/items/:id` | DOSS | **Update** report details | 200 |
| DELETE | `/api/items/:id` | DOSS | **Delete** a report (and its claims) | 200 |
| POST | `/api/items/:id/collect` | DOSS | Owner collected the item | 200 |
| POST | `/api/items/:id/resolve` | DOSS | Close the case | 200 |
| GET | `/api/claims` | Public* | List claims (`?status=`) | 200 |
| GET | `/api/claims/:id` | Public* | One claim (`?populate=items` for DOSS) | 200 |
| POST | `/api/claims` | Public | Submit an ownership claim | 201 |
| POST | `/api/claims/:id/accept` | DOSS | Accept a pending claim | 200 |
| POST | `/api/claims/:id/reject` | DOSS | Reject with a reason | 200 |
| GET | `/api/stats` | Public | Counts via MongoDB aggregation | 200 |
| POST | `/api/admin/reset` | DOSS | Restore the sample data | 200 |
| GET | `/api/users` | Super admin | List accounts (`?role=`) | 200 |
| POST | `/api/users` | Super admin | Create an account (any role) | 201 |
| PATCH | `/api/users/:id` | Super admin | Enable/disable, change role, reset password | 200 |
| DELETE | `/api/users/:id` | Super admin | Delete an account | 200 |

**DOSS** routes accept DOSS staff *and* super admins.

\* **Public\*** = anyone can call it, but logged-in DOSS staff receive extra fields: `privateDetails` on items, and names/roll numbers/contacts/answers on claims.

## Status codes used

| Code | When |
|---|---|
| 200 / 201 | Success / created |
| 400 | Validation failed (`details` lists each field), bad JSON |
| 401 | Missing, wrong or expired token; wrong password |
| 403 | Logged in with the wrong role, wrong login tab, or a disabled account |
| 404 | Unknown ID or route |
| 409 | Business-rule conflict: item can't be claimed, duplicate claim, claim already reviewed, item not ready to resolve |
| 413 | Body too large (photo) |
| 429 | Too many failed logins (5 per email and IP, 15 min lock) |
| 500 | Unexpected server error |

---

## Auth

Three kinds of account share one `users` collection:

| Role | Demo login | Can do |
|---|---|---|
| `student` | `student@college.edu` / `Student@123` | Everything a guest can, with name/roll/email pre-filled on claims |
| `doss` | `doss@college.edu` / `Doss@123` | Review claims, see private details, hand items over |
| `superadmin` | `admin@college.edu` / `Admin@123` | Everything DOSS can, plus `/api/users` |

### `POST /api/auth/login`
```json
{ "email": "doss@college.edu", "password": "Doss@123", "portal": "doss" }
```
`portal` (optional) is the login tab used. A student account on the DOSS tab gets **403** *"This is a Student account. Please use the Student tab."* A super admin may also use the DOSS tab.
**200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "6acb0c...", "name": "DOSS Office", "email": "doss@college.edu", "role": "doss" }
}
```
**401** `{ "error": "Incorrect email or password." }` – the same message for unknown emails, so accounts can't be guessed. Tokens expire after `JWT_EXPIRES_IN` (8 h).

### `POST /api/auth/register`
```json
{ "name": "Priya Nair", "email": "priya.nair@college.edu", "rollNumber": "22ECE017", "password": "Priya2024" }
```
**201** `{ token, user }` with `role: "student"`. The role is never read from the request, so nobody can sign up as staff. Password: 8+ characters with a letter and a number. **409** if the email is already registered.

---

## Items

### `GET /api/items`
Query parameters (all optional): `type` (`lost`/`found`), `status`, `category`, `location`, `search` (case-insensitive text in name, description, colour, location or category). Newest first.

```
GET /api/items?type=found&search=black
```
```json
[
  {
    "id": "LF-2001",
    "type": "found",
    "name": "Black iPhone",
    "category": "Electronics",
    "color": "Black",
    "description": "Black iPhone found near the library entrance.",
    "location": "Library",
    "date": "2026-10-10",
    "time": "16:10",
    "contactName": "Divya Menon",
    "contact": "divya.menon@college.edu",
    "image": null,
    "handedTo": "Handed over to DOSS Office",
    "status": "FOUND",
    "claimId": null,
    "createdAt": "2026-10-10T10:40:00.000Z"
  }
]
```
With a DOSS token each item also has `"privateDetails": "The back case has a few scratches…"`.

### `POST /api/items`
```json
{
  "type": "lost",
  "name": "Lenovo Charger",
  "category": "Electronics",
  "color": "Black",
  "description": "Black Lenovo 65W laptop charger with a round pin.",
  "location": "Library",
  "date": "2026-10-10",
  "time": "11:30",
  "privateDetails": "Green tape around the cable near the plug.",
  "contactName": "Madhu K",
  "contact": "madhu@college.edu",
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```
**201** – the created report with its new `id` (e.g. `LF-1013`) and `status: "LOST"`. Fields such as `status` or `id` sent by the client are ignored. `privateDetails` is not echoed back.

**400**
```json
{
  "error": "Please check the highlighted fields.",
  "details": {
    "name": "Item name must be at least 3 characters",
    "date": "Date cannot be in the future",
    "privateDetails": "Add at least one private detail (10+ characters) so DOSS can verify the owner"
  }
}
```

### `PATCH /api/items/:id` (DOSS)
Body: any of `name, category, color, description, location, date, time, privateDetails, additionalInfo, contactName, contact, image, handedTo`. Returns the updated report.

### `DELETE /api/items/:id` (DOSS)
**200** `{ "id": "LF-1013", "deletedClaims": 0 }`

### `POST /api/items/:id/collect` and `/resolve` (DOSS)
No body. Both return the changed documents:
```json
{
  "claims": [{ "id": "CL-3008", "status": "COLLECTED", "collectedAt": "2026-10-11T04:21:37.052Z" }],
  "items":  [{ "id": "LF-2001", "status": "COLLECTED" }, { "id": "LF-1001", "status": "COLLECTED" }]
}
```
**409** when there is no accepted claim (collect), or the report is not ready to close (resolve).

---

## Claims

### `POST /api/claims` – "This is my item"
```json
{
  "itemId": "LF-2001",
  "lostItemId": "LF-1001",
  "claimantName": "Rahul Sharma",
  "rollNumber": "22cse031",
  "contact": "rahul.sharma@college.edu",
  "reason": "It is my iPhone 15. I lost it in the library while studying.",
  "uniqueFeature": "Three small scratches on the bottom-right corner of the back case.",
  "lostLocation": "Library",
  "lostDate": "2026-10-10",
  "additionalProof": "My lock screen is a golden retriever."
}
```
**201**
```json
{
  "claim": { "id": "CL-3008", "status": "CLAIM_PENDING", "rollNumber": "22CSE031" },
  "items": [{ "id": "LF-2001", "status": "CLAIM_PENDING" }, { "id": "LF-1001", "status": "CLAIM_PENDING" }]
}
```
Server rules:
- the item must be a **found** report that is `FOUND` or `CLAIM_PENDING`, otherwise **409**
- `lostDate` cannot be more than a day after the item was found → **400**
- the linked lost report must still be `LOST` → **400**
- one pending claim per contact per item → **409** "You already have a pending claim for this item."

### `GET /api/claims`
Public response, with personal data removed:
```json
[{ "id": "CL-3008", "itemId": "LF-2001", "lostItemId": "LF-1001", "status": "CLAIM_PENDING",
   "reviewNote": "", "createdAt": "…", "reviewedAt": null, "acceptedAt": null, "collectedAt": null, "resolvedAt": null }]
```

### `GET /api/claims/:id?populate=items` (DOSS)
`itemId` and `lostItemId` are replaced by the full item documents (Mongoose `populate`), including their private details: everything DOSS needs on one screen.

### `POST /api/claims/:id/accept` (DOSS)
Body `{ "reviewNote": "Scratches match the finder's note" }` (optional).
- claim → `CLAIM_ACCEPTED`; item and linked lost report → `READY_FOR_COLLECTION`
- every other pending claim on the same item → `CLAIM_REJECTED` ("Another claim for this item was verified by DOSS.")
- returns `{ items, claims }`; **409** if the claim was already reviewed

### `POST /api/claims/:id/reject` (DOSS)
Body `{ "reviewNote": "The described marks do not match." }`: **required**, at least 5 characters (**400** otherwise). The item goes back to `FOUND` (or stays `CLAIM_PENDING` if other claims are waiting), and the linked lost report goes back to `LOST`.

---

## Statistics

### `GET /api/stats`
Calculated by MongoDB with `aggregate([{ $group: … }])`:
```json
{
  "items": {
    "total": 26, "lost": 13, "found": 13,
    "byTypeAndStatus": [{ "type": "found", "status": "FOUND", "count": 6 }],
    "byCategory": [{ "category": "Electronics", "count": 8 }]
  },
  "claims": { "CLAIM_PENDING": 3, "CLAIM_ACCEPTED": 1, "CLAIM_REJECTED": 1, "COLLECTED": 1, "RESOLVED": 2 }
}
```

## Try it from the terminal

```bash
curl http://localhost:5050/api/health
curl "http://localhost:5050/api/items?type=found&search=black"
TOKEN=$(curl -s -X POST http://localhost:5050/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"doss@college.edu","password":"Doss@123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -X POST http://localhost:5050/api/claims/CL-3001/accept -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"reviewNote":"Roll number matches"}'
```

## Automated tests

`server/test/api.test.js` (17 tests, Node test runner + supertest) covers health, login, CRUD, validation, privacy and the full claim workflow, using a separate test database:

```bash
npm run test:server
```
