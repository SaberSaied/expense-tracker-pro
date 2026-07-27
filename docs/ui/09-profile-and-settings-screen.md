# Expense Tracker Pro — Profile & Settings Module UI Specification (Step 4.9)

This document provides detailed UI component specifications, avatar customization rules, security form controls, theme/currency selectors, and notification preferences for the **Profile & Settings Module** (`/profile` & `/settings`).

---

## 1. User Profile Screen Specification (`/profile`)

The Profile Screen allows users to manage personal information, update avatars, and change security credentials:

```
+-----------------------------------------------------------------------------------+
|  User Profile & Security                                                          |
+-----------------------------------------------------------------------------------+
|  Avatar Customization Header                                                      |
|  +-----------------------------------------------------------------------------+  |
|  | [ Avatar Image (128x128) ]  Alex Rivera                                     |  |
|  |                             tech.alex@example.com                           |  |
|  | [ Upload Photo ]  [ Remove ]  Max size: 2MB (.png, .jpg)                   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Personal Information Form                                                        |
|  +-----------------------------------------------------------------------------+  |
|  | Full Name:         [ Alex Rivera                                   ]        |  |
|  | Email Address:     [ alex@freelancer.com                           ]        |  |
|  | Job Title / Bio:   [ Senior Software Consultant                    ]        |  |
|  | [ Save Profile Changes ]                                                     |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Security & Password Management                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Current Password:   [ ****************                              ]        |  |
|  | New Password:       [ ****************                              ]        |  |
|  | Confirm Password:   [ ****************                              ]        |  |
|  | [ Update Password ]                                                          |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Application Settings Screen Specification (`/settings`)

The Settings Screen manages workspace localization, visual theme preferences, and notification channels:

```
+-----------------------------------------------------------------------------------+
|  Account & Workspace Settings                                                     |
+-----------------------------------------------------------------------------------+
|  Visual Theme & Appearance                                                        |
|  +-----------------------------------------------------------------------------+  |
|  | Color Theme:   (*) Dark Mode (Obsidian)  ( ) Light Mode  ( ) System Default|  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Currency & Regional Localization                                                 |
|  +-----------------------------------------------------------------------------+  |
|  | Default Currency:  [ USD ($) - US Dollar                             v ]   |  |
|  | Display Language:  [ English (US)                                    v ]   |  |
|  | Date Format:       [ YYYY-MM-DD (2026-07-28)                         v ]   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Notification Preferences                                                         |
|  +-----------------------------------------------------------------------------+  |
|  | [x] Budget Threshold Alerts (Receive toast when category budget hits 80%)    |  |
|  | [x] Email Over-Budget Warnings (Email notification on 100% budget cap)     |  |
|  | [ ] Weekly Spending Summary Digest                                          |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Data Backup & Danger Zone                                                        |
|  +-----------------------------------------------------------------------------+  |
|  | Data Export:     [ Download Full JSON Backup ]                              |  |
|  | Danger Action:   [ Permanently Delete Account ] (Red Danger Card)            |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Zod Validation & Security Rules

- **Password Change Validation**:
  - `currentPassword`: Required.
  - `newPassword`: Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
  - `confirmPassword`: Must match `newPassword`.
- **Avatar File Guard**: Max 2MB, MIME types `image/png`, `image/jpeg`, `image/webp`.
