# CrimeTrack — Database Design

**Project:** CrimeTrack
**Database:** MongoDB
**ODM:** Mongoose
**Version:** 1.0
**Status:** Approved for Development

---

# 1. Purpose

This document defines the database architecture for CrimeTrack.

It describes:

* Collections
* Document responsibilities
* Relationships
* References
* Ownership
* Access scope
* Status values
* Indexing strategy
* Soft deletion
* History
* Audit logging

The database design must support the authorization rules defined in `ARCHITECTURE.md`.

---

# 2. Database Strategy

CrimeTrack uses:

```text
MongoDB
    +
Mongoose
```

MongoDB is a document-oriented database, so related information will be embedded only when it is naturally part of the parent document.

Large/reusable entities will generally be referenced.

---

# 3. Core Collections

The initial database contains:

```text
users
firs
cases
crimes
criminals
investigations
case_histories
action_histories
audit_logs
login_logs
feedback
```

---

# 4. Entity Overview

```text
User
 │
 ├── manages → FIR
 │
 ├── assigned → Case
 │
 ├── supervises → Viewer
 │
 └── performs → Actions

FIR
 │
 └── linked to → Case

Case
 │
 ├── assigned to → Officer
 ├── contains → Crime
 ├── references → Criminal(s)
 ├── contains → Investigation(s)
 └── has → Case History

Action
 │
 ├── performed by → User
 └── stored in → Action History

User actions
 │
 ├── Audit Logs
 └── Login Logs
```

---

# 5. User Collection

Collection:

```text
users
```

Purpose:

Stores Admin, Officer, and Viewer accounts.

---

## 5.1 User Fields

Conceptual structure:

```text
User
├── _id
├── name
├── email
├── passwordHash
├── role
├── phone
├── employeeId
├── supervisorOfficerId
├── isActive
├── isDeleted
├── createdAt
└── updatedAt
```

---

## 5.2 Role

Allowed values:

```text
ADMIN
OFFICER
VIEWER
```

---

## 5.3 supervisorOfficerId

Used only for Viewer accounts.

Example:

```text
Viewer A
supervisorOfficerId → Officer A
```

For Admin/Officer:

```text
supervisorOfficerId = null
```

---

## 5.4 User Rules

### Admin

```text
role = ADMIN
supervisorOfficerId = null
```

### Officer

```text
role = OFFICER
supervisorOfficerId = null
```

### Viewer

```text
role = VIEWER
supervisorOfficerId = Officer ID
```

---

# 6. FIR Collection

Collection:

```text
firs
```

Purpose:

Stores First Information Reports created by Officers.

---

## 6.1 FIR Fields

```text
FIR
├── _id
├── firNumber
├── complainant
│   ├── name
│   ├── phone
│   ├── address
│   └── identification
├── incident
│   ├── date
│   ├── time
│   ├── location
│   ├── area
│   └── description
├── crimeType
├── createdBy
├── assignedOfficerId
├── caseId
├── status
├── isDeleted
├── createdAt
└── updatedAt
```

---

# 7. FIR Ownership

FIR should have:

```text
createdBy
assignedOfficerId
```

`assignedOfficerId` is the primary field used for operational access control.

Example:

```text
FIR #1001
assignedOfficerId → Officer A
```

Officer B cannot modify it.

---

# 8. FIR Status

Initial values:

```text
REGISTERED
UNDER_REVIEW
LINKED_TO_CASE
CLOSED
```

The exact workflow may be simplified during implementation if necessary.

---

# 9. Case Collection

Collection:

```text
cases
```

Purpose:

Represents the investigation case linked to an FIR.

---

## 9.1 Case Fields

```text
Case
├── _id
├── caseNumber
├── firId
├── title
├── description
├── assignedOfficerId
├── criminalIds[]
├── status
├── openedAt
├── closedAt
├── isDeleted
├── createdAt
└── updatedAt
```

---

# 10. Case Status

Initial supported values:

```text
OPEN
UNDER_INVESTIGATION
SOLVED
CLOSED
```

Future:

```text
REOPENED
```

may be added later.

---

# 11. Case Assignment

Every operational Case must have:

```text
assignedOfficerId
```

