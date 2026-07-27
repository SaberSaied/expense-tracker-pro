# Expense Tracker Pro — Primary Dashboard UI Specification (Step 4.4)

This document provides complete component, layout, and visual widget specifications for the **Primary Dashboard Screen** (`/dashboard`) in **Expense Tracker Pro**.

---

## 1. Dashboard Layout Architecture

The Dashboard uses an adaptive **12-Column Responsive Grid** with glassmorphic cards:

```
+-----------------------------------------------------------------------------------+
|  [Header Bar] Search | Month Selector | Quick Add (+) | User Profile              |
+-----------------------------------------------------------------------------------+
|  [Statistics Cards Grid - 4 Columns]                                              |
|  +---------------+ +---------------+ +---------------+ +---------------+         |
|  | Total Spent   | | Daily Avg     | | Top Category  | | Rem. Budget   |         |
|  | $3,420.50     | | $114.02       | | Food (34%)    | | $1,079.50     |         |
|  +---------------+ +---------------+ +---------------+ +---------------+         |
+-----------------------------------------------------------------------------------+
|  [Analytics Charts & Budget Matrix - 12 Columns Split]                            |
|  +---------------------------------------+ +----------------------------------+   |
|  | Category Breakdown Doughnut Chart     | | Category Budget Targets Widget   |   |
|  | (8 Columns)                           | | (4 Columns)                      |   |
|  +---------------------------------------+ +----------------------------------+   |
+-----------------------------------------------------------------------------------+
|  [Recent Transactions Ledger Widget - Full Width]                                 |
+-----------------------------------------------------------------------------------+
```

---

## 2. Widget Specifications

### **A. Statistics Overview Cards Grid**

Four glassmorphic metric cards positioned at the top of the dashboard:

| Metric Card             | Value Display   | Subtext / Trend Badge              | Icon Component |
| :---------------------- | :-------------- | :--------------------------------- | :------------- |
| **Total Monthly Spent** | `$3,420.50`     | `+4.2% vs last month` (Amber)      | `DollarSign`   |
| **Daily Average**       | `$114.02`       | `-1.8% vs last month` (Emerald)    | `Calendar`     |
| **Top Category**        | `Food & Dining` | `$1,150.00 (33.6% of total)`       | `PieChart`     |
| **Remaining Budget**    | `$1,079.50`     | `76% of $4,500 monthly limit used` | `Target`       |

---

### **B. Charts & Analytics Section**

1. **Category Breakdown Doughnut Chart**:
   - Visual distribution of monthly expenses grouped by category.
   - Interactive hover tooltips showing total amount and transaction count.
   - Center summary text showing total month expenditure.
2. **30-Day Spending Trend Area Chart**:
   - Smooth curved line showing daily expenditure fluctuations.
   - Gradient fill under the curve (`#10B981` opacity blend).

---

### **C. Budget Overview Widget**

Displays real-time budget progress bars for top spending categories:

- **Food & Dining**: `$820 / $1,000` — Progress: `82%` | Status: **Amber Alert** (`#F59E0B`)
- **Transportation**: `$240 / $600` — Progress: `40%` | Status: **Normal** (`#22C55E`)
- **Housing & Utilities**: `$1,500 / $1,500` — Progress: `100%` | Status: **Critical Limit** (`#F43F5E`)

---

### **D. Recent Transactions Ledger Widget**

- Displays the **5 most recent expenses** with category badge, date, description, payment method, and amount.
- Quick action menu per row (`Edit`, `Delete`).
- Header includes a "View All Transactions" button redirecting to `/expenses`.

---

### **E. Quick Actions & Floating Action Button (FAB)**

- **Header Trigger**: Primary Emerald button `+ Add Expense` opens the quick transaction entry modal.
- **Mobile FAB**: Bottom-right floating action button (`44px` minimum target) for single-tap expense creation.
