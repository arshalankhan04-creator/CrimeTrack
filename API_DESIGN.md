# CrimeTrack — API Design

**Project:** CrimeTrack
**Architecture:** MERN Stack
**API Style:** REST
**Base URL:** `/api`
**Version:** 1.0
**Status:** Approved for Development

---

# 1. Purpose

This document defines the REST API contract for CrimeTrack.

It specifies:

* API modules
* Endpoints
* HTTP methods
* Authentication requirements
* Role requirements
* Ownership requirements
* Request structure
* Response structure
* Error handling
* Query parameters
* Reporting endpoints

The API must follow the security and ownership rules defined in:

* `PRD.md`
* `ARCHITECTURE.md`
* `DATABASE_DESIGN.md`

---

# 2. API Architecture

The general request flow is:

```text
Client
  ↓
React
  ↓
Axios
  ↓
Express Router
  ↓
Authentication Middleware
  ↓
Role Middleware
  ↓
Ownership/Scope Middleware
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Mongoose
  ↓
MongoDB
```

---

# 3. Base URL

All APIs are under:

```text
/api
```

Example:

```text
GET /api/cases
```

---

# 4. Authentication

Protected APIs require:

```text
Authorization: Bearer <JWT>
```

Example:

```text
Authorization: Bearer eyJhbGciOi...
```

Public endpoint:

```text
POST /api/auth/login
```

---

# 5. Standard Response Format

## Success

```json id="y7m6od"
{
  "success": true,
  "data": {}
}
```

For messages:

```json id="n72kjq"
{
  "success": true,
  "message": "Case updated successfully.",
  "data": {}
}
```

---

# 6. Standard Error Format

```json id="kq6o2v"
{
  "success": false,
  "message": "You are not authorized to modify this case."
}
```

Optional validation details:

```json id="p4f7bb"
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": "Invalid email format"
  }
}
```

---

# 7. HTTP Status Codes

| Status | Meaning                          |
| ------ | -------------------------------- |
| 200    | Successful request               |
| 201    | Resource created                 |
| 400    | Invalid request                  |
| 401    | Not authenticated                |
| 403    | Authenticated but not authorized |
| 404    | Resource not found               |
| 409    | Conflict                         |
| 422    | Validation/business rule failure |
| 500    | Internal server error            |

---

# 8. API Modules

```text id="rj1k7w"
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

---

# 9. Authentication APIs

## 9.1 Login

```text
POST /api/auth/login
```

Access:

```text
Public
```

Request:

```json id="rj0v4d"
{
  "email": "officer@example.com",
  "password": "password"
}
```

Response:

```json id="y0kq2u"
{
  "success": true,
  "data": {
    "token": "<JWT>",
    "user": {
      "id": "...",
      "name": "Officer A",
      "email": "officer@example.com",
      "role": "OFFICER"
    }
  }
}
```

---

## 9.2 Get Current User

```text
GET /api/auth/me
```

Access:

```text
Authenticated users
```

Returns the currently authenticated user's safe profile information.

---

## 9.3 Logout

```text
POST /api/auth/logout
```

Access:

```text
Authenticated users
```

The server should record a logout event if applicable.

Since JWT authentication is stateless, actual token invalidation strategy can remain simple for the intermediate version.

---

# 10. User Management APIs

Base:

```text
/api/users
```

Only Admin can manage users.

---

## 10.1 Create User

```text
POST /api/users
```

Access:

```text
ADMIN
```

Request:

```json id="y2xq2m"
{
  "name": "Officer A",
  "email": "officer@example.com",
  "password": "password",
  "role": "OFFICER",
  "phone": "9999999999",
  "employeeId": "OFF-001"
}
```

For Viewer:

```json id="vl4z3y"
{
  "name": "Viewer A",
  "email": "viewer@example.com",
  "password": "password",
  "role": "VIEWER",
  "supervisorOfficerId": "OFFICER_ID"
}
```

---

## 10.2 Get Users

```text
GET /api/users
```

Access:

```text
ADMIN
```

Query parameters:

```text
?role=OFFICER
?role=VIEWER
?isActive=true
?search=arshalan
```

---

## 10.3 Get User

```text
GET /api/users/:id
```

Access:

```text
ADMIN
```

---

## 10.4 Update User

```text
PUT /api/users/:id
```

Access:

```text
ADMIN
```

---

## 10.5 Deactivate User

```text
PATCH /api/users/:id/status
```

Access:

```text
ADMIN
```

Request:

```json id="d7x9vb"
{
  "isActive": false
}
```

---

## 10.6 Assign Viewer

```text
PATCH /api/users/:id/supervisor
```

Access:

```text
ADMIN
```

Request:

```json id="g1o5qw"
{
  "supervisorOfficerId": "OFFICER_ID"
}
```

---

# 11. FIR APIs

Base:

```text
/api/firs
```

---

## 11.1 Create FIR

```text
POST /api/firs
```

Access:

```text
ADMIN
OFFICER
```

Viewer:

```text
DENY
```

Request example:

```json id="z9bb86"
{
  "complainant": {
    "name": "Example Citizen",
    "phone": "9999999999",
    "address": "Ahmedabad",
    "identification": "ID-001"
  },
  "incident": {
    "date": "2026-08-31",
    "time": "18:30",
    "location": "Example Location",
    "area": "Ahmedabad",
    "description": "Example incident description"
  },
  "crimeType": "ROBBERY"
}
```

The backend determines the appropriate ownership/creator information.

Do not trust the client to assign itself unauthorized ownership.

---

## 11.2 Get FIRs

```text
GET /api/firs
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Scope:

