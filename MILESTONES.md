# CrimeTrack — Development Milestones

**Project:** CrimeTrack
**Stack:** MERN
**Development Approach:** Incremental / Milestone-based
**Target Level:** Intermediate
**Status:** Approved

---

# 1. Development Strategy

CrimeTrack will be developed incrementally.

Each milestone should:

* Have a clear objective.
* Produce a working part of the application.
* Be tested before moving forward.
* Avoid implementing future features prematurely.
* Follow `PRD.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md`, and `API_DESIGN.md`.

Development flow:

```text
Foundation
    ↓
Authentication
    ↓
User & Role Management
    ↓
FIR Management
    ↓
Case Management
    ↓
Crime & Criminal Management
    ↓
Investigation
    ↓
Dashboard & Statistics
    ↓
Search & Filters
    ↓
Reports & Export
    ↓
Audit / Login Logs
    ↓
Undo / Redo
    ↓
Testing & Security
    ↓
Deployment
```

---

# 2. Milestone Overview

| Milestone | Name                           | Priority |
| --------- | ------------------------------ | -------- |
| M1        | Project Foundation             | Critical |
| M2        | Authentication & Authorization | Critical |
| M3        | User & Role Management         | Critical |
| M4        | FIR Management                 | Critical |
| M5        | Case Management                | Critical |
| M6        | Crime & Criminal Management    | Critical |
| M7        | Investigation Management       | High     |
| M8        | Dashboard & Statistics         | High     |
| M9        | Search & Filters               | High     |
| M10       | Reports & Export               | High     |
| M11       | Audit & Login Logs             | Medium   |
| M12       | Undo / Redo                    | Medium   |
| M13       | Feedback Management            | Medium   |
| M14       | Testing & Security Hardening   | Critical |
| M15       | Final UI Polish & Deployment   | Final    |

---

# 3. Milestone 1 — Project Foundation

## Objective

Create the basic MERN project structure and establish communication between frontend, backend, and MongoDB.

---

## Backend

Set up:

```text
Node.js
Express.js
MongoDB
Mongoose
dotenv
CORS
```

Create:

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
└── server.js
```

---

## Frontend

Set up:

```text
React
Vite
React Router
Axios
```

Basic structure:

```text
client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   └── utils/
└── main.jsx
```

---

## Required Features

* Express server
* MongoDB connection
* Environment variables
* CORS
* API health check
* React application
* Frontend → backend request
* Backend → MongoDB connection

---

## Completion Criteria

```text
GET /api/health
```

returns success.

React successfully communicates with Express.

Express successfully connects to MongoDB.

---

# 4. Milestone 2 — Authentication & Authorization

## Objective

Implement secure login and role-based access.

---

## Roles

```text
ADMIN
OFFICER
VIEWER
```

---

## Features

* Login
* Logout
* JWT authentication
* Password hashing
* Current-user endpoint
* Authentication middleware
* Role middleware
* Foundation Audit Logging Service (`AuditLog` model & `auditService.logAction`)
* Protected frontend routes
* Protected backend routes

---

## Backend

Implement:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Middleware & Services:

```text
authenticate
requireRole
auditService (foundation logging utility)
```

---

## Frontend

Create:

```text
Login Page
Protected Route
Auth Context
Role-based navigation
```

---

## Completion Criteria

A user can log in and receive a valid authenticated session.

Unauthorized users cannot access protected APIs.

Viewer cannot access Officer/Admin-only operations.

---

# 5. Milestone 3 — User & Role Management

## Objective

Allow Admin to create and manage Officers and Viewers.

---

## Admin Features

```text
Dashboard
User list
Create Officer
Create Viewer
Update user
Activate/deactivate user
Assign Viewer → Officer
```

---

## APIs

```text
POST   /api/users
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
PATCH  /api/users/:id/status
PATCH  /api/users/:id/supervisor
```

---

## Important Rule

Only Admin can:

```text
Create Officer
Create Viewer
Modify users
Deactivate users
Assign Viewer
```

---

## Completion Criteria

Admin can completely manage Officer and Viewer accounts.

Viewer correctly stores:

```text
supervisorOfficerId
```

---

# 6. Milestone 4 — FIR Management

## Objective

Allow Officers to register FIRs for citizens and manage them within their permitted scope.

---

## Features

* Create FIR
* View FIR
* Update FIR
* Soft delete FIR
* FIR status
* FIR search
* FIR filtering
* FIR details page

---

## Workflow

```text
Citizen arrives
      ↓
