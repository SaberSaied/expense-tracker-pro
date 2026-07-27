# Expense Tracker Pro — Development Roadmap & Milestone Plan

This document outlines the phased development roadmap, milestone scope estimations, sprint planning schedule, and exit criteria for **Expense Tracker Pro**.

---

## Roadmap Overview

```
[ M1: Foundation ] ➔ [ M2: Auth ] ➔ [ M3: Transactions ] ➔ [ M4: Dashboard ] ➔ [ M5: Reporting ] ➔ [ M6: Testing ] ➔ [ M7: Deployment ]
```

---

## Milestone Breakdown & Scope Estimations

### Milestone 1: Monorepo Foundation & Core Setup

- **Scope Estimate**: 1 Week (Sprint 1)
- **Status**: ✅ _Completed_
- **Key Deliverables**:
  - Pnpm workspace configuration (`apps/web`, `apps/server`, `packages/*`).
  - Strict TypeScript configuration (`tsconfig.base.json`).
  - Layered Express backend structure (Routes → Controllers → Services → Repositories).
  - PostgreSQL + Prisma client setup with driver adapter.
  - ESLint and Prettier workspace configuration.
- **Exit Criteria**: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, and `pnpm build` pass with zero errors.

---

### Milestone 2: User Authentication & Session Security

- **Scope Estimate**: 1 Week (Sprint 2)
- **Status**: ⏳ _Next In Queue_
- **Key Deliverables**:
  - User registration & login endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`).
  - Password hashing via `bcrypt` and JWT session token generation.
  - Express authentication middleware and protected route guards.
  - Frontend AuthContext provider, Login page, and Register page.
- **Exit Criteria**: Integration tests verify registration, password security, session persistence, and invalid token rejection (`401 Unauthorized`).

---

### Milestone 3: Transaction & Category Management

- **Scope Estimate**: 2 Weeks (Sprints 3–4)
- **Status**: 📅 _Planned_
- **Key Deliverables**:
  - Full Expense CRUD REST endpoints (`/api/v1/expenses`).
  - Zod validation schemas (`createExpenseSchema`, `expenseQuerySchema`).
  - Category taxonomy handling (16 system categories + custom user categories).
  - Paginated expense list view with category filtering.
  - Frontend modal forms for adding and editing expenses.
- **Exit Criteria**: End-to-end expense CRUD workflows operate reliably with zero data loss or invalid state bugs.

---

### Milestone 4: Financial Dashboard & Category Budgets

- **Scope Estimate**: 1.5 Weeks (Sprint 5)
- **Status**: 📅 _Planned_
- **Key Deliverables**:
  - Interactive financial overview dashboard (KPI cards for Total Spent, Daily Average, Top Category).
  - Interactive charts (Category Breakdown Doughnut Chart, Budget vs Actual Bar Chart).
  - Category budget limit setup and visual progress indicators.
  - Over-budget visual threshold alerts (Green < 80%, Amber 80–99%, Red ≥ 100%).
- **Exit Criteria**: Dashboard renders real-time budget progress bars and charts with sub-100ms API response time.

---

### Milestone 5: Analytics, Reports & Data Export

- **Scope Estimate**: 1 Week (Sprint 6)
- **Status**: 📅 _Planned_
- **Key Deliverables**:
  - Category breakdown analytics reports with percentage calculations and transaction counts.
  - Date-range filter picker (`startDate` to `endDate`).
  - CSV export generation engine and download trigger.
- **Exit Criteria**: Reports correctly aggregate date-filtered expenditures and CSV files download cleanly with accurate headers.

---

### Milestone 6: Quality Assurance & Integration Testing

- **Scope Estimate**: 1 Week (Sprint 7)
- **Status**: 📅 _Planned_
- **Key Deliverables**:
  - Integration test suite for Express service & repository layer.
  - End-to-end UI tests for transaction workflows.
  - Accessibility audit (WCAG 2.1 Level AA) and keyboard navigation verification.
- **Exit Criteria**: Test coverage exceeds 85% for business logic services; zero critical or high accessibility violations.

---

### Milestone 7: Production Deployment & CI/CD

- **Scope Estimate**: 1 Week (Sprint 8)
- **Status**: 📅 _Planned_
- **Key Deliverables**:
  - Docker containerization for Express server and React Vite web app.
  - GitHub Actions CI/CD pipeline running `typecheck`, `lint`, `format:check`, `test`, and container build.
  - Production database migration and environment configuration deployment.
  - Live production monitoring and health check probe verification (`GET /api/v1/health`).
- **Exit Criteria**: Production deployment online with 99.9% target SLA and automated CI/CD pipeline active.
