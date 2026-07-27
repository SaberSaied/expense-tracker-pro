# Expense Tracker Pro — Functional Requirements Specification (FRS)

This Functional Requirements Specification (FRS) defines the system behaviors, API boundaries, validation criteria, and functional rules for **Expense Tracker Pro**.

---

## 1. System Overview

Expense Tracker Pro is a web-based financial tracking application built using React, Express, PostgreSQL, and Prisma. The application provides end-to-end data integrity using Zod schemas and shared monorepo packages.

---

## 2. Detailed Functional Requirements

### FRS-01: User Registration

- **FRS-01.1**: The system shall provide a registration form accepting `email`, `password`, and optional `name`.
- **FRS-01.2**: The system shall enforce email format validation and password complexity (minimum 8 characters).
- **FRS-01.3**: The system shall hash passwords using bcrypt before saving to the database.
- **FRS-01.4**: The system shall reject duplicate email registrations with HTTP `409 Conflict`.

### FRS-02: User Login & Session Management

- **FRS-02.1**: The system shall authenticate users using email and password credentials.
- **FRS-02.2**: Upon successful login, the system shall issue a signed JWT token stored in HTTP-only cookies or authorization headers.
- **FRS-02.3**: Protected API routes shall reject requests lacking a valid JWT token with HTTP `401 Unauthorized`.

### FRS-03: Transaction Management

- **FRS-03.1**: The system shall allow users to create an expense transaction with `amount` (numeric > 0), `category` (enum), `description` (string 1–500 chars), and `date` (YYYY-MM-DD).
- **FRS-03.2**: The system shall return a paginated list of transactions with configurable page size (default 20, max 100).
- **FRS-03.3**: The system shall allow updating existing transactions by ID with partial payloads.
- **FRS-03.4**: The system shall delete transaction records by ID and return HTTP `200 OK` or `204 No Content`.

### FRS-04: Category Management

- **FRS-04.1**: The system shall maintain a standard taxonomy of 16 categories (`Food & Dining`, `Transportation`, `Housing`, `Utilities`, `Entertainment`, `Healthcare`, `Shopping`, `Education`, `Travel`, `Personal Care`, `Groceries`, `Subscriptions`, `Insurance`, `Savings & Investments`, `Income`, `Other`).
- **FRS-04.2**: The system shall allow filtering transactions by one or multiple categories.

### FRS-05: Budget Management

- **FRS-05.1**: The system shall allow users to define monthly target budget limits for each expense category.
- **FRS-05.2**: The system shall compute current spending relative to category budget limits in real time.
- **FRS-05.3**: The system shall return spending percentage ratios (`amountSpent / budgetLimit * 100`).

### FRS-06: Dashboard

- **FRS-06.1**: The system shall present an interactive dashboard displaying total monthly expenditures, top spending categories, and recent transactions.
- **FRS-06.2**: The dashboard shall include a quick action trigger to launch the "Create Expense" modal or form immediately.

### FRS-07: Reports & Analytics

- **FRS-07.1**: The system shall aggregate expenses by category, calculating total amount, percentage share, and item count.
- **FRS-07.2**: The system shall support custom date-range aggregation (`startDate` to `endDate`).

### FRS-08: Search & Filtering

- **FRS-08.1**: The system shall support case-insensitive full-text keyword search across transaction descriptions.
- **FRS-08.2**: Search queries shall combine with category and date-range filters seamlessly.

### FRS-09: Data Export

- **FRS-09.1**: The system shall generate and download CSV formatted exports of filtered or complete transaction histories.
- **FRS-09.2**: The CSV output shall include standard columns: `ID`, `Date`, `Category`, `Amount`, `Description`, `CreatedAt`.

### FRS-10: Notifications & Visual Alerts

- **FRS-10.1**: The system shall render visual alert indicators (amber at 80% budget, red at 100% budget).
- **FRS-10.2**: The system shall display toast notifications for asynchronous actions (e.g. "Expense added successfully", "Failed to update record").
