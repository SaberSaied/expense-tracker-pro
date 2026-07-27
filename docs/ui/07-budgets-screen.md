# Expense Tracker Pro — Budgets Module UI Specification (Step 4.7)

This document provides detailed UI component specifications, progress bar indicators, threshold alert levels, and budget creation/editing modal designs for the **Budgets Module** (`/budgets`).

---

## 1. Budget Overview Layout Specification (`/budgets`)

The Budgets view acts as a central financial discipline dashboard:

```
+-----------------------------------------------------------------------------------+
|  Category Monthly Budgets                      Period Selector: [ July 2026 v ]   |
+-----------------------------------------------------------------------------------+
|  Overall Monthly Budget Summary                                                   |
|  Spent: $3,420.50 / Limit: $4,500.00 (76% Used)                                   |
|  [============================...................] (Amber Alert: 4 days left)    |
+-----------------------------------------------------------------------------------+
|  Category Budget Cards Grid (2 Columns Desktop)                                   |
|                                                                                   |
|  +-------------------------------------+ +-------------------------------------+  |
|  | (Icon) Food & Dining               | | (Icon) Transportation               |  |
|  | Spent: $820.00 / Limit: $1,000.00  | | Spent: $240.00 / Limit: $600.00     |  |
|  | Progress: 82% [========..]         | | Progress: 40% [===.....]            |  |
|  | Status: [ AMBER ALERT ]             | | Status: [ NORMAL ]                  |  |
|  | [ View Txns ]        [ Edit Limit ]| | [ View Txns ]        [ Edit Limit ]|  |
|  +-------------------------------------+ +-------------------------------------+  |
|                                                                                   |
|  +-------------------------------------+                                          |
|  | (Icon) Housing & Rent               |                                          |
|  | Spent: $1,500 / Limit: $1,500      |                                          |
|  | Progress: 100% [========]           |                                          |
|  | Status: [ RED CRITICAL LIMIT ]      |                                          |
|  | [ View Txns ]        [ Edit Limit ]|                                          |
|  +-------------------------------------+                                          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Progress Bar Indicators & Color Thresholds

Category progress bars dynamically adjust colors based on spending percentage:

| Spending Level               | Color Token                      | Visual Appearance | Triggered System Behavior           |
| :--------------------------- | :------------------------------- | :---------------- | :---------------------------------- |
| **`< 70%` (Normal)**         | `var(--color-success)` `#22C55E` | Emerald Fill      | Normal tracking                     |
| **`70% - 89%` (Warning)**    | `var(--color-warning)` `#F59E0B` | Amber Fill        | In-app toast notification alert     |
| **`≥ 90%` (Critical Limit)** | `var(--color-error)` `#F43F5E`   | Red Fill + Pulse  | In-app warning banner & email alert |

---

## 3. Create & Edit Budget Target Modal Form

- **Trigger**: `+ Set Category Budget` header button or card `Edit Limit` action.
- **Form Controls**:
  - `CategorySelect`: Select target category.
  - `TargetAmountInput`: Monthly maximum spend limit (`$`).
  - `AlertThresholdSelect`: Custom notification threshold (`75%`, `80%`, `90%`).
  - `PeriodSelect`: Billing period alignment (Calendar Month vs Custom Payday Cycle).
- **Validation & Zod Schema**:
  - `targetAmount`: Positive number (`≥ 1.00`).
  - `categoryId`: Valid category UUID.
  - `threshold`: Integer between `50` and `100`.

---

## 4. Budget Details & Transaction Breakdown Drawer

- **Trigger**: Clicking `View Txns` on any category budget card.
- **Content**:
  - List of all transactions during the selected month attributed to this budget.
  - Historical spending comparison graph (Previous 3 months vs current month).
