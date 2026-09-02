# 🛡️ CrimeTrack — Police Crime & Case Management System

An institutional-grade, privacy-preserving **Police Crime & Case Management System (MERN Stack)** built for law enforcement precincts and command centers.

---

## ⚡ Quick Start Guide (Run on Any Laptop)

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **MongoDB**: Local Community Server running on `127.0.0.1:27017` or MongoDB Atlas URI ([Download MongoDB](https://www.mongodb.com/try/download/community))
* **npm**: v9.0.0 or higher

---

### 2. Backend Setup (`server/`)

Open a terminal window:
```bash
cd server
npm install
```

#### Environment Variables
Verify or create `server/.env` (a `.env.example` is provided):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/crimetrack
JWT_SECRET=CrimeTrack_Super_Secret_JWT_Key_2026_Institutional_Police_Suite_987654321
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Seed Initial / Demo Police Data
Run the comprehensive moderate data seeder to immediately populate sample FIRs, cases, criminals, and investigation entries:
```bash
npm run seed
```

#### Start Backend Server
```bash
npm start
```
> Backend API will run on `http://localhost:5000`

---

### 3. Frontend Setup (`client/`)

Open a second terminal window:
```bash
cd client
npm install
npm run dev
```
> Frontend Application will open on `http://localhost:5173`

---

## 🔑 Demo Login Credentials

You can log in at [`http://localhost:5173/login`](http://localhost:5173/login) using any of these roles:

| Role | Officer / Personnel Name | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** | Chief Commissioner Alok Deshmukh | `admin@crimetrack.gov` | `Admin@123` | Full station command, User Provisioning, Global Audit Logs, Disaster Recovery Undo, QA Test Console, and Feedback Triage. |
| **`OFFICER`** | Senior Inspector Rajesh Sharma | `officer.sharma@crimetrack.gov` | `Officer@123` | Crime Branch Unit 1: FIR registration, case lifecycle management, investigation diaries, and evidence lockers. |
| **`OFFICER`** | Sub-Inspector Priya Patel | `officer.patel@crimetrack.gov` | `Officer@123` | Cyber Crime Investigation Cell: Wire fraud, phishing forensics, and digital evidence logs. |
| **`OFFICER`** | Inspector Amit Verma | `officer.verma@crimetrack.gov` | `Officer@123` | Anti-Narcotics Division: Contraband seizures and homicide cases. |
| **`VIEWER`** | Desk Operator Sunita Rao | `viewer.desk@crimetrack.gov` | `Viewer@123` | Station Helpdesk: Read-only access scoped to Inspector Sharma's cases. |
| **`VIEWER`** | Records Clerk Manoj Gupta | `viewer.clerk@crimetrack.gov` | `Viewer@123` | Central Archives: Read-only access scoped to Sub-Inspector Patel's cases. |

---

## 🧪 Automated Testing & Diagnostics

To run the full end-to-end integration test suite (34 automated assertions):
```bash
cd server
npm test
```
Or use the in-app **System Diagnostics Console** available under the Admin dashboard (`/qa`).

---

## 🏛️ System Features & Subsystems

1. **Station Command Overview**: Real-time server and database health telemetry.
2. **User Management**: Admin provisioning of Officers and Viewers with supervisor assignment.
3. **FIR Management**: Sequential `FIR-YYYY-XXXX` auto-numbering, complaint filing, and printable official police sheets.
4. **Case Registry**: Case lifecycle stages (`OPEN` $\rightarrow$ `UNDER_INVESTIGATION` $\rightarrow$ `SOLVED` / `CLOSED`), priority management, and reassignment.
5. **Privacy Criminal Directory**: Reusable master identities with strict minimal privacy lookups.
6. **Investigation Journals**: Chronological diary entries, 5-stage progress meter, and multi-format evidence lockers (`DOCUMENT`, `IMAGE`, `PHYSICAL`, `DIGITAL`, `WEAPON`).
7. **Analytics & Metrics**: Real-time KPI counts, crime distributions, pipeline funnels, and trend charts.
8. **Global Omni-Search**: High-velocity cross-entity search across FIRs, Cases, Crimes, Criminals, and Investigations.
9. **Reports & Exports**: Filtered CSV data streaming (`text/csv`), JSON exports, and printable police report sheets.
10. **Audit Logs & Security Trails**: Immutable mutation logs with side-by-side visual diff inspector (`oldValues` vs `newValues`).
11. **Disaster Recovery & Undo**: State-aware rollback engine restoring historical field snapshots and soft-deleted records.
12. **Feedback Hub**: In-app feedback reporting, 5-star ratings, and official Admin triage responses.
13. **System Diagnostics**: Live end-to-end automated test runner.

---

## 📂 Project Architecture

```
CrimeTrack/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Sidebar, Navbar, Modals)
│   │   ├── context/            # AuthContext & Session management
│   │   ├── pages/              # Role-specific and operational views
│   │   ├── routes/             # Protected and Role-scoped router
│   │   └── services/           # Axios API service clients
│   └── package.json
│
├── server/                     # Backend API Server (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/             # Database and environment configurations
│   │   ├── controllers/        # REST API controllers
│   │   ├── middleware/         # Auth, RBAC, and error middlewares
│   │   ├── models/             # Mongoose Schemas (User, FIR, Case, Crime, Criminal, etc.)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic & Database operations
│   │   └── utils/              # Seeder scripts and response helpers
│   ├── tests/                  # End-to-end automated test runner
│   └── package.json
└── README.md
```