Officer records information
      ↓
Officer creates FIR
      ↓
FIR registered
```

---

## Important Authorization

Officer A:

```text
Can modify → Officer A's FIR
Cannot modify → Officer B's FIR
```

Admin:

```text
Can manage → All permitted FIRs
```

Viewer:

```text
Can view → Supervisor's FIR scope
Cannot modify
```

---

# 7. Milestone 5 — Case Management

## Objective

Connect FIRs to Cases and implement case assignment and lifecycle management.

---

## Workflow

```text
FIR Created
    ↓
Case Created
    ↓
Officer Assigned
    ↓
Investigation
    ↓
Status Updates
    ↓
Solved
    ↓
Closed
```

---

## Features

* Create Case
* Link FIR
* Assign Officer
* View Case
* Update Case
* Delete/soft delete
* Case status
* Case history
* Case details

---

## Case Status

```text
OPEN
UNDER_INVESTIGATION
SOLVED
CLOSED
```

---

## Assignment

Only Admin can reassign Cases.

Officer can operate only within assigned Cases.

---

# 8. Milestone 6 — Crime & Criminal Management

## Objective

Implement reusable Criminal records and Crime records linked to Cases.

---

## Crime Features

```text
Create
Read
Update
Delete
Search
Filter
```

---

## Criminal Features

```text
Create
Read
Update
Delete
Search
Link to Case
Remove from Case
```

---

## Important Design

Criminals are reusable.

```text
Criminal A
   ↑
   ├── Case 1
   ├── Case 2
   └── Case 3
```

Do not duplicate Criminal A for each Case.

---

## Authorization

Officer can modify Criminal information only within their permitted Case scope.

Viewer is read-only.

---

# 9. Milestone 7 — Investigation Management

## Objective

Allow Officers to record investigation activities against assigned Cases.

---

## Features

* Add investigation entry
* View investigation history
* Update investigation entry
* Delete investigation entry
* Investigation date
* Notes
* Evidence description

---

## Workflow

```text
Case
 ↓
Investigation Entry
 ↓
Investigation Entry
 ↓
Investigation Entry
```

---

## Authorization

Officer A:

```text
Case A → Allowed
Case B → Denied
```

Viewer:

```text
Read only
```

---

# 10. Milestone 8 — Dashboard & Statistics

## Objective

Create role-specific dashboards and statistics.

---

# Admin Dashboard

Show:

```text
Total Officers
Total Viewers
Total FIRs
Total Cases
Total Crimes
Total Criminals

Cases by status
Crimes by category
Crimes by area
Monthly crime statistics
Yearly crime statistics
```

---

# Officer Dashboard

Show:

```text
Assigned Cases
Assigned FIRs
Crimes
Criminals

Recent Crimes
Recent Actions

Case status statistics
Crime statistics
Criminal statistics
```

---

# Viewer Dashboard

Show:

```text
Supervisor's Cases
Supervisor's FIRs
Crimes
Criminals

