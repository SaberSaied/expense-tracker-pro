# Expense Tracker Pro — Application Low-Fidelity Wireframes (Step 4.2)

This document provides structured low-fidelity ASCII/Markdown layout wireframes for all 9 core screens in **Expense Tracker Pro**.

---

## 1. Authentication Screens

### **Login Screen Wireframe (`/login`)**

```
+-----------------------------------------------------------------------+
|  Expense Tracker Pro (Logo)                        [Light / Dark]    |
+-----------------------------------------------------------------------+
|                                                                       |
|                     +---------------------------+                     |
|                     |       Welcome Back        |                     |
|                     | Sign in to your account   |                     |
|                     +---------------------------+                     |
|                     | Email Address             |                     |
|                     | [ alex@freelancer.com   ] |                     |
|                     | Password                  |                     |
|                     | [ ****************      ] |                     |
|                     | [ ] Remember Me  [Forgot?]|                     |
|                     +---------------------------+                     |
|                     | [   Sign In Button      ] |                     |
|                     +---------------------------+                     |
|                     | Don't have an account?    |                     |
|                     | [Register here]           |                     |
|                     +---------------------------+                     |
|                                                                       |
+-----------------------------------------------------------------------+
```

---

### **Register Screen Wireframe (`/register`)**

```
+-----------------------------------------------------------------------+
|  Expense Tracker Pro (Logo)                        [Light / Dark]    |
+-----------------------------------------------------------------------+
|                                                                       |
|                     +---------------------------+                     |
|                     |    Create Pro Account     |                     |
|                     | Start tracking expenses   |                     |
|                     +---------------------------+                     |
|                     | Full Name                 |                     |
|                     | [ Alex Rivera           ] |                     |
|                     | Email Address             |                     |
|                     | [ alex@freelancer.com   ] |                     |
|                     | Password                  |                     |
|                     | [ ****************      ] |                     |
|                     | Confirm Password          |                     |
|                     | [ ****************      ] |                     |
|                     +---------------------------+                     |
|                     | [  Create Account Button  ] |                     |
|                     +---------------------------+                     |
|                     | Already have an account?  |                     |
|                     | [Sign in here]            |                     |
|                     +---------------------------+                     |
|                                                                       |
+-----------------------------------------------------------------------+
```

---

## 2. Core Application Screens

### **Primary Dashboard Wireframe (`/dashboard`)**

```
+-----------------------------------------------------------------------+
| (Logo) Pro   | Search expenses...           | [Quick Add +] | (User)  |
+--------------+----------------------------------------------+---------+
| [D] Dashboard|  Dashboard Overview                         [Month v]  |
| [$] Expenses | +----------------------------------------------------+ |
| [B] Budgets  | | Total Spent   | Daily Avg    | Top Category        | |
| [C] Category | | $3,420.50    | $114.02      | Food & Dining (34%) | |
| [R] Reports  | +----------------------------------------------------+ |
| [S] Settings |                                                        |
|              | +--------------------------+ +-----------------------+ |
|              | | Category Spending Pie    | | Budget Target Progress| |
|              | |  (Doughnut Chart)        | | Food   [======..] 82% | |
|              | |                          | | Travel [===.....] 40% | |
|              | +--------------------------+ +-----------------------+ |
|              |                                                        |
|              | +----------------------------------------------------+ |
|              | | Recent Transactions                   [View All >] | |
|              | | 2026-07-27 | Whole Foods  | Groceries  | $142.50   | |
|              | | 2026-07-26 | Uber Trip    | Transport  |  $24.00   | |
|              | +----------------------------------------------------+ |
+--------------+--------------------------------------------------------+
```

---

### **Transactions Ledger Wireframe (`/expenses`)**

```
+-----------------------------------------------------------------------+
|  Transaction Ledger                          [ Export CSV ] [ + Add ] |
+-----------------------------------------------------------------------+
|  Filters: [ Category: All v ] [ Payment: All v ] [ Date Range v ]     |
+-----------------------------------------------------------------------+
|  Date       | Description    | Category     | Payment  | Amount    |  |
| ------------+----------------+--------------+----------+-----------+  |
|  2026-07-27 | Whole Foods    | Groceries    | Credit   | $142.50   |  |
|  2026-07-26 | Uber Ride      | Transport    | Debit    |  $24.00   |  |
|  2026-07-25 | Client Dinner  | Dining Out   | Cash     |  $88.20   |  |
|  2026-07-24 | AWS Hosting    | Software     | Credit   | $210.00   |  |
+-----------------------------------------------------------------------+
|  Showing 1-10 of 42 transactions             [ < Prev ]  1 2 3 [ Next > ]
+-----------------------------------------------------------------------+
```

