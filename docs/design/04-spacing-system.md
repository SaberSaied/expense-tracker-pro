# Expense Tracker Pro — Spacing System & Layout Grid (Step 3.4)

This document defines the 8pt base grid spacing scale, container width standards, section padding, component layout rules, and grid gaps for **Expense Tracker Pro**.

---

## 1. Base Spacing Scale (8pt Grid System)

All layout dimensions, margins, and paddings adhere strictly to an 8pt base grid system (with 4px half-steps for micro-components).

| Token Name   | Rem Size  | Pixel Value | Typical Application                                                    |
| :----------- | :-------- | :---------- | :--------------------------------------------------------------------- |
| `--space-1`  | `0.25rem` | 4px         | Micro badges, icon-to-text gap, focus ring offset                      |
| `--space-2`  | `0.5rem`  | 8px         | Button icon spacing, tag padding, input inner gap                      |
| `--space-3`  | `0.75rem` | 12px        | Compact button padding, dropdown item padding                          |
| `--space-4`  | `1rem`    | 16px        | Standard button padding, form field gap, card content padding (mobile) |
| `--space-5`  | `1.25rem` | 20px        | Medium modal header padding, list item gap                             |
| `--space-6`  | `1.5rem`  | 24px        | Standard card padding (desktop), grid column gap, section gap          |
| `--space-8`  | `2rem`    | 32px        | Major component gap, header bottom margin, modal body padding          |
| `--space-10` | `2.5rem`  | 40px        | Dashboard widget vertical spacing, hero banner padding                 |
| `--space-12` | `3rem`    | 48px        | Page header vertical padding, section divider spacing                  |
| `--space-16` | `4rem`    | 64px        | Main page top/bottom margin, marketing hero spacing                    |
| `--space-20` | `5rem`    | 80px        | Extra large layout section breaks                                      |

---

## 2. Container Width Standards

| Token Name        | Max Width | Target Screen / Viewport | Purpose                                                         |
| :---------------- | :-------- | :----------------------- | :-------------------------------------------------------------- |
| `--container-sm`  | `640px`   | Mobile / Compact Dialog  | Authentication screens (Login/Register), confirmation modals    |
| `--container-md`  | `768px`   | Tablet / Single Column   | User profile settings, account preferences, single-column forms |
| `--container-lg`  | `1024px`  | Standard Tablet / Laptop | Category management views, report detail tables                 |
| `--container-xl`  | `1280px`  | Standard Desktop         | Primary financial dashboard, transaction ledger list            |
| `--container-2xl` | `1536px`  | Ultra-Wide Desktop       | Multi-column analytics view, split-screen dashboard view        |

---

## 3. Section & Component Spacing Standards

### **Section Layout Spacing**:

- **Page Header to Content**: `var(--space-8)` (32px)
- **Dashboard Section Gap**: `var(--space-6)` (24px)
- **Modal Internal Content Padding**: `var(--space-6)` (24px)

### **Component Internal Spacing**:

- **Standard Button Padding**: Vertical `10px` (`0.625rem`), Horizontal `16px` (`var(--space-4)`)
- **Input Field Padding**: Vertical `10px` (`0.625rem`), Horizontal `14px` (`0.875rem`)
- **Card Body Padding**: `var(--space-6)` (24px on desktop) / `var(--space-4)` (16px on mobile)
- **Table Row Padding**: Vertical `14px` (`0.875rem`), Horizontal `16px` (`var(--space-4)`)

### **Grid Gaps**:

- **KPI Summary Card Grid**: `var(--space-4)` (16px) on mobile, `var(--space-6)` (24px) on desktop
- **Form Row Gap**: `var(--space-4)` (16px)
- **Main Dashboard Layout Split**: `var(--space-6)` (24px)

---

## 4. CSS Custom Properties Implementation

Below are the exact spacing tokens added to `apps/web/src/index.css`:

```css
:root {
  /* Spacing Scale Tokens */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */

  /* Container Width Tokens */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}
```
