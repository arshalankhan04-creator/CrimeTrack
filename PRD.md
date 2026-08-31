# CrimeTrack — Product Requirements Document

**Project Name:** CrimeTrack
**Product:** Police Crime & Case Management System
**Architecture:** MERN Stack
**Project Level:** Intermediate
**Document Version:** 1.0
**Status:** Approved for Development

---

# 1. Product Overview

CrimeTrack is a web-based Crime & Case Management System designed to help police administrators and officers manage FIRs, crimes, criminals, investigations, cases, reports, and related records from a centralized application.

The system has three roles:

* **Admin**
* **Officer**
* **Viewer**

The system focuses on **role-based access control, officer-level ownership, case investigation, reporting, and historical activity tracking**.

The application is intended as an intermediate academic/portfolio project and will use fictional/demo data.

---

# 2. Problem Statement

Traditional/manual crime record management can make it difficult to:

* Maintain organized FIR and case records
* Track investigations
* Manage criminal information
* Monitor case status
* Restrict records according to Officer responsibility
* Generate reports and statistics
* Track changes made by users
* Maintain a clear history of case activities

CrimeTrack addresses these problems through a centralized web application with controlled access based on user roles and record ownership.

---

# 3. Product Goals

The system should:

1. Provide secure authentication.
2. Support Admin, Officer, and Viewer roles.
3. Allow Admin to manage Officers and Viewers.
4. Allow Officers to create and manage FIRs.
5. Connect FIRs with Cases.
6. Support crime and criminal management.
7. Support case investigation.
8. Track case status changes.
9. Restrict Officers to their assigned cases/records.
10. Provide read-only access to Viewers.
11. Prevent one Officer from modifying another Officer's records.
12. Provide dashboards and statistics.
13. Provide search and filtering.
14. Maintain audit and login logs.
15. Support controlled undo/redo.
16. Generate PDF and Excel reports.

---

# 4. User Roles

## 4.1 Admin

Admin is the system-level manager.

### Responsibilities

* Manage Officers
* Manage Viewers
* Assign Viewers to Officers
* Assign Cases to Officers
* View/manage all system records
* View global statistics
* Manage feedback
* View audit logs
* View login logs
* Generate reports
* Activate/deactivate users

Admin has global access to system records.

---

# 5. Officer

Officer is the primary operational user.

### Responsibilities

* Create FIRs
* Manage assigned FIRs
* Manage assigned Cases
* Manage crime information
* Manage criminals related to assigned cases
* Add investigation records
* Update case status
* View recent crimes
* View recent actions
* View statistics
* Generate permitted reports
* Undo/redo supported recent actions

### Ownership Rule

An Officer can only modify records that belong to or are assigned to that Officer.

For example:

```text
Officer A
    ↓
Case #101
```

Officer A can modify Case #101.

But:

```text
Officer B
    ↓
Case #202
```

Officer A cannot modify Case #202.

This rule must be enforced by the backend.

---

# 6. Viewer

Viewer is a read-only user.

Each Viewer belongs to one supervising Officer.

Example:

```text
Officer A
├── Viewer A
└── Viewer B

Officer B
└── Viewer C
```

### Viewer can:

* View permitted FIRs
* View permitted Cases
* View crimes
* View criminals
* View investigation information
* View statistics

### Viewer cannot:

* Create records
* Update records
* Delete records
* Change case status
* Assign cases
* Manage users
* Manage Viewers
* View audit logs
* View login logs

A Viewer cannot access another Officer's private case data.

---

# 7. User Hierarchy

The system follows:

```text
                         ADMIN
                           |
             +-------------+-------------+
             |             |             |
         Officer A      Officer B      Officer C
             |             |             |
        +----+----+       |             |
        |         |       Viewer C      |
     Viewer A  Viewer B                Viewer D
```

### Rules

* Admin creates Officers and Viewers.
* Admin assigns Viewers to Officers.
* Each Viewer has one supervising Officer.
* Officers cannot manage another Officer's Viewers.
* Officers cannot assign their own Viewers to other Officers.
* Officers cannot access another Officer's private records.

