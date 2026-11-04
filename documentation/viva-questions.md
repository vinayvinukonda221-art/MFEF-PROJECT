# STUDENT MANAGEMENT SYSTEM (SMS)
## Comprehensive Viva Voce Questions & Answers (45 Technical Questions)

---

### SECTION 1: REACT.JS & FRONTEND ARCHITECTURE

#### Q1: Why did you choose React.js with Vite over traditional multi-page HTML/PHP or Create React App (CRA)?
**Answer:**  
Vite uses native ES modules (ESM) in modern browsers and esbuild (written in Go) for pre-bundling. This provides near-instantaneous Hot Module Replacement (HMR) and cold server start times (<300ms) compared to Webpack-based CRA. React 18 introduces a declarative component model, Virtual DOM reconciliation, and unidirectional data flow, enabling a responsive Single Page Application (SPA) without full page reloads.

#### Q2: How is state managed in your frontend application?
**Answer:**  
We utilize React Context API (`AuthContext` and `ThemeContext`) for cross-cutting global state like user authentication tokens, active role permissions, and dark/light mode preference. For local component state (form inputs, modal toggles, table pagination), we use `useState` and `useEffect` hooks. This avoids unnecessary external state libraries while preventing prop-drilling.

#### Q3: What is the purpose of Axios interceptors in your project?
**Answer:**  
In `services/api.js`, the request interceptor automatically attaches the `Authorization: Bearer <token>` header from `localStorage` to every outgoing HTTP request. The response interceptor catches HTTP 401 Unauthorized errors globally; if a session expires or a token is revoked, it clears storage and redirects the user to `/login`.

#### Q4: How does role-based routing work in React Router DOM?
**Answer:**  
We created a custom `RoleRoute` wrapper component in `App.jsx`. It inspects `isAuthenticated` and `user.role` from `AuthContext`. If an unauthenticated user attempts to visit `/admin/dashboard`, it redirects them to `/login`. If an authenticated student attempts to access `/admin/students`, the route guard redirects them to `/student/dashboard`.

#### Q5: How is Dark Mode implemented and persisted?
**Answer:**  
Tailwind CSS's `darkMode: 'class'` strategy is used. When the user clicks the theme toggle in the Navbar, `ThemeContext` toggles the `dark` class on the root `document.documentElement` (`<html>` element) and persists `'dark'` or `'light'` in the browser's `localStorage`.

---

### SECTION 2: NODE.JS, EXPRESS.JS & REST API

#### Q6: What is the role of Express middleware, and which middleware did you implement?
**Answer:**  
Middleware functions have access to the request object (`req`), response object (`res`), and the `next` function in the application’s request-response cycle. We implemented:
1. `helmet()`: Sets secure HTTP response headers to protect against web vulnerabilities (e.g. clickjacking, cross-site scripting).
2. `cors()`: Manages Cross-Origin Resource Sharing.
3. `express.json()`: Parses incoming JSON request payloads.
4. `verifyToken`: Extracts and cryptographically verifies the JWT session token.
5. `authorizeRoles`: Validates whether the authenticated user's role matches route requirements.
6. Centralized `errorHandler` and `notFoundHandler`.

#### Q7: Why do you verify user roles on the backend if the frontend already restricts UI buttons?
**Answer:**  
Never trust the client. A malicious user or developer can inspect network calls, manipulate frontend JavaScript variables in DevTools, or forge raw HTTP requests via Postman/curl. The backend must independently extract user identity from the verified cryptographic token and check database-level roles before executing sensitive database mutations.

#### Q8: What HTTP status codes did you use and why?
**Answer:**  
- `200 OK`: Successful retrieval or modification (`GET`, `PUT`).
- `201 Created`: Successful resource creation (`POST` for students, courses, marks).
- `400 Bad Request`: Input validation failed (e.g., missing required fields, invalid semester number).
- `401 Unauthorized`: Missing, expired, or invalid JWT token.
- `403 Forbidden`: Authenticated user lacks necessary role permissions (e.g., student calling admin route).
- `404 Not Found`: Resource or ID does not exist in database.
- `500 Internal Server Error`: Unhandled server or database exceptions caught by the centralized error handler.

