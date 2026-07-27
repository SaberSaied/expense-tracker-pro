# Expense Tracker Pro — Authentication Screens Design Specification (Step 4.3)

This document provides detailed UI component specifications, layout structures, form validation requirements, state handling, and interactive behaviors for all 5 authentication screens in **Expense Tracker Pro**.

---

## 1. Shared Layout & Aesthetics (`AuthLayout`)

All authentication screens share a unified centered glassmorphic card layout:

- **Background**: Deep Obsidian Dark (`var(--bg-app)` `#0F172A`) with subtle radial emerald gradient glows (`var(--color-primary)` `#10B981`).
- **Glass Card**: High-contrast glass container (`backdrop-filter: blur(16px)`, `background: rgba(30, 41, 59, 0.7)`, `border: 1px solid var(--border-glass)`).
- **Brand Identity**: Application logo (`lucide-react` `TrendingUp` icon in Electric Emerald `#10B981`) and bold title.

---

## 2. Authentication Screens Specification

### **Screen 1: Login (`/login`)**

- **Purpose**: Authenticate existing users via email and password.
- **UI Components**:
  - Logo & Heading ("Welcome Back to Expense Tracker Pro")
  - `EmailInput`: `<input type="email">` with icon prefix.
  - `PasswordInput`: `<input type="password">` with toggle visibility eye icon.
  - `RememberMeCheckbox`: Custom accessible checkbox.
  - `ForgotPasswordLink`: Navigates to `/forgot-password`.
  - `SubmitButton`: Full-width glass button ("Sign In") with loading spinner state.
  - `RegisterRedirect`: Link to `/register`.
- **Form Validation & Zod Schema**:
  - `email`: Required, valid email format.
  - `password`: Required, minimum 8 characters.

---

### **Screen 2: Register (`/register`)**

- **Purpose**: Onboard new users and create a workspace account.
- **UI Components**:
  - Logo & Heading ("Create Your Pro Account")
  - `FullNameInput`: `<input type="text">` for user's display name.
  - `EmailInput`: `<input type="email">`.
  - `PasswordInput`: Password field with strength meter (Weak/Medium/Strong).
  - `ConfirmPasswordInput`: Ensures matching password string.
  - `TermsCheckbox`: Agreement to Terms of Service & Privacy Policy.
  - `SubmitButton`: Full-width glass button ("Create Account").
- **Form Validation & Zod Schema**:
  - `name`: Required, 2-50 characters.
  - `email`: Required, unique email format.
  - `password`: Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
  - `confirmPassword`: Must match `password` field exactly.

---

### **Screen 3: Forgot Password (`/forgot-password`)**

- **Purpose**: Initiate password recovery by sending a reset link via email.
- **UI Components**:
  - Heading ("Reset Your Password")
  - Subtitle ("Enter your email and we'll send a password recovery link.")
  - `EmailInput`: Email field with validation.
  - `SubmitButton`: "Send Reset Link" with loading state.
  - `BackToLogin`: Navigates back to `/login`.
- **State Behavior**: Upon successful submission, replaces form with a success confirmation state ("Check your inbox! Reset link dispatched.").

---

### **Screen 4: Reset Password (`/reset-password?token=...`)**

- **Purpose**: Set a new password using a verified token query parameter.
- **UI Components**:
  - Heading ("Set New Password")
  - `NewPasswordInput`: Password field with strength meter.
  - `ConfirmNewPasswordInput`: Password confirmation.
  - `SubmitButton`: "Update Password".
- **Validation**: Token validity check on mount. Invalid/expired tokens trigger an error banner with a request new link option.

---

### **Screen 5: Email Verification (`/verify-email?token=...`)**

- **Purpose**: Confirm user email ownership.
- **UI Components & States**:
  - **Loading State**: Animated emerald pulse ring with "Verifying your email address..."
  - **Success State**: Checkmark icon in electric emerald, "Email Verified!", and "Proceed to Dashboard" button.
  - **Failure State**: Error alert icon, "Link Expired or Invalid", and "Resend Verification Email" button.