```text
ADMIN   → All permitted FIRs
OFFICER → Assigned FIRs
VIEWER  → Supervisor scope
```

Filters:

```text
?firNumber=
?crimeType=
?status=
?area=
?dateFrom=
?dateTo=
?search=
?page=
?limit=
```

---

## 11.3 Get FIR

```text
GET /api/firs/:id
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

The backend verifies access before returning the FIR.

---

## 11.4 Update FIR

```text
PUT /api/firs/:id
```

Access:

```text
ADMIN
OFFICER
```

Officer requirement:

```text
FIR.assignedOfficerId === req.user.id
```

Otherwise:

```text
403 Forbidden
```

---

## 11.5 Soft Delete FIR

```text
DELETE /api/firs/:id
```

Access:

```text
ADMIN
OFFICER
```

Officer can delete only within their permitted scope.

Deletion means soft deletion.

---

# 12. Case APIs

Base:

```text
/api/cases
```

---

## 12.1 Create Case

```text
POST /api/cases
```

Access:

```text
ADMIN
OFFICER
```

A valid FIR is required.

Request:

```json id="e2gyh1"
{
  "firId": "FIR_ID",
  "title": "Example Case",
  "description": "Case description"
}
```

Assignment behavior:

* Admin can assign an Officer.
* Officer-created Case is associated with the appropriate Officer scope.
* Client cannot arbitrarily assign a Case to another Officer.
* Crime details can be created alongside the Case or added via `POST /api/crimes` referencing the created `caseId`.

---

## 12.2 Get Cases

```text
GET /api/cases
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Scope:

```text
ADMIN   → Global
OFFICER → Assigned cases
VIEWER  → Supervisor cases
```

Filters:

```text
?caseNumber=
?firNumber=
?status=
?area=
?crimeType=
?dateFrom=
?dateTo=
?assignedOfficerId=
?search=
?page=
?limit=
```

`assignedOfficerId` filtering must not bypass authorization.

---

## 12.3 Get Case

