# FranchiseBridge: REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account (`business_owner` or `investor`) | None |
| `POST` | `/api/auth/login` | Login user, issues JWT token and HttpOnly session cookie | None |
| `POST` | `/api/auth/logout` | Clears session cookie | None |
| `POST` | `/api/auth/refresh` | Refreshes session via refresh token | None |
| `GET` | `/api/auth/me` | Fetches authenticated user identity & linked profiles | Yes (Bearer/Cookie) |

---

## 2. Business Management (`/api/businesses`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/businesses/my` | Retrieves logged in business profile and latest readiness score | `business_owner`, `admin` |
| `POST` | `/api/businesses` | Creates or updates business profile and queues for review | `business_owner`, `admin` |
| `POST` | `/api/businesses/readiness` | Submits 8-pillar self-evaluation answers and calculates score | `business_owner`, `admin` |

---

## 3. Franchise Marketplace (`/api/franchises`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/franchises` | Queries published franchise opportunities with search & filters | Optional |
| `GET` | `/api/franchises/:slug` | Retrieves single franchise dossier by slug & increments views | Optional |
| `POST` | `/api/franchises` | Submits new franchise listing for brokerage approval | `business_owner`, `admin` |
| `PATCH` | `/api/franchises/:id` | Updates franchise listing details | `business_owner`, `admin` |
| `POST` | `/api/franchises/:id/save` | Toggles bookmark for authenticated investor | `investor`, `admin` |
| `GET` | `/api/franchises/saved` | Retrieves all saved franchises for current user | `investor`, `admin` |

---

## 4. Franchise Applications (`/api/applications`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Submits investment application for a specific franchise | `investor`, `admin` |
| `GET` | `/api/applications/my` | Lists applications submitted by current investor | `investor` |
| `GET` | `/api/applications/business` | Lists applications received for current owner's franchises | `business_owner` |
| `GET` | `/api/applications/:id` | Retrieves application detail and status history | Investor, Owner, Admin |
| `PATCH` | `/api/applications/:id/status` | Updates application stage with audit note | Owner, Admin |

---

## 5. Investor Matching Engine (`/api/investors`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/investors/profile` | Fetches investor preferences and financial capacity | `investor`, `admin` |
| `PATCH` | `/api/investors/profile` | Updates investment criteria (budget, locations, sectors) | `investor`, `admin` |
| `GET` | `/api/investors/recommendations` | Runs multi-unit matching engine and returns scored matches | `investor`, `admin` |

---

## 6. Document Workflows (`/api/documents`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/documents/sop` | Lists SOP procedure manuals for business | Authenticated |
| `POST` | `/api/documents/sop` | Creates new SOP document with verified checklists | Owner, Admin |
| `PATCH` | `/api/documents/sop/:id/status` | Approves or requests revision on SOP manual | Admin |
| `GET` | `/api/documents/legal` | Lists FDD disclosures & trademark licenses | Authenticated |
| `POST` | `/api/documents/legal` | Uploads FDD disclosure item for legal counsel review | Owner, Admin |
| `PATCH` | `/api/documents/legal/:id/status` | Updates legal review status and compliance notes | Admin |

---

## 7. Admin CRM & Brokerage Pipeline (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Returns platform KPIs (pipeline value, commission, deals) | Admin |
| `GET` | `/api/admin/deals` | Retrieves deals board across all stages | Admin |
| `POST` | `/api/admin/deals` | Initiates new brokerage deal in pipeline | Admin |
| `PATCH` | `/api/admin/deals/:id` | Advances deal stage and logs status transition note | Admin |
| `GET` | `/api/admin/leads` | Lists CRM leads with status & priority filters | Admin |
| `POST` | `/api/admin/leads` | Enters new inbound lead into CRM | Admin |
| `PATCH` | `/api/admin/leads/:id` | Updates lead status, notes, or assigned broker | Admin |
| `GET` | `/api/admin/businesses` | Reviews brand profiles submitted for franchise packaging | Admin |
| `PATCH` | `/api/admin/businesses/:id/status` | Approves brand or requests revisions | Admin |
| `GET` | `/api/admin/audit-logs` | Retrieves system audit trail of critical actions | Admin |
| `GET` | `/api/admin/settings` | Gets brokerage commission rates & policy settings | Admin |
| `PATCH` | `/api/admin/settings` | Updates platform configuration parameters | Super Admin |
