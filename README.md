# EduPulse SMS — Enterprise Student Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Security Verified](https://img.shields.io/badge/Security-Hardened%20%26%20Audited-success.svg)]()
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passed-brightgreen.svg)]()

EduPulse SMS is an enterprise-grade Student Management System designed for colleges, universities, and academic institutions. Built on **React 18 + Vite**, **Node.js + Express**, and **Supabase PostgreSQL**, EduPulse delivers role-based dashboards, secure academic management, attendance tracking, examination grading, and comprehensive analytics.

---

## 🌟 Key Highlights

- **Multi-Role Dashboards:**
  - **Administrator:** Complete institutional governance over students, faculty, departments, courses, analytics, and academic reports.
  - **Faculty:** Dedicated portals for assigned course management, student directories, live attendance tracking, and examination mark entry with automated grading.
  - **Student:** Self-service portal for course schedules, attendance percentage tracking, transcript & grade reports, and personal profile updates.
- **Enterprise-Grade Security:**
  - Dual-client Supabase PostgreSQL architecture with strictly user-scoped queries enforcing database Row Level Security (RLS).
  - Multi-tier Role-Based Access Control (RBAC) preventing horizontal and vertical privilege escalation.
  - Persistent server-side token revocation storage (`backend/data/revoked_tokens.json`) ensuring logged-out tokens remain rejected across server restarts.
  - Sliding-window rate limiting protecting login and general API endpoints from brute force and denial of service attacks.
  - Zero-credential exposure policy: service keys, passwords, and database connection strings are never leaked in client responses.
- **High-Performance Architecture:**
  - Route-level code splitting using `React.lazy()` and `<Suspense>`, lowering initial JS load to just 260 kB.
  - Idempotent, non-destructive PostgreSQL migrations (`database/migrate.sql`) and declarative RLS security policies (`database/policies.sql`).

---

## 📂 Repository Structure

```
EduPulse-SMS/
├── backend/
│   ├── config/
│   │   └── supabase.js             # Dual-client architecture (user-scoped vs admin)
│   ├── controllers/
│   │   ├── authController.js       # Authentication, session invalidation, profile updates
│   │   ├── studentController.js    # Student registry CRUD, horizontal access boundaries
│   │   ├── facultyController.js    # Faculty lifecycle management
│   │   ├── courseController.js     # Academic course catalog & assignments
│   │   ├── departmentController.js # Department management
│   │   ├── attendanceController.js # Attendance logging with faculty assignment checks
│   │   ├── marksController.js      # Exam marks entry, auto-grading, student privacy
│   │   └── dashboardController.js  # Role-specific analytics and statistics
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification, persistent token revocation, active-checks
│   │   ├── rateLimiter.js          # Sliding-window rate limiters for auth and API
│   │   ├── validator.js            # Input validation and boundary enforcement
│   │   └── errorHandler.js         # Production error handling & leak prevention
│   ├── routes/                     # Express REST API routes
│   ├── data/                       # Persistent data storage (revoked_tokens.json)
│   ├── utils/                      # Helper utilities and grade calculation algorithms
│   ├── test-final-suite.js         # 20-Scenario Final Production Verification Suite
│   ├── test-security-phase3.js     # 16-Scenario Security Regression Suite
│   ├── test-controllers.js         # Controller unit & integration tests
│   ├── .env.example                # Safe environment variable template
│   ├── package.json
│   └── server.js                   # Application entry point & middleware mounting
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components (Navbar, Sidebar, Modals, Tables)
│   │   ├── context/                # AuthContext & global session management
│   │   ├── pages/                  # Route-split dashboards and views
│   │   ├── services/               # Axios API client services
│   │   ├── App.jsx                 # Lazy-loaded router with RBAC route protection
│   │   └── main.jsx
│   ├── .env.example                # Frontend environment template
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── migrate.sql                 # Non-destructive database migrations
│   ├── policies.sql                # Complete Row Level Security (RLS) policies
│   ├── schema.sql                  # Canonical 9-table schema definition
│   └── seed.sql                    # Initial seed data
│
├── FINAL_SECURITY_REPORT.md        # Comprehensive security audit & remediation report
├── FINAL_TEST_REPORT.md            # Complete 20-scenario test execution report
├── DEPLOYMENT_GUIDE.md             # Production deployment, cloud hosting, and backup guide
└── README.md                       # Main documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Supabase Account / PostgreSQL instance** (Optional for demo mode; built-in mock fallback operates without external setup)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials or use demo mode
npm run dev
```
*Backend runs on:* `http://localhost:5000`  
*API Healthcheck:* `http://localhost:5000/api/health`

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🧪 Automated Testing & Verification

Run the comprehensive test suites directly inside the `backend` directory:

```bash
cd backend

# Execute 20-Scenario Final Production Verification Suite
node test-final-suite.js

# Execute 16-Scenario Security & RLS Regression Suite
node test-security-phase3.js

# Execute Controller & Business Logic Integration Suite
node test-controllers.js
```

Verify Frontend Production Build:
```bash
cd frontend
npm run build
```

---

## 🔑 Default Demo Credentials

For evaluation and demonstration purposes, the application includes pre-configured demo accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@sms.edu` | `Admin@123` | Full institutional access |
| **Faculty** | `faculty@sms.edu` | `Faculty@123` | Assigned courses, attendance & marks |
| **Student** | `student@sms.edu` | `Student@123` | Self profile, enrolled courses & grades |

*(Note: In production environments, demo credentials and pre-filled inputs are disabled automatically outside DEV mode).*

---

## 📖 Documentation & Audits

- **[Security Audit Report (FINAL_SECURITY_REPORT.md)](./FINAL_SECURITY_REPORT.md)**: Detailed technical breakdown of all vulnerability fixes, token revocation strategies, and RLS enforcement.
- **[Automated Test Report (FINAL_TEST_REPORT.md)](./FINAL_TEST_REPORT.md)**: Complete 20-scenario test matrix, assertions, and build performance logs.
- **[Deployment Guide (DEPLOYMENT_GUIDE.md)](./DEPLOYMENT_GUIDE.md)**: Production deployment instructions for Ubuntu/Nginx, PM2, Docker, Vercel, and Supabase.

---

## 📄 License
This project is licensed under the MIT License.

