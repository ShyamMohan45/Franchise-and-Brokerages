# FranchiseBridge: Full-Stack Franchise Development & Expansion Brokerage Platform

[![Full-Stack Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald)](https://github.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Backend-Express.js%20TypeScript-blue)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-green)](https://mongodb.com)

**FranchiseBridge** is an enterprise-grade digital franchise development and expansion brokerage web platform designed to assist proven regional brands in packaging Standard Operating Procedures (SOPs), structuring legal Franchise Disclosure Documents (FDDs/FIMs), and recruiting qualified multi-unit franchisee investors.

---

## Technical Stack Architecture

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide React icons, Framer Motion, TanStack Query, Recharts, React Hook Form, Zod.
- **Backend API**: Node.js, Express.js, TypeScript, RESTful Architecture, Zod Validation, Helmet, Strict CORS, Express Rate Limit, Morgan, Cookie-Parser, Multer.
- **Authentication**: Secure HttpOnly Cookie JWT sessions + Authorization header support with RBAC (`guest`, `business_owner`, `investor`, `admin`, `super_admin`) and ownership-level enforcement.
- **Database**: MongoDB with Mongoose ODM (18 normalized schemas, relationships, indexes, unique constraints).
- **Testing**: Vitest + Supertest integration test suite.

---

## Platform Stakeholders & Dedicated Dashboards

1. **Guest / Public**:
   - High-conversion responsive landing page with 18 core sections.
   - Franchise Marketplace (`/franchises`) with search, industry filter, model type filter, sorting, and pagination.
   - Comprehensive Franchise Dossier pages (`/franchises/[slug]`) with unit economics disclosures, floor space requirements, training schedules, and application modal.
   - Educational solutions pages: Franchise Readiness, SOP Codification, FDD Structuring, Multi-Unit Recruitment, Territory Advisory.
   - Insights Hub (`/blog`, `/blog/[slug]`), FAQ Accordion, and Contact forms.

2. **Business Owner (Franchisor)**:
   - Executive Dashboard (`/dashboard/business`).
   - Diagnostic 8-Pillar Franchise Readiness benchmark evaluator.
   - Digital SOP procedure manuals builder with mandatory verification checklists.
   - Legal FDD disclosure tracking & compliance reviewer notes.
   - Direct investor applications review with private investor data protection.
   - Meeting scheduler and brand profile manager.

3. **Franchise Investor (Franchisee)**:
   - Investor Dashboard (`/dashboard/investor`).
   - Algorithmic Multi-Unit Matching Engine scoring franchises against investment budget, target cities, and industry preferences.
   - Saved franchise opportunities portfolio.
   - Application status tracking with progress history timeline.
   - Investment criteria calibration.

4. **Brokerage Administrator / Advisor**:
   - Admin Operations Control Hub (`/dashboard/admin`).
   - Executive analytics: Active Deal Pipeline Value, Projected Commissions, Franchise Approvals.
   - CRM Lead Registry with priority scoring and broker assignments.
   - Deal Pipeline board (Lead Received &rarr; Qualification &rarr; Matching &rarr; Discussion &rarr; FDD Review &rarr; Negotiation &rarr; Agreement Pending &rarr; Closed).
   - Brand profile reviews and franchise approvals.
   - System audit trail recording all critical transitions.

---

## Quickstart Guide

### Prerequisites
- Node.js >= v20
- MongoDB running locally on port 27017 or a MongoDB Atlas connection URI

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populates database with realistic demo accounts & reference brands
npm test         # Executes Vitest API integration test suite
npm run dev      # Launches Express API server at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build    # Compiles production Next.js static & dynamic routes
npm run dev      # Launches Next.js frontend at http://localhost:3000
```

---

## Seed Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@franchisebridge.com` | `Password123!` |
| **Broker Admin** | `broker.admin@franchisebridge.com` | `Password123!` |
| **Business Owner (Coffee)** | `owner.roastcraft@example.com` | `Password123!` |
| **Business Owner (Gyms)** | `owner.fitpulse@example.com` | `Password123!` |
| **Investor (Multi-Unit)** | `investor.arun@example.com` | `Password123!` |
| **Investor (Syndicate)** | `investor.priya@example.com` | `Password123!` |

---

## Documentation Index

- [Architecture Specification](docs/architecture.md)
- [REST API Documentation](docs/api-documentation.md)
- [Database Schemas & Models](docs/database-schema.md)
- [Production Deployment Guide](docs/deployment-guide.md)

---

## License
Proprietary & Confidential. Built for enterprise franchise development and brokerage operations.
