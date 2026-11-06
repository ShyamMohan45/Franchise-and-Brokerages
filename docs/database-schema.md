# FranchiseBridge: Database Schemas & Collection Models

All models are engineered in TypeScript with Mongoose ODM against MongoDB, incorporating validation, compound indexes, and relational references.

---

## 1. Core Authentication & Identity
- **`Users`**: Holds credentials, email verification status, roles (`guest`, `business_owner`, `investor`, `admin`, `super_admin`), profile references (`businessProfile`, `investorProfile`), and last login timestamps.
- **`BusinessProfiles`**: Company identity, founder name, headquarters location, operating outlet count, revenue range, expansion targets, logo, and readiness scores.
- **`InvestorProfiles`**: Investor persona (`individual`, `corporate`, `syndicate`, `family_office`), budget range, preferred locations, preferred industries, single vs multi-unit focus, liquid capital, and broker verification status.

---

## 2. Franchise Opportunities & Discovery
- **`FranchiseListings`**: Published franchise dossiers including total investment range, initial franchise fee, royalty percentage, commercial space (min/max sq ft), staff requirements, training duration, ideal franchisee profile, and target expansion locations.
- **`SavedFranchises`**: Bookmark relations between investors and franchise listings.
- **`FranchiseReadinessAssessments`**: 8-pillar diagnostic benchmark records with individual pillar scores (0-100), overall readiness score, priority action items, and advisory summary.

---

## 3. Operational Packaging & Legal Disclosures
- **`SOPDocuments`**: Standard operating procedure manuals across 9 categories (`daily_operations`, `employee_training`, `customer_service`, `inventory_management`, `quality_control`, `health_and_safety`, `marketing_procedures`, `financial_operations`, `opening_closing_procedures`) with checklist verification items.
- **`LegalDocuments`**: FDD Item 1-23 disclosures, Master Franchise Agreements, IP & Trademark Licensing covenants, and Bilateral NDAs.
- **`DocumentVersions`**: Version history and audit changelog for SOP and legal documents.

---

## 4. Deal Brokerage & Applications
- **`FranchiseApplications`**: Applications submitted by investors with proposed location, target units, pledged capital, and status tracking (`submitted` &rarr; `vetted_by_broker` &rarr; `introduced_to_owner` &rarr; `in_discussion` &rarr; `documentation_review` &rarr; `negotiation` &rarr; `deal_closed` / `rejected`).
- **`Leads`**: Brokerage CRM lead registry with lead type, pipeline score, priority, source, and activity logs.
- **`BrokerageDeals`**: Deal pipeline tracker recording total deal value, initial franchise fee, commission rates (default 5%), expected and actual commissions, stage transitions, and assigned broker.
- **`Meetings`**: Consultations, FDD reviews, and founder-investor negotiation conferences.

---

## 5. System Administration & Compliance
- **`Notifications`**: Real-time notifications for status changes, new applications, and meeting invites.
- **`ContactEnquiries`**: Inbound general, partnership, and franchise inquiries from the public website.
- **`BlogPosts`**: Content hub articles on franchise development, legal compliance, and SOPs.
- **`AuditLogs`**: Immutable log of sensitive operations (user role edits, business approvals, deal progressions, document sign-offs).
- **`PlatformSettings`**: Brokerage commission rates, jurisdiction toggles, and platform maintenance status.
