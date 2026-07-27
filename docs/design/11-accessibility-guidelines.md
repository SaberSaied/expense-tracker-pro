# Expense Tracker Pro — Accessibility Standards & Guidelines (Step 3.11)

This document specifies the WCAG 2.1 Level AA accessibility rules, color contrast ratios, high-visibility focus states, keyboard navigation patterns, touch target specifications, and auditing checklist for **Expense Tracker Pro**.

---

## 1. Color Contrast Standards (WCAG 2.1 Level AA)

All text, icons, and interactive form controls must pass WCAG 2.1 AA color contrast verification:

| Content Element                        | Minimum Contrast Ratio | Implementation Standard                                                                      |
| :------------------------------------- | :--------------------- | :------------------------------------------------------------------------------------------- |
| **Normal Body Text** (`< 18pt` / 24px) | **4.5 : 1**            | Dark text (`#0F172A`) on light bg (`#F8FAFC`); Light text (`#F8FAFC`) on dark bg (`#0F172A`) |
| **Large Headings** (`≥ 18pt` / 24px)   | **3.0 : 1**            | Primary brand titles, card KPI text                                                          |
| **UI Components & Graphic Objects**    | **3.0 : 1**            | Input borders (`#334155`), button outlines, chart line markers                               |
| **Incidental / Disabled Content**      | Exempt                 | Inactive buttons (`opacity: 0.38`), muted placeholder text                                   |

---

## 2. High-Visibility Focus States

To ensure full usability for keyboard users and assistive technologies, interactive elements enforce a dual-layer, high-contrast focus ring:

```css
/* Universal Accessible Focus Style */
:focus-visible {
  outline: 2px solid var(--color-primary) !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25) !important;
}

/* Strict Enforcement: Never remove outline without replacement */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 3. Keyboard Navigation Rules

Every feature in Expense Tracker Pro must be 100% operable via keyboard without requiring a mouse:

| Key Action                     | Expected Component Behavior                                              |
| :----------------------------- | :----------------------------------------------------------------------- |
| `Tab`                          | Moves focus to the next interactive control in logical DOM reading order |
| `Shift + Tab`                  | Moves focus to the previous interactive control                          |
| `Enter` / `Space`              | Activates focused buttons, toggles checkboxes, submits active forms      |
| `Escape`                       | Dismisses active dialog modals, popover dropdowns, and drawer sheets     |
| `Arrow Keys` (`↑` `↓` `←` `→`) | Navigates option items in select dropdowns, radio groups, and tab lists  |

### **Modal Focus Trapping**:

When a dialog modal opens, keyboard focus automatically shifts to the first focusable element inside the modal. Tabbing is restricted to elements within the modal until closed via `Escape` or the close button. Upon closing, focus returns to the triggering button.

---

## 4. Minimum Touch Target Sizes

To support mobile touch screens and users with motor control impairments:

- **Minimum Touch Target Dimension**: All interactive elements (Buttons, Icon Triggers, Checkboxes, Pagination links) have a minimum clickable area of **44px × 44px**.
- **Touch Target Spacing**: Adjacent touch targets maintain a minimum separation gap of `var(--space-2)` (8px).

```css
/* Standalone Icon Button Minimum Touch Target */
.btn-icon-accessible {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## 5. WCAG 2.1 Level AA Accessibility Checklist

- [ ] **Semantic HTML5 Structure**: Native `<button>`, `<a>`, `<input>`, `<form>`, `<main>`, `<nav>`, `<header>` elements used correctly.
- [ ] **Image & Icon Alt Text**: Decorative icons carry `aria-hidden="true"`; standalone icon buttons carry descriptive `aria-label` attributes.
- [ ] **Form Labels**: Every text input and select menu is explicitly linked to an `<label htmlFor="...">` or carries `aria-label`.
- [ ] **ARIA Live Regions**: Asynchronous toast notifications use `role="status"` and `aria-live="polite"`. Validation error banners use `role="alert"` and `aria-live="assertive"`.
- [ ] **Screen Reader Testing**: Verified using NVDA / VoiceOver for smooth auditory navigation.
