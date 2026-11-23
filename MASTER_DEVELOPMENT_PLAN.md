# BAJAJ CANTEEN & OPERATIONS: ENTERPRISE ADMIN PANEL 2.0
## Master Architecture, Design System & Phased Development Plan

**Document Status:** LOCKED & APPROVED  
**Architecture Lead & Senior Software Engineer:** Antigravity  
**Repository:** [github.com/omshinde04/bajaj-canteen](https://github.com/omshinde04/bajaj-canteen)  
**Database:** MongoDB Atlas (`bajaj_enterprise`)  
**Frontend / Fullstack:** Next.js (App Router, JavaScript, Tailwind CSS v4)  

---

## 1. Engineering Roles & Operational Standards

As Senior Software Engineer, the implementation follows rigorous production standards:

*   **Role 1: Senior Fullstack Developer**
    *   Clean, modular, and maintainable JavaScript (`.js` / `.jsx`).
    *   Zero hardcoded secrets; strict separation of concerns (`/models`, `/controllers`, `/services`, `/lib`, `/app/api`).
    *   Backend-enforced Role-Based Access Control (RBAC). Client-side UI gating is treated purely as a convenience; every API route validates sessions and permissions.
    *   Proper indexing, pagination, and projection on MongoDB queries to avoid unindexed table scans.
*   **Role 2: Senior Tester & Debugger**
    *   Comprehensive test suites covering unit logic, database schema validation, API contracts, and edge cases.
    *   Structured error boundaries (`error.js`), global try/catch wrappers, and audit log captures for uncaught errors.
    *   Automated regression test gates prior to branch merging.
*   **Role 3: Code Quality, Compliance & CodeRabbit Review**
    *   Integration with static analysis, ESLint standards, and CodeRabbit for automated pull request governance and code audits.
    *   Clean commit hygiene, semantic PR descriptions, and zero dead code.

---

## 2. Design System & Visual Specification

Locked directly from the approved design direction:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          COLOR SPECIFICATION                           │
├───────────────┬───────────┬───────────────────┬────────────────────────┤
│ Token Name    │ Hex Code  │ Role              │ Application            │
├───────────────┼───────────┼───────────────────┼────────────────────────┤
│ Electric Lime │ #CDFE02   │ Primary Accent    │ Status chips, CTAs,    │
│               │           │ (High-Visibility) │ highlights, alerts     │
├───────────────┼───────────┼───────────────────┼────────────────────────┤
│ Vibrant Violet│ #5733F0   │ Brand Primary     │ Active links, buttons, │
│               │           │                   │ hero panels, gradients │
├───────────────┼───────────┼───────────────────┼────────────────────────┤
│ Ice Blue      │ #D2EFF7   │ Secondary Soft    │ Card borders, badges,  │
│               │           │                   │ subtle backgrounds     │
├───────────────┼───────────┼───────────────────┼────────────────────────┤
│ Dark Canvas   │ #101010   │ Deep Surface      │ Dark mode base, tables,│
│               │           │                   │ sidebar, deep contrast │
├───────────────┼───────────┼───────────────────┼────────────────────────┤
│ Pure White    │ #FFFFFF   │ Light Surface     │ Card background, text  │
│               │           │                   │ on dark, modal sheet   │
└───────────────┴───────────┴───────────────────┴────────────────────────┘
```

### Typography
*   **Primary Font Family:** `Gilroy`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`
*   **Weights:** Regular (`400`), Medium (`500`), Semibold (`600`), Bold (`700`)
*   **Scale:**
    *   Display: `32px` / `36px` Semibold
    *   Heading 1: `24px` / `28px` Semibold
    *   Heading 2: `18px` / `24px` Medium
    *   Body: `14px` / `20px` Regular
    *   Micro / Tag: `12px` / `16px` Medium

---

## 3. Technology Stack & Infrastructure

*   **Runtime:** Node.js (v20.x)
*   **Fullstack Framework:** Next.js (App Router, JavaScript)
*   **Styling Engine:** Tailwind CSS v4 with custom theme inline variables (`#CDFE02`, `#5733F0`, `#D2EFF7`, `#101010`, `#FFFFFF`)
*   **Database:** MongoDB Atlas via Mongoose ODM
    *   **Cluster:** `ecommerce-cluster.ddi9clk.mongodb.net`
    *   **Database Name:** `bajaj_enterprise` (migrated from default `SEO-Om`)
    *   **Connection URI:** `mongodb+srv://SEO-OM-PRODUCT:admin1234@ecommerce-cluster.ddi9clk.mongodb.net/bajaj_enterprise?appName=ecommerce-cluster`
    *   **Connection Pooling:** Global cached Mongoose singleton to prevent connection leaks during Next.js serverless and hot-reload cycles.
*   **Icons & Assets:** `lucide-react`
*   **Testing Harness:** Jest + React Testing Library + Supertest / Node test runners.
*   **Version Control:** Git on `https://github.com/omshinde04/bajaj-canteen.git` (main branch).

---

## 4. Master 40-Module Scope & Phased Implementation

The 40 modules of Enterprise Specification 2.0 are structured into 8 distinct milestones:

### Phase 1: Core Foundation & Master Data (Sprint 1)
*   **Module 1: Centralized Admin Dashboard (Core Metrics & KPIs)**
*   **Module 2: Complete Check Sheet Management (CRUD, Categories & Templates)**
*   **Module 3: Advanced User & Role Management (Super Admin, Plant Admin, Dept Admin, Supervisor, Operator)**
*   **Module 15: Master Data Management (Locations, Categories, Shifts, Depts)**
*   **Module 18: Advanced Security Management (Auth, Session Expiry, Password Security)**
*   **Module 20: Custom Admin Settings**

### Phase 2: Operations, Workflow & Photo Evidence (Sprint 2)
*   **Module 6: Advanced Status Monitoring (Not Started → Completed / Overdue)**
*   **Module 7: Approval & Workflow Management (Multi-tier approvals, Rejection notes, Resubmissions)**
*   **Module 8: Photo Upload & Digital Evidence (Camera capture, pre-signed uploads, photo linking)**
*   **Module 14: Advanced Search & Filtering (Global query engine across all fields)**
*   **Module 16: QR Code & Digital Signature Integration**
*   **Module 17: Mobile & Offline Support (Responsive views, Draft local storage)**

### Phase 3: Industrial Hierarchy, Shifts & Analytics (Sprint 3)
*   **Module 4: Advanced Analytics & KPI Dashboard (Completion %, Trends, Rejection analysis)**
*   **Module 25: Department & Shift Management (Shift A, Shift B, Shift C schedules and rosters)**
*   **Module 29: Advanced Performance Comparison (Operator vs Operator, Shift vs Shift)**
*   **Module 34: Multi-Level Admin Control (Plant Admin vs Dept Admin data isolation)**

### Phase 4: Reporting & Notification Automation (Sprint 4)
*   **Module 5: Smart Notification & Alert System (In-app alerts, read/unread status)**
*   **Module 9: Advanced Report Management (Daily, Weekly, Monthly Excel & PDF exports)**
*   **Module 10: Automated Report Scheduling (Configurable cron generation and delivery)**
*   **Module 19: Email & WhatsApp Integration (SMTP delivery, templated alerts)**

### Phase 5: Governance, Quality & Audit Trail (Sprint 5)
*   **Module 11: Activity Log & Immutable Audit Trail (Every user action, timestamped)**
*   **Module 12: Data Backup, Recovery & Version History (Soft delete, Recycle Bin, Restore)**
*   **Module 13: Issue & Corrective Action Management (CAPA / 8D issues, Before/After photos)**
*   **Module 26: Advanced Compliance Management (Daily mandatory compliance tracking)**
*   **Module 30: Data Quality & Duplicate Detection (Sanitization, validation rules)**

### Phase 6: Dynamic Form Builder & SLA Engine (Sprint 6)
*   **Module 23: Advanced Dynamic Check Sheet Builder (Drag-and-drop form schema builder)**
*   **Module 24: Escalation Management (Automatic alerts for missed deadlines)**
*   **Module 27: Centralized Document & Attachment Management (SOPs, certifications)**
*   **Module 31: SLA & Deadline Management (Resolution times and SLA breach alerts)**

### Phase 7: Real-Time Command Center & AI Intelligence (Sprint 7)
*   **Module 21: AI-Based Smart Analytics (Anomaly detection, repetitive failure insights)**
*   **Module 22: Real-Time Live Activity Dashboard (Live activity timeline)**
*   **Module 28: Admin Command Center (Critical unified triage console)**
*   **Module 32: System Health & Technical Monitoring (DB latency, job status, error logs)**
*   **Module 33: Advanced Dashboard Customization (Modular draggable widgets)**
*   **Module 35: Advanced Communication Center (Circulars, broadcast notices)**

### Phase 8: Hardening, End-to-End QA & Production Deployment (Sprint 8)
*   **Module 36: Advanced UI/UX Final Polish (Pixel-perfect Gilroy styling and animations)**
*   **Module 37: Database Indexing & Query Optimization**
*   **Module 38: Unified Sidebar Navigation (40 modules mapped to permissions)**
*   **Module 39: Complete Automation Triggers Validation**
*   **Module 40: End-to-End Testing, Stress Testing & Production Sign-off**

---

## 5. Testing & Debugging Strategy

Every module developed will be paired with explicit test coverage:

1.  **Unit Tests:**
    *   Mongoose Schema validations (required fields, enum checks, timestamps).
    *   Utility functions (date formatting, shift calculations, status transitions).
2.  **API Integration Tests:**
    *   Auth route tests (`POST /api/auth/login`, session cookies).
    *   Check Sheet CRUD (`GET`, `POST`, `PUT`, `DELETE /api/checksheets`).
    *   Approval workflow transitions (Draft → Submitted → Approved / Rejected).
3.  **Security & RBAC Tests:**
    *   Verify that Operators cannot invoke admin endpoints.
    *   Verify that Department Admins cannot modify records outside their department.
4.  **Debugging & Logging Standards:**
    *   Structured JSON logs in server-side API handlers (`timestamp`, `route`, `userId`, `errorDetails`).
    *   Audit collection records (`AuditLog` model) for all state modifications.

---

## 6. Directory Structure Architecture

```
bajaj-canteen/
├── MASTER_DEVELOPMENT_PLAN.md      # Locked Master Plan
├── .env.local                      # Local secrets (MongoDB URI, JWT secret)
├── .env.example                    # Template for environment configuration
├── package.json                    # Project scripts & dependencies
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Login, session recovery routes
│   │   ├── (dashboard)/            # Admin Panel protected routes
│   │   │   ├── dashboard/          # Centralized Dashboard
│   │   │   ├── checksheets/        # Check Sheet CRUD & Builder
│   │   │   ├── submissions/        # Approvals & Status Monitoring
│   │   │   ├── users/              # User & RBAC Management
│   │   │   ├── shifts/             # Department & Shift Management
│   │   │   ├── analytics/          # KPI & Charts
│   │   │   ├── reports/            # Daily/Weekly/Monthly Reports
│   │   │   ├── issues/             # Corrective Actions (CAPA)
│   │   │   ├── audit/              # Activity Logs
│   │   │   └── settings/           # Admin Settings
│   │   ├── api/                    # REST API Endpoints
│   │   │   ├── auth/
│   │   │   ├── checksheets/
│   │   │   ├── submissions/
│   │   │   ├── users/
│   │   │   ├── master/
│   │   │   └── reports/
│   │   ├── globals.css             # Theme inline tokens & Gilroy font styling
│   │   └── layout.js               # Root layout
│   ├── components/                 # Reusable React Components
│   │   ├── ui/                     # Buttons, Cards, Inputs, Badges, Modals
│   │   ├── layout/                 # Sidebar, Header, Breadcrumbs, Command Center
│   │   ├── dashboard/              # KPI Cards, Recent Activities, Charts
│   │   └── forms/                  # Dynamic Form Fields, Photo Uploaders
│   ├── lib/                        # Core Utilities & Singletons
│   │   ├── db.js                   # Cached MongoDB connection via Mongoose
│   │   ├── auth.js                 # JWT & Session validation
│   │   ├── rbac.js                 # Permission matrix evaluation
│   │   └── audit.js                # Immutable audit log recorder
│   ├── models/                     # Mongoose Data Models
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── CheckSheet.js
│   │   ├── CheckSheetTemplate.js
│   │   ├── Submission.js
│   │   ├── Department.js
│   │   ├── Shift.js
│   │   ├── Issue.js
│   │   └── AuditLog.js
│   └── tests/                      # Automated Test Suites
│       ├── unit/
│       └── integration/
```

---
**Approved by:** Senior Software Engineer (Antigravity)  
**Date:** November 23, 2026