```text
GET /api/cases/:id
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Access must be checked before returning data.

---

## 12.4 Update Case

```text
PUT /api/cases/:id
```

Access:

```text
ADMIN
OFFICER
```

Officer:

```text
Only assigned case
```

Viewer:

```text
DENY
```

---

## 12.5 Delete Case

```text
DELETE /api/cases/:id
```

Access:

```text
ADMIN
OFFICER
```

Uses soft deletion.

---

## 12.6 Assign Case

```text
PATCH /api/cases/:id/assign
```

Access:

```text
ADMIN
```

Request:

```json id="l8l34a"
{
  "assignedOfficerId": "OFFICER_ID"
}
```

Backend validates that the target user is an active Officer.

---

## 12.7 Change Case Status

```text
PATCH /api/cases/:id/status
```

Access:

```text
ADMIN
OFFICER
```

Officer:

```text
Assigned case only
```

Request:

```json id="c6svm3"
{
  "status": "UNDER_INVESTIGATION",
  "note": "Investigation started."
}
```

The service must:

1. Validate transition.
2. Update Case.
3. Create CaseHistory.
4. Create AuditLog.

---

## 12.8 Get Case History

```text
GET /api/cases/:id/history
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Scope:

* ADMIN $\rightarrow$ Global access
* OFFICER $\rightarrow$ Assigned case only
* VIEWER $\rightarrow$ Supervisor case scope only

Returns chronological status transition entries from `CaseHistory` for the specified Case:

```json
{
  "success": true,
  "data": [
    {
      "id": "HISTORY_ID",
      "caseId": "CASE_ID",
      "previousStatus": "OPEN",
      "newStatus": "UNDER_INVESTIGATION",
      "note": "Investigation started.",
      "changedBy": {
        "id": "OFFICER_ID",
        "name": "Officer A"
      },
      "createdAt": "2026-08-31T20:00:00.000Z"
    }
  ]
}
```

---

# 13. Crime APIs

Base:

```text
/api/crimes
```

---

## 13.1 Create Crime

```text
POST /api/crimes
```

Access:

```text
ADMIN
OFFICER
```

Crime must be associated with a permitted Case.

---

## 13.2 Get Crimes

```text
GET /api/crimes
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Filters:

```text
?crimeType=
?category=
?area=
?dateFrom=
?dateTo=
?caseId=
?page=
?limit=
```

---

## 13.3 Get Crime

```text
GET /api/crimes/:id
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Access is determined through its Case.

---

## 13.4 Update Crime

```text
PUT /api/crimes/:id
```

Access:

```text
ADMIN
OFFICER
```

Officer must own/access the associated Case.

---

## 13.5 Delete Crime

```text
DELETE /api/crimes/:id
```

Access:

```text
ADMIN
OFFICER
```

Soft delete.

---

# 14. Criminal APIs

Base:

```text
/api/criminals
```

Criminals are reusable global entities.

---

## 14.1 Create Criminal

```text
POST /api/criminals
```

Access:

```text
ADMIN
OFFICER
```

---

## 14.2 Get Criminals / Global Search
 
```text
GET /api/criminals
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Query Parameters:

```text
?search=nameOrId
?page=1
?limit=20
```

### Authorization & Scope Filtering:
1. **Global Search Mode (`?search=...`)**:
   * Officers can search the Global Criminal Registry to identify if an existing record exists before creating a new criminal.
   * **Exposes ONLY minimal non-sensitive identification fields:**
     * `_id`
     * `name`
     * `aliases`
     * `dateOfBirth`
     * `identification` (e.g. ID numbers, reference marks)
     * `status`
   * **STRICTLY PROHIBITED in Search Responses:**
     * Other Officers' FIR information
     * Other Officers' Case information
     * Investigation notes
     * Evidence descriptions
     * Case history timeline
     * Private notes from other officers
2. **List / Case View Mode (without global search)**:
   * **ADMIN** $\rightarrow$ Global list
   * **OFFICER** $\rightarrow$ Criminals linked to Officer's assigned Cases
   * **VIEWER** $\rightarrow$ Criminals linked to Supervisor's Cases

---

## 14.3 Get Criminal Details

```text
GET /api/criminals/:id
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Behavior:

* Returns full profile details for the Criminal.
* Associated case records and investigation references returned in this response are strictly filtered to the current user's authorized scope (Admin: all, Officer: assigned cases, Viewer: supervisor cases). An Officer will **not** see case associations belonging to other Officers.

---

## 14.4 Update Criminal

```text
PUT /api/criminals/:id
```

Access:

```text
ADMIN
OFFICER
```

The backend verifies the Officer's permitted relationship to the Criminal.

---

## 14.5 Delete Criminal