Example:

```text
Case #2001
assignedOfficerId → Officer A
```

This field is critical for authorization.

---

# 12. Case → FIR Relationship

A Case references one FIR:

```text
Case.firId → FIR._id
```

Conceptually:

```text
FIR #1001
    ↓
Case #2001
```

A Case should not exist without a valid FIR reference unless a future business requirement explicitly allows standalone cases.

---

# 13. Crime Collection

Collection:

```text
crimes
```

Purpose:

Stores crime information used for case management and statistics.

---

## 13.1 Crime Fields

```text
Crime
├── _id
├── caseId
├── crimeType
├── category
├── description
├── location
├── area
├── incidentDate
├── reportedDate
├── recordedBy
├── isDeleted
├── createdAt
└── updatedAt
```

---

# 14. Crime → Case Relationship

Each operational Crime is associated with a Case:

```text
Crime.caseId → Case._id
```

The Case's assigned Officer determines the Officer's access scope.

Therefore, the Officer does not need an independent security relationship for every Crime.

---

# 15. Criminal Collection

Collection:

```text
criminals
```

Purpose:

Stores reusable criminal/person records.

---

## 15.1 Criminal Fields

```text
Criminal
├── _id
├── name
├── aliases[]
├── dateOfBirth
├── address
├── identification
├── status
├── notes
├── isDeleted
├── createdAt
└── updatedAt
```

---

# 16. Criminal Data Strategy

Criminals are global reusable entities.

Do NOT duplicate the same Criminal for every Case.

Bad:

```text
Case A → Criminal A copy
Case B → Criminal A copy
Case C → Criminal A copy
```

Preferred:

```text
             Criminal
                ↑
        ┌───────┼───────┐
        │       │       │
      Case A  Case B  Case C
```

---

# 17. Case → Criminal Relationship

A Case contains references:

```text
criminalIds[]
```

Example:

```text
Case #1001
criminalIds:
[
    Criminal A ID,
    Criminal B ID
]
```

This allows the same Criminal to be associated with multiple Cases.

---

# 18. Criminal Authorization & Global Search

Although Criminal records are globally reusable, Officer access must strictly respect Case ownership and privacy boundaries:

### 18.1 Global Criminal Search for Case Linking
An Officer may search the Global Criminal Registry (`GET /api/criminals?search=...`) to determine if a suspect already exists in the system before creating a duplicate record.

**Search exposes ONLY minimal identification information:**
* Name
* Aliases
* Date of birth / age
* Basic identification/reference information (e.g. ID numbers, reference marks)
* Status

**Search MUST NEVER expose:**
* Other Officers' FIR details
* Other Officers' Case details
* Investigation notes
* Evidence descriptions
* Case history timeline
* Private officer-specific notes
* Any other case-scoped information

### 18.2 Case-Scoped Criminal Access
* An Officer can view full case-specific criminal links, investigation notes, and history **only** for Cases assigned to that Officer.
* Linking a Criminal to a Case (`POST /api/cases/:caseId/criminals`) associates the existing global entity with the Officer's assigned Case without creating duplicate entity records.
* Authorization must be evaluated per requested resource.

---

# 19. Investigation Collection

Collection:

```text
investigations
```

Purpose:

Stores investigation activities performed for a Case.

---

## 19.1 Investigation Fields

```text
Investigation
├── _id
├── caseId
├── officerId
├── title
├── notes
├── evidenceDescription
├── investigationDate
├── createdAt
└── updatedAt
```

---

# 20. Investigation Access

Investigation access is derived from the Case.

```text
Investigation
     ↓
caseId
     ↓
Case
     ↓
assignedOfficerId
```

Therefore:

```text
Officer A
→ Case A
→ Investigation A
→ ALLOW
```

```text
Officer A
→ Case B
→ Investigation B
→ DENY
```

---

# 21. Case History Collection

Collection:

```text
case_histories
```

Purpose:

Tracks important Case lifecycle changes.

Example:

```text
Case #1001

OPEN
↓
UNDER_INVESTIGATION
↓
SOLVED
↓
CLOSED
```

---

## 21.1 Case History Fields

