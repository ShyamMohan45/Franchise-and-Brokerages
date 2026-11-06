# FranchiseBridge: Platform Architecture Specification

## 1. System Overview
**FranchiseBridge** is a digital franchise development and expansion brokerage platform connecting:
- **Emerging & Proven Brands (Business Owners)**: Codifying standard operating procedures (SOPs), benchmarking franchise readiness, drafting regulatory Franchise Disclosure Documents (FDDs), and recruiting multi-unit investors.
- **Franchise Investors (Franchisees)**: Discovering pre-vetted opportunities, evaluating unit economics, and executing multi-unit expansion agreements.
- **Platform Brokers (Advisors & Admins)**: Managing the CRM lead pipeline, qualifying investors, structuring deals, and tracking commissions.

---

## 2. Layered Architecture

### Client Layer (Next.js 15+ App Router)
- **Framework**: React 19, TypeScript, Tailwind CSS
- **State Management**: TanStack Query (server state & caching), React Context (authentication & session)
- **Forms & Validation**: React Hook Form, Zod
- **UI Components**: Shadcn-style custom accessible components with Lucide icons

### API Gateway & Security (Express.js)
- **RESTful Endpoints**: `/api/auth`, `/api/businesses`, `/api/franchises`, `/api/applications`, `/api/investors`, `/api/documents`, `/api/admin`, `/api/meetings`, `/api/public`
- **Security Middlewares**: Helmet security headers, CORS with credential handling, express-rate-limit, cookie-parser for HttpOnly JWT tokens
- **Role-Based Access Control (RBAC)**: Fine-grained middleware verifying `guest`, `business_owner`, `investor`, `admin`, `super_admin` permissions and document ownership

### Persistence & Storage Layer (MongoDB + Mongoose)
- **18 Normalized Collections**: Indexed schemas with unique constraints and relationships
- **Document Vault**: Private object storage abstraction for sensitive FDD and SOP manual attachments

---

## 3. Core Business & Domain Engines

### A. The 8-Pillar Franchise Readiness Engine
Scores brands on a scale of 0 to 100 based on:
1. Brand Strength & Differentiation
2. Unit Economics & Gross Margins
3. SOP Codification
4. Legal FDD & IP Readiness
5. Supply Chain Scalability
6. Training System Readiness
7. Unit Repeatability Across Markets
8. Expansion Management Capacity

### B. Multi-Unit Investor Matching Engine
Evaluates:
- Investor maximum budget & liquid capital vs. franchise investment requirements
- Geographic alignment with active expansion corridors
- Industry sector preferences
- Single vs. multi-unit operational capacity

### C. Brokerage Deal Pipeline & CRM
Tracks deals from initial lead to closing:
- Lead Received &rarr; Qualification &rarr; Matching &rarr; Discussion &rarr; Documentation Review &rarr; Negotiation &rarr; Agreement Pending &rarr; Deal Closed / Lost
- Automatic commission calculations (default 5% of franchise deal capital)