Crime statistics
```

Viewer statistics must respect supervisor scope.

---

# 11. Milestone 9 — Search & Filters

## Objective

Implement efficient server-side searching and filtering.

---

## Searchable Resources

```text
FIR
Case
Crime
Criminal
User
```

---

## Filters

### FIR

```text
FIR number
Crime type
Status
Area
Date range
```

### Case

```text
Case number
Status
Area
Crime type
Date range
```

### Crime

```text
Crime type
Category
Area
Date range
```

### Criminal

```text
Name
Alias
```

---

## Requirements

Search must be:

```text
Server-side
Paginated
Authorization-aware
```

---

# 12. Milestone 10 — Reports & Export

## Objective

Generate useful reports from authorized system data.

---

## Reports

```text
Crime Report
Criminal Report
FIR Report
Case Status Report
Date-wise Crime Report
Area-wise Crime Report
Monthly Report
Yearly Report
```

---

## Export

Support:

```text
PDF
Excel
```

---

## Important Rule

Reports must respect the user's access scope.

Example:

Officer A requests a crime report.

The report must not contain Officer B's restricted Cases.

---

# 13. Milestone 11 — Audit & Login Log Management

## Objective

Build the Admin UI and query/filter endpoints for system audit logs and authentication login logs. (Backend logging utility `auditService` was initialized in M2 and leveraged across M4–M7 CRUD operations).

---

## Audit Logs

API & UI for reviewing administrative event history:

```text
CREATE
UPDATE
DELETE
ASSIGN
STATUS_CHANGE
UNDO
REDO
```

---

## Login Logs

Record:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
```

---

## Admin Features

Admin can:

```text
View audit logs
Filter logs
View login logs
Filter login logs
```

---

## Important Rule

Logs should be treated as historical records.

Normal users must not modify or delete them.

---

# 14. Milestone 12 — Undo / Redo

## Objective

Implement controlled undo/redo for supported Officer actions.

---

## Scope

Undo/redo should initially support selected operations rather than every database operation.

Recommended first targets:

```text
Update Case
Update Crime
Update Criminal
Update FIR
Change Case Status
```

---

## Workflow

```text
Officer Action
     ↓
Store Before State
     ↓
Store After State
     ↓
Action History
```

Undo:

```text
Action
 ↓
Validate ownership
 ↓
Validate current state
 ↓
Restore beforeState
 ↓
Audit
```

Redo:

```text
Action
 ↓
Validate ownership
 ↓
Validate current state
 ↓
Restore afterState
 ↓
Audit
```

---

## Critical Rule

Undo must never bypass authorization.

---

# 15. Milestone 13 — Feedback Management

## Objective

Allow users to submit feedback and Admin to manage it.

---

## User Features

```text
Submit feedback
View own feedback
```

---

## Admin Features

```text
View feedback
Mark reviewed
Resolve feedback
Respond to feedback
```

---

## Status

```text
NEW
REVIEWED
RESOLVED
```

---

# 16. Milestone 14 — Testing & Security Hardening

## Objective

Ensure the application is secure, reliable, and consistent.

---

## Backend Testing

Test:

```text
Authentication
Authorization
CRUD
Ownership
Case assignment
Viewer scope
Status transitions
Validation
Pagination
Search
Reports
```

---

## Security Testing

Verify:

```text
Officer A cannot access Officer B's Case
Officer A cannot modify Officer B's FIR
Officer A cannot modify Officer B's Viewer
Viewer cannot modify records
Viewer cannot access another Officer's data
Non-admin cannot access Admin APIs
Unauthenticated user cannot access protected APIs
```

---

## Input Security

Test:

```text
Invalid IDs
Invalid dates
Invalid status
Missing fields
Invalid email
Duplicate email
Duplicate FIR number
Duplicate case number
```

---

## Error Handling

Ensure APIs never expose:

```text
Passwords
Password hashes
Stack traces
Internal secrets
Database credentials
```

---

# 17. Milestone 15 — Final UI Polish & Deployment

## Objective

Prepare the project for final demonstration and deployment.

---

## UI

Improve:

```text
Responsive design
Loading states
Empty states
Error states
Confirmation dialogs
Toast notifications
Tables
Forms
Dashboard cards
Charts
Navigation
```

---

## Deployment Preparation

Backend:

```text
Environment variables
Production MongoDB
CORS configuration
JWT secret
Error handling
```

Frontend:

```text
Production API URL
Build configuration
Environment variables
```

---

# 18. Suggested Development Order

Do not start all modules simultaneously.

Recommended sequence:

```text
M1 Foundation
 ↓
M2 Authentication
 ↓
M3 Users
 ↓
M4 FIR
 ↓
M5 Cases
 ↓
M6 Crimes + Criminals
 ↓
M7 Investigation
 ↓
M8 Dashboard
 ↓
M9 Search
 ↓
M10 Reports
 ↓
M11 Logs
 ↓
M12 Undo/Redo
 ↓
M13 Feedback
 ↓
M14 Testing
 ↓
M15 Final Polish
```

