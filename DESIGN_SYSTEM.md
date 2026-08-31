# CrimeTrack — Design System

**Project:** CrimeTrack
**UI Type:** Modern Administrative / Police Management Dashboard
**Frontend:** React
**Design Direction:** Professional, clean, trustworthy, modern
**Status:** Approved

---

# 1. Design Philosophy

CrimeTrack should look like a **professional police/government management system**, not like a gaming, hacker, or horror-themed website.

The UI should communicate:

* Trust
* Security
* Authority
* Clarity
* Efficiency
* Professionalism

Avoid excessive use of:

* Red
* Neon colours
* Gradients
* Glowing effects
* Excessive animations
* Dark backgrounds everywhere

The interface should prioritize usability over decoration.

---

# 2. Primary Colour Palette

| Purpose        | Name        | HEX       |
| -------------- | ----------- | --------- |
| Primary        | Deep Navy   | `#0F172A` |
| Secondary      | Slate       | `#1E293B` |
| Primary Accent | Blue        | `#2563EB` |
| Light Accent   | Light Blue  | `#EFF6FF` |
| Background     | Slate White | `#F8FAFC` |
| Surface/Card   | White       | `#FFFFFF` |
| Main Text      | Dark Slate  | `#0F172A` |
| Secondary Text | Slate Gray  | `#64748B` |
| Border         | Light Slate | `#E2E8F0` |

---

# 3. Semantic Colours

These colours communicate system states and should remain consistent throughout the application.

| Meaning                | Colour      | HEX       |
| ---------------------- | ----------- | --------- |
| Success                | Green       | `#16A34A` |
| Success Background     | Light Green | `#F0FDF4` |
| Warning                | Amber       | `#D97706` |
| Warning Background     | Light Amber | `#FFFBEB` |
| Danger                 | Red         | `#DC2626` |
| Danger Background      | Light Red   | `#FEF2F2` |
| Information            | Blue        | `#2563EB` |
| Information Background | Light Blue  | `#EFF6FF` |
| Neutral                | Gray        | `#64748B` |
| Neutral Background     | Light Gray  | `#F1F5F9` |

---

# 4. Where to Use Each Colour

## Deep Navy — `#0F172A`

Primary structural colour.

Recommended for:

* Sidebar
* Main navbar
* Logo area
* Application branding
* Important headings
* Dark navigation elements

Example:

```text
Sidebar
Navbar
CrimeTrack logo
```

Do NOT use it for every button.

---

# 5. Slate — `#1E293B`

Use as a secondary dark colour.

Recommended for:

* Sidebar hover states
* Secondary navigation
* Dark cards
* Secondary headers
* Selected navigation states where appropriate

---

# 6. Blue — `#2563EB`

This is the **main interactive accent colour**.

Recommended for:

* Primary buttons
* Links
* Active navigation
* Selected tabs
* Important actions
* Pagination
* Focus states
* Information indicators

Example:

```text
+ Create FIR
+ Add Criminal
+ Create Case
View Details
Edit
```

Blue should be the most commonly visible accent colour in the application.

---

# 7. Light Blue — `#EFF6FF`

Use as a supporting background for blue elements.

Recommended for:

* Selected table rows
* Information cards
* Active filters
* Blue badges
* Dashboard highlights
* Hover backgrounds

Avoid using it for large full-page backgrounds.

---

# 8. Red — `#DC2626`

Red represents **danger or destructive actions**.

Recommended for:

* Delete
* Deactivate
* Failed login
* Critical errors
* Security warnings
* Dangerous actions
* Serious alerts

Examples:

```text
Delete FIR
Delete Case
Deactivate Officer
Failed Login
Unauthorized Access
```

### Important

**Do not use red as the main application colour.**

CrimeTrack is a crime-management application, but the interface should still look professional rather than aggressive.

---

# 9. Green — `#16A34A`

Use for successful states.

Recommended for:

