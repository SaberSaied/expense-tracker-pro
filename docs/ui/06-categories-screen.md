# Expense Tracker Pro — Categories Module UI Specification (Step 4.6)

This document provides detailed UI component specifications, modal designs, color/icon pickers, delete confirmation dialogs, and empty state handlings for the **Categories Module** (`/categories`).

---

## 1. Categories List View Specification (`/categories`)

Categories are organized into **Predefined System Categories** and **Custom User Categories**:

```
+-----------------------------------------------------------------------------------+
|  Category Management                           [ + Create Category ]              |
+-----------------------------------------------------------------------------------+
|  Predefined System Categories (Default)                                           |
|  +-----------------------+ +-----------------------+ +-----------------------+    |
|  | (Icon) Food & Dining  | | (Icon) Transport      | | (Icon) Utilities      |    |
|  | 14 Transactions       | | 8 Transactions        | | 4 Transactions        |    |
|  | Spent: $820.00        | | Spent: $240.00       | | Spent: $310.00        |    |
|  +-----------------------+ +-----------------------+ +-----------------------+    |
|                                                                                   |
|  Custom User Categories                                                           |
|  +-----------------------+ +-----------------------+                              |
|  | (Icon) SaaS Subscriptions | (Icon) Client Diners|                              |
|  | 6 Transactions        | | 3 Transactions        |                              |
|  | Spent: $420.00        | | Spent: $185.00        |                              |
|  | [ Edit ]   [ Delete ] | | [ Edit ]   [ Delete ] |                              |
|  +-----------------------+ +-----------------------+                              |
+-----------------------------------------------------------------------------------+
```

- **Category Cards**: Display category icon, badge color accent (`#10B981`, `#6366F1`, `#06B6D4`), total transaction count, and monthly spent total.
- **System Category Guard**: System categories cannot be deleted or renamed, but their monthly budget caps can be updated.

---

## 2. Create / Edit Category Modal Form

- **Trigger**: `+ Create Category` header button or card `Edit` action.
- **Form Controls**:
  - `NameInput`: `<input type="text">` for category title (e.g., "Software Subscriptions").
  - `ColorPicker`: Preset palette of 12 accessible HSL color swatches.
  - `IconSelector`: Searchable icon grid using `Lucide React` icons (`ShoppingBag`, `Car`, `Zap`, `Briefcase`, `Heart`, etc.).
  - `BudgetsInput`: Optional monthly budget target threshold (`$`).
- **Validation & Zod Schema**:
  - `name`: 2-30 characters, unique per user workspace.
  - `color`: Hex/HSL string matching preset color format.
  - `icon`: Valid Lucide icon string identifier.

---

## 3. Delete Category Confirmation Modal

- **Trigger**: Clicking `Delete` on a custom user category.
- **Safety Safeguard & Business Logic**:
  - Displays a high-contrast danger alert dialog modal.
  - **Transaction Reassignment Prompt**: If the category has linked transactions, prompts the user to reassign those transactions to a fallback category (e.g., "General / Uncategorized") before deletion.
  - Action Buttons: `Cancel` (Secondary) vs `Confirm Delete & Reassign` (Danger Red `#F43F5E`).

---

## 4. Empty State View

- **Trigger**: User has zero custom categories created.
- **UI Specification**:
  - Icon: `FolderPlus` (`lucide-react`) in Electric Indigo opacity blend.
  - Title: "No Custom Categories Yet"
  - Subtitle: "Create custom categories tailored to your unique financial tracking needs."
  - Action: `+ Create Your First Category` primary emerald button.
