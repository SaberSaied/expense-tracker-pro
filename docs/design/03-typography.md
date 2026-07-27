# Expense Tracker Pro — Typography System & Scale (Step 3.3)

This document defines the typography family choices, modular scale, weights, line heights, letter spacing rules, and CSS token mappings for **Expense Tracker Pro**.

---

## 1. Font Family System

- **Primary UI & Headings**: **Inter** (Primary) / **Outfit** (Fallback)
  - Selected for crisp legibility across screen sizes, clean geometric forms, and native support for tabular numeric figures (`font-variant-numeric: tabular-nums`).
- **Monospace & Financial Numbers**: **JetBrains Mono** / **Fira Code**
  - Used for transaction IDs, currency values, code snippets, and structured log displays.

---

## 2. Modular Typography Scale (Major Third — 1.25 Ratio)

| Token Name    | Rem Size   | Pixel Equiv | Line Height   | Letter Spacing | Target UI Component                                |
| :------------ | :--------- | :---------- | :------------ | :------------- | :------------------------------------------------- |
| `--text-xs`   | `0.75rem`  | 12px        | `1.33` (16px) | `0.05em`       | Badges, micro labels, timestamps                   |
| `--text-sm`   | `0.875rem` | 14px        | `1.42` (20px) | `0em`          | Table rows, secondary descriptions, form help text |
| `--text-base` | `1rem`     | 16px        | `1.5` (24px)  | `0em`          | Body text, input field values, button labels       |
| `--text-lg`   | `1.125rem` | 18px        | `1.5` (27px)  | `-0.01em`      | Card subheadings, navigation item titles           |
| `--text-xl`   | `1.25rem`  | 20px        | `1.4` (28px)  | `-0.01em`      | Modal titles, section headers                      |
| `--text-2xl`  | `1.5rem`   | 24px        | `1.33` (32px) | `-0.02em`      | Main section headings (H3)                         |
| `--text-3xl`  | `1.875rem` | 30px        | `1.2` (36px)  | `-0.02em`      | Page titles (H2), financial card KPIs              |
| `--text-4xl`  | `2.25rem`  | 36px        | `1.16` (42px) | `-0.025em`     | Main hero headings (H1)                            |
| `--text-5xl`  | `3rem`     | 48px        | `1.1` (53px)  | `-0.025em`     | Display metrics, total account balance banner      |

---

## 3. Font Weights

| Token Name               | Weight Value | Usage Standard                                           |
| :----------------------- | :----------- | :------------------------------------------------------- |
| `--font-weight-regular`  | `400`        | Standard body copy, paragraph text, table cell content   |
| `--font-weight-medium`   | `500`        | Form labels, navigation links, table column headers      |
| `--font-weight-semibold` | `600`        | Buttons, card subheaders, active tab indicators          |
| `--font-weight-bold`     | `700`        | H1/H2 page titles, financial balance totals, KPI numbers |

---

## 4. CSS Custom Properties Implementation

Below are the exact typography tokens added to `apps/web/src/index.css`:

```css
:root {
  /* Typography Family Tokens */
  --font-sans: "Inter", "Outfit", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Typography Scale Tokens */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */

  /* Font Weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.05em;
}
```