---

# 8. Authentication

The application requires authentication for Admin, Officer, and Viewer.

### Authentication flow

```text
Login
 ↓
Validate credentials
 ↓
Verify password
 ↓
Generate JWT
 ↓
Authenticated session
 ↓
Access protected resources
```

Passwords must be securely hashed.

Recommended:

* JWT
* bcrypt

There is no public Citizen registration.

Officer and Viewer accounts are created by Admin.

---

# 9. Citizen/FIR Workflow

A Citizen does not directly use the system.

The workflow is:

```text
Citizen visits police station
        ↓
Officer receives complaint/details
        ↓
Officer creates FIR
        ↓
FIR linked to Case
        ↓
Crime information recorded
        ↓
Criminal(s) linked if applicable
        ↓
Investigation
        ↓
Case status updates
        ↓
Case Closed
```

Citizen/complainant information can be stored within the FIR.

Possible information:

* Name
* Phone
* Address
* Identification details
* Statement

---

# 10. FIR Management

Officers can create FIRs based on complaints received from citizens.

An FIR should contain:

* FIR number
* Complainant information
* Incident information
* Crime type
* Incident date/time
* Location
* Area
* Description
* Creating Officer
* Assigned Officer
* Case reference
* Status
* Created/updated timestamps

### FIR ownership

An Officer must not be able to modify another Officer's FIR.

Admin can manage all FIRs.

Viewer can only view permitted FIRs.

---

# 11. Crime Management

The system should maintain crime information associated with cases.

Crime information may include:

* Crime type
* Crime category
* Description
* Location
* Area
* Date
* Case reference
* Assigned Officer

Crime records are used for:

* Case management
* Search
* Statistics
* Reports

---

# 12. Case Management

A Case represents the investigation associated with an FIR.

A Case should contain:

* Case number
* FIR reference
* Title
* Description
* Crime category
* Location
* Area
* Assigned Officer
* Status
* Related Criminals
* Open date
* Close date
* Created/updated timestamps

### Case ownership

Each Case has an assigned Officer.

```text
Case #1001
assignedOfficerId → Officer A
```

Officer A can modify the Case.

Officer B cannot.

Admin can access the Case.

Viewer can only view it if the Viewer belongs to the permitted Officer scope.

---

# 13. Case Status

Initial case lifecycle:

```text
OPEN
   ↓
UNDER_INVESTIGATION
   ↓
SOLVED
   ↓
CLOSED
```

An optional `REOPENED` status may be added later.

Every important status change should be recorded.

Example:

```text
OPEN
→ UNDER_INVESTIGATION

Officer: Officer A
Date: 31 Aug 2026
```

---

# 14. Case Investigation

A Case can contain multiple investigation entries.

Example:

```text
Case #1001

31 Aug
Crime scene visited

01 Sep
Witness statement recorded

03 Sep
CCTV footage collected

05 Sep
Suspect identified
```

Each investigation entry should contain:

* Case ID
* Officer ID
* Investigation notes
* Evidence description/reference
* Timestamp

Only Officers assigned to the Case can modify its investigation records.

Admin has global access.

Viewer has read-only access.

---

# 15. Criminal Management

Criminals are **global entities**.

A criminal can be associated with multiple cases.

Example:

```text
Criminal: Raj Patel

Case #101 → Officer A
Case #202 → Officer B
Case #305 → Officer C
```

The system must NOT create duplicate criminal records for every Officer.

Possible fields:

* Name
* Aliases
* Date of birth
* Address
* Identification information
* Notes
* Status
* Created/updated timestamps

Officers can manage criminal information only within their permitted scope.

Admin has global management access.

Permanent deletion should be restricted; soft deletion is preferred.

---

# 16. Officer Management

Only Admin can manage Officers.

Admin can:

* Create Officer
* View Officer
* Update Officer
* Activate Officer
* Deactivate Officer
* View Officer activity
* Assign Cases

Officers cannot manage other Officers.

---