```text
DELETE /api/criminals/:id
```

Access:

```text
ADMIN
OFFICER
```

Soft delete preferred.

---

## 14.6 Link Criminal to Case

```text
POST /api/cases/:caseId/criminals
```

Access:

```text
ADMIN
OFFICER
```

Officer:

```text
Assigned case only
```

Request:

```json id="z3l6hy"
{
  "criminalId": "CRIMINAL_ID"
}
```

---

## 14.7 Remove Criminal from Case

```text
DELETE /api/cases/:caseId/criminals/:criminalId
```

Access:

```text
ADMIN
OFFICER
```

Officer:

```text
Assigned case only
```

---

# 15. Investigation APIs

Base:

```text
/api/investigations
```

---

## 15.1 Create Investigation Entry

```text
POST /api/cases/:caseId/investigations
```

Access:

```text
ADMIN
OFFICER
```

Officer:

```text
Assigned case only
```

Request:

```json id="8h3xij"
{
  "title": "Witness Interview",
  "notes": "Witness statement recorded.",
  "evidenceDescription": "Statement document",
  "investigationDate": "2026-08-31"
}
```

---

## 15.2 Get Investigation Entries

```text
GET /api/cases/:caseId/investigations
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Scope is inherited from the Case.

---

## 15.3 Get Investigation Entry

```text
GET /api/investigations/:id
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Backend checks the associated Case.

---

## 15.4 Update Investigation

```text
PUT /api/investigations/:id
```

Access:

```text
ADMIN
OFFICER
```

Officer must have access to the associated Case.

---

## 15.5 Delete Investigation

```text
DELETE /api/investigations/:id
```

Access:

```text
ADMIN
OFFICER
```

Officer must have access to the associated Case.

---

# 16. Statistics APIs

Base:

```text
/api/statistics
```

---

## 16.1 Dashboard Statistics

```text
GET /api/statistics/dashboard
```

Access:

```text
ADMIN
OFFICER
VIEWER
```

Returned statistics depend on user scope.

Admin:

```text
Global statistics
```

Officer:

```text
Officer-specific statistics
```

Viewer:

```text
Supervisor-scope statistics
```

---

## 16.2 Crime Statistics

```text
GET /api/statistics/crimes
```

Filters:

```text
?dateFrom=
?dateTo=
?area=
?category=
?crimeType=
```

---

## 16.3 Criminal Statistics

```text
GET /api/statistics/criminals
```

---

## 16.4 Case Status Statistics

```text
GET /api/statistics/cases/status
```

Example response:

```json id="8j2wfi"
{
  "success": true,
  "data": {
    "OPEN": 10,
    "UNDER_INVESTIGATION": 7,
    "SOLVED": 5,
    "CLOSED": 20
  }
}
```

---

## 16.5 Monthly Statistics

```text
GET /api/statistics/monthly
```

Optional:

```text
?year=2026
```

---

## 16.6 Yearly Statistics

```text
GET /api/statistics/yearly
```

---

## 16.7 Area Statistics

```text
GET /api/statistics/areas
```

---

# 17. Reports APIs

Base:

```text
/api/reports
```

---

## 17.1 Crime Report

```text
GET /api/reports/crimes
```

Optional filters:

```text
?dateFrom=
?dateTo=
?area=
?category=
?crimeType=
?format=pdf
```

---

## 17.2 Criminal Report

```text
GET /api/reports/criminals
```

---

## 17.3 FIR Report

```text
GET /api/reports/firs
```

---

## 17.4 Case Status Report

```text
GET /api/reports/case-status
```

---

## 17.5 Date-wise Crime Report

```text
GET /api/reports/crimes/date-wise
```

---

## 17.6 Area-wise Crime Report

```text
GET /api/reports/crimes/area-wise
```

---

## 17.7 Monthly Report

```text
GET /api/reports/monthly
```

---

## 17.8 Yearly Report

```text
GET /api/reports/yearly
```

---

# 18. Report Formats

Supported:

```text
format=pdf
format=excel
```

Example:

```text
GET /api/reports/crimes?format=pdf
```

or:

