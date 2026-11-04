/**
 * run-seed.js  — matches the EXACT schema.sql column names
 * Usage: node scripts/run-seed.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

const q = async (sql, params = []) => {
  const c = await pool.connect();
  try { return await c.query(sql, params); }
  finally { c.release(); }
};

/* ─────────────────────────── helpers ─────────────────────────── */
const grade = (score, max) => {
  const p = (score / max) * 100;
  if (p >= 90) return ['O', 9.99];  // NUMERIC(3,2) max = 9.99; O-grade = 10 displayed in app
  if (p >= 80) return ['A+', 9.00];
  if (p >= 70) return ['A', 8.00];
  if (p >= 60) return ['B+', 7.00];
  if (p >= 50) return ['B', 6.00];
  if (p >= 40) return ['C', 5.00];
  return ['F', 0.00];
};

const pastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

/* ═══════════════════════════ MAIN ════════════════════════════════ */
async function seed() {
  console.log('🌱 Starting database seed (schema-matched)...\n');

  /* ── 1. Departments ──────────────────────────────────────────── */
  console.log('1️⃣  Departments...');
  const deptRows = [
    ['CSE', 'Computer Science Engineering', 'Dr. Rajesh Kumar'],
    ['ECE', 'Electronics & Communication', 'Dr. Priya Sharma'],
    ['ME', 'Mechanical Engineering', 'Dr. Anil Verma'],
    ['CE', 'Civil Engineering', 'Dr. Sunita Patel'],
    ['IT', 'Information Technology', 'Dr. Meera Nair'],
  ];
  const deptId = {};
  for (const [code, name, hod] of deptRows) {
    const r = await q(
      `INSERT INTO departments (code, name, head_of_department)
       VALUES ($1,$2,$3)
       ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name
       RETURNING id`,
      [code, name, hod]
    );
    deptId[code] = r.rows[0].id;
  }
  console.log(`   ✅ ${deptRows.length} departments`);

  /* ── 2. Profiles (non-auth — synthetic UUIDs) ────────────────── */
  // Real auth profiles are auto-created by handle_new_user() trigger.
  // We insert standalone profiles with synthetic IDs for demo data only.
  // profiles.id references auth.users(id), so we must bypass the FK.
  // We achieve this by temporarily disabling the FK or using a workaround.
  //
  // WORKAROUND: Insert profiles with IDs that DON'T reference auth.users
  // by using INSERT ... ON CONFLICT DO NOTHING with pre-generated UUIDs.
  // This works because Supabase's RLS is off during service-role seed.
  // If FK constraint fires, we wrap in a BEGIN ... SET session_replication_role='replica' ... COMMIT.

  console.log('2️⃣  Profiles (bypass auth FK for demo data)...');
  const IDs = {
    admin: randomUUID(),
    fac1: randomUUID(),
    fac2: randomUUID(),
    stu1: randomUUID(),
    stu2: randomUUID(),
    stu3: randomUUID(),
  };

  // Bypass FK constraint for seeding (session-level, reverts after session)
  await q(`SET session_replication_role = 'replica'`);

  const profRows = [
    [IDs.admin, 'admin@sms.edu', 'Admin User', 'admin'],
    [IDs.fac1, 'faculty@sms.edu', 'Dr. Amit Sharma', 'faculty'],
    [IDs.fac2, 'faculty2@sms.edu', 'Dr. Priya Patel', 'faculty'],
    [IDs.stu1, 'student@sms.edu', 'Rahul Verma', 'student'],
    [IDs.stu2, 'student2@sms.edu', 'Sneha Singh', 'student'],
    [IDs.stu3, 'student3@sms.edu', 'Arjun Kumar', 'student'],
  ];
  for (const [id, email, full_name, role] of profRows) {
    await q(
      `INSERT INTO profiles (id, email, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO NOTHING`,
      [id, email, full_name, role]
    );
  }

  // Restore FK checks
  await q(`SET session_replication_role = 'origin'`);
  console.log(`   ✅ ${profRows.length} profiles`);

  /* ── 3. Faculty ──────────────────────────────────────────────── */
  console.log('3️⃣  Faculty...');
  const facRows = [
    [IDs.fac1, 'FAC001', deptId['CSE'], 'Associate Professor', 'M.Tech, Ph.D'],
    [IDs.fac2, 'FAC002', deptId['ECE'], 'Assistant Professor', 'M.Tech'],
  ];
  const facId = {};
  for (const [pid, empId, did, desig, qual] of facRows) {
    const r = await q(
      `INSERT INTO faculty (profile_id, employee_id, department_id, designation, qualification)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (employee_id) DO UPDATE SET designation=EXCLUDED.designation
       RETURNING id`,
      [pid, empId, did, desig, qual]
    );
    facId[empId] = r.rows[0].id;
  }
  console.log(`   ✅ ${facRows.length} faculty`);

  /* ── 4. Courses ──────────────────────────────────────────────── */
  console.log('4️⃣  Courses...');
  const courseRows = [
    // [code, name, deptCode, credits, semester, is_elective, faculty_key]
    ['CS301', 'Data Structures & Algorithms', 'CSE', 4, 3, false, 'FAC001'],
    ['CS302', 'Database Management Systems', 'CSE', 4, 3, false, 'FAC001'],
    ['CS303', 'Operating Systems', 'CSE', 4, 3, false, 'FAC001'],
    ['CS401', 'Computer Networks', 'CSE', 4, 4, false, 'FAC001'],
    ['CS501', 'Machine Learning', 'CSE', 4, 5, true, 'FAC001'],
    ['EC301', 'Signals & Systems', 'ECE', 4, 3, false, 'FAC002'],
    ['EC302', 'Digital Electronics', 'ECE', 4, 3, false, 'FAC002'],
    ['ME301', 'Thermodynamics', 'ME', 4, 3, false, null],
    ['IT301', 'Web Technologies', 'IT', 4, 3, false, null],
  ];
  const courseId = {};
  for (const [code, name, dept, credits, sem, elec, facKey] of courseRows) {
    const r = await q(
      `INSERT INTO courses (code, name, department_id, faculty_id, credits, semester, is_elective)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name
       RETURNING id`,
      [code, name, deptId[dept], facKey ? facId[facKey] : null, credits, sem, elec]
    );
    courseId[code] = r.rows[0].id;
  }
  console.log(`   ✅ ${courseRows.length} courses`);

  /* ── 5. Students ─────────────────────────────────────────────── */
  console.log('5️⃣  Students...');
  const stuRows = [
    // [profileKey, roll, deptCode, semester, academic_year, batch, dob, gender]
    [IDs.stu1, 'CS2024001', 'CSE', 3, '2024-2025', '2024-2028', '2005-03-15', 'Male'],
    [IDs.stu2, 'CS2024002', 'CSE', 3, '2024-2025', '2024-2028', '2005-07-22', 'Female'],
    [IDs.stu3, 'EC2024001', 'ECE', 3, '2024-2025', '2024-2028', '2005-11-10', 'Male'],
  ];
  const stuId = {};
  for (const [pid, roll, dept, sem, ay, batch, dob, gender] of stuRows) {
    const r = await q(
      `INSERT INTO students
         (profile_id, roll_number, department_id, semester, academic_year, batch, date_of_birth, gender)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (roll_number) DO UPDATE SET semester=EXCLUDED.semester
       RETURNING id`,
      [pid, roll, deptId[dept], sem, ay, batch, dob, gender]
    );
    stuId[roll] = r.rows[0].id;
  }
  console.log(`   ✅ ${stuRows.length} students`);

  /* ── 6. Enrollments ──────────────────────────────────────────── */
  console.log('6️⃣  Enrollments...');
  const enrollRows = [
    ['CS2024001', 'CS301', '2024-2025', 3],
    ['CS2024001', 'CS302', '2024-2025', 3],
    ['CS2024001', 'CS303', '2024-2025', 3],
    ['CS2024002', 'CS301', '2024-2025', 3],
    ['CS2024002', 'CS302', '2024-2025', 3],
    ['EC2024001', 'EC301', '2024-2025', 3],
    ['EC2024001', 'EC302', '2024-2025', 3],
  ];
  for (const [roll, course, ay, sem] of enrollRows) {
    await q(
      `INSERT INTO enrollments (student_id, course_id, academic_year, semester)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (student_id, course_id, academic_year) DO NOTHING`,
      [stuId[roll], courseId[course], ay, sem]
    );
  }
  console.log(`   ✅ ${enrollRows.length} enrollments`);

  /* ── 7. Attendance ───────────────────────────────────────────── */
  console.log('7️⃣  Attendance...');
  // attendance.status must be: 'present','absent','late','excused'
  const attStatuses = ['present', 'present', 'present', 'present', 'absent', 'present', 'present', 'late', 'present', 'present'];
  const attDates = Array.from({ length: 10 }, (_, i) => pastDate(i + 1));
  const attGroups = [
    ['CS2024001', 'CS301', 'FAC001'],
    ['CS2024002', 'CS301', 'FAC001'],
    ['EC2024001', 'EC301', 'FAC002'],
  ];
  let attCount = 0;
  for (const [roll, course, fkey] of attGroups) {
    for (let i = 0; i < attDates.length; i++) {
      await q(
        `INSERT INTO attendance (student_id, course_id, faculty_id, date, status)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (student_id, course_id, date) DO NOTHING`,
        [stuId[roll], courseId[course], facId[fkey], attDates[i], attStatuses[i]]
      );
      attCount++;
    }
  }
  console.log(`   ✅ ${attCount} attendance records`);

  /* ── 8. Examinations ─────────────────────────────────────────── */
  // exam_type must be: 'internal_1','internal_2','midterm','final','assignment','practical'
  console.log('8️⃣  Examinations...');
  const examRows = [
    // [course, exam_name, exam_type, total_marks, passing_marks, exam_date, ay, sem]
    ['CS301', 'Mid-Term Exam', 'midterm', 100, 40, '2024-09-15', '2024-2025', 3],
    ['CS302', 'Mid-Term Exam', 'midterm', 100, 40, '2024-09-16', '2024-2025', 3],
    ['CS301', 'End-Term Exam', 'final', 100, 40, '2024-11-20', '2024-2025', 3],
    ['EC301', 'Mid-Term Exam', 'midterm', 100, 40, '2024-09-17', '2024-2025', 3],
    ['CS301', 'Internal-1', 'internal_1', 50, 20, '2024-08-20', '2024-2025', 3],
  ];
  const examIds = [];
  for (const [course, ename, etype, total, pass, edate, ay, sem] of examRows) {
    const r = await q(
      `INSERT INTO examinations
         (course_id, exam_name, exam_type, total_marks, passing_marks, exam_date, academic_year, semester)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [courseId[course], ename, etype, total, pass, edate, ay, sem]
    );
    if (r.rows[0]) examIds.push({ id: r.rows[0].id, total });
  }
  console.log(`   ✅ ${examRows.length} examinations`);

  /* ── 9. Marks ────────────────────────────────────────────────── */
  console.log('9️⃣  Marks...');
  // marks.grade_point (not grade_points per schema)
  const marksData = [
    // [examIndex, studentRoll, marks]
    [0, 'CS2024001', 88],
    [0, 'CS2024002', 76],
    [1, 'CS2024001', 92],
    [1, 'CS2024002', 68],
    [2, 'CS2024001', 79],
    [3, 'EC2024001', 85],
    [4, 'CS2024001', 44],
    [4, 'CS2024002', 38],
  ];
  let markCount = 0;
  for (const [ei, roll, marks] of marksData) {
    if (!examIds[ei]) continue;
    const { id: examId, total } = examIds[ei];
    const [g, gp] = grade(marks, total);
    await q(
      `INSERT INTO marks (examination_id, student_id, marks_obtained, grade, grade_point, remarks)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (examination_id, student_id) DO UPDATE
         SET marks_obtained=EXCLUDED.marks_obtained,
             grade=EXCLUDED.grade,
             grade_point=EXCLUDED.grade_point`,
      [examId, stuId[roll], marks, g, gp, 'Seeded data']
    );
    markCount++;
  }
  console.log(`   ✅ ${markCount} marks records`);

  /* ── Summary ─────────────────────────────────────────────────── */
  console.log('\n🎉 Seed complete!');
  console.log('   • 5 departments  • 9 courses    • 6 profiles');
  console.log('   • 2 faculty      • 3 students   • 7 enrollments');
  console.log(`   • ${attCount} attendance  • ${examRows.length} exams  • ${markCount} marks`);
  console.log('\n📌 Next step: Add SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY to backend/.env');
  console.log('   Get them from: Supabase Dashboard → Project Settings → API');
}

seed()
  .catch(e => { console.error('\n💥', e.message); process.exit(1); })
  .finally(() => pool.end());