* Solved Case
* Successful operation
* Active status
* Successful login
* Completed investigation
* Success notifications

Example:

```text
✓ Case Solved
✓ FIR Created Successfully
✓ Changes Saved
```

---

# 10. Amber — `#D97706`

Use for warnings and attention-required states.

Recommended for:

* Under Investigation
* Pending actions
* Warning messages
* Incomplete information
* Important notifications

Example:

```text
⚠ Investigation Pending
⚠ Action Required
```

---

# 11. Gray — `#64748B`

Use for neutral information.

Recommended for:

* Closed cases
* Disabled controls
* Secondary information
* Metadata
* Timestamps
* Less important text
* Neutral badges

---

# 12. Case Status Colours

Case status should always use consistent semantic colours.

| Status              | Colour | HEX       |
| ------------------- | ------ | --------- |
| OPEN                | Blue   | `#2563EB` |
| UNDER_INVESTIGATION | Amber  | `#D97706` |
| SOLVED              | Green  | `#16A34A` |
| CLOSED              | Gray   | `#64748B` |

Example:

```text
OPEN
[ Blue Badge ]

UNDER INVESTIGATION
[ Amber Badge ]

SOLVED
[ Green Badge ]

CLOSED
[ Gray Badge ]
```

---

# 13. User Role Colours

Role colours should provide subtle visual differentiation.

## Admin

```text
Colour: Blue
HEX: #2563EB
```

Use for:

* Admin badge
* Admin-specific indicators
* Admin dashboard accent

---

## Officer

```text
Colour: Indigo
HEX: #4F46E5
```

Use for:

* Officer badge
* Officer-specific indicators
* Assigned case indicators

---

## Viewer

```text
Colour: Teal
HEX: #0D9488
```

Use for:

* Viewer badge
* Read-only indicators
* Viewer-specific indicators

### Important

Do not change the entire application theme based on role.

The application should maintain one consistent visual identity.

Only badges, small indicators, or subtle accents should differ.

---

# 14. Backgrounds

## Main Application Background

```text
#F8FAFC
```

Use this as the primary dashboard background.

---

## Cards

```text
#FFFFFF
```

Cards should generally use white backgrounds with a subtle border.

Example:

```text
┌──────────────────────────┐
│ Total Cases              │
│                          │
│ 124                      │
│ ↑ 12% this month         │
└──────────────────────────┘
```

---

# 15. Borders

Primary border:

```text
#E2E8F0
```

Use for:

* Cards
* Tables
* Input fields
* Dividers
* Dropdowns
* Modals

Avoid heavy borders.

---

# 16. Typography

Recommended font:

```text
Inter
```

Fallback:

```text
system-ui
-apple-system
BlinkMacSystemFont
"Segoe UI"
sans-serif
```

---

# 17. Typography Hierarchy

## Page Title

Large and bold.

Example:

```text
Dashboard
Case Management
FIR Management
```

---

## Section Heading

Medium/bold.

Example:

```text
Recent Cases
Crime Statistics
Recent Actions
```

---

## Body Text

Regular weight.

Use for:

* Descriptions
* Table content
* Form labels
* General information

---

## Secondary Text

Use:

```text
#64748B
```

For:

* Dates
* IDs
* Metadata
* Descriptions
* Supporting information

---

# 18. Buttons

## Primary Button

Use:

```text
Background: #2563EB
Text: White
```

Recommended for:

* Create
* Save
* Submit
* Assign
* Generate Report

---

## Secondary Button

Use:

```text
Background: White
Border: #E2E8F0
Text: #0F172A
```

Recommended for:

* Cancel
* Back
* Reset
* Secondary actions

---

## Danger Button

Use:

```text
Background: #DC2626
Text: White
```

Only for destructive operations.

Example:

```text
Delete
Deactivate
Remove
```

---

## Success Button

Use sparingly.

```text
Background: #16A34A
Text: White
```

Suitable for:

