# Expense Tracker Pro — Complete Design System Documentation

Welcome to the central design system specification for **Expense Tracker Pro**. This system ensures 100% visual consistency, brand harmony, responsive liquidity, glassmorphic elegance, and WCAG 2.1 AA accessibility across every screen and component.

---

## 1. Master Design System Directory

| #      | Specification Document                                                                                                 | Focus Area                                                                               |
| :----- | :--------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **01** | [Brand Identity](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/01-brand-identity.md)                    | Brand personality, obsidian dark theme, glassmorphism aesthetics, moodboard              |
| **02** | [Color Palette](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/02-color-palette.md)                      | Primary Emerald (`#10B981`), Indigo (`#6366F1`), Semantic states, Light & Dark themes    |
| **03** | [Typography System](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/03-typography.md)                     | Inter/Outfit fonts, Major-Third 1.25 scale (`xs` to `5xl`), weights, tabular numerals    |
| **04** | [Spacing System](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/04-spacing-system.md)                    | 8pt base grid scale (`4px` to `80px`), container widths (`640px` to `1536px`), grid gaps |
| **05** | [Elevation System](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/05-elevation-system.md)                | 5-tier elevation scale (`Level 0` to `Level 4`), `--shadow-hover`, `--shadow-glass` glow |
| **06** | [Border System](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/06-border-system.md)                      | Border radius scale (`0px` to `9999px`), border widths (`0px` to `4px`), dividers        |
| **07** | [Iconography System](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/07-icon-system.md)                   | Lucide React icon library, 2px stroke weight, icon size scale, accessibility rules       |
| **08** | [Motion Guidelines](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/08-motion-guidelines.md)              | Animation durations (`150ms` to `1500ms`), cubic-bezier easing, reduced motion rules     |
| **09** | [Design Tokens Reference](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/09-design-tokens.md)            | Master index of CSS custom properties (Opacity, Z-Index, Breakpoints)                    |
| **10** | [Responsive Guidelines](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/10-responsive-guidelines.md)      | 6 breakpoint tiers (`xs` to `2xl`), 4/8/12-column grid system, fluid typography          |
| **11** | [Accessibility Standards](file:///home/eldgwy/Projects/expense-tracker-pro/docs/design/11-accessibility-guidelines.md) | WCAG 2.1 AA contrast ratios, dual focus rings, focus traps, 44px touch targets           |

---

## 2. Core UI Component Code Examples

### **Example A: Glassmorphic Metric KPI Card**

```tsx
import React from "react";
import { TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  amount: string;
  changePercentage: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, amount, changePercentage }) => {
  return (
    <div className="card-glass p-6 rounded-xl border border-glass shadow-glass hover:shadow-hover transition-all duration-fast">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted">{title}</span>
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
          <TrendingUp size={20} strokeWidth={2} aria-hidden="true" />
        </div>
      </div>
      <div className="text-3xl font-bold font-mono tracking-tight text-primary">{amount}</div>
      <div className="mt-2 text-xs font-semibold text-emerald-500">
        +{changePercentage}% vs last month
      </div>
    </div>
  );
};
```

### **Example B: Accessible Glass Button**

```tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", children, ...props }) => {
  const baseStyles =
    "px-4 py-2.5 rounded-md font-semibold text-sm transition-all duration-fast focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 min-h-[44px] inline-flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95",
    secondary:
      "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};
```

---

## 3. Design System Consistency Review Checklist

- [x] **Brand Consistency**: All HSL color tokens mapped to CSS variables in `apps/web/src/index.css`.
- [x] **Typography Scale**: Major-Third ratio verified across heading and body sizes with `tabular-nums` numeric formatting.
- [x] **8pt Spacing Metric**: Margins, paddings, and container gaps enforce 8pt grid metrics (`space-1` through `space-20`).
- [x] **Elevation & Depth**: Glassmorphism cards enforce backdrop blurs (`backdrop-filter: blur(12px)`) and `--shadow-glass` depth.
- [x] **WCAG 2.1 AA Accessibility**: Dual focus rings, 4.5:1 text contrast ratios, and 44px minimum touch targets active across tokens.