```text
GET /api/reports/crimes?format=excel
```

The server must generate the report only from data the user is authorized to access.

---

# 19. Audit Log APIs

Base:

```text
/api/audit-logs
```

Only Admin.

---

## 19.1 Get Audit Logs

```text
GET /api/audit-logs
```

Filters:

```text
?userId=
?action=
?entityType=
?dateFrom=
?dateTo=
?page=
?limit=
```

---

## 19.2 Get Audit Log

```text
GET /api/audit-logs/:id
```

Access:

```text
ADMIN
```

Audit logs should generally be read-only through the API.

---

# 20. Login Log APIs

Base:

```text
/api/login-logs
```

Only Admin.

---

## 20.1 Get Login Logs

```text
GET /api/login-logs
```

Filters:

```text
?userId=
?event=
?dateFrom=
?dateTo=
?page=
?limit=
```

---

# 21. Action History APIs

Base:

```text
/api/actions
```

---

## 21.1 Get My Recent Actions

```text
GET /api/actions/recent
```

Access:

```text
ADMIN
OFFICER
```

Officer sees own actions.

Admin can have broader visibility.

Viewer:

```text
DENY
```

---

## 21.2 Undo Action

```text
POST /api/actions/:id/undo
```

Access:

```text
ADMIN
OFFICER
```

Officer can undo only their own supported actions within their current permitted scope.

### Scope & Validation Rules:
1. **Bounded Scope**: Undo/redo is strictly bounded to **single-document attribute and status updates** (e.g. Case status update, Case/FIR description edit, Investigation text update). It does not perform cascading multi-document deletions.
2. **Current Entity Ownership**: The backend validates that the requesting user *currently* has assignment ownership of the target entity (or is Admin). If a Case has been reassigned to another Officer, the previous assignee cannot undo actions on that Case.
3. **Action Integrity**: Verifies that the action has status `ACTIVE` and current entity state matches `afterState` before reverting to `beforeState`.
4. **Audit**: Generates an `UNDO_ACTION` audit record.

---

## 21.3 Redo Action

```text
POST /api/actions/:id/redo
```

Same authorization principles apply.

---

# 22. Feedback APIs

Base:

```text
/api/feedback
```

---

## 22.1 Submit Feedback

```text
POST /api/feedback
```

Access:

```text
Authenticated users
```

Request:

```json id="3w0m8m"
{
  "subject": "Dashboard suggestion",
  "message": "Add more statistics."
}
```

---

## 22.2 Get Feedback

```text
GET /api/feedback
```

Access:

```text
ADMIN
```

---

## 22.3 Update Feedback Status

```text
PATCH /api/feedback/:id/status
```

Access:

```text
ADMIN
```

Request:

```json id="3wqby9"
{
  "status": "REVIEWED"
}
```

---

## 22.4 Respond to Feedback

```text
PATCH /api/feedback/:id/response
```

Access:

```text
ADMIN
```

Request:

```json id="5f5jkh"
{
  "adminResponse": "Thank you for the suggestion."
}
```

---

# 23. Access Control Matrix