```text
Mark as Solved
Approve
Complete
```

---

# 19. Forms

Forms should be clean and easy to scan.

Use:

```text
White input background
Light border
Blue focus state
Dark text
Gray placeholder
```

Focus:

```text
Border → #2563EB
```

Validation error:

```text
Border → #DC2626
Error text → #DC2626
```

Success:

```text
Border → #16A34A
```

---

# 20. Tables

Tables will be heavily used in CrimeTrack.

Recommended structure:

```text
┌──────────────────────────────────────────────────┐
│ FIR No. │ Crime │ Officer │ Status │ Date │ ... │
├──────────────────────────────────────────────────┤
│ FIR001  │ Theft │ Officer A │ OPEN │ ...       │
│ FIR002  │ Fraud │ Officer B │ SOLVED │ ...     │
└──────────────────────────────────────────────────┘
```

### Table recommendations

Header:

```text
Background: #F8FAFC
Text: #64748B
```

Rows:

```text
Background: #FFFFFF
```

Borders:

```text
#E2E8F0
```

Hover:

```text
#F8FAFC
```

Avoid colouring entire rows based on status.

Use status badges instead.

---

# 21. Status Badges

Badges should use a light background and darker text.

Example:

```text
OPEN
Blue text
Light blue background
```

```text
SOLVED
Green text
Light green background
```

```text
CLOSED
Gray text
Light gray background
```

Avoid large coloured blocks.

---

# 22. Sidebar

Recommended:

```text
Background: #0F172A
Text: #CBD5E1
Active item: #2563EB
Hover: #1E293B
```

Structure:

```text
CrimeTrack
──────────────
Dashboard

FIR Management
Case Management
Crime Management
Criminals
Investigation

Reports
Statistics

Settings
Logout
```

Admin may additionally see:

```text
User Management
Feedback
Audit Logs
Login Logs
```

---

# 23. Navbar

Recommended:

```text
Background: #FFFFFF
Border: #E2E8F0
Text: #0F172A
```

Include:

```text
Page title
Notifications
User name
Role badge
Profile menu
```

Keep the navbar clean.

---

# 24. Dashboard Cards

Dashboard cards should primarily use:

```text
White background
Subtle border
Dark text
Small blue/role-specific accent
```

Example:

```text
┌────────────────────┐
│ Total FIRs      📄 │
│                    │
│ 1,248              │
│ +8.4% this month   │
└────────────────────┘
```

Do not create a different bright colour for every card.

Use small icons/accent indicators instead.

---

# 25. Charts

Charts should use the same design language as the application.

Recommended chart colour hierarchy:

```text
Primary data → Blue
Success data → Green
Warning data → Amber
Danger data → Red
Neutral data → Gray
```

Avoid rainbow charts unless the data genuinely requires multiple categories.

Charts should prioritize readability.

---

# 26. Notifications / Toasts

## Success

```text
Green
```

Example:

```text
✓ FIR created successfully.
```

## Error

```text
Red
```

Example:

```text
✕ Unable to update case.
```

## Warning

```text
Amber
```

Example:

```text
⚠ This case requires attention.
```

## Information

```text
Blue
```

Example:

```text
Case assigned to Officer A.
```

---

# 27. Modals

Use modals for:

* Delete confirmation
* Deactivation confirmation
* Assignment confirmation
* Important warnings
* Viewing compact details

Modal:

```text
White background
Rounded corners
Subtle shadow
Dark heading
Gray supporting text
```

Destructive modal:

```text
Red action button
```

---

# 28. Icons

Use a consistent icon library.

Recommended:

```text
Lucide React
```

Icons should be:

* Simple
* Consistent
* Easy to recognize
* Used as supporting visual elements

Do not use icons excessively.

---

# 29. Navigation Icons

Suggested icons:

