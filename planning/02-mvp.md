# Expense Tracker Pro — MVP Feature List & Scope Specification

This document defines the Minimum Viable Product (MVP) scope for **Expense Tracker Pro** using the MoSCoW prioritization methodology.

---

## 1. MoSCoW Feature Categorization

### Must Have (MVP Core Scope — Release 1.0)

These features are essential for a functional, viable expense tracking system. Without these, the application cannot provide value.

- **Expense Management (CRUD)**:
  - Add single expense with amount, category, description, and date.
  - View paginated list of recorded expenses with sorting (date, amount, category).
  - Edit existing expense details.
  - Delete an expense item.
- **Categorization System**:
  - Predefined set of standard categories (`Food & Dining`, `Transportation`, `Housing`, `Utilities`, `Entertainment`, `Healthcare`, `Shopping`, `Education`, `Travel`, `Personal Care`, `Groceries`, `Subscriptions`, `Insurance`, `Savings & Investments`, `Income`, `Other`).
  - Category filtering on expense list views.
- **Financial Analytics & Summary**:
  - Category breakdown with spending amount, percentage of total, and transaction count.
  - Total expenditure calculation for specified date ranges.
- **Input Validation & Data Integrity**:
  - Client-side and server-side Zod validation (positive numbers, ISO dates, non-empty description, validated categories).
  - Clear, user-friendly validation error feedback.
- **System Health & Reliability**:
  - Health check API endpoint (`/api/v1/health`).
  - Graceful error handling and 404 fallback routing.

---

### Should Have (Release 1.1 — Next Priority)

Features that add significant value but are not strictly required for the immediate first functional release.

- **Search & Advanced Filtering**:
  - Full-text search by description keywords.
  - Custom date range filter picker (`startDate` to `endDate`).
- **Data Export & Backup**:
  - Export expense history to CSV format.
- **User Authentication & Session Management**:
  - JWT-based sign-in and sign-up.
  - Password hashing via bcrypt.

---

### Could Have (Future Considerations — Release 2.0+)

Enhancements that provide convenience or specialized capabilities.

- **Multi-Currency Support**:
  - Real-time exchange rate conversion and multi-currency tracking.
- **Receipt Image Attachment**:
  - File upload for paper receipt scans using Express multer.
- **Budget Goal Notifications**:
  - E-mail alerts when monthly category limits exceed predefined thresholds.

---

### Won't Have (Explicitly Excluded from Initial Scope)

Features explicitly out of scope for the MVP to prevent scope creep and unnecessary complexity.

- ❌ Automated bank feed / Open Banking synchronization.
- ❌ Crypto wallet integration.
- ❌ Multi-tenant organization team permissions & RBAC workflows.
- ❌ Native mobile app builds (focus strictly on responsive web app first).

---

## 2. MVP Release Scope Definition

The MVP (Release 1.0) will deliver a single, robust, web-accessible interface connected to the Express backend and PostgreSQL database with zero unnecessary complexity.

```
[ Frontend: React + Vite ] ──(REST API)──> [ Backend: Express + Zod ] ──> [ DB: PostgreSQL + Prisma ]
```