```text
CaseHistory
├── _id
├── caseId
├── changedBy
├── previousStatus
├── newStatus
├── note
└── createdAt
```

---

# 22. Action History Collection

Collection:

```text
action_histories
```

Purpose:

Supports undo/redo.

---

## 22.1 Action History Fields

```text
ActionHistory
├── _id
├── userId
├── actionType
├── entityType
├── entityId
├── beforeState
├── afterState
├── status
├── createdAt
└── updatedAt
```

---

## 22.2 Action Status

```text
ACTIVE
UNDONE
REDONE
```

---

# 23. Undo/Redo Data

Example:

```text
beforeState:
{
    status: "OPEN"
}

afterState:
{
    status: "UNDER_INVESTIGATION"
}
```

When Undo is performed:

```text
current state
      ↓
validate version/state
      ↓
restore beforeState
```

Undo must not bypass normal authorization.

---

# 24. Audit Log Collection

Collection:

```text
audit_logs
```

Purpose:

Stores important security/system activity.

---

## 24.1 Audit Log Fields

```text
AuditLog
├── _id
├── userId
├── role
├── action
├── entityType
├── entityId
├── oldValues
├── newValues
├── metadata
└── createdAt
```

---

# 25. Audit Log Examples

```text
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

# 26. Login Log Collection

Collection:

```text
login_logs
```

Purpose:

Tracks authentication events.

---

## 26.1 Login Log Fields

```text
LoginLog
├── _id
├── userId
├── event
├── ipAddress
├── userAgent
└── createdAt
```

---

# 27. Login Events

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
```

---

# 28. Feedback Collection

Collection:

```text
feedback
```

Purpose:

Stores feedback submitted through the application.

---

## 28.1 Feedback Fields

```text
Feedback
├── _id
├── userId
├── subject
├── message
├── status
├── adminResponse
├── createdAt
└── updatedAt
```

---

# 29. Feedback Status

```text
NEW
REVIEWED
RESOLVED
```

---

# 30. Relationship Diagram

```text
                         ┌─────────────┐
                         │    USER     │
                         └──────┬──────┘
                                │
                ┌───────────────┼────────────────┐
                │               │                │
                ▼               ▼                ▼
             created         assigned        supervises
                │               │                │
                ▼               ▼                ▼
              FIR              CASE           VIEWER
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
               CRIME        CRIMINAL      INVESTIGATION
                                ▲              │
                                │              │
                                └──── CASE ────┘

CASE
 │
 ├── CASE HISTORY
 │
 └── ACTION HISTORY

USER
 ├── AUDIT LOG
 ├── LOGIN LOG
 └── FEEDBACK
```

---

# 31. Important Reference Relationships

| Source        | Field               | Target   |
| ------------- | ------------------- | -------- |
| FIR           | createdBy           | User     |
| FIR           | assignedOfficerId   | User     |
| FIR           | caseId              | Case     |
| Case          | firId               | FIR      |
| Case          | assignedOfficerId   | User     |
| Case          | criminalIds[]       | Criminal |
| Crime         | caseId              | Case     |
| Investigation | caseId              | Case     |
| Investigation | officerId           | User     |
| CaseHistory   | caseId              | Case     |
| CaseHistory   | changedBy           | User     |
| ActionHistory | userId              | User     |
| AuditLog      | userId              | User     |
| LoginLog      | userId              | User     |
| Feedback      | userId              | User     |
| User          | supervisorOfficerId | User     |

---

# 32. Data Ownership Model

Ownership is primarily based on:

```text
assignedOfficerId
```

For Case:

```text
Case.assignedOfficerId
```

For FIR:

```text
FIR.assignedOfficerId
```

For Investigation:

```text
Investigation.caseId
→ Case.assignedOfficerId
```

For Crime:

```text
Crime.caseId
→ Case.assignedOfficerId
```

This prevents authorization logic from becoming unnecessarily duplicated.

---

# 33. Viewer Data Scope

Viewer:

```text
Viewer.supervisorOfficerId
```

determines the Viewer scope.

Conceptually:

```text
Viewer A
supervisorOfficerId → Officer A
```

Viewer A can access records belonging to Officer A's permitted scope.