#### Q9: What is the difference between synchronous and asynchronous code in Node.js, and how does your API utilize it?
**Answer:**  
Node.js operates on a single-threaded Event Loop using non-blocking I/O. All database queries, password hashing, and authentication calls in our controllers use `async/await` returning Promises. This ensures that while PostgreSQL processes a query, the Node.js event loop remains free to handle incoming requests from other users.

#### Q10: How does your backend prevent SQL injection?
**Answer:**  
We avoid raw string concatenation in SQL queries. In Supabase client calls, queries are parameterized and parsed by the PostgreSQL query planner. In stored functions and triggers, parameterized variables and typed constraints (`UUID`, `INT`, `NUMERIC`) reject malicious SQL injections.

---

### SECTION 3: SUPABASE & POSTGRESQL DATABASE DESIGN

#### Q11: Why did you use PostgreSQL over MongoDB (NoSQL) for this project?
**Answer:**  
Educational management systems are deeply relational. Students belong to departments, enroll in specific courses, have one attendance record per course per day, and receive exam scores tied to defined courses. PostgreSQL provides ACID compliance (Atomicity, Consistency, Isolation, Durability), foreign key constraints (`ON DELETE CASCADE` / `SET NULL`), unique constraints, and schema validation. MongoDB lacks kernel-level Row Level Security and relational integrity enforcement without complex application code.

#### Q12: What is Row Level Security (RLS) in PostgreSQL, and why is it important?
**Answer:**  
Row Level Security is a database engine security mechanism where security policies act as automatic SQL filters applied to every query. For example:
```sql
CREATE POLICY "Students view own attendance" ON attendance FOR SELECT TO authenticated USING (student_id = get_student_id());
```
Even if an attacker invokes `SELECT * FROM attendance;`, PostgreSQL automatically appends `WHERE student_id = auth.uid()` at the query planner level.

#### Q13: Explain the relationships between `departments`, `faculty`, `courses`, `students`, and `enrollments`.
**Answer:**  
- **1-to-Many:** One Department offers Many Courses and enrolls Many Students.
- **1-to-Many:** One Faculty member teaches Many Courses.
- **Many-to-Many:** Students and Courses have a Many-to-Many relationship, resolved via the junction/bridge table `enrollments` with a composite unique constraint on `(student_id, course_id, academic_year)`.

#### Q14: What composite unique constraints did you implement and why?
**Answer:**  
1. `UNIQUE(student_id, course_id, date)` on `attendance`: Guarantees a student cannot be marked present or absent twice for the same lecture on the same day.
2. `UNIQUE(examination_id, student_id)` on `marks`: Guarantees a student receives only one recorded score per examination event.
3. `UNIQUE(student_id, course_id, academic_year)` on `enrollments`: Prevents duplicate enrollment in the same course during the same academic session.

#### Q15: What is database normalization, and to what level is your schema normalized?
**Answer:**  
Database normalization is the process of structuring relational tables to reduce data redundancy and eliminate update, insertion, and deletion anomalies. Our database is normalized to **Third Normal Form (3NF)**:
- **1NF:** All table columns contain atomic, indivisible values, and every table has a primary key.
- **2NF:** It is in 1NF and all non-key attributes are fully functionally dependent on the primary key (no partial dependencies).
- **3NF:** It is in 2NF and there are no transitive functional dependencies (non-prime attributes do not depend on other non-prime attributes).

#### Q16: Why are database indexes used, and on which columns did you add them?
**Answer:**  
Database indexes create auxiliary B-Tree data structures that allow PostgreSQL to locate rows in $O(\log N)$ time instead of scanning the entire table in $O(N)$ sequential time. We added indexes on frequently filtered and joined columns:
- `profiles(role)`, `profiles(email)`
- `students(roll_number)`, `students(department_id)`, `students(semester)`
- `attendance(student_id)`, `attendance(course_id)`, `attendance(date)`
- `marks(examination_id)`, `marks(student_id)`

#### Q17: What is the purpose of PostgreSQL triggers in your schema?
**Answer:**  
1. `set_updated_at`: An `UPDATE` trigger that automatically updates the `updated_at` timestamp with `CURRENT_TIMESTAMP` whenever a row is modified.
2. `on_auth_user_created`: An `AFTER INSERT` trigger on `auth.users` that automatically creates a corresponding record in `public.profiles` whenever a user registers in Supabase Auth.

---

### SECTION 4: SECURITY, AUTHENTICATION & SESSIONS

