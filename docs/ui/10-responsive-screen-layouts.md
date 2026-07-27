# Expense Tracker Pro — Responsive Screen Adaptation Specifications (Step 4.10)

This document provides comprehensive layout adaptation rules, breakpoint behaviors, and device-specific UI transformations across **Mobile**, **Tablet**, **Laptop**, and **Desktop** viewports for every screen in **Expense Tracker Pro**.

---

## 1. Device Viewport Matrix & Breakpoints

| Device Tier | Breakpoint Query               | Layout Structure                   | Primary Navigation Pattern                                 |
| :---------- | :----------------------------- | :--------------------------------- | :--------------------------------------------------------- |
| **Mobile**  | `< 640px` (`xs`)               | 1-Column Stack (`100%` width)      | Fixed Bottom Tab Bar (`56px` height, `44px` touch targets) |
| **Tablet**  | `640px` - `1023px` (`sm`/`md`) | 2-Column Grid Matrix               | Collapsible Slide-Over Navigation Drawer                   |
| **Laptop**  | `1024px` - `1279px` (`lg`)     | 12-Column Grid (Max `1024px`)      | Fixed Left Sidebar Navigation (`256px` width)              |
| **Desktop** | `≥ 1280px` (`xl`/`2xl`)        | 12-Column Wide Grid (Max `1536px`) | Fixed Expanded Left Sidebar + Utility Toolbar              |

---

## 2. Screen-by-Screen Adaptation Rules

### **A. Authentication Screens (`/login`, `/register`, `/forgot-password`)**

- **Mobile (`< 640px`)**: Full-screen layout container with zero horizontal margin, padding `var(--space-4)` (16px), bottom-aligned submit buttons for easy thumb access.
- **Tablet & Up (`≥ 640px`)**: Centered glassmorphic card container with `max-width: 440px` and `--shadow-elevation-3` depth.

---

### **B. Primary Dashboard Screen (`/dashboard`)**

- **Mobile (`< 640px`)**:
  - Statistics KPI Cards: Single-column vertical scroll stack.
  - Charts: Full-width scrollable container with touch swipe gestures.
  - Recent Transactions: Top 3 items displayed, stacked layout.
  - FAB: Bottom-right primary emerald floating action button (`44px` target area).
- **Tablet (`640px - 1023px`)**:
  - Statistics KPI Cards: 2 × 2 grid matrix.
  - Charts & Budgets: Stacked 100% width sections.
- **Laptop & Desktop (`≥ 1024px`)**:
  - Statistics KPI Cards: 4-column horizontal row.
  - Analytics Matrix: 8-column Doughnut/Area Chart + 4-column Budget Progress sidebar.

---

### **C. Transactions Ledger (`/expenses`)**

- **Mobile (`< 640px`)**:
  - Converts table into a **Touch Card List** view displaying Description, Category Badge, Date, and Amount in a compact vertical row.
  - Action menu becomes a bottom sheet drawer upon tapping a card row.
- **Tablet & Up (`≥ 640px`)**:
  - Full multi-column data table with sortable column headers, pagination controls, and inline quick action dropdowns.

---

### **D. Categories Management (`/categories`)**

- **Mobile (`< 640px`)**: 1-column grid stack of category cards.
- **Tablet (`640px`)**: 2-column grid matrix of category cards.
- **Desktop (`≥ 1024px`)**: 3-column grid matrix with quick hover action controls.

---

### **E. Category Budgets (`/budgets`)**

- **Mobile (`< 640px`)**: Stacked progress bars with inline percentage text.
- **Tablet & Desktop (`≥ 640px`)**: 2-column card grid displaying spend metrics, status alert badges (`Normal`, `Amber`, `Red`), and budget target sliders.

---

### **F. Reports & Analytics (`/reports`)**

- **Mobile (`< 640px`)**: Date preset dropdown menu, single area chart, stacked summary table.
- **Desktop (`≥ 1024px`)**: Side-by-side date range picker, dual charts (Expenditure Trend + Category Allocation), and full financial summary ledger table.

---

### **G. Profile & Settings (`/profile`, `/settings`)**

- **Mobile (`< 640px`)**: Form inputs stacked vertically; avatar upload controls aligned full-width.
- **Desktop (`≥ 1024px`)**: 2-column split (Left profile overview card, Right form input matrix).