Viewer A cannot access:

```text
Officer B's Cases
Officer B's FIRs
Officer B's Investigations
```

---

# 34. Admin Data Scope

Admin has global scope.

```text
Admin
 ↓
All permitted system collections
```

Admin can manage users, assignments, records, reports, logs, and feedback.

---

# 35. Soft Delete

Core operational collections should preferably support:

```text
isDeleted
```

Collections:

```text
firs
cases
crimes
criminals
```

Normal queries should use:

```text
isDeleted: false
```

Audit/history collections should generally not be deleted.

---

# 36. Timestamps

Operational collections should contain:

```text
createdAt
updatedAt
```

Mongoose timestamps can be used.

History/log collections generally require:

```text
createdAt
```

---

# 37. Unique Constraints

Recommended unique values:

```text
users.email
users.employeeId
firs.firNumber
cases.caseNumber
```

The exact uniqueness strategy should account for soft-deleted records.

---

# 38. Indexing Strategy

Indexes should be created for frequently searched fields.

Recommended initial indexes:

### Users

```text
email
role
supervisorOfficerId
```

### FIR

```text
firNumber
assignedOfficerId
caseId
createdAt
status
```

### Cases

```text
caseNumber
assignedOfficerId
firId
status
createdAt
```

### Crimes

```text
caseId
crimeType
category
area
incidentDate
```

### Criminals

```text
name
```

### Investigations

```text
caseId
officerId
investigationDate
```

### Logs

```text
userId
createdAt
```

Indexes should be added based on actual query patterns rather than indexing every field.

---

# 39. Search Strategy

Search must combine:

```text
Authorization scope
+
User filters
```

Example:

```text
Officer A
 ↓
GET /cases?status=OPEN&area=Ahmedabad
```

Backend conceptually performs:

```text
assignedOfficerId = Officer A
AND status = OPEN
AND area = Ahmedabad
AND isDeleted = false
```

---

# 40. Statistics Strategy

Statistics should use MongoDB aggregation pipelines.

Examples:

```text
Count cases by status
Count crimes by area
Count crimes by month
Count crimes by year
Count criminals
```

The aggregation must first apply the user's access scope.

---

# 41. Data Integrity Rules

The application must ensure:

1. Every Case references a valid FIR.
2. Every operational Case has an assigned Officer.
3. Investigation belongs to a valid Case.
4. Crime belongs to a valid Case.
5. Criminal references point to valid Criminal records.
6. Viewer must have a valid supervising Officer.
7. Viewer supervisor must have role `OFFICER`.
8. `closedAt` should be populated when a Case becomes CLOSED.
9. `closedAt` should normally be null for non-closed Cases.
10. Deleted records should not appear in normal operational queries.

---

# 42. Case Status Integrity

Recommended transitions:

```text
OPEN
 ↓
UNDER_INVESTIGATION
 ↓
SOLVED
 ↓
CLOSED
```

Invalid transitions should be rejected.

For example:

```text
CLOSED → UNDER_INVESTIGATION
```

should not happen unless a future `REOPENED` workflow is explicitly implemented.

---

# 43. Criminal Record Strategy

A Criminal should represent a person/entity, not a Case-specific copy.

Case-specific information should remain on the Case or an appropriate relationship/history record.

This prevents:

* Duplicate criminals
* Inconsistent criminal information
* Difficult reporting
* Data synchronization problems

---

# 44. Data Access Rules

## Admin

```text
Global read/write
```

subject to system safety rules.

## Officer

```text
Read/write:
Assigned/permitted scope
```

## Viewer

```text
Read:
Supervisor scope

Write:
None
```

---

# 45. Critical Authorization Queries

### Officer Case Access

```text
Case.findOne({
    _id: caseId,
    assignedOfficerId: req.user.id,
    isDeleted: false
})
```

### Officer FIR Access

```text
FIR.findOne({
    _id: firId,
    assignedOfficerId: req.user.id,
    isDeleted: false
})
```

### Viewer Case Access

Conceptually:

```text
Case
 ↓
assignedOfficerId
 ↓
Viewer.supervisorOfficerId
```

### Admin Access

Admin does not require an Officer ownership filter.

