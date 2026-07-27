# Expense Tracker Pro — Business Rules Document

This document specifies the strict business rules, domain constraints, and validation invariants enforced across **Expense Tracker Pro**.

---

## 1. User & Authorization Business Rules (`BR-USR`)

- **BR-USR-01 (Single User Ownership)**: Every transaction, budget limit, custom category, and payment method belongs to **exactly one user**.
- **BR-USR-02 (Strict Data Isolation)**: Users can **only access, view, modify, or delete their own financial data**. Cross-tenant data leakage is strictly prohibited.
- **BR-USR-03 (Email Uniqueness)**: Every registered user account must possess a unique, verified email address.
- **BR-USR-04 (Session Scope)**: An authenticated session token is valid only for the issuing user and expires after 7 days unless revoked earlier.

---

## 2. Transaction Business Rules (`BR-TXN`)

- **BR-TXN-01 (Positive Amounts)**: Expense transaction amounts must be **strictly greater than zero** (`amount > 0`). Zero or negative expense amounts are prohibited.
- **BR-TXN-02 (Date Bounds)**: Transaction dates must be valid ISO calendar dates (`YYYY-MM-DD`) and cannot be set more than 10 years in the past or future.
- **BR-TXN-03 (Mandatory Association)**: Every transaction must be linked to an existing, valid category.
- **BR-TXN-04 (Description Limits)**: Transaction descriptions must be non-empty strings with a maximum length of 500 characters.

---

## 3. Category Business Rules (`BR-CAT`)

- **BR-CAT-01 (Protected Deletion)**: Predefined system categories cannot be deleted or renamed.
- **BR-CAT-02 (Referential Integrity on Deletion)**: A custom category **cannot be deleted if it is linked to existing transactions**. If a user attempts to delete a category containing transactions, the system must either:
  1. Block deletion and request reassigning those transactions, OR
  2. Automatically reassign those transactions to the default `Other` category before deletion.
- **BR-CAT-03 (Category Name Uniqueness)**: Category names must be unique per user.

---

## 4. Budget Business Rules (`BR-BDG`)

- **BR-BDG-01 (Non-Negative Limits)**: Monthly category budget limits **cannot be negative** (`limit >= 0`).
- **BR-BDG-02 (Budget Period Alignment)**: Category budget limits apply on a per-calendar-month basis (`YYYY-MM`).
- **BR-BDG-03 (Threshold Calculations)**:
  - Spending between **0% and 79.9%** is classified as `NORMAL` (Green status).
  - Spending between **80% and 99.9%** triggers a `WARNING` state (Amber status).
  - Spending at **100% or above** triggers a `CRITICAL` over-budget state (Red status).

---

## 5. Report & Export Business Rules (`BR-RPT`)

- **BR-RPT-01 (Deterministic Date Range Filtering)**: Date range filters (`startDate` to `endDate`) are inclusive (`startDate <= date <= endDate`). If `startDate > endDate`, the system shall reject the request.
- **BR-RPT-02 (Export Completeness)**: CSV exports must contain all filtered records up to a maximum export limit of 10,000 transactions per single file download.