| Endpoint Category    |      Admin |         Officer |            Viewer |
| -------------------- | ---------: | --------------: | ----------------: |
| Login                |          ✅ |               ✅ |                 ✅ |
| Current User         |          ✅ |               ✅ |                 ✅ |
| User Management      |          ✅ |               ❌ |                 ❌ |
| FIR Create           |          ✅ |               ✅ |                 ❌ |
| FIR Read             |          ✅ |       Own Scope |  Supervisor Scope |
| FIR Update           |          ✅ |       Own Scope |                 ❌ |
| FIR Delete           |          ✅ |       Own Scope |                 ❌ |
| Case Create          |          ✅ |               ✅ |                 ❌ |
| Case Read            |          ✅ |       Own Scope |  Supervisor Scope |
| Case Update          |          ✅ |       Own Scope |                 ❌ |
| Case Delete          |          ✅ |       Own Scope |                 ❌ |
| Case Assignment      |          ✅ |               ❌ |                 ❌ |
| Case Status          |          ✅ |       Own Scope |                 ❌ |
| Crime Create         |          ✅ |  Permitted Case |                 ❌ |
| Crime Read           |          ✅ | Permitted Scope |  Supervisor Scope |
| Crime Update         |          ✅ |  Permitted Case |                 ❌ |
| Criminal Create      |          ✅ | Permitted Scope |                 ❌ |
| Criminal Read        |          ✅ | Permitted Scope |  Supervisor Scope |
| Criminal Update      |          ✅ | Permitted Scope |                 ❌ |
| Investigation Create |          ✅ |   Assigned Case |                 ❌ |
| Investigation Read   |          ✅ |  Permitted Case |  Supervisor Scope |
| Investigation Update |          ✅ |   Assigned Case |                 ❌ |
| Statistics           |     Global |       Own Scope |  Supervisor Scope |
| Reports              |     Global |       Own Scope | Limited/Read-only |
| Audit Logs           |          ✅ |               ❌ |                 ❌ |
| Login Logs           |          ✅ |               ❌ |                 ❌ |
| Undo/Redo            | Controlled |     Own Actions |                 ❌ |
| Feedback Submit      |          ✅ |               ✅ |                 ✅ |
| Feedback Management  |          ✅ |               ❌ |                 ❌ |

---

# 24. Ownership Rules

## FIR

Officer access:

```text
FIR.assignedOfficerId === req.user.id
```

---

## Case

Officer access:

```text
Case.assignedOfficerId === req.user.id
```

---

## Crime

Officer access:

```text
Crime.caseId
    ↓
Case.assignedOfficerId
    ↓
req.user.id
```

---

## Investigation

Officer access:

```text
Investigation.caseId
    ↓
Case.assignedOfficerId
    ↓
req.user.id
```

---

## Viewer

Viewer access:

```text
Viewer.supervisorOfficerId
    ↓
Record.assignedOfficerId
```

---

# 25. Authorization Middleware

Recommended middleware:

```text id="p47m28"
authenticate
requireRole
checkCaseOwnership
checkFIROwnership
checkViewerScope
```

Not every endpoint requires a separate middleware.

For related resources, authorization may be handled inside a service.

---

# 26. Recommended Middleware Flow

Example:

```text id="w2k9b0"
PUT /api/cases/:id
        ↓
authenticate
        ↓
requireRole("ADMIN", "OFFICER")
        ↓
checkCaseAccess
        ↓
validateRequest
        ↓
controller
```

---

# 27. 401 vs 403

Use:

```text id="8r9k9v"
401 Unauthorized
```

when the user is not authenticated.

Examples:

* Missing JWT
* Invalid JWT
* Expired JWT

Use:

```text id="8c9j49"
403 Forbidden
```

when the user is authenticated but lacks permission.

Examples:

* Viewer attempts update
* Officer attempts another Officer's Case
* Officer attempts Admin-only endpoint

---

# 28. Pagination

List endpoints should support:

```text id="t2e1q4"
?page=1&limit=20
```

Response:

```json id="m2f5xk"
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

Pagination should be implemented for large/list endpoints such as:

* Cases
* FIRs
* Criminals
* Crimes
* Users
* Audit logs
* Login logs

---

# 29. Search and Filtering

Search parameters should be optional.

Example:

```text
GET /api/cases?status=OPEN&area=Ahmedabad
```

Multiple filters should be combined.

The backend must apply authorization before returning results.

---

# 30. API Validation

Requests should be validated before reaching business logic.

Validation should cover:

```text
Required fields
IDs
Dates
Enums
Email
Phone
Status
Pagination
```

Invalid request:

```text
400 Bad Request
```

Business rule violation:

```text
422 Unprocessable Entity
```

---

# 31. Case Status API Rules

Only valid transitions are accepted.

Example:

```text
OPEN
 ↓
UNDER_INVESTIGATION
 ↓
SOLVED
 ↓