---

# 46. Important Security Rule

Never determine authorization by trusting client-supplied values.

For example, never trust:

```text
assignedOfficerId
```

sent from React simply because it looks valid.

The backend must determine whether the current user is permitted to assign/change it.

---

# 47. Case Assignment

Case assignment is primarily an Admin operation.

```text
Admin
 ↓
Select Case
 ↓
Select Officer
 ↓
Backend validates Officer
 ↓
Update assignedOfficerId
 ↓
Create AuditLog
```

An Officer cannot assign a Case to another Officer unless a future requirement explicitly permits it.

---

# 48. Viewer Assignment

Viewer assignment is an Admin operation.

```text
Admin
 ↓
Select Viewer
 ↓
Select Officer
 ↓
Validate Officer
 ↓
Update supervisorOfficerId
 ↓
Create AuditLog
```

Officer cannot reassign another Officer's Viewer.

---

# 49. Deletion Strategy

For core records:

```text
DELETE request
 ↓
Authorization
 ↓
Soft delete
 ↓
Audit log
```

For example:

```text
Case.isDeleted = true
```

rather than immediately removing the document.

Permanent deletion can be implemented later as an Admin-only maintenance operation if required.

---

# 50. Reporting Data

Reports should be generated from operational collections.

Examples:

### Crime Report

```text
crimes
→ cases
→ officers
```

### Criminal Report

```text
criminals
→ case relationships
```

### FIR Report

```text
firs
→ cases
```

### Case Status Report

```text
cases
→ status
```

### Date-wise Crime Report

```text
crimes
→ incidentDate
```

### Area-wise Crime Report

```text
crimes
→ area
```

---

# 51. Database Naming Convention

Use consistent naming.

Recommended:

```text
Collection:
plural lowercase

users
firs
cases
crimes
criminals
investigations
```

Mongoose model names can use singular PascalCase:

```text
User
FIR
Case
Crime
Criminal
Investigation
```

Fields should use:

```text
camelCase
```

Example:

```text
assignedOfficerId
createdAt
incidentDate
supervisorOfficerId
```

---

# 52. Data Model Philosophy

Prefer references for:

```text
User
FIR
Case
Crime
Criminal
```

Use separate collections for growing/repeating information:

```text
Investigation
CaseHistory
AuditLog
LoginLog
ActionHistory
```

Avoid excessive embedding of large arrays that could grow indefinitely.

---

# 53. Example Complete Case

Conceptually:

```text
CASE #C-1001
│
├── FIR #FIR-5001
│
├── Officer
│     └── Officer A
│
├── Crime
│     └── Robbery
│
├── Criminals
│     ├── Criminal A
│     └── Criminal B
│
├── Investigations
│     ├── Scene visited
│     ├── Witness interviewed
│     └── CCTV collected
│
├── Status
│     └── UNDER_INVESTIGATION
│
└── Case History
      ├── OPEN
      └── UNDER_INVESTIGATION
```

---

# 54. Database Rules to Keep Locked

The following decisions are considered locked for the current version:

```text
Database:
MongoDB

ODM:
Mongoose

Users:
Admin / Officer / Viewer

Viewer:
supervisorOfficerId

Case:
assignedOfficerId

FIR:
assignedOfficerId

Crime:
caseId

Investigation:
caseId

Case:
criminalIds[]

Criminal:
Reusable global entity

Case history:
Separate collection

Audit logs:
Separate collection

Login logs:
Separate collection

Undo/redo:
ActionHistory

Deletion:
Soft delete

Authorization:
Backend enforced

Officer access:
Assignment/ownership based

Viewer access:
Supervisor scope + read-only

Admin:
Global access
```

---

# 55. Database Design Principle

The database should support the application's security model without duplicating authorization information unnecessarily.

The primary ownership chain is:

```text
Officer
   ↓
Case
   ↓
Crime
   ↓
Investigation
```

and:

```text
Officer
   ↓
FIR
   ↓
Case
```

while Criminals remain reusable entities:

```text
Criminal
   ↑
   │
Multiple Cases
```

This structure keeps the system normalized enough for an intermediate MongoDB application while remaining practical to implement with Mongoose.
