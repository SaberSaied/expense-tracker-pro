# Expense Tracker Pro — Master Design Tokens Reference (Step 3.9)

This document provides the centralized master reference of all design tokens enforced across **Expense Tracker Pro**, covering Colors, Typography, Spacing, Radius, Shadows, Opacity, Z-Index, and Responsive Breakpoints.

---

## 1. Color Tokens (`--color-*`, `--bg-*`, `--border-*`)

| Category          | Token Name          | Value (HSL / Hex / RGBA)         | Purpose                                     |
| :---------------- | :------------------ | :------------------------------- | :------------------------------------------ |
| **Brand**         | `--color-primary`   | `hsl(160, 84%, 39%)` (`#10B981`) | Primary actions, brand logos, income totals |
| **Brand**         | `--color-secondary` | `hsl(238, 83%, 66%)` (`#6366F1`) | Charts, secondary buttons, analytics        |
| **Brand**         | `--color-accent`    | `hsl(190, 95%, 45%)` (`#06B6D4`) | Interactive hover rings, cyan highlights    |
| **Semantic**      | `--color-success`   | `hsl(142, 71%, 45%)` (`#22C55E`) | Income logged, form success                 |
| **Semantic**      | `--color-warning`   | `hsl(38, 92%, 50%)` (`#F59E0B`)  | 80% budget caution status                   |
| **Semantic**      | `--color-error`     | `hsl(346, 84%, 61%)` (`#F43F5E`) | 100% over-budget status, destructive action |
| **Semantic**      | `--color-info`      | `hsl(199, 89%, 48%)` (`#0EA5E9`) | Informational badges, tooltips              |
| **Surface Light** | `--bg-app`          | `hsl(210, 40%, 98%)` (`#F8FAFC`) | Light mode canvas                           |
| **Surface Dark**  | `--bg-app`          | `hsl(222, 47%, 11%)` (`#0F172A`) | Dark mode obsidian canvas                   |
| **Glass Light**   | `--bg-card-glass`   | `rgba(255, 255, 255, 0.85)`      | Light glass panel                           |
| **Glass Dark**    | `--bg-card-glass`   | `rgba(30, 41, 59, 0.75)`         | Dark glass panel                            |

---

## 2. Typography Tokens (`--text-*`, `--font-*`, `--leading-*`, `--tracking-*`)

- **Font Families**: Sans (`--font-sans`: Inter/Outfit), Mono (`--font-mono`: JetBrains Mono)
- **Scale Tokens**: `xs` (12px), `sm` (14px), `base` (16px), `lg` (18px), `xl` (20px), `2xl` (24px), `3xl` (30px), `4xl` (36px), `5xl` (48px)
- **Weights**: Regular (`400`), Medium (`500`), SemiBold (`600`), Bold (`700`)
- **Line Heights**: Tight (`1.2`), Normal (`1.5`), Relaxed (`1.625`)
- **Tracking**: Tight (`-0.025em`), Normal (`0em`), Wide (`0.05em`)

---

## 3. Spacing Tokens (`--space-*`)

- `space-1`: 4px | `space-2`: 8px | `space-3`: 12px | `space-4`: 16px | `space-5`: 20px
- `space-6`: 24px | `space-8`: 32px | `space-10`: 40px | `space-12`: 48px | `space-16`: 64px | `space-20`: 80px

---

## 4. Radius & Border Tokens (`--radius-*`, `--border-width-*`)

- **Radius Tokens**: `none` (0px), `xs` (2px), `sm` (4px), `md` (6px), `lg` (8px), `xl` (12px), `2xl` (16px), `3xl` (24px), `full` (9999px)
- **Border Width Tokens**: `0` (0px), `1` (1px), `2` (2px focus ring), `4` (4px alert bar)

---

## 5. Shadow & Elevation Tokens (`--shadow-*`)

- `shadow-sm`: Low elevation (inputs)
- `shadow-md`: Default card shadow
- `shadow-lg`: Popovers & select menus
- `shadow-xl`: Modal containers
- `shadow-2xl`: High-priority toast notifications
- `shadow-glass`: Glassmorphic card ambient glow

---

## 6. Opacity Tokens (`--opacity-*`)

| Token Name           | Numeric Value | Purpose                                     |
| :------------------- | :------------ | :------------------------------------------ |
| `--opacity-disabled` | `0.38`        | Disabled buttons, inactive form controls    |
| `--opacity-muted`    | `0.6`         | Muted secondary text, background grid lines |
| `--opacity-subtle`   | `0.85`        | Translucent glass backdrop, hover overlays  |
| `--opacity-opaque`   | `1.0`         | Default fully opaque state                  |

---

## 7. Z-Index Layering Tokens (`--z-*`)

| Token Name     | Stack Value | Component Application                               |
| :------------- | :---------- | :-------------------------------------------------- |
| `--z-deep`     | `-1`        | Canvas background glow blobs, decorative elements   |
| `--z-base`     | `0`         | Standard page content cards, text                   |
| `--z-dock`     | `10`        | Sticky navigation bars, table header rows           |
| `--z-dropdown` | `100`       | Select dropdown menus, date picker popovers         |
| `--z-sticky`   | `500`       | Floating Action Button (FAB), quick-add trigger     |
| `--z-overlay`  | `1000`      | Modal dark backdrop blur overlay                    |
| `--z-modal`    | `1050`      | Center dialog modal container                       |
| `--z-toast`    | `2000`      | Real-time toast notifications, system alert banners |

---

## 8. Responsive Breakpoint Tokens (`--breakpoint-*`)

| Token Name         | Width Value | Viewport Class                  |
| :----------------- | :---------- | :------------------------------ |
| `--breakpoint-xs`  | `480px`     | Mobile Portrait                 |
| `--breakpoint-sm`  | `640px`     | Mobile Landscape / Small Tablet |
| `--breakpoint-md`  | `768px`     | Tablet Portrait                 |
| `--breakpoint-lg`  | `1024px`    | Laptop / Standard Desktop       |
| `--breakpoint-xl`  | `1280px`    | Desktop Large Container         |
| `--breakpoint-2xl` | `1536px`    | Ultra-Wide Monitor              |