```text
Dashboard        → LayoutDashboard
FIR              → FileText
Cases            → Folder
Crimes           → ShieldAlert
Criminals        → UserRound
Investigation    → Search
Reports          → FileBarChart
Statistics       → BarChart3
Users            → Users
Audit Logs       → ClipboardList
Login Logs       → LogIn
Feedback         → MessageSquare
Settings         → Settings
Logout           → LogOut
```

Exact icons may be adjusted if a better Lucide equivalent exists.

---

# 30. Spacing

Use a consistent spacing system.

Preferred base:

```text
4px
```

Examples:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
```

Avoid random spacing values throughout the application.

---

# 31. Border Radius

Recommended:

```text
Inputs: 8px
Buttons: 8px
Cards: 12px
Modals: 12px
Badges: 9999px
```

The UI should feel modern but not overly rounded.

---

# 32. Shadows

Use subtle shadows only.

Recommended:

```text
Cards → very subtle
Dropdowns → subtle
Modals → moderate
```

Avoid heavy glowing shadows.

---

# 33. Animations

Animations should be subtle.

Recommended:

```text
Button hover
Sidebar transitions
Dropdown opening
Modal appearance
Toast appearance
Page transitions
```

Avoid:

```text
Excessive bouncing
Large zoom animations
Constant motion
Glowing effects
```

The application is an administrative system, so usability comes first.

---

# 34. Responsive Design

The application should support:

```text
Desktop
Laptop
Tablet
Mobile
```

Desktop is the primary target because the system is intended for administrative/police use.

Tables should become:

```text
Responsive table
Horizontal scrolling
or
Card/list layout
```

on smaller screens.

---

# 35. Role-Based UI

Frontend navigation should be role-aware.

### Admin

Show:

```text
Dashboard
Users
FIRs
Cases
Crimes
Criminals
Investigation
Statistics
Reports
Feedback
Audit Logs
Login Logs
```

### Officer

Show:

```text
Dashboard
FIRs
Cases
Crimes
Criminals
Investigation
Statistics
Reports
Recent Actions
```

### Viewer

Show:

```text
Dashboard
FIRs
Cases
Crimes
Criminals
Statistics
```

### Important

Frontend role-based navigation is only for UX.

**Backend authorization remains the actual security boundary.**

---

# 36. Read-Only Viewer UI

Viewer should visually understand that the system is read-only.

Recommended:

* Hide Create buttons
* Hide Edit buttons
* Hide Delete buttons
* Hide assignment controls
* Show a subtle `Read Only` indicator

Example:

```text
VIEWER
Read Only
```

However, the backend must still reject mutation requests even if a malicious user manually calls the API.

---

# 37. Empty States

Every major list should have a useful empty state.

Example:

```text
No cases found.

There are no cases matching the selected filters.
```

For an Officer:

```text
No assigned cases.

Cases assigned to you will appear here.
```

Avoid simply displaying:

```text
No data
```

---

# 38. Loading States

Use:

* Skeleton loaders
* Button loading states
* Table loading indicators

Example:

```text
Saving...
Generating report...
Loading cases...
```

Do not freeze the interface without feedback.

---

# 39. Error States

Errors should be understandable.

Bad:

```text
Error 500
```

Better:

```text
Unable to load cases.

Please try again.
```

Technical details should remain in developer logs, not user-facing UI.

---

# 40. Confirmation Rules

Confirmation should be required for destructive actions.

Examples:

```text
Delete FIR
Delete Case
Delete Crime
Deactivate Officer
Deactivate Viewer
Remove Criminal from Case
```

Example:

```text
Are you sure?

This action will remove the selected record from active use.

