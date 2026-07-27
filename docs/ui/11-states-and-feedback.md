# Expense Tracker Pro — UI States & Feedback Design Specifications (Step 4.11)

This document provides detailed UI specifications for all interactive states, feedback patterns, skeleton loaders, error boundaries, toast notifications, and confirmation dialogs in **Expense Tracker Pro**.

---

## 1. UI Loading & Skeleton Loaders (`SKELETON-SYSTEM`)

To prevent layout shift and maintain perceived speed during API fetches:

```css
/* Accessible Shimmer Loading Animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.12) 37%,
    rgba(255, 255, 255, 0.05) 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
  border-radius: var(--radius-md);
}
```

### **Component Skeleton Mapping**:

- **KPI Overview Cards**: Displays rectangular shimmer boxes for Title, Amount, and Trend Badge.
- **Transactions Data Table**: Displays 5 shimmer rows matching table column dimensions.
- **Charts Section**: Displays circular skeleton ring for Doughnut Chart and rectangular gradient box for Area Chart.

---

## 2. Empty States Architecture (`EMPTY-STATES`)

Every data view provides an encouraging, actionable initial state:

| View Location           | Trigger Condition              | Visual Illustration         | Primary Action             |
| :---------------------- | :----------------------------- | :-------------------------- | :------------------------- |
| **Transactions Ledger** | Zero transactions created      | `Receipt` Icon (Indigo)     | `+ Add First Expense`      |
| **Filtered Search**     | Search keywords return 0 items | `SearchX` Icon (Muted)      | `Clear Search Filters`     |
| **Categories View**     | Zero custom categories         | `FolderPlus` Icon (Emerald) | `+ Create Custom Category` |
| **Budgets View**        | Zero budget targets configured | `Target` Icon (Cyan)        | `+ Set Category Budget`    |

---

## 3. Error Handling & Validation Feedback (`ERROR-PATTERNS`)

- **Inline Input Field Errors**:
  - Red border accent (`var(--border-error)` `#F43F5E`).
  - Subtext helper message in red (`#F43F5E`) with an inline warning icon.
- **Global API Error Alert Banners**:
  - Displayed at the top of forms when network connection fails or 500 server errors occur.
- **React Error Boundary Screen**:
  - Catches unexpected runtime JavaScript exceptions.
  - Displays "Something went wrong", details error stack, and provides a `Reload Application` primary button.

---

## 4. Success Toast Notifications (`TOAST-SYSTEM`)

- **Appearance**: Glassmorphic toast container anchored at top-right or bottom-center (`z-index: 2000`).
- **Variants**:
  - **Success**: Electric Emerald border/icon (`#10B981`), auto-dismiss after 4000ms.
  - **Warning**: Amber border/icon (`#F59E0B`), auto-dismiss after 5000ms.
  - **Error**: Red border/icon (`#F43F5E`), persistent until manual dismissal.

---

## 5. Confirmation Dialog Modals (`CONFIRMATION-DIALOGS`)

Used exclusively for irreversible destructive actions (e.g., Delete Category, Delete Transaction, Delete Account):

- **Overlay**: Backdrop blur filter (`backdrop-filter: blur(8px)`, `background: rgba(0, 0, 0, 0.6)`).
- **Dialog Box**: High-contrast card with Red danger header accent.
- **Button Actions**: `Cancel` (Secondary Gray) vs `Confirm Delete` (Primary Danger Red `#F43F5E`).
- **Focus Trap**: Traps keyboard focus (`Tab`/`Shift+Tab`) inside dialog until action is taken.
