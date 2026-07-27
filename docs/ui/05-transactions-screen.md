# Expense Tracker Pro — Transactions Module UI Specification (Step 4.5)

This document provides detailed UI component specifications, layout structures, form modal designs, filter controls, search behaviors, and empty state handlings for the **Transactions Module** (`/expenses`).

---

## 1. Transactions List View Specification (`/expenses`)

The Transactions Ledger provides a high-density, accessible data table:

```
+-----------------------------------------------------------------------------------+
|  Transactions Ledger                          [ + Add Expense ] [ Export CSV ]    |
+-----------------------------------------------------------------------------------+
|  [Search Input: "Search description..."] | Category: [All v] | Payment: [All v]   |
+-----------------------------------------------------------------------------------+
| [x] | Date       | Description     | Category    | Payment Method | Amount   | ...|
|-----+------------+-----------------+-------------+----------------+----------+----|
| [ ] | 2026-07-27 | Whole Foods     | Groceries   | Credit Card    | $142.50  | (v)|
| [ ] | 2026-07-26 | Uber Ride       | Transport   | Debit Card     |  $24.00  | (v)|
+-----------------------------------------------------------------------------------+
| Showing 1-10 of 42 transactions                    [ < Prev ] 1 2 3 [ Next > ]   |
+-----------------------------------------------------------------------------------+
```

- **Table Columns**: Date, Description, Category Badge, Payment Method Badge, Amount (Bold, `tabular-nums`), Action Menu (`Edit`, `Delete`, `Details`).
- **Sorting**: Clicking column headers toggles ascending/descending order.

---

## 2. Add / Edit Transaction Form Modal

- **Modal Trigger**: `+ Add Expense` button or `Row Edit` action.
- **Form Fields**:
  - `AmountInput`: Currency input formatted with symbol (`$`), numeric validation.
  - `CategorySelect`: Accessible dropdown displaying icon + category name.
  - `DatePicker`: ISO date picker defaulting to current date.
  - `DescriptionInput`: Text input (e.g., "Whole Foods Market").
  - `PaymentMethodSelect`: Radio cards or dropdown (`Credit Card`, `Debit Card`, `Cash`, `Bank Transfer`).
  - `NotesTextarea`: Optional notes / memo text.
- **Form Validation & Zod Schema**:
  - `amount`: Positive number (`> 0.01`).
  - `categoryId`: Valid UUID string.
  - `date`: Valid ISO date string.
  - `description`: 2-100 characters.

---

## 3. Transaction Details Drawer

- **Trigger**: Clicking a row or selecting `Details` in the row action menu.
- **Metadata Displayed**:
  - Unique Transaction ID (`UUIDv4`)
  - Creation & Update Timestamps
  - Category Badge & Payment Method Details
  - Full Description & Optional Notes

---

## 4. Search, Filtering & Empty States

### **Search & Filter Bar**:

- **Debounced Search**: Filters by description text as the user types (300ms debounce).
- **Category Filter**: Dropdown to isolate specific categories.
- **Payment Method Filter**: Dropdown (`All`, `Credit`, `Debit`, `Cash`, `Transfer`).
- **Date Range Picker**: Filter by Month/Custom Date Window.

### **Empty States**:

1. **Zero Transactions Initial State**:
   - Icon: `Receipt` (`lucide-react`)
   - Title: "No Expenses Recorded Yet"
   - Body: "Start tracking your spending by adding your first expense."
   - Action: `+ Add First Expense` primary button.
2. **No Filter / Search Matches State**:
   - Icon: `SearchX`
   - Title: "No Matching Transactions Found"
   - Body: "Try adjusting your search keywords or filter criteria."
   - Action: `Clear Filters` secondary button.