[Cancel] [Delete]
```

---

# 41. Search UI

Search should be visually simple.

Example:

```text
🔍 Search cases...
```

Filters can appear beside or below the search box.

Recommended filters:

```text
Status
Crime Type
Area
Date Range
Officer
```

Use a clear:

```text
Reset Filters
```

button.

---

# 42. Date & Time Display

Use a consistent format throughout the application.

Recommended user-facing format:

```text
31 Aug 2026
```

For timestamps:

```text
31 Aug 2026, 06:30 PM
```

Store dates in a consistent backend format and format them only at the UI layer.

---

# 43. Data Density

CrimeTrack contains many tables and records.

Therefore:

* Keep tables compact.
* Avoid excessive whitespace.
* Maintain readable row height.
* Use pagination.
* Use filters.
* Use expandable/detail views where necessary.

The UI should feel information-rich but not cluttered.

---

# 44. Accessibility

The application should maintain reasonable accessibility.

Requirements:

* Sufficient colour contrast
* Visible focus states
* Keyboard-friendly controls
* Buttons should have meaningful labels
* Icons should not be the only way to understand an action
* Forms should have proper labels
* Error messages should be readable

Do not rely solely on colour to communicate status.

For example:

```text
🟢 SOLVED
```

is preferable to showing only a green dot.

---

# 45. Colour Usage Rules

### Use Blue for:

```text
Primary actions
Links
Navigation
Information
Active states
```

### Use Green for:

```text
Success
Solved
Completed
Active/successful operations
```

### Use Amber for:

```text
Warnings
Pending
Under Investigation
Attention required
```

### Use Red for:

```text
Delete
Danger
Errors
Failed actions
Security warnings
```

### Use Gray for:

```text
Neutral
Closed
Disabled
Secondary information
Metadata
```

---

# 46. Things to Avoid

Do NOT use:

```text
❌ Full red dashboard
❌ Neon green
❌ Hacker-style terminal UI
❌ Excessive black backgrounds
❌ Rainbow colour palette
❌ Excessive gradients
❌ Excessive glassmorphism
❌ Huge glowing buttons
❌ Excessive animations
❌ Different colour theme on every page
```

CrimeTrack should look like a serious administrative application.

---

# 47. Recommended Overall Visual Structure

```text
┌─────────────────────────────────────────────────────┐
│ CrimeTrack                         Notifications 👤 │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│  Dashboard    │  Dashboard                          │
│               │                                     │
│  FIRs         │  ┌────────┐ ┌────────┐ ┌────────┐ │
│  Cases        │  │ FIRs   │ │ Cases  │ │ Crimes │ │
│  Crimes       │  │ 1248   │ │  342   │ │  829   │ │
│  Criminals    │  └────────┘ └────────┘ └────────┘ │
│               │                                     │
│  Investigation│  ┌───────────────────────────────┐ │
│               │  │ Crime Statistics              │ │
│  Reports      │  │                               │ │
│  Statistics   │  │          Chart                │ │
│               │  │                               │ │
│  Settings     │  └───────────────────────────────┘ │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

---

# 48. Design Priority

When making UI decisions, follow this priority:

```text
1. Usability
2. Accessibility
3. Consistency
4. Readability
5. Security clarity
6. Visual aesthetics
```

Do not sacrifice usability merely to make the interface look impressive.

---

# 49. Source of Truth

This document is the visual source of truth for CrimeTrack.

Before creating or modifying UI components, check:

```text
PRD.md
ARCHITECTURE.md
DESIGN_SYSTEM.md
```

Do not introduce a new colour, typography system, spacing system, or component style without a valid reason.

If a new design requirement conflicts with this document, flag it before implementation.

---

# 50. Final Design Direction

CrimeTrack should feel like:

```text
Professional
        +
Modern
        +
Secure
        +
Clean
        +
Data-focused
```

The final visual identity should be:

```text
Deep Navy
     +
Professional Blue
     +
White / Slate Background
     +
Semantic Green / Amber / Red
     +
Clean Typography
```

This palette should remain consistent across:

```text
Admin Dashboard
Officer Dashboard
Viewer Dashboard
FIR Management
Case Management
Crime Management
Criminal Management
Investigation
Reports
Statistics
User Management
Audit Logs
Login Logs
Feedback
```

**Consistency is more important than adding more colours.**