# 17. Viewer Management

Only Admin can manage Viewers.

Admin can:

* Create Viewer
* Update Viewer
* Activate/deactivate Viewer
* Assign Viewer to Officer
* Reassign Viewer where appropriate
* View Viewer information

Officers cannot manage Viewers.

An Officer cannot modify another Officer's Viewers.

---

# 18. Search & Filters

Search functionality must be permission-aware.

## Case filters

* Case number
* FIR number
* Crime category
* Crime type
* Location
* Area
* Status
* Date range
* Assigned Officer

## FIR filters

* FIR number
* Complainant
* Crime type
* Date
* Status

## Criminal filters

* Name
* Alias
* Identification reference
* Linked Case

### Security requirement

Filtering must happen on the backend together with authorization.

The frontend must never download unauthorized records and then hide them using JavaScript.

---

# 19. Dashboards

Each role gets a different dashboard.

## Admin Dashboard

Global:

* Total Officers
* Total Viewers
* Total FIRs
* Total Cases
* Active Cases
* Closed Cases
* Total Criminals
* Crime statistics
* Criminal statistics
* Case status statistics
* Area-wise crime statistics
* Monthly/yearly statistics

## Officer Dashboard

Officer-specific:

* My FIRs
* My active cases
* My closed cases
* Recent crimes
* Recent actions
* Crime statistics
* Criminal statistics
* Case status statistics
* Reports

## Viewer Dashboard

Read-only statistics for accessible data:

* Crime statistics
* Criminal statistics
* Case statistics

---

# 20. Statistics

Recommended statistics:

### Crime statistics

* Crimes by category
* Crimes by type
* Crimes by area
* Crimes by month
* Crimes by year

### Case statistics

* Open
* Under investigation
* Solved
* Closed

### Criminal statistics

* Total criminals
* Criminals linked to cases
* Most frequently linked criminals, if appropriate for demo analytics

Statistics must respect the current user's access scope.

---

# 21. Reports

The system should provide:

1. Crime Report
2. Criminal Report
3. FIR Report
4. Case Status Report
5. Date-wise Crime Report
6. Area-wise Crime Report
7. Monthly Statistics
8. Yearly Statistics

Export formats:

* PDF
* Excel

Reports should support filters.

Example:

```text
Date:
01/08/2026 → 31/08/2026

Area:
Ahmedabad

Category:
Robbery

Status:
SOLVED
```

Then:

```text
Generate PDF
Export Excel
```

Officer reports must only contain data accessible to that Officer.

---

# 22. Recent Actions

Officer Dashboard should show recent actions.

Examples:

```text
Created FIR #1001
Updated Case #1020
Added Criminal #500
Changed Case #1020 status
Added Investigation Entry
```

Recent Actions are a user-friendly activity feed.

They are different from Audit Logs.

---

# 23. Audit Logs

Audit Logs track important system actions.

Example:

```text
Actor: Officer A
Action: UPDATE_CASE
Entity: Case #1020
Old Status: OPEN
New Status: UNDER_INVESTIGATION
Timestamp: 31 Aug 2026
```

Audit log may contain:

* Actor
* Role
* Action
* Entity type
* Entity ID
* Old values
* New values
* Timestamp

Only Admin can access audit logs.

---

# 24. Login Logs

Login Logs track authentication events.

Examples:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
```

Possible information:

* User
* Event
* Timestamp
* IP address
* User agent

IP and user-agent tracking is optional for the intermediate version.

---

# 25. Feedback Management

Keep feedback simple.

Admin can:

* View feedback
* Mark as reviewed
* Mark as resolved
* Add response

Feedback is not a core investigation module.

---

# 26. Undo / Redo

Undo/redo should be controlled rather than implementing a global database rollback system.

Supported actions can include:

* Create
* Update
* Soft delete

Example:

```text
Officer updates Case #101
       ↓
Action History
       ↓
Undo
       ↓
