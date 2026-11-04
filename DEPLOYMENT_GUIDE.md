# EDUPULSE STUDENT MANAGEMENT SYSTEM (SMS)
## PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

This document provides complete instructions for configuring, migrating, securing, and deploying the EduPulse SMS application in cloud or on-premise environments.

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |       Client Browser        |
                      |   (React 18 + Vite SPA)     |
                      +--------------+--------------+
                                     |
                         HTTPS / TLS | Bearer JWT
                                     v
                      +-----------------------------+
                      |     Express.js API Layer    |
                      |  - Helmet & CORS            |
                      |  - Sliding-Window Rate Limiter
                      |  - JWT Auth & Revocation    |
                      |  - Server-Side RBAC Guards  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               | User Scoped Client  | Admin Service Client|
               | (auth.uid() scoped) | (Admin operations)  |
               v                     v                     v
+-------------------------------------------------------------------+
|                     Supabase PostgreSQL Engine                    |
|   - 9 Core Relational Tables                                      |
|   - Row Level Security (RLS) Policies on all tables               |
|   - Triggers for Profile Creation & Updated Timestamps            |
+-------------------------------------------------------------------+
```

---

## 2. Environment Variables Specification

### Backend Configuration (`backend/.env`)

Create `backend/.env` based on `backend/.env.example`:

```ini
# Server Port & Runtime Environment
PORT=5000
NODE_ENV=production

# Supabase API Connection
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-public-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-private-service-role-key>

# Database Direct Connection (For migrations and pooling)
DATABASE_URL=postgresql://postgres:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres

# Security & CORS Settings
CORS_ORIGIN=https://sms.yourinstitution.edu
JWT_SECRET=<optional-custom-jwt-secret>
```

> [!CAUTION]
> Never commit `backend/.env` or expose `SUPABASE_SERVICE_ROLE_KEY` to the client-side bundle or Git repositories.

### Frontend Configuration (`frontend/.env`)

Create `frontend/.env` based on `frontend/.env.example`:

```ini
# Backend API Base URL
VITE_API_BASE_URL=https://api.sms.yourinstitution.edu/api

# Supabase Client Settings (Anon key only)
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-public-anon-key>
```

---

## 3. Database Migration & RLS Execution Order

Execute the SQL scripts in the `database/` directory in the following sequence via the Supabase SQL Editor or `psql`:

### Step 1: Base Schema Migration (`database/migrate.sql`)
Ensures tables exist and adds any missing columns non-destructively:
```sql
-- Run database/migrate.sql in Supabase SQL editor
-- Creates tables: profiles, departments, faculty, students, courses,
-- enrollments, attendance, examinations, marks
```

### Step 2: Row Level Security Hardening (`database/policies.sql`)
Applies idempotent RLS policies across all 9 tables:
```sql
-- Run database/policies.sql
-- Enables RLS on all 9 tables and creates granular SELECT/INSERT/UPDATE/DELETE policies
```

### Step 3: Seed Reference Data (`database/seed.sql` - Optional)
Seeds initial administrative accounts and foundational academic departments.

---

## 4. Production Deployment Procedures

### Option A: Standard VPS Deployment (Ubuntu / Debian / CentOS)

1. **Install Prerequisites:**
   ```bash
   sudo apt update && sudo apt install -y nodejs npm nginx git
   ```

2. **Deploy Backend with PM2:**
   ```bash
   cd /var/www/edupulse/backend
   npm install --production
   pm2 start server.js --name edupulse-api -i max
   pm2 save && pm2 startup
   ```

3. **Build & Host Frontend with Nginx:**
   ```bash
   cd /var/www/edupulse/frontend
   npm install
   npm run build
   # Copy dist contents to web server root
   sudo cp -r dist/* /var/www/html/edupulse/
   ```

4. **Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/edupulse`):**
   ```nginx
   server {
       listen 80;
       server_name sms.yourinstitution.edu;

       # Frontend SPA routing
       location / {
           root /var/www/html/edupulse;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API proxy
       location /api/ {
           proxy_pass http://localhost:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

### Option B: Cloud Hosting (Vercel Frontend + Render/Railway Backend)

1. **Frontend on Vercel:**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL` pointing to backend domain.

2. **Backend on Render / Railway:**
   - Root directory: `backend`
   - Start command: `node server.js`
   - Configure environment variables from `backend/.env`.

---

## 5. Security Checklist Before Going Live

- [ ] All `.env` files populated with live, rotated keys and excluded from version control.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is present only on backend server environment.
- [ ] Database RLS is enabled and verified on all 9 tables in the Supabase Dashboard.
- [ ] CORS is restricted to your production domain (`CORS_ORIGIN=https://sms.yourinstitution.edu`).
- [ ] HTTPS certificates (Let's Encrypt / SSL) are active for both frontend and backend.
- [ ] Automated regression tests pass cleanly (`npm test` in `backend/`).
- [ ] Persistent revocation file path (`backend/data/revoked_tokens.json`) has write permissions.

---

## 6. Disaster Recovery & Backup Plan

1. **Database Backups:**
   - Enable Daily Automated Backups in Supabase project settings.
   - For point-in-time recovery, execute manual backups prior to major semester rollouts:
     ```bash
     pg_dump "postgresql://postgres:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" > edupulse_backup_$(date +%Y%m%d).sql
     ```
2. **Storage and Tokens:**
   - Back up `backend/data/revoked_tokens.json` to preserve active session blacklist states.
3. **Rollback Procedure:**
   - Restore database dump:
     ```bash
     psql "postgresql://postgres:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" < edupulse_backup_YYYYMMDD.sql
     ```