---

### **Categories Management Wireframe (`/categories`)**

```
+-----------------------------------------------------------------------+
|  Category Management                           [ + New Custom Category ]
+-----------------------------------------------------------------------+
|  System Categories (Predefined)                                       |
|  +-------------------+ +-------------------+ +-------------------+    |
|  | (Icon) Food       | | (Icon) Transport  | | (Icon) Utilities  |    |
|  | 14 Transactions   | | 8 Transactions    | | 4 Transactions    |    |
|  +-------------------+ +-------------------+ +-------------------+    |
|                                                                       |
|  Custom User Categories                                               |
|  +-------------------+ +-------------------+                          |
|  | (Icon) SaaS Tools | | (Icon) Client Din.|                          |
|  | 6 Txns [Edit][Del]| | 3 Txns [Edit][Del]|                          |
|  +-------------------+ +-------------------+                          |
+-----------------------------------------------------------------------+
```

---

### **Budgets Setup Wireframe (`/budgets`)**

```
+-----------------------------------------------------------------------+
|  Category Monthly Budgets                      Period: [ July 2026 v ]|
+-----------------------------------------------------------------------+
|  Overall Budget Progress: $3,420.50 of $4,500.00 (76%) [========....] |
+-----------------------------------------------------------------------+
|  Food & Dining      Spent: $820.00 / Target: $1,000.00  [======..] 82%|
|  [AMBER ALERT: Spending reached 80% threshold]         [Edit Target] |
+-----------------------------------------------------------------------+
|  Transportation     Spent: $240.00 / Target: $600.00    [===.....] 40%|
|  [NORMAL STATUS]                                       [Edit Target] |
+-----------------------------------------------------------------------+
|  Housing & Rent     Spent: $1,500 / Target: $1,500      [========]100%|
|  [RED CRITICAL: Budget limit reached]                  [Edit Target] |
+-----------------------------------------------------------------------+
```

---

### **Financial Reports Wireframe (`/reports`)**

```
+-----------------------------------------------------------------------+
|  Analytics & Financial Reports                                        |
+-----------------------------------------------------------------------+
|  Filter Range: [ 2026-07-01 ] to [ 2026-07-28 ]   [ Export PDF/CSV v ]|
+-----------------------------------------------------------------------+
|  Monthly Spending Trend Chart (Line Graph)                            |
|  $4k |          /\                                                    |
|  $2k |   /\    /  \    /\                                             |
|   $0 +--/--\--/----\--/--\-------------------------------------------|
|        Jan   Feb   Mar  Apr                                           |
+-----------------------------------------------------------------------+
|  Category Breakdown Summary Table                                     |
|  Category      | Total Spent | Share % | Transaction Count           |
|  --------------+-------------+---------+------------------           |
|  Food & Dining | $820.00     | 24.0%   | 14 transactions             |
|  Housing       | $1,500.00   | 43.8%   | 1 transaction               |
+-----------------------------------------------------------------------+
```

---

## 3. User Profile & Settings Screens

### **User Profile Wireframe (`/profile`)**

```
+-----------------------------------------------------------------------+
|  User Profile                                                         |
+-----------------------------------------------------------------------+
|  +-----------------------------------------------------------------+  |
|  | (Avatar Image)  Alex Rivera                                     |  |
|  |                 Tech Freelancer / Consultant                    |  |
|  +-----------------------------------------------------------------+  |
|  | Full Name:   [ Alex Rivera                             ]       |  |
|  | Email:       [ alex@freelancer.com                     ]       |  |
|  | Member Since: July 2026                                         |  |
|  +-----------------------------------------------------------------+  |
|  | [ Save Profile Changes ]                                        |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

---

### **Account Settings Wireframe (`/settings`)**

```
+-----------------------------------------------------------------------+
|  Account & Application Settings                                       |
+-----------------------------------------------------------------------+
|  Preferences                                                          |
|  - Currency Code:     [ USD ($) v ]                                   |
|  - Date Format:       [ YYYY-MM-DD v ]                                |
|  - Default Theme:     (*) Dark Mode   ( ) Light Mode                  |
+-----------------------------------------------------------------------+
|  Data Management & Export                                             |
|  - Backup Account Data: [ Download JSON Backup ]                      |
|  - Export All Logs:     [ Export CSV ]                                |
+-----------------------------------------------------------------------+
|  Account Security & Danger Zone                                       |
|  - Change Password:   [ Change Password ]                             |
|  - Delete Account:    [ Permanently Delete Account ] (Red Danger)     |
+-----------------------------------------------------------------------+
```