---

# 19. Kiro Development Strategy

Each milestone should have its own specification.

Example:

```text
.kiro/
└── specs/
    ├── milestone-1-foundation/
    │   ├── requirements.md
    │   ├── design.md
    │   └── tasks.md
    │
    ├── milestone-2-auth/
    │   ├── requirements.md
    │   ├── design.md
    │   └── tasks.md
    │
    ├── milestone-3-users/
    │   ├── requirements.md
    │   ├── design.md
    │   └── tasks.md
    │
    └── ...
```

---

# 20. Definition of Done

A milestone is complete only when:

```text
Feature implemented
       ↓
API tested
       ↓
Frontend integrated
       ↓
Authorization tested
       ↓
Validation tested
       ↓
Error handling tested
       ↓
No major regression
       ↓
Milestone approved
```

---

# 21. What NOT to Do

Do not:

```text
❌ Build all frontend pages first
❌ Build all APIs without authorization
❌ Trust frontend role checks
❌ Store passwords as plain text
❌ Let Officers modify arbitrary Cases
❌ Let Viewers modify data
❌ Duplicate Criminal records unnecessarily
❌ Implement every advanced feature immediately
❌ Build reports before core data is stable
❌ Build Undo/Redo before CRUD is stable
❌ Optimize prematurely
```

---

# 22. Intermediate-Level Boundary

CrimeTrack should remain an intermediate project.

Avoid adding unnecessary complexity such as:

```text
❌ Microservices
❌ Kubernetes
❌ Event-driven architecture
❌ Redis
❌ Kafka
❌ Elasticsearch
❌ Complex distributed systems
❌ AI crime prediction
❌ Real-time collaboration
```

unless the project requirements change later.

The goal is:

```text
Clean
Secure
Modular
Understandable
Demonstrable
```

rather than unnecessarily complex.

---

# 23. Final Architecture Goal

By the end of development:

```text
                    CrimeTrack
                        │
        ┌───────────────┼────────────────┐
        │               │                │
      Admin           Officer          Viewer
        │               │                │
        │               │                │
   User Management   FIR Management   Read-only
   Global Records    Case Management   Supervisor Scope
   Statistics        Crime Management
   Reports           Criminal Mgmt
   Logs              Investigation
   Feedback          Statistics
                     Reports
                        │
                        ▼
                  Express REST API
                        │
            ┌───────────┴───────────┐
            │                       │
       Auth/RBAC              Business Logic
            │                       │
            └───────────┬───────────┘
                        │
                     Mongoose
                        │
                        ▼
                    MongoDB
```

---

# 24. Final Project Flow

The primary business flow is:

```text
Citizen
   ↓
Officer
   ↓
Create FIR
   ↓
FIR linked to Case
   ↓
Case assigned to Officer
   ↓
Crime linked to Case
   ↓
Criminal linked to Case
   ↓
Investigation
   ↓
Case Status Updates
   ↓
Solved
   ↓
Closed
   ↓
Reports / Statistics
```

Administrative flow:

```text
Admin
 ↓
Create Officer
 ↓
Create Viewer
 ↓
Assign Viewer → Officer
 ↓
Assign Case → Officer
 ↓
Monitor System
 ↓
View Statistics
 ↓
Manage Feedback
 ↓
Review Audit/Login Logs
```

Viewer flow:

```text
Viewer
 ↓
Login
 ↓
Identify Supervisor
 ↓
View Supervisor Scope
 ↓
View FIRs
 ↓
View Cases
 ↓
View Crimes
 ↓
View Criminals
 ↓
View Statistics
```

---

# 25. Current Project Documentation Set

The project should now have:

```text
docs/
├── PRD.md
├── ARCHITECTURE.md
├── DATABASE_DESIGN.md
├── API_DESIGN.md
└── MILESTONES.md
```

These documents together define the current product and technical direction.

Before implementing a new feature, check these documents first.

If a requirement conflicts with them, update the documentation before implementing the feature.
