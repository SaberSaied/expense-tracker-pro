# Expense Tracker Pro — Border Radius & Border System (Step 3.6)

This document defines the border radius scale, border widths, divider styles, card border treatments, and CSS custom property mappings for **Expense Tracker Pro**.

---

## 1. Border Radius Scale

| Token Name      | Value    | Rem Equivalent | Component Target                                     |
| :-------------- | :------- | :------------- | :--------------------------------------------------- |
| `--radius-none` | `0px`    | `0rem`         | Sharp edges, flush side panels                       |
| `--radius-xs`   | `2px`    | `0.125rem`     | Micro tags, status dots, tooltip pointers            |
| `--radius-sm`   | `4px`    | `0.25rem`      | Inline code blocks, table cell badges                |
| `--radius-md`   | `6px`    | `0.375rem`     | Standard buttons, text input fields, select triggers |
| `--radius-lg`   | `8px`    | `0.5rem`       | Dropdown context menus, popovers, alert banners      |
| `--radius-xl`   | `12px`   | `0.75rem`      | Standard financial metric cards, dashboard widgets   |
| `--radius-2xl`  | `16px`   | `1rem`         | Centered dialog modals, hero summary banners         |
| `--radius-3xl`  | `24px`   | `1.5rem`       | Floating action bars, search bar overlays            |
| `--radius-full` | `9999px` | `9999rem`      | Circular avatars, status pills, rounded badges       |

---

## 2. Border Width Standards

| Token Name         | Value | Usage Standard                                                             |
| :----------------- | :---- | :------------------------------------------------------------------------- |
| `--border-width-0` | `0px` | Borderless panels, flat cards                                              |
| `--border-width-1` | `1px` | Standard card outlines, form input borders, table borders, dividers        |
| `--border-width-2` | `2px` | Active focus rings (`ring-2`), selected tab indicators, active state cards |
| `--border-width-4` | `4px` | Over-budget severity side accents, status alert indicator bars             |

---

## 3. Card Borders & Glassmorphic Highlights

- **Standard Light Card Border**: `1px solid hsl(214, 32%, 91%)` (`#E2E8F0`)
- **Standard Dark Card Border**: `1px solid hsl(215, 25%, 27%)` (`#334155`)
- **Glassmorphic Card Border**: `1px solid rgba(255, 255, 255, 0.08)` (Dark) / `rgba(0, 0, 0, 0.08)` (Light)
- **Active Focus Border**: `2px solid hsl(160, 84%, 39%)` (Electric Emerald)

---

## 4. Divider Styles

- **Standard Divider (`.divider-solid`)**: `1px solid var(--border-card)`
- **Glassmorphic Divider (`.divider-glass`)**: `1px solid var(--border-glass)`
- **Dashed Divider (`.divider-dashed`)**: `1px dashed var(--border-card)`

---

## 5. CSS Custom Properties Implementation

Below are the exact border tokens implemented in `apps/web/src/index.css`:

```css
:root {
  /* Border Radius Tokens */
  --radius-none: 0px;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-full: 9999px;

  /* Border Width Tokens */
  --border-width-0: 0px;
  --border-width-1: 1px;
  --border-width-2: 2px;
  --border-width-4: 4px;
}
```
