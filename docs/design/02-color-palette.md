# Expense Tracker Pro — Color Palette & Theme Tokens (Step 3.2)

This document defines the complete color system, semantic status colors, light theme tokens, dark theme tokens, and HSL values for **Expense Tracker Pro**.

---

## 1. Brand Core Colors

| Role          | Color Name       | Hex Code  | HSL Value            | Purpose                                                                    |
| :------------ | :--------------- | :-------- | :------------------- | :------------------------------------------------------------------------- |
| **Primary**   | Electric Emerald | `#10B981` | `hsl(160, 84%, 39%)` | Primary buttons, brand logos, positive spend indicators, active highlights |
| **Secondary** | Electric Indigo  | `#6366F1` | `hsl(238, 83%, 66%)` | Charts, analytics widgets, navigation badges, secondary actions            |
| **Accent**    | Bright Cyan      | `#06B6D4` | `hsl(190, 95%, 45%)` | Interactive hover highlights, focus rings, subtle gradients                |

---

## 2. Semantic Colors

| Semantic State       | Color Name  | Hex Code  | HSL Value            | Application                                                                   |
| :------------------- | :---------- | :-------- | :------------------- | :---------------------------------------------------------------------------- |
| **Success**          | Vivid Green | `#22C55E` | `hsl(142, 71%, 45%)` | Income transactions, completed forms, positive balance changes                |
| **Warning**          | Amber Alert | `#F59E0B` | `hsl(38, 92%, 50%)`  | Budget caution (80% breach), pending confirmation states                      |
| **Error / Critical** | Rose Red    | `#F43F5E` | `hsl(346, 84%, 61%)` | Over-budget alerts (100% breach), destructive actions, form validation errors |
| **Info**             | Sky Blue    | `#0EA5E9` | `hsl(199, 89%, 48%)` | System tooltips, informational banners, neutral tags                          |

---

## 3. Light & Dark Theme CSS Custom Properties

Below are the exact design system tokens implemented in `apps/web/src/index.css`:

```css
:root {
  /* Brand Core Tokens */
  --color-primary: hsl(160, 84%, 39%);
  --color-primary-hover: hsl(160, 84%, 33%);
  --color-secondary: hsl(238, 83%, 66%);
  --color-secondary-hover: hsl(238, 83%, 58%);
  --color-accent: hsl(190, 95%, 45%);

  /* Semantic State Tokens */
  --color-success: hsl(142, 71%, 45%);
  --color-success-bg: hsl(142, 71%, 95%);
  --color-warning: hsl(38, 92%, 50%);
  --color-warning-bg: hsl(38, 92%, 95%);
  --color-error: hsl(346, 84%, 61%);
  --color-error-bg: hsl(346, 84%, 95%);
  --color-info: hsl(199, 89%, 48%);
  --color-info-bg: hsl(199, 89%, 95%);

  /* Light Theme Specific Tokens */
  --bg-app: hsl(210, 40%, 98%); /* #F8FAFC */
  --bg-card: hsl(0, 0%, 100%); /* #FFFFFF */
  --bg-card-glass: rgba(255, 255, 255, 0.85);
  --border-card: hsl(214, 32%, 91%); /* #E2E8F0 */
  --border-glass: rgba(0, 0, 0, 0.08);

  --text-primary: hsl(222, 47%, 11%); /* #0F172A */
  --text-secondary: hsl(215, 16%, 47%); /* #64748B */
  --text-muted: hsl(215, 20%, 65%); /* #94A3B8 */

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
}

[data-theme="dark"] {
  /* Dark Theme Specific Tokens */
  --bg-app: hsl(222, 47%, 11%); /* #0F172A */
  --bg-card: hsl(217, 33%, 17%); /* #1E293B */
  --bg-card-glass: rgba(30, 41, 59, 0.75);
  --border-card: hsl(215, 25%, 27%); /* #334155 */
  --border-glass: rgba(255, 255, 255, 0.08);

  --text-primary: hsl(210, 40%, 98%); /* #F8FAFC */
  --text-secondary: hsl(215, 20%, 65%); /* #94A3B8 */
  --text-muted: hsl(215, 16%, 47%); /* #64748B */

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
}
```
