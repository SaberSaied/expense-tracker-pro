# Expense Tracker Pro — Responsive Design Guidelines & Grid System (Step 3.10)

This document defines the responsive layout rules, media query breakpoints, fluid typography scaling, adaptive spacing, and 12-column grid behavior for **Expense Tracker Pro**.

---

## 1. Responsive Breakpoints

Expense Tracker Pro uses a mobile-first responsive architecture built around 6 standardized breakpoint tiers:

| Breakpoint Token    | Min-Width | Target Viewport / Device Class      | Primary Layout Behavior                                              |
| :------------------ | :-------- | :---------------------------------- | :------------------------------------------------------------------- |
| Mobile (`xs`)       | `< 640px` | Smart phones (Portrait)             | 1-Column vertical stack, bottom tab bar navigation, full-width cards |
| Small Tablet (`sm`) | `640px`   | Phones (Landscape), compact tablets | 2-Column KPI grid, collapsible drawer menu                           |
| Tablet (`md`)       | `768px`   | iPad / Tablet (Portrait)            | 2-Column dashboard split, inline form inputs                         |
| Laptop (`lg`)       | `1024px`  | Laptops, iPad Pro (Landscape)       | 12-Column grid, fixed 256px sidebar navigation                       |
| Desktop (`xl`)      | `1280px`  | Desktop Monitors                    | 12-Column grid with centered max-width container (`1280px`)          |
| Ultra-Wide (`2xl`)  | `1536px`  | Large Desktop / 4K Monitors         | Multi-panel analytics view with max-width container (`1536px`)       |

---

## 2. Responsive Grid System (4 / 8 / 12 Columns)

The application adapts grid column density dynamically based on viewport width:

- **Mobile Viewport (`< 640px`)**: **4-Column Grid** (`gap: 16px`, side margins `16px`)
  - All summary KPI cards span 4 columns (100% width).
- **Tablet Viewport (`640px – 1023px`)**: **8-Column Grid** (`gap: 20px`, side margins `24px`)
  - KPI summary cards span 4 columns each (2x2 grid matrix).
- **Desktop Viewport (`≥ 1024px`)**: **12-Column Grid** (`gap: 24px`, side margins `32px`)
  - KPI summary cards span 3 columns each (4-card top row).
  - Main transaction table spans 8 columns; summary category pie chart spans 4 columns.

---

## 3. Responsive Typography & Adaptive Spacing

### **Fluid Typography Scaling**:

To maintain optimal reading density without horizontal overflow, heading sizes adjust dynamically across screen sizes:

```css
h1,
.text-hero {
  font-size: clamp(2.25rem, 5vw, 3rem); /* 36px on mobile -> 48px on desktop */
  line-height: var(--leading-tight);
}

h2,
.text-title {
  font-size: clamp(1.5rem, 3.5vw, 1.875rem); /* 24px on mobile -> 30px on desktop */
  line-height: var(--leading-tight);
}

body,
.text-body {
  font-size: clamp(0.875rem, 2vw, 1rem); /* 14px on mobile -> 16px on desktop */
  line-height: var(--leading-normal);
}
```

### **Adaptive Spacing & Container Padding**:

| Component / Container  | Mobile (`< 640px`)      | Tablet (`640px – 1023px`) | Desktop (`≥ 1024px`)    |
| :--------------------- | :---------------------- | :------------------------ | :---------------------- |
| **Card Inner Padding** | `var(--space-4)` (16px) | `var(--space-5)` (20px)   | `var(--space-6)` (24px) |
| **Dashboard Grid Gap** | `var(--space-4)` (16px) | `var(--space-5)` (20px)   | `var(--space-6)` (24px) |
| `--layout-margin`      | `16px`                  | `24px`                    | `32px`                  |

---

## 4. Mobile & Desktop Layout Behavior

### **Mobile Viewport Rules (`< 640px`)**:

- Navigation transforms into a fixed bottom navigation bar with sub-3-second quick-add Floating Action Button (`FAB`).
- Data tables collapse into touch-friendly stacked card items.
- Modals anchor to the bottom of the screen as slide-up drawer sheets.

### **Desktop Viewport Rules (`≥ 1024px`)**:

- Fixed left sidebar navigation (`width: 256px`) with active state glows.
- Data tables render in full tabular format with sortable headers, inline actions, and hover rows.
- Modals render as centered dialog boxes with backdrop blurs (`backdrop-filter: blur(8px)`).
