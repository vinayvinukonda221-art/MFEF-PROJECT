# 🚀 EduPulse Student Management System — Setup & Execution Guide

This guide provides step-by-step instructions for configuring, migrating, testing, and running the **EduPulse SMS** full-stack application.

---

## 1. System Requirements

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Database:** Supabase PostgreSQL instance (or local PostgreSQL)
- **Web Browser:** Modern browser (Chrome, Firefox, Edge, Safari)

---

## 2. Project Directory Layout

```
EduPulse-SMS/
├── backend/
│   ├── config/            # Supabase dual-client and PostgreSQL pool
│   ├── controllers/       # Feature controllers with record-level security
│   ├── middleware/        # JWT verify, RBAC, input validation, error handling
│   ├── routes/            # Express feature routers
│   ├── utils/             # Grade calculator, mock data fallback
│   ├── test-security-phase3.js  # 16-scenario security test suite
│   ├── test-controllers.js      # 8 controller integration tests
│   ├── server.js          # Express application entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # Lazy-loaded Admin, Faculty, and Student dashboards
│   │   ├── components/    # Navigation, DataTables, Modals, StatCards
│   │   ├── context/       # AuthContext and ThemeContext
│   │   ├── services/      # Axios API service client
│   │   ├── App.jsx        # Route definitions with Suspense code-splitting
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── database/
│   ├── schema.sql         # Base database schema definition
│   ├── migrate.sql        # Safe, non-destructive migration script
│   ├── policies.sql       # Hardened Row Level Security (RLS) policies
│   └── seed.sql           # Initial institutional reference data
├── documentation/         # College project report, PPT, and viva questions
├── PHASE3_1_SECURITY_FIX_REPORT.md
└── README.md
```

---

## 3. Environment Configuration

### Backend Configuration
Create `backend/.env` based on `backend/.env.example`:
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase Credentials (Found in Supabase Dashboard -> Settings -> API)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Direct PostgreSQL Pooler URI (For running migrations and schema scripts)
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
```

### Frontend Configuration
Create `frontend/.env` based on `frontend/.env.example`:
```ini
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="EduPulse Student Management System"
```

---

## 4. Database Setup & RLS Migration

To apply safe, non-destructive migrations to your Supabase PostgreSQL database:

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** -> Select your project.
2. Navigate to **SQL Editor**.
3. Open and run [`database/migrate.sql`](file:///c:/MFEF%20PROJECT/database/migrate.sql) to apply tables, indexes, and triggers non-destructively.
4. Open and run [`database/policies.sql`](file:///c:/MFEF%20PROJECT/database/policies.sql) to activate hardened Row Level Security.
5. (Optional) Run [`database/seed.sql`](file:///c:/MFEF%20PROJECT/database/seed.sql) to populate initial departments and courses.

---

## 5. Dependency Installation

### Install Backend Dependencies:
```bash
cd backend
npm install
```

### Install Frontend Dependencies:
```bash
cd frontend
npm install
```

---

## 6. Running Automated Tests

Run the comprehensive test suites directly from the terminal:

### A. Run 16-Scenario Security & RLS Test Suite:
```bash
cd backend
node test-security-phase3.js
```
*Expected: 16/16 PASSED (checks token revocation, inactive accounts, student record isolation, faculty course boundaries, and privilege escalation prevention).*

### B. Run Controller Integration Test Suite:
```bash
cd backend
node test-controllers.js
```
*Expected: 8/8 PASSED (verifies authentication, dashboard statistics, student CRUD, marks calculation, and reports).*

### C. Verify Production Frontend Build:
```bash
cd frontend
npm run build
```
*Expected: Built in ~9s with zero chunk warnings and optimized lazy-loaded routes.*

---

## 7. Starting the Application

### Start the Backend API Server:
```bash
cd backend
node server.js
```
- API Base URL: **`http://localhost:5000/api`**
- Healthcheck: **`http://localhost:5000/api/health`**

### Start the Frontend Client:
```bash
cd frontend
npm run dev
```
- Web Application: **`http://localhost:5173`**

---

## 8. Role-Based Login Credentials (Development)

| Role | Email | Password | Allowed Capabilities |
|:---|:---|:---|:---|
| **Administrator** | `admin@sms.edu` | `Admin@123` | Institutional analytics, student CRUD, faculty management, course & department governance, reports |
| **Faculty** | `faculty@sms.edu` | `Faculty@123` | Assigned courses, attendance recording, examination marks entry, student performance |
| **Student** | `student@sms.edu` | `Student@123` | Personal profile, attendance record, examination grades, course enrollment |

*(In development mode, one-click quick login buttons are accessible directly on the login screen).*