CLOSED
```

Invalid transition:

```text
CLOSED → OPEN
```

returns an appropriate business error.

---

# 32. Assignment API Rules

Only Admin can assign Cases.

Only Admin can assign Viewers.

Backend validates:

```text
Target user exists
Target user is active
Target user has correct role
```

Example:

```text
assign Case → OFFICER only
assign Viewer → OFFICER only
```

---

# 33. API Security Rules

The following are mandatory:

1. Never trust frontend role information.
2. Never trust frontend ownership information.
3. Never expose password hashes.
4. Never return unauthorized records.
5. Validate every protected request.
6. Apply authorization before database mutation.
7. Apply authorization before sensitive reads.
8. Use parameterized/Mongoose queries.
9. Keep secrets in environment variables.
10. Log important mutations.

---

# 34. API Audit Behavior

Important mutations should generate AuditLogs.

Example:

```text
PUT /api/cases/:id
        ↓
Update Case
        ↓
AuditLog
```

For status changes:

```text
PATCH /api/cases/:id/status
        ↓
Case update
        ↓
CaseHistory
        ↓
AuditLog
```

For assignments:

```text
PATCH /api/cases/:id/assign
        ↓
Case update
        ↓
AuditLog
```

---

# 35. API Naming Convention

Use REST-style plural resource names:

```text
/api/users
/api/firs
/api/cases
/api/crimes
/api/criminals
```

Use nested routes when the relationship is important:

```text
/api/cases/:caseId/investigations
/api/cases/:caseId/criminals
```

Use action endpoints for state transitions:

```text
/api/cases/:id/status
/api/cases/:id/assign
/api/actions/:id/undo
/api/actions/:id/redo
```

---

# 36. API Versioning

Versioning is not required for the initial academic project.

If needed later:

```text
/api/v1
```

can be introduced.

For the current version:

```text
/api
```

is sufficient.

---

# 37. API Health Check

The backend should provide:

```text
GET /api/health
```

Response:

```json id="v5gl3a"
{
  "success": true,
  "message": "CrimeTrack API is running."
}
```

This will be used during Milestone 1 to verify the backend.

---

# 38. Example Complete Request Flow

Officer updates assigned Case:

```text
PUT /api/cases/CASE_ID
        ↓
JWT verification
        ↓
Role = OFFICER
        ↓
Find Case
        ↓
Check assignedOfficerId
        ↓
Matches current user
        ↓
Validate request
        ↓
Update Case
        ↓
Create AuditLog
        ↓
Return response
```

---

# 39. Unauthorized Request Example

Officer A attempts:

```text
PUT /api/cases/OFFICER_B_CASE
```

Backend:

```text
JWT valid
        ↓
Role = OFFICER
        ↓
Case belongs to Officer B
        ↓
Access denied
```

Response:

```json id="o44yfc"
{
  "success": false,
  "message": "You are not authorized to modify this case."
}
```

HTTP:

```text
403 Forbidden
```

---

# 40. Viewer Request Example

Viewer A requests:

```text
GET /api/cases
```

Backend:

```text
JWT valid
 ↓
Role = VIEWER
 ↓
Find supervisorOfficerId
 ↓
Filter Cases by supervisor
 ↓
Return read-only data
```

Viewer attempting:

```text
PUT /api/cases/:id
```

must receive:

```text
403 Forbidden
```

---

# 41. API Design Decisions

The following are locked for the current version:

```text
API style:
REST

Authentication:
JWT

Password security:
bcrypt

Base path:
/api

Authorization:
RBAC + ownership/scope

Admin:
Global access

Officer:
Assigned/permitted scope

Viewer:
Supervisor scope + read-only

Assignment:
Admin controlled

Case status:
Dedicated endpoint

Reports:
Dedicated report endpoints

Statistics:
Dedicated statistics endpoints

Logs:
Dedicated read-only Admin endpoints

Undo/Redo:
Dedicated action endpoints

Pagination:
Supported on list endpoints

Search:
Server-side

Filtering:
Server-side

API versioning:
Not required initially
```

---

# 42. Implementation Principle

The API should remain simple enough for an intermediate MERN project while maintaining realistic security.

The most important API rule is:

```text
AUTHENTICATE
      ↓
AUTHORIZE
      ↓
VALIDATE
      ↓
EXECUTE
      ↓
AUDIT
```

No protected operation should skip the authorization stage.

---
