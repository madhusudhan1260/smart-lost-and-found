# Application screenshots

[← Back to README](../README.md) · [Architecture](ARCHITECTURE.md) · [Database design](DATABASE.md) · [API details](API.md) · [Team roles](TEAM_ROLES.md)

All screenshots were taken from the running full-stack app (React → Express → MongoDB) with the sample data from `npm run seed`.

## Student

### Home
![Home page](screenshots/01-home.png)

### Found items – search, filters, cards
![Found items list](screenshots/02-found-items.png)

### Item details
![Item details](screenshots/03-item-details.png)

### Report a lost item – validation, progress bar, private details
![Report lost item form](screenshots/04-report-lost-item.png)

### Claim form – "This is my item"
![Claim form](screenshots/05-claim-form.png)

### Smart Match – scored matches with factors
![Smart Match](screenshots/06-smart-match.png)

### My Claims – status tracker
![My claims](screenshots/07-my-claims.png)

## DOSS staff

### Login (JWT)
![DOSS login dialog](screenshots/08-doss-login-dialog.png)

### DOSS dashboard
![DOSS dashboard](screenshots/09-doss-dashboard.png)

### Claims queue
![DOSS claims](screenshots/10-doss-claims.png)

### Claim review – found report vs lost report, private details
![Claim review](screenshots/11-claim-review.png)

### Claim review – claimant's answers and verification helper
![Claim review verification](screenshots/12-claim-review-verification.png)

### Resolved cases
![Resolved cases](screenshots/13-resolved-cases.png)

## Mobile

| Home | Found items |
|---|---|
| ![Mobile home](screenshots/14-mobile-home.png) | ![Mobile found items](screenshots/15-mobile-found-items.png) |

## Backend

### REST API response – `GET /api/items?type=found&search=black`
JSON returned by Express from MongoDB (no private details in the public response).

![REST API JSON](screenshots/16-rest-api-json.png)
