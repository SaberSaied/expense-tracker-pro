# Expense Tracker Pro — Shadow & Elevation System (Step 3.5)

This document defines the elevation levels, shadow tokens, component shadow mappings (Cards, Modals, Dropdowns, Hover States), and theme-specific shadow behavior for **Expense Tracker Pro**.

---

## 1. Elevation Hierarchy & Levels

Expense Tracker Pro uses a 5-tier elevation system (plus a glassmorphism elevation tier) to establish visual depth, component layering, and focus hierarchy.

| Elevation Tier    | Level     | Token Name                          | Visual Depth  | Component Application                                               |
| :---------------- | :-------- | :---------------------------------- | :------------ | :------------------------------------------------------------------ |
| **Flat**          | `Level 0` | `--shadow-none`                     | `0px`         | App background canvas, inset panels, table rows                     |
| **Low**           | `Level 1` | `--shadow-sm` / `--shadow-md`       | `2px – 6px`   | Standard UI cards, form inputs, quiet buttons                       |
| **Medium**        | `Level 2` | `--shadow-lg` / `--shadow-dropdown` | `10px – 15px` | Select dropdown menus, popovers, context menus                      |
| **High**          | `Level 3` | `--shadow-xl` / `--shadow-modal`    | `20px – 25px` | Center dialog modals, Floating Action Buttons (FAB)                 |
| **Highest**       | `Level 4` | `--shadow-2xl`                      | `25px – 50px` | Real-time Toast notifications, critical alert banners               |
| **Glass Special** | `Glass`   | `--shadow-glass`                    | `32px Glow`   | Glassmorphic financial metric cards (`backdrop-filter: blur(12px)`) |

---

## 2. Component Shadow Specifications

### **Card Shadows (`--shadow-card`)**:

- **Default State**: Soft 2-layer ambient shadow (`0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` in Light; `0 4px 6px -1px rgba(0, 0, 0, 0.3)` in Dark).
- **Glassmorphic Variant**: Multi-layer glow (`0 8px 32px 0 rgba(31, 38, 135, 0.12)` in Light; `0 8px 32px 0 rgba(0, 0, 0, 0.45)` in Dark).

### **Hover Shadows (`--shadow-hover`)**:

- **Interactive Hover State**: Triggered on card focus/hover, raising component by `-2px` (`transform: translateY(-2px)`) and transitioning to `--shadow-lg` (`0 10px 25px -5px rgba(16, 185, 129, 0.15)` primary accent ambient glow).

### **Dropdown & Popover Shadows (`--shadow-dropdown`)**:

- Crisp 3-tier directional shadow with high contrast edge definition (`0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)`).

### **Modal & Overlay Shadows (`--shadow-modal`)**:

- Deep atmospheric shadow that lifts modal above backdrop overlays (`0 25px 50px -12px rgba(0, 0, 0, 0.35)`).

---

## 3. CSS Custom Properties Implementation

Below are the exact shadow tokens implemented in `apps/web/src/index.css`:

```css
:root {
  /* Light Theme Shadow Tokens */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  --shadow-card: var(--shadow-md);
  --shadow-hover: 0 10px 20px -3px rgba(16, 185, 129, 0.18), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-dropdown: 0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08);
  --shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
}

[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Theme Shadow Tokens */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.45);
    --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);

    --shadow-card: var(--shadow-md);
    --shadow-hover: 0 10px 20px -3px rgba(16, 185, 129, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
    --shadow-dropdown: 0 10px 20px -3px rgba(0, 0, 0, 0.5);
    --shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
    --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.55);
  }
}
```
