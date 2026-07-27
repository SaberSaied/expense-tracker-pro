# Expense Tracker Pro — Reports & Analytics Module UI Specification (Step 4.8)

This document provides detailed UI component specifications, data analytics visualizations, date range filter controls, and report export dialog modal designs for the **Reports & Analytics Module** (`/reports`).

---

## 1. Reports Dashboard Layout Specification (`/reports`)

The Reports Dashboard provides high-level financial analysis and intelligence:

```
+-----------------------------------------------------------------------------------+
|  Financial Analytics & Reports                        [ Export Data (v) ]         |
+-----------------------------------------------------------------------------------+
|  [ Date Range Preset: Last 3 Months v ]  From: [ 2026-05-01 ]  To: [ 2026-07-28 ] |
+-----------------------------------------------------------------------------------+
|  Analytics Summary Metric Cards                                                   |
|  +---------------+ +---------------+ +---------------+ +---------------+         |
|  | Total Spent   | | Daily Average | | Top Category  | | Total Txns    |         |
|  | $9,840.00     | | $109.33       | | Food (31.2%)  | | 124 Txns      |         |
|  +---------------+ +---------------+ +---------------+ +---------------+         |
+-----------------------------------------------------------------------------------+
|  Spending Trend Line Chart & Category Allocation (12-Column Responsive Split)    |
|  +---------------------------------------+ +----------------------------------+   |
|  | Monthly Expenditure Trend (Line/Area) | | Category Breakdown (Doughnut)    |   |
|  | (8 Columns Grid)                      | | (4 Columns Grid)                 |   |
|  +---------------------------------------+ +----------------------------------+   |
+-----------------------------------------------------------------------------------+
|  Category Performance Summary Data Table                                          |
|  Category       | Total Spent | Share % | Avg / Txn   | Transaction Count           |
|  ---------------+-------------+---------+-------------+------------------           |
|  Food & Dining  | $3,070.00   | 31.2%   | $73.09      | 42 transactions             |
|  Housing & Rent | $4,500.00   | 45.7%   | $1,500.00   | 3 transactions              |
|  Transport      | $1,120.00   | 11.4%   | $32.00      | 35 transactions             |
+-----------------------------------------------------------------------------------+
```

---

## 2. Date Range Filter Controls

- **Preset Selectors**: Quick buttons / dropdown options:
  - `This Month` (Default: 1st of current month to today)
  - `Last Month`
  - `Last 3 Months`
  - `Year-to-Date (YTD)`
  - `Custom Date Range`
- **Custom Range Inputs**: Accessible start date (`FromDate`) and end date (`ToDate`) inputs with date validation (`FromDate ≤ ToDate`).

---

## 3. Data Export Dialog Modal

- **Trigger**: `Export Data` header button.
- **Export Options**:
  - `FileFormat`: Radio selector (`CSV Spreadsheet (.csv)`, `PDF Report (.pdf)`, `JSON Data (.json)`).
  - `IncludeFields`: Checkbox toggles (`All Fields`, `Category Breakdown Only`, `Raw Ledger Rows`).
- **Action Buttons**: `Cancel` vs `Download Export File` (Primary Emerald button).

---

## 4. Visual Charts Specification

1. **Monthly Expenditure Trend (Area Chart)**:
   - X-Axis: Days / Months in selected date range.
   - Y-Axis: Total Amount ($).
   - Tooltip: Displays exact date, expenditure total, and top transaction.
2. **Category Allocation (Doughnut Chart)**:
   - Interactive legend toggling categories on/off.
   - High-contrast HSL color swatches.