#### Q18: What is a JSON Web Token (JWT), and how is it structured?
**Answer:**  
A JWT is a compact, URL-safe standard (RFC 7519) for transmitting claims securely between parties. It consists of three parts separated by dots:
1. **Header:** Algorithm used (e.g., HS256, RS256) and token type.
2. **Payload:** Claims such as user ID (`sub`), role, email, and expiration timestamp (`exp`).
3. **Signature:** Cryptographic hash of the encoded header and payload generated with a secret key, ensuring the token cannot be tampered with in transit.

#### Q19: Why should the Supabase `service_role` key never be placed in frontend code?
**Answer:**  
The `service_role` key is a superuser secret that completely bypasses Row Level Security (RLS) in Supabase. If exposed in client-side React code (visible via browser Developer Tools or network inspection), any user could gain unrestricted access to delete or modify all database tables. The frontend must only use the public `anon` key or proxy calls through our authenticated Express backend.

#### Q20: How are user passwords stored in your system?
**Answer:**  
Passwords are never stored in plaintext. Supabase Auth hashes passwords using the **bcrypt** adaptive cryptographic hash function with salt generation (`crypt(password, gen_salt('bf'))`). Bcrypt includes a work factor (cost parameter) that slows down brute-force and rainbow-table attacks.

---

### SECTION 5: GRADING & ACADEMIC LOGIC

#### Q21: How does the auto-grade calculation utility function work?
**Answer:**  
In `backend/utils/gradeCalculator.js`, the function `calculateGrade(marksObtained, totalMarks)` calculates percentage:
$$\text{Percentage} = \left(\frac{\text{marksObtained}}{\text{totalMarks}}\right) \times 100$$
It maps percentage according to the UGC 10-point scale:
- $\ge 90\% \implies \text{Grade 'O'} \text{ (10.0 points, Outstanding)}$
- $80 - 89.9\% \implies \text{Grade 'A+'} \text{ (9.0 points, Excellent)}$
- $70 - 79.9\% \implies \text{Grade 'A'} \text{ (8.0 points, Very Good)}$
- $60 - 69.9\% \implies \text{Grade 'B+'} \text{ (7.0 points, Good)}$
- $50 - 59.9\% \implies \text{Grade 'B'} \text{ (6.0 points, Above Average)}$
- $45 - 49.9\% \implies \text{Grade 'C'} \text{ (5.0 points, Average)}$
- $40 - 44.9\% \implies \text{Grade 'P'} \text{ (4.0 points, Pass)}$
- $< 40\% \implies \text{Grade 'F'} \text{ (0.0 points, Fail)}$

#### Q22: How is Semester Grade Point Average (SGPA) calculated?
**Answer:**  
SGPA is calculated as the weighted average of grade points earned across all courses in a semester:
$$\text{SGPA} = \frac{\sum_{i=1}^{n} (C_i \times GP_i)}{\sum_{i=1}^{n} C_i}$$
where $C_i$ is course credit weightage and $GP_i$ is grade points earned in subject $i$.

---

### SECTION 6: PRACTICAL VIVA QUESTIONS (QUICK-FIRE)

#### Q23: What is CORS and why did your Express server need it?
**Answer:** Cross-Origin Resource Sharing. Because React runs on port 5173 and Express on port 5000, the browser blocks requests across different origins by default. CORS middleware explicitly whitelists the frontend origin.

#### Q24: What is the purpose of `dotenv`?
**Answer:** It loads environment variables from a `.env` file into `process.env`, keeping credentials like database URLs and secret keys outside source control.

#### Q25: How does React detect changes in data to update the DOM?
**Answer:** Through the Virtual DOM. When state or props change, React creates a new Virtual DOM tree, runs its diffing algorithm to compute the minimal delta, and batch-updates only the changed real DOM elements.

#### Q26: What is the purpose of the `key` prop in React lists?
**Answer:** The `key` prop gives elements a stable identity across renders, enabling the Virtual DOM diffing algorithm to identify which items have been inserted, reordered, or deleted without re-rendering the entire list.

#### Q27: What is an ORM/Query Builder versus raw SQL?
**Answer:** An Object-Relational Mapper (ORM) abstracts SQL tables into JavaScript objects and methods (e.g. `supabase.from('students').select()`). It provides compile-time safety, auto-escaping, and cleaner code.