Previous state restored
```

Before undoing, validate that the record has not changed unexpectedly.

A version field can help prevent unsafe undo operations.

Viewer does not have undo/redo privileges.

---

# 27. Soft Delete

Important records should preferably use soft deletion.

Instead of immediately removing:

```text
isDeleted = true
```

Normal queries exclude deleted records.

Permanent deletion should be restricted, preferably Admin-only.

This also improves history and recovery.

---

# 28. Access Control Matrix

| Feature                     |      Admin |               Officer |           Viewer |
| --------------------------- | ---------: | --------------------: | ---------------: |
| Login                       |          ✅ |                     ✅ |                ✅ |
| Manage Officers             |          ✅ |                     ❌ |                ❌ |
| Manage Viewers              |          ✅ |                     ❌ |                ❌ |
| Assign Viewers              |          ✅ |                     ❌ |                ❌ |
| Assign Cases                |          ✅ |                     ❌ |                ❌ |
| Create FIR                  |          ✅ |                     ✅ |                ❌ |
| Update own FIR              |          ✅ |                     ✅ |                ❌ |
| Update another Officer FIR  |          ✅ |                     ❌ |                ❌ |
| Create Case                 |          ✅ |                     ✅ |                ❌ |
| Update assigned Case        |          ✅ |                     ✅ |                ❌ |
| Update another Officer Case |          ✅ |                     ❌ |                ❌ |
| Investigation               |          ✅ |         Assigned Case |        View only |
| Crime Management            |          ✅ |       Permitted scope |        View only |
| Criminal Management         |          ✅ |       Permitted scope |        View only |
| Change Case Status          |          ✅ |         Assigned Case |                ❌ |
| Reports                     |          ✅ |             Own scope |                ❌ |
| Statistics                  |     Global |             Own scope | Accessible scope |
| Audit Logs                  |          ✅ |                     ❌ |                ❌ |
| Login Logs                  |          ✅ |                     ❌ |                ❌ |
| Feedback Management         |          ✅ |                     ❌ |                ❌ |
| Undo/Redo                   | Controlled | Own supported actions |                ❌ |

---

# 29. Security Requirements

The backend is the actual security boundary.

The system must implement:

* JWT authentication
* Password hashing
* Role-based authorization
* Ownership/assignment authorization
* Request validation
* Protected routes
* Safe error handling
* Environment variables
* No plaintext passwords
* No secrets committed to Git

### Critical rule

Never rely only on React route guards.

Example:

```text
Officer A
    ↓
PUT /api/cases/CASE_B
```

Backend must determine:

```text
CASE_B.assignedOfficerId !== Officer A.id
```

Then:

```text
403 Forbidden
```

---

# 30. Non-Functional Requirements

## Security

Unauthorized users must not access protected records.

## Maintainability

Frontend/backend should use modular folder structures.

## Usability

Dashboards should clearly separate role-specific functions.

## Performance

Search/filter operations should be performed by MongoDB/backend rather than loading large datasets into React.

## Reliability

Important actions should be logged.

## Scalability

The application should be structured so additional modules can be added later without rewriting the entire application.

---

# 31. Recommended MERN Architecture

```text
React Frontend
      ↓
Axios
      ↓
Express REST API
      ↓
JWT Authentication
      ↓
Role Authorization
      ↓
Ownership Authorization
      ↓
Controllers
      ↓
Services
      ↓
Mongoose
      ↓
MongoDB
```

---

# 32. Main Data Entities

Initial entities:

```text
User
FIR
Case
Crime
Criminal
Investigation
CaseHistory
ActionHistory
AuditLog
LoginLog
Feedback
```

Exact MongoDB schemas should be finalized before implementing the core CRUD milestone.

---

# 33. Main Relationships

```text
ADMIN
  |
  +── Officers
  |
  +── Viewers
        |
        +── supervisorOfficerId
```

```text
FIR
  |
  +── Case
        |
        +── Crime
        |
        +── Criminal(s)
        |
        +── Investigation(s)
        |
        +── Case History
