# Expense Tracker Pro — Motion & Animation Guidelines (Step 3.8)

This document defines the animation durations, easing functions, micro-interactions, modal dialog reveals, loading states, page transition behavior, and reduced-motion accessibility standards for **Expense Tracker Pro**.

---

## 1. Animation Duration Scale

Motion in Expense Tracker Pro is purposeful, subtle, and snappy to reinforce an enterprise-grade SaaS feel.

| Token Name          | Duration | Milliseconds | Application Target                                                 |
| :------------------ | :------- | :----------- | :----------------------------------------------------------------- |
| `--duration-fast`   | `0.15s`  | 150ms        | Button hover states, active press feedback, tooltip fades          |
| `--duration-normal` | `0.25s`  | 250ms        | Dropdown menu reveals, tab content switches, card hover elevations |
| `--duration-slow`   | `0.35s`  | 350ms        | Modal dialog entrances, drawer slide-ins, page route transitions   |
| `--duration-pulse`  | `1.5s`   | 1500ms       | Skeleton shimmer waves, live synchronization status spinners       |

---

## 2. Easing Curve Tokens

| Token Name        | Cubic-Bezier Curve                  | Motion Feel                                   | Application                                  |
| :---------------- | :---------------------------------- | :-------------------------------------------- | :------------------------------------------- |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)`        | Smooth, natural acceleration and deceleration | Default UI movements, list item reordering   |
| `--ease-in`       | `cubic-bezier(0.4, 0, 1, 1)`        | Quick exit acceleration                       | Modal backdrops closing, toast dismissals    |
| `--ease-out`      | `cubic-bezier(0, 0, 0.2, 1)`        | Decelerated smooth entry                      | Dialog modals sliding in, popovers opening   |
| `--ease-bounce`   | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Subtle elastic snap                           | Success checkmark badges, budget alert icons |

---

## 3. Interactive Micro-Animations & Hover States

### **Card Hover Elevation**:

```css
.card-interactive {
  transition:
    transform var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
```

### **Button Active Feedback**:

```css
.button-primary:active {
  transform: scale(0.98);
}
```

---

## 4. Modal & Page Transition Specifications

### **Modal Reveal Entrance**:

- **Backdrop**: Opacity transitions from `0` to `1` over `250ms` using `--ease-out`.
- **Dialog Container**: Scale transitions from `scale(0.95)` to `scale(1)` with vertical movement `translateY(10px)` -> `translateY(0)` over `300ms` using `--ease-bounce`.

### **Page Route Transition**:

- Opacity transitions from `0` to `1` with subtle vertical slide `translateY(8px)` -> `translateY(0)` over `300ms` using `--ease-out`.

---

## 5. Loading Animations & Reduced Motion Accessibility

### **Skeleton Loading Shimmer**:

```css
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### **Accessibility Rule (`prefers-reduced-motion`)**:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. CSS Custom Properties Implementation

Below are the exact motion tokens added to `apps/web/src/index.css`:

```css
:root {
  /* Animation Duration Tokens */
  --duration-fast: 0.15s;
  --duration-normal: 0.25s;
  --duration-slow: 0.35s;
  --duration-pulse: 1.5s;

  /* Easing Curve Tokens */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```