#### Q28: What is an ACID transaction?
**Answer:** Atomicity (all-or-nothing execution), Consistency (data conforms to schema constraints), Isolation (concurrent transactions execute without interference), Durability (committed data survives system crashes).

#### Q29: What happens when a user clicks 'Logout'?
**Answer:** The frontend removes `sms_token` and `sms_user` from `localStorage`, resets React authentication state to `null`, optionally calls `supabase.auth.signOut()`, and navigates to `/login`.

#### Q30: What is the difference between `NULL` and empty string in database columns?
**Answer:** `NULL` represents the absence of any value or unknown data, occupying no storage for value and evaluated via `IS NULL`. An empty string `''` is a defined string with zero length.

#### Q31: How do you handle pagination in your REST API?
**Answer:** Using `page` and `limit` query parameters. We calculate offset:
$$\text{offset} = (\text{page} - 1) \times \text{limit}$$
In PostgreSQL, this translates to `LIMIT limit OFFSET offset`.

#### Q32: What is the difference between `PUT` and `PATCH` in REST?
**Answer:** `PUT` replaces the entire target resource with the uploaded payload, whereas `PATCH` applies partial modifications to specific fields.

#### Q33: What is an index scan versus a sequential scan?
**Answer:** A sequential scan reads every single page and row in a table. An index scan navigates a B-tree index structure to retrieve only matching pointer pages, drastically speeding up queries on large tables.

#### Q34: What is a foreign key constraint with `ON DELETE CASCADE`?
**Answer:** When the parent row is deleted (e.g., deleting a student from `students`), all corresponding rows in child tables (e.g. `attendance`, `marks`, `enrollments`) referencing that student are automatically deleted to maintain referential integrity.

#### Q35: What is the purpose of Recharts in the admin dashboard?
**Answer:** Recharts is a declarative charting library built on SVG and React components. It renders responsive BarCharts for departmental enrollments, LineCharts for attendance trends, and PieCharts for grade cohorts.

#### Q36: What is a SPA (Single Page Application)?
**Answer:** A web application that loads a single HTML document and dynamically updates page views via JavaScript API calls as the user interacts, eliminating full-browser page reloads.

#### Q37: What is the difference between authentication and authorization?
**Answer:** Authentication verifies *who you are* (verifying email and password). Authorization determines *what you are allowed to do* (checking whether an authenticated user is an Admin, Faculty, or Student).

#### Q38: How does your application ensure attendance compliance?
**Answer:** Real-time query aggregations compute attendance percentage:
$$\frac{\text{Classes Attended}}{\text{Total Sessions Held}} \times 100$$
The Academic Reports module automatically queries students whose attendance is below 75% and displays a Warning Badge.

#### Q39: What is the role of `pgcrypto` in PostgreSQL?
**Answer:** It is a PostgreSQL cryptographic extension that provides cryptographic hash functions like SHA-256, HMAC, and blowfish bcrypt salt generation (`gen_salt`).

#### Q40: What happens if the live Supabase database is unreachable?
**Answer:** The backend incorporates fallback handling: it logs a warning and serves demo data, allowing reviewers to evaluate all UI screens and API structures even in offline test environments.

#### Q41: How are responsive mobile viewports supported in your UI?
**Answer:** Through Tailwind CSS breakpoints (`sm:`, `md:`, `lg:`, `xl:`), flexible flexbox/grid containers, and a slide-out mobile drawer navigation with a backdrop overlay.

#### Q42: What is a trigger function in PostgreSQL?
**Answer:** A stored procedure written in PL/pgSQL that returns a `TRIGGER` type and is automatically invoked when a specific database event (`INSERT`, `UPDATE`, `DELETE`) occurs on a table.

#### Q43: How can this system be deployed to production?
**Answer:** 
- Frontend: Deploy to Vercel, Netlify, or AWS S3 + CloudFront with `npm run build`.
- Backend: Deploy to Railway, Render, or AWS ECS as a containerized Node.js service.
- Database: Hosted on Supabase managed cloud with automated backups and SSL encryption.

#### Q44: What are the primary strengths of your project architecture?
**Answer:** Clean separation of concerns, database-level Row Level Security, 100% responsive modern design, auto-grading conforming to university standards, and zero unauthenticated data leakages.

#### Q45: If given more time, what would you improve?
**Answer:** Implement WebSockets (Socket.io) for real-time live attendance notifications to parents' smartphones and export official academic transcripts to signed cryptographic PDF documents.