```

---

# 34. Development Milestones

## Milestone 1 — Foundation

* MERN project setup
* React setup
* Express setup
* MongoDB connection
* Environment configuration
* Basic folder structure
* API health endpoint
* Base frontend routing/layout

## Milestone 2 — Authentication

* Login
* JWT
* bcrypt
* Auth middleware
* Role middleware
* Active/inactive users
* Admin account

## Milestone 3 — User Management

* Officer management
* Viewer management
* Viewer → Officer assignment
* Case assignment

## Milestone 4 — Core Crime System

* FIR
* Case
* Crime
* Criminal
* Investigation
* Case status

## Milestone 5 — Authorization

* Admin global access
* Officer ownership
* Viewer supervisor scope
* Cross-Officer protection
* Backend 403 handling

## Milestone 6 — Dashboards

* Admin dashboard
* Officer dashboard
* Viewer dashboard
* Statistics
* Recent actions

## Milestone 7 — Search & Analytics

* Search
* Filters
* Charts
* Date-wise statistics
* Area-wise statistics
* Monthly/yearly statistics

## Milestone 8 — History & Logging

* Case history
* Audit logs
* Login logs
* Action history
* Undo/redo

## Milestone 9 — Reports

* Crime report
* Criminal report
* FIR report
* Case status report
* Date-wise report
* Area-wise report
* PDF export
* Excel export

## Milestone 10 — Final Polish

* Validation
* Error handling
* Loading states
* Empty states
* Responsive UI
* Testing
* Security review
* Demo data
* Documentation

---

# 35. Recommended Development Order

Do not build all dashboards first.

Recommended:

```text
Foundation
    ↓
Authentication
    ↓
User hierarchy
    ↓
Database models
    ↓
Core CRUD
    ↓
Authorization
    ↓
Dashboards
    ↓
Search & filters
    ↓
Statistics
    ↓
Logs/history
    ↓
Undo/redo
    ↓
Reports
    ↓
Testing & polish
```

Authorization should be implemented alongside CRUD rather than being postponed until the end.

---

# 36. Out of Scope

The following should NOT be added to the initial intermediate version:

* Citizen login
* Citizen dashboard
* Mobile application
* Live GPS tracking
* Facial recognition
* AI crime prediction
* Biometric authentication
* Real police/government API integration
* SMS gateway
* Email automation
* Payments
* Blockchain
* Microservices
* Kubernetes
* Real-time chat
* Complex evidence storage system

These can be considered future enhancements.

---

# 37. Future Enhancements

Possible future features:

* Citizen portal
* Evidence file uploads
* Advanced evidence tracking
* Police station management
* Multiple departments
* Real-time notifications
* Email/SMS notifications
* Advanced analytics
* Geographic crime maps
* AI-assisted analytics
* Mobile application

These are not part of the current MVP.

---

# 38. Definition of Done

CrimeTrack is complete when:

* Admin can securely log in.
* Admin can create/manage Officers.
* Admin can create/manage Viewers.
* Admin can assign Viewers to Officers.
* Admin can assign Cases to Officers.
* Officer can securely log in.
* Viewer can securely log in.
* Officer can create FIR.
* FIR can be linked to a Case.
* Case can contain crime information.
* Cases can reference Criminals.
* Investigation timeline works.
* Case status can be updated.
* Case history is recorded.
* Officer A cannot modify Officer B's records.
* Officer A cannot modify Officer B's Viewers.
* Viewer is read-only.
* Viewer cannot access another Officer's private records.
* Admin has global access.
* Search and filters respect permissions.
* Statistics respect permissions.
* Audit logs work.
* Login logs work.
* Recent actions work.
* Supported undo/redo works safely.
* Reports can be generated.
* PDF and Excel exports work.
* Important records use safe deletion/history practices.
* Backend authorization cannot be bypassed by manipulating frontend requests.

---

# 39. Final Product Principle

The project should feel like a realistic case-management application, but its complexity must remain appropriate for an intermediate academic project.

The most important architectural principle is:

> **Role determines what a user is generally allowed to do; ownership/assignment determines which records they are allowed to access.**

This principle must be enforced at the backend API level.
