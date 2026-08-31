# CrimeTrack — System Architecture

**Project:** CrimeTrack
**Architecture:** MERN Stack
**Version:** 1.0
**Status:** Approved for Development

---

# 1. Purpose

This document defines the technical architecture of CrimeTrack.

It describes:

* Application layers
* Frontend architecture
* Backend architecture
* Database interaction
* Authentication
* Authorization
* Role-based access control
* Ownership-based access control
* User hierarchy
* API organization
* Security boundaries
* Logging
* Reporting
* Project structure

This document defines **how the system is built**.

The Product Requirements Document defines **what the system must do**.

---

# 2. Technology Stack

## Frontend

| Technology      | Purpose             |
| --------------- | ------------------- |
| React.js        | UI                  |
| Vite            | Frontend build tool |
| React Router    | Routing             |
| Axios           | API communication   |
| Tailwind CSS    | Styling             |
| React Hook Form | Form management     |
| Recharts        | Statistics/charts   |

## Backend

| Technology | Purpose          |
| ---------- | ---------------- |
| Node.js    | Runtime          |
| Express.js | REST API         |
| Mongoose   | MongoDB ODM      |
| JWT        | Authentication   |
| bcrypt     | Password hashing |

## Database

```text
MongoDB
```

## Development Tools

```text
Git
GitHub
VS Code
Postman
```

## Reporting

```text
PDF generation
Excel generation
```

---

# 3. High-Level Architecture

CrimeTrack follows a layered MERN architecture.

```text
┌──────────────────────────────┐
│        React Frontend        │
│                              │
│ Pages / Components / Routes  │
│ Context / Services / Hooks   │
└──────────────┬───────────────┘
               │
             Axios
               │
               ▼
┌──────────────────────────────┐
│       Express REST API       │
├──────────────────────────────┤
│ Authentication Middleware    │
│ Role Authorization           │
│ Ownership Authorization      │
│ Validation                   │
├──────────────────────────────┤
│ Routes                       │
│ Controllers                  │
│ Services                     │
└──────────────┬───────────────┘
               │
            Mongoose
               │
               ▼
┌──────────────────────────────┐
│          MongoDB             │
│                              │
│ Users / FIRs / Cases / etc.  │
└──────────────────────────────┘
```

---

# 4. Core Architectural Principle

The most important security principle is:

> **Role determines what a user can do. Ownership/assignment determines which records they can do it to.**

For example:

```text
Officer A
    |
    +── Case A
```

Officer A can modify Case A.

But:

```text
Officer A
    |
    X── Case B
          |
       Officer B
```

Officer A must not be allowed to modify Case B.

This restriction must be enforced by the backend.

---

# 5. Frontend Architecture

The frontend is responsible for:

* UI
* Navigation
* Forms
* Tables
* Charts
* User interaction
* Client-side validation
* Displaying permitted actions
* Calling backend APIs

The frontend is **not the final security layer**.

---

# 6. Frontend Folder Structure

Recommended structure:

