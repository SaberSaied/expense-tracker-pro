# Expense Tracker Pro — Iconography & Icon System (Step 3.7)

This document specifies the icon library choice, size scale, stroke weight rules, color states, spacing standards, and accessibility guidelines for **Expense Tracker Pro**.

---

## 1. Icon Library Choice

**Lucide React** (`lucide-react`) is selected as the primary icon system across Expense Tracker Pro.

### **Rationale**:

- **Clean 24px Grid Alignment**: Designed on a consistent 24px grid with crisp pixel snapping.
- **Consistent 2px Stroke Weight**: Uniform visual density across all UI views.
- **Lightweight & Tree-Shakable**: Zero bloat; only imports icons used in production.
- **Complete Financial & SaaS Coverage**: Features dedicated icons for wallet management, credit cards, analytics, transactions, category badges, and navigation items.

---

## 2. Icon Size Scale

| Token Name   | Pixel Value | Rem Size  | Primary Application                                      |
| :----------- | :---------- | :-------- | :------------------------------------------------------- |
| `--icon-xs`  | 12px        | `0.75rem` | Micro status indicators, inline tags, metadata dots      |
| `--icon-sm`  | 16px        | `1rem`    | Input field prefixes, table row inline actions, tooltips |
| `--icon-md`  | 20px        | `1.25rem` | Standard button leading icons, navigation sidebar items  |
| `--icon-lg`  | 24px        | `1.5rem`  | Card headers, section titles, modal headers              |
| `--icon-xl`  | 32px        | `2rem`    | Financial KPI metric card icons, category avatars        |
| `--icon-2xl` | 48px        | `3rem`    | Empty state illustrations, onboarding feature highlights |

---

## 3. Icon Color States & Semantic Mapping

| Icon State            | Color Reference  | Token / Hex Code                     | Usage                                                |
| :-------------------- | :--------------- | :----------------------------------- | :--------------------------------------------------- |
| **Primary Accent**    | Electric Emerald | `var(--color-primary)` (`#10B981`)   | Brand highlights, active tab icons                   |
| **Secondary Accent**  | Electric Indigo  | `var(--color-secondary)` (`#6366F1`) | Analytics, graph legends, secondary triggers         |
| **Neutral / Muted**   | Slate Muted      | `var(--text-muted)` (`#94A3B8`)      | Inactive navigation, metadata icons, chevron toggles |
| **Success / Income**  | Emerald Green    | `var(--color-success)` (`#22C55E`)   | Income category badge, positive balance growth       |
| **Warning / Caution** | Amber Alert      | `var(--color-warning)` (`#F59E0B`)   | 80% budget caution indicator                         |
| **Error / Critical**  | Rose Red         | `var(--color-error)` (`#F43F5E`)     | 100% over-budget alert, delete modal trigger         |
| **Info**              | Sky Blue         | `var(--color-info)` (`#0EA5E9`)      | System info banners, tooltips                        |

---

## 4. Icon Spacing & Accessibility Guidelines

### **Icon Spacing Rules**:

- **Icon-to-Text Gap**: `var(--space-2)` (8px) between icon and adjacent label text.
- **Icon Button Padding**: Minimum `var(--space-2)` (8px) padding around standalone icon buttons to maintain 44px × 44px minimum touch target size.

### **Accessibility Standards (WCAG 2.1 AA)**:

- **Decorative Icons**: Set `aria-hidden="true"` when an icon is accompanied by text.
- **Standalone Icon Buttons**: Must include `aria-label="Description"` (e.g. `aria-label="Delete transaction"`).
- **Stroke Uniformity**: Enforce `strokeWidth={2}` across all icon components.

---

## 5. CSS Custom Properties Implementation

Below are the exact icon size tokens added to `apps/web/src/index.css`:

```css
:root {
  /* Icon Size Tokens */
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;
  --icon-2xl: 48px;
}
```