```text
client/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── charts/
│   │   └── modals/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── AuditLogs.jsx
│   │   │   ├── LoginLogs.jsx
│   │   │   ├── Feedback.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── officer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FIRs.jsx
│   │   │   ├── Cases.jsx
│   │   │   ├── Crimes.jsx
│   │   │   ├── Criminals.jsx
│   │   │   ├── Investigations.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   └── viewer/
│   │       ├── Dashboard.jsx
│   │       ├── FIRs.jsx
│   │       ├── Cases.jsx
│   │       ├── Crimes.jsx
│   │       └── Criminals.jsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── caseService.js
│   │   ├── firService.js
│   │   └── ...
│   │
│   ├── constants/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

---

# 7. Frontend Routing

Routes should be protected according to authentication and role.

Example:

```text
/login
```

Public.

```text
/admin/*
```

Admin only.

```text
/officer/*
```

Officer only.

```text
/viewer/*
```

Viewer only.

However, route protection only improves the UI experience.

The backend must independently enforce permissions.

---

# 8. Authentication Architecture

Authentication uses:

```text
JWT + bcrypt
```

Login flow:

```text
User
 ↓
Login Form
 ↓
POST /api/auth/login
 ↓
Validate email/password
 ↓
Find user
 ↓
Compare password using bcrypt
 ↓
Check account status
 ↓
Generate JWT
 ↓
Return authentication response
 ↓
Frontend stores authentication state
```

JWT should contain only necessary identity information.

Example conceptual payload:

```text
userId
role
```

Never store:

```text
password
passwordHash
sensitive data
```

inside JWT.

---

# 9. Authentication Middleware

Every protected API request follows:

```text
Request
 ↓
Extract JWT
 ↓
Verify JWT
 ↓
Identify user
 ↓
Attach user to request
 ↓
Continue
```

Invalid/missing authentication:

```text
401 Unauthorized
```

---

# 10. Role Authorization

After authentication:

```text
JWT Authentication
        ↓
Role Authorization
```

Example:

```text
Admin route
    ↓
requireRole("ADMIN")
```

If Officer tries:

```text
GET /api/audit-logs
```

backend returns:

```text
403 Forbidden
```

---

# 11. Ownership Authorization

Role authorization alone is insufficient.

Consider:

```text
Officer A
Officer B
```

Both have:

```text
role = OFFICER
```

Therefore role middleware alone cannot determine whether Officer A can edit a particular Case.

The backend must perform an ownership check.

Example:

```text
Case.assignedOfficerId
        ==
req.user.id
```

If true:

```text
Allowed
```

Otherwise:

```text
403 Forbidden
```

---

# 12. Authorization Layers

Protected operations should follow:

```text
Request
 ↓
Authentication
 ↓
Role Check
 ↓
Ownership / Assignment Check
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Database
```

Example:

```text
Officer A
    ↓
PUT /api/cases/CASE_B
    ↓
JWT valid
    ↓
Role = OFFICER
    ↓
CASE_B.assignedOfficerId = Officer B
    ↓
Current user = Officer A
    ↓
Mismatch
    ↓
403 Forbidden
```

---

# 13. User Hierarchy Architecture

The system contains three roles:

```text
ADMIN
OFFICER
VIEWER
```

Hierarchy:

```text
                    ADMIN
                      |
          ┌───────────┴───────────┐
          │                       │
      Officer A               Officer B
          │                       │
     ┌────┴────┐                  │
     │         │                  │
 Viewer A   Viewer B           Viewer C
```

A Viewer contains:

```text
supervisorOfficerId
```

which references the Officer's User ID.

---

# 14. Viewer Access Model

Viewer access is derived from the supervising Officer.

Example:

```text
Viewer A
supervisorOfficerId → Officer A
```

Therefore Viewer A can read data permitted to Officer A.

Viewer A cannot:

```text
modify Case
create FIR
delete Criminal
change Case status
manage users
```

Viewer is strictly read-only.

---

# 15. Admin Access

Admin has global system access.

Conceptually:

```text
Admin
 ↓
All Officers
All Viewers
All FIRs
All Cases
All Crimes
All Criminals
All Investigations
All Reports
All Logs
All Feedback
```

Admin access should still be implemented through explicit authorization rather than scattered `if admin` conditions.

---

# 16. Officer Access Model

Officer access is assignment/ownership based.

Example:

```text
Officer A
├── FIR 101
├── FIR 102
├── Case 201
├── Case 202
└── Viewer A
```

Officer A can modify records within the permitted Officer A scope.

Officer A cannot modify:

```text
Officer B's FIR
Officer B's Case
Officer B's Investigation
Officer B's Viewer
```

---

# 17. Data Access Strategy

Backend queries should apply access scope before returning records.

Bad approach:

```text
Fetch all cases
 ↓
Send all cases to React
 ↓
Hide unauthorized cases in UI
```

Correct approach:

```text
Authenticated user
 ↓
Determine access scope
 ↓
MongoDB query with access restriction
 ↓
Return only permitted records
```

Example Officer query:

```text
Case.find({
    assignedOfficerId: req.user.id,
    isDeleted: false
})
```

Conceptually.

---

# 18. Backend Architecture

Backend follows a layered architecture:

```text
Routes
 ↓
Middleware
 ↓
Controllers
 ↓
Services
 ↓
Models
 ↓
MongoDB
```

---

# 19. Backend Folder Structure

```text
server/
│
├── src/
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── environment.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── firController.js
│   │   ├── caseController.js
│   │   ├── crimeController.js
│   │   ├── criminalController.js
│   │   ├── investigationController.js
│   │   ├── reportController.js
│   │   └── ...
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── caseService.js
│   │   ├── firService.js
│   │   ├── reportService.js
│   │   ├── auditService.js
│   │   └── ...
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── FIR.js
│   │   ├── Case.js
│   │   ├── Crime.js
│   │   ├── Criminal.js
│   │   ├── Investigation.js
│   │   ├── CaseHistory.js
│   │   ├── ActionHistory.js
│   │   ├── AuditLog.js
│   │   ├── LoginLog.js
│   │   └── Feedback.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── firRoutes.js
│   │   ├── caseRoutes.js
│   │   ├── crimeRoutes.js
│   │   ├── criminalRoutes.js
│   │   ├── investigationRoutes.js
│   │   ├── reportRoutes.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── ownershipMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── validators/
│   │
│   ├── utils/
│   │
│   ├── constants/
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
└── package.json
```

---

# 20. Route Layer

Routes define:

* HTTP method
* Endpoint
* Middleware
* Controller

Example conceptual flow:

```text
PUT /api/cases/:id
       ↓
authMiddleware
       ↓
roleMiddleware
       ↓
ownershipMiddleware
       ↓
caseController.updateCase
```

Routes should remain thin.

Business logic should not be placed directly inside route definitions.

---

# 21. Controller Layer

Controllers handle HTTP concerns:

* Request data
* Parameters
* Calling services
* Response status
* Response format

Controllers should not contain large amounts of business logic.

---

# 22. Service Layer

Services contain business logic.

Examples:

```text
createFIR()
updateCase()
changeCaseStatus()
assignCase()
createInvestigation()
generateCrimeReport()
undoAction()
redoAction()
```

Services communicate with Mongoose models.

This keeps controllers clean and easier to test.

---

# 23. Model Layer

Mongoose models represent MongoDB collections.

Core models:

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

Exact schema fields are defined separately in `DATABASE_DESIGN.md`.

---

# 24. Core Business Workflow

The central workflow is:

```text
Complaint received
       ↓
Officer creates FIR
       ↓
FIR linked to Case
       ↓
Crime recorded
       ↓
Criminal linked if applicable
       ↓
Case assigned to Officer
       ↓
Investigation entries
       ↓
Case status updates
       ↓
Case solved
       ↓
Case closed
```

---

# 25. FIR → Case Relationship

A FIR may be linked to a Case.

Conceptually:

```text
FIR
 |
 └── caseId
       ↓
      Case
```

The Case can then contain:

```text
Crime
Criminals
Investigations
Status history
```

---

# 26. Case → Officer Relationship

Every operational Case should have an assigned Officer.

```text
Case
 |
 └── assignedOfficerId
              ↓
           User
          Officer
```

This relationship is the foundation of Officer-level authorization.

---

# 27. Case → Criminal Relationship

A Case can reference one or more Criminals.

```text
Case
 |
 ├── Criminal A
 ├── Criminal B
 └── Criminal C
```

Criminal records themselves remain globally reusable.

---

# 28. Case → Investigation Relationship

A Case can have multiple investigation entries.

```text
Case
 |
 ├── Investigation 1
 ├── Investigation 2
 ├── Investigation 3
 └── Investigation 4
```

Investigation access is determined through the Case's ownership.

---

# 29. Case Status Architecture

Supported initial statuses:

```text
OPEN
UNDER_INVESTIGATION
SOLVED
CLOSED
```

Status changes should be processed through a dedicated service.

Example:

```text
CaseService.changeStatus()
       ↓
Validate transition
       ↓
Update Case
       ↓
Create CaseHistory
       ↓
Create AuditLog
```

---

# 30. Soft Delete Architecture

Important records should use soft deletion.

Example:

```text
isDeleted: true
```

Normal queries:

```text
isDeleted: false
```

This helps preserve history and enables controlled recovery.

Permanent deletion should be restricted.

---

# 31. Audit Architecture

Important operations generate audit records.

Example:

```text
Officer A
   ↓
UPDATE_CASE
   ↓
Case #1020
   ↓
AuditLog
```

Audit service should be centralized.

Possible actions:

```text
CREATE_USER
UPDATE_USER
DEACTIVATE_USER

CREATE_FIR
UPDATE_FIR

CREATE_CASE
UPDATE_CASE
CHANGE_CASE_STATUS
ASSIGN_CASE

CREATE_CRIMINAL
UPDATE_CRIMINAL

CREATE_INVESTIGATION
UPDATE_INVESTIGATION

UNDO_ACTION
REDO_ACTION
```

---

# 32. Login Log Architecture

Authentication events should create LoginLog records.

Examples:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
```

Login logging should not interfere with the primary login operation if the logging mechanism itself encounters a recoverable failure.

---

# 33. Undo/Redo Architecture

Undo/redo uses ActionHistory with clear operational boundaries:

### 33.1 Bounded Scope
Undo/redo is intentionally bounded to **single-document updates** (e.g. Case status changes, FIR/Case detail edits, Investigation note edits). It does not perform cascading multi-table rollbacks or deletions.

### 33.2 Ownership & Integrity Validation
Before applying an undo or redo:
1. **Current Ownership**: Backend validates that the requesting user *currently* has assignment ownership of the target entity (or is Admin). A former assignee cannot revert changes on a reassigned Case.
2. **State Compatibility**: Verifies that the record has not been modified unexpectedly by checking state integrity against `afterState`/version.

Conceptual flow:

```text
User Action
    ↓
Store before/after state
    ↓
Perform operation
    ↓
ActionHistory
```

Undo:

```text
ActionHistory
    ↓
Validate current entity ownership
    ↓
Validate current state/version
    ↓
Restore previous state
    ↓
Mark action UNDONE
    ↓
Audit Log (UNDO_ACTION)
```

Redo:

```text
ActionHistory
    ↓
Validate current entity ownership
    ↓
Validate current state/version
    ↓
Reapply action
    ↓
Mark action REDONE
    ↓
Audit Log (REDO_ACTION)
```

Undo/redo is not a global MongoDB rollback mechanism.

---

# 34. Reporting Architecture

Reports follow:

```text
User
 ↓
Select filters
 ↓
Backend validates filters
 ↓
Authorization scope applied
 ↓
Database query
 ↓
Report service
 ↓
PDF / Excel generator
 ↓
Response
```

An Officer must never be able to generate a report containing another Officer's private records.

---

# 35. Statistics Architecture

Statistics should also be authorization-aware.

Example:

```text
Admin
 ↓
Global aggregation
```

```text
Officer
 ↓
Aggregation restricted to assignedOfficerId
```

```text
Viewer
 ↓
Aggregation restricted to supervisor scope
```

Possible statistics:

```text
Crimes by category
Cases by status
Crimes by area
Crimes by month
Crimes by year
Criminal statistics
```

---

# 36. Search Architecture

Search should happen server-side.

Example:

```text
GET /api/cases?status=OPEN&area=Ahmedabad
```

Backend:

```text
Authentication
 ↓
Determine scope
 ↓
Apply filters
 ↓
MongoDB query
 ↓
Return permitted results
```

Never retrieve the entire database into React for filtering.

---

# 37. API Architecture

Base URL:

```text
/api
```

Major modules:

```text
/api/auth
/api/users
/api/firs
/api/cases
/api/crimes
/api/criminals
/api/investigations
/api/statistics
/api/reports
/api/audit-logs
/api/login-logs
/api/actions
/api/feedback
```

API details are maintained separately in `API_DESIGN.md`.

---

# 38. API Response Architecture

Standard success response:

```json
{
  "success": true,
  "data": {}
}
```

Standard error response:

```json
{
  "success": false,
  "message": "Not authorized."
}
```

HTTP status codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 39. Error Handling

Backend should have centralized error handling.

```text
Request
 ↓
Route
 ↓
Controller/Service
 ↓
Error
 ↓
Central Error Middleware
 ↓
Standard Response
```

Do not expose:

* stack traces
* database internals
* passwords
* secrets
* sensitive implementation details

to normal production clients.

---

# 40. Validation Architecture

Validation should happen at the API boundary.

Validate:

* Required fields
* Email
* Phone where required
* Status values
* IDs
* Dates
* Enum values
* Business constraints

Frontend validation improves UX.

Backend validation is mandatory.

---

# 41. Security Architecture

Security layers:

```text
HTTPS
 ↓
JWT Authentication
 ↓
Role Authorization
 ↓
Ownership Authorization
 ↓
Validation
 ↓
Database
```

Additional practices:

* bcrypt password hashing
* environment variables
* `.env` excluded from Git
* no plaintext passwords
* no password hash in API responses
* authorization on every protected operation
* safe error handling
* soft delete where appropriate

---

# 42. Database Security Principle

The database should never be treated as a substitute for application authorization.

Authorization happens before sensitive data is returned or modified.

Example:

```text
Officer A
 ↓
Request Case B
 ↓
Backend authorization
 ↓
DENIED
```

not:

```text
Officer A
 ↓
Fetch Case B
 ↓
React hides Case B
```

---

# 43. Environment Configuration

Server environment variables should contain values such as:

```text
PORT
MONGODB_URI
JWT_SECRET
CLIENT_URL
NODE_ENV
```

Use:

```text
.env
.env.example
```

`.env` must not be committed.

---

# 44. Frontend ↔ Backend Communication

```text
React Component
      ↓
Service Function
      ↓
Axios
      ↓
Express API
      ↓
Controller
      ↓
Service
      ↓
MongoDB
```

Components should avoid directly constructing large API requests repeatedly.

Centralize API configuration.

---

# 45. State Management

Do not introduce Redux initially.

Use:

```text
React Context
```

for small global state such as:

```text
authenticated user
role
authentication status
```

Local component state should handle local UI state.

Introduce a larger state-management solution only if actual complexity requires it.

---

# 46. Logging Separation

The system intentionally separates:

### Login Logs

Authentication events.

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
```

### Audit Logs

Security/administrative record of important system changes.

### Recent Actions

User-friendly activity feed.

### Action History

Technical history required for undo/redo.

These should not be treated as the same collection or feature.

---

# 47. Authorization Examples

## Example 1

```text
Admin → Officer A Case
```

Result:

```text
ALLOW
```

## Example 2

```text
Officer A → Officer A Case
```

Result:

```text
ALLOW
```

## Example 3

```text
Officer A → Officer B Case
```

Result:

```text
DENY
```

## Example 4

```text
Viewer A → Officer A Case
```

Result:

```text
ALLOW READ
```

## Example 5

```text
Viewer A → Officer A Case UPDATE
```

Result:

```text
DENY
```

## Example 6

```text
Viewer A → Officer B Case
```

Result:

```text
DENY
```

## Example 7

```text
Officer A → Officer B Viewer
```

Result:

```text
DENY
```

---

# 48. Project-Level Data Flow

```text
                    ┌─────────────┐
                    │    Admin    │
                    └──────┬──────┘
                           │
                  manages / assigns
                           │
          ┌────────────────┴────────────────┐
          │                                 │
     Officer A                         Officer B
          │                                 │
      Viewer A                          Viewer B
          │
          │
       FIRs
          │
        Cases
          │
       Crimes
          │
     Criminals
          │
   Investigations
          │
   Status History
          │
       Reports
```

---

# 49. Deployment Architecture

Initial project does not require microservices.

Recommended conceptual deployment:

```text
Browser
   ↓
React Frontend
   ↓
Express Backend
   ↓
MongoDB
```

All components can be deployed independently later if required.

Do not introduce:

```text
Microservices
Kubernetes
Message brokers
```

for the intermediate version.

---

# 50. Scalability Approach

The architecture should remain modular.

Future modules can be added:

```text
Evidence Management
Notifications
Police Stations
Departments
Citizen Portal
Advanced Analytics
```

without rewriting the entire application.

---

# 51. Testing Strategy

Testing should cover at least:

## Authentication

```text
Valid login
Invalid password
Inactive account
Missing token
Invalid token
```

## Authorization

```text
Admin access
Officer access
Viewer access
Cross-Officer access
```

## Ownership

```text
Officer A → own case
Officer A → Officer B case
Officer A → Officer B FIR
Officer A → Officer B Viewer
```

## Viewer

```text
Read permitted data
Attempt modification
Attempt unauthorized data access
```

## CRUD

```text
Create
Read
Update
Soft delete
```

## Case workflow

```text
FIR → Case → Investigation → Status → Closed
```

---

# 52. Development Rules

The following rules should be followed during implementation:

1. Do not bypass backend authorization.
2. Do not put business logic directly into React components.
3. Do not put large business logic inside Express routes.
4. Keep controllers thin.
5. Keep business logic inside services.
6. Use Mongoose models for database interaction.
7. Validate API input.
8. Keep secrets in environment variables.
9. Do not duplicate global Criminal records unnecessarily.
10. Do not implement Citizen login in the initial version.
11. Do not add unnecessary technologies.
12. Do not build dashboards before the underlying data/API works.
13. Implement authorization alongside CRUD.
14. Keep Officer ownership rules explicit.
15. Keep Viewer access read-only.

---

# 53. Source-of-Truth Hierarchy

When making development decisions, use this order:

```text
PRD.md
   ↓
ARCHITECTURE.md
   ↓
DATABASE_DESIGN.md
   ↓
API_DESIGN.md
   ↓
Milestone/Feature Specs
   ↓
Implementation
```

If an implementation conflicts with the architecture or PRD, update the documentation first rather than silently changing the design.

---

# 54. Initial Implementation Strategy

Do not build the complete system at once.

Recommended sequence:

```text
Phase 1
Project Foundation
        ↓
Phase 2
Authentication
        ↓
Phase 3
Admin + User Management
        ↓
Phase 4
FIR + Case + Crime
        ↓
Phase 5
Criminal + Investigation
        ↓
Phase 6
Authorization Hardening
        ↓
Phase 7
Dashboards + Statistics
        ↓
Phase 8
Search + Filters
        ↓
Phase 9
Logs + History + Undo/Redo
        ↓
Phase 10
Reports + PDF/Excel
        ↓
Phase 11
Testing + Polish
```

---

# 55. Architecture Decision Summary

The following decisions are considered locked for the current version:

```text
Stack:
MERN

Roles:
Admin
Officer
Viewer

Authentication:
JWT + bcrypt

Authorization:
RBAC + Ownership/Assignment

Database:
MongoDB + Mongoose

Frontend:
React + Vite

Routing:
React Router

HTTP:
Axios

Styling:
Tailwind CSS

Charts:
Recharts

State:
React Context initially

Architecture:
Layered Express backend

Citizen:
No login/account

FIR:
Created by Officer

Case:
Linked to FIR

Case assignment:
Admin controlled

Viewer:
Belongs to Officer

Officer:
Can modify assigned/permitted records only

Viewer:
Read-only

Admin:
Global access

Deletion:
Soft delete preferred

Logs:
Audit + Login + Recent Actions + Action History

Reports:
PDF + Excel

Project level:
Intermediate
```

---

# 56. Final Architecture Principle

CrimeTrack should remain a **modular monolithic MERN application**.

The system should prioritize:

```text
Correct authorization
        +
Clear ownership
        +
Clean data relationships
        +
Maintainable code
        +
Useful reporting
```

over unnecessary technical complexity.

The application is not intended to simulate a national police infrastructure. It is an intermediate case-management system demonstrating full-stack development, authentication, authorization, database design, CRUD operations, analytics, reporting, and secure ownership-based access control.
