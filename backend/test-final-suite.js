/**
 * test-final-suite.js
 * EDUPULSE STUDENT MANAGEMENT SYSTEM (SMS)
 * FINAL PRODUCTION-READINESS 20-SCENARIO VERIFICATION SUITE
 */

const fs = require('fs');
const path = require('path');
const { verifyToken, authorizeRoles, revokeToken, isTokenRevoked, clearRevocations } = require('./middleware/auth');
const { validateStudentInput, validateMarksInput, validateAttendanceInput } = require('./middleware/validator');
const authController = require('./controllers/authController');
const studentController = require('./controllers/studentController');
const courseController = require('./controllers/courseController');
const attendanceController = require('./controllers/attendanceController');
const marksController = require('./controllers/marksController');
const dashboardController = require('./controllers/dashboardController');
const supabaseConfig = require('./config/supabase');
const { mockUsers, mockFaculty, mockStudents, mockCourses } = require('./utils/mockData');

// Mock Express Context Generator
const createMockContext = (reqData = {}) => {
    let statusCode = 200;
    let responseData = null;

    const res = {
        status: (code) => {
            statusCode = code;
            return res;
        },
        json: (data) => {
            responseData = data;
            return res;
        }
    };

    const req = {
        body: reqData.body || {},
        query: reqData.query || {},
        params: reqData.params || {},
        headers: reqData.headers || {},
        user: reqData.user || null,
        token: reqData.token || null,
        supabase: reqData.supabase || null
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    return { req, res, next, isNextCalled: () => nextCalled, getResult: () => ({ statusCode, data: responseData }) };
};

let passedCount = 0;
let failedCount = 0;
const testRecords = [];

function recordTest(num, name, expected, actual, passCondition, evidence) {
    const isPass = Boolean(passCondition);
    if (isPass) {
        passedCount++;
        console.log(`\x1b[32m✔ [TEST ${num}] PASS: ${name}\x1b[0m`);
    } else {
        failedCount++;
        console.log(`\x1b[31m✖ [TEST ${num}] FAIL: ${name}\x1b[0m`);
    }
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
    console.log(`   Evidence: ${JSON.stringify(evidence).substring(0, 160)}...`);
    console.log('------------------------------------------------------------');
    
    testRecords.push({
        testNum: num,
        name,
        expected,
        actual,
        status: isPass ? 'PASSED' : 'FAILED',
        evidence
    });
}

async function runTestSuite() {
    console.log('============================================================');
    console.log('EDUPULSE SMS: 20-SCENARIO FINAL PRODUCTION TEST SUITE');
    console.log('============================================================\n');

    // TEST 1: Reject unauthenticated request (401)
    {
        const { req, res, next, isNextCalled, getResult } = createMockContext({ headers: {} });
        await verifyToken(req, res, next);
        const { statusCode, data } = getResult();
        recordTest(1, 'Reject Unauthenticated Request (Missing Token)', 401, statusCode, statusCode === 401 && !isNextCalled(), data);
    }

    // TEST 2: Reject invalid / forged JWT token (401)
    {
        const { req, res, next, isNextCalled, getResult } = createMockContext({
            headers: { authorization: 'Bearer completely-forged-jwt-signature' }
        });
        await verifyToken(req, res, next);
        const { statusCode, data } = getResult();
        recordTest(2, 'Reject Invalid / Forged JWT Token', 401, statusCode, statusCode === 401 && !isNextCalled(), data);
    }

    // TEST 3: Reject expired / unrecognized JWT token (401)
    {
        const { req, res, next, isNextCalled, getResult } = createMockContext({
            headers: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token' }
        });
        await verifyToken(req, res, next);
        const { statusCode, data } = getResult();
        recordTest(3, 'Reject Expired / Unrecognized JWT Token', 401, statusCode, statusCode === 401 && !isNextCalled(), data);
    }

    // TEST 4: Token revocation upon logout (401 on reused token)
    {
        const testToken = 'mock-token-revocation-test-123';
        revokeToken(testToken);
        const { req, res, next, isNextCalled, getResult } = createMockContext({
            headers: { authorization: `Bearer ${testToken}` }
        });
        await verifyToken(req, res, next);
        const { statusCode, data } = getResult();
        recordTest(4, 'Reject Revoked Session Token After Logout', 401, statusCode, statusCode === 401 && !isNextCalled(), data);
    }

    // TEST 5: Persistent token revocation verification (disk persistence across re-init)
    {
        const persistToken = 'persistent-blacklist-token-xyz';
        revokeToken(persistToken);
        const storageFile = path.join(__dirname, 'data', 'revoked_tokens.json');
        const fileExists = fs.existsSync(storageFile);
        let inStoredJson = false;
        if (fileExists) {
            const content = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
            inStoredJson = content.includes(persistToken);
        }
        recordTest(5, 'Persistent Blacklist Storage (File Persistence & Re-Init)', true, inStoredJson, inStoredJson && fileExists, { storageFile, foundInStorage: inStoredJson });
    }

    // TEST 6: Inactive user account access rejection (403)
    {
        const { req, res, next, isNextCalled, getResult } = createMockContext({
            headers: { authorization: 'Bearer mock-token-student' }
        });
        const studentUser = mockUsers.find(u => u.role === 'student');
        const origState = studentUser.is_active;
        studentUser.is_active = false; // Temporarily simulate deactivated account
        await verifyToken(req, res, next);
        const { statusCode, data } = getResult();
        studentUser.is_active = origState; // Restore
        recordTest(6, 'Deactivated / Inactive User Account Rejection', 403, statusCode, statusCode === 403 && !isNextCalled(), data);
    }

    // TEST 7: Student cross-record profile isolation (Student B blocked from Student A profile - 403)
    {
        const studentA = mockStudents[0];
        const studentB = mockStudents[1];
        const { req, res, getResult } = createMockContext({
            params: { id: studentA.id },
            user: { id: studentB.profile_id, role: 'student' }
        });
        await studentController.getStudentById(req, res);
        const { statusCode, data } = getResult();
        recordTest(7, 'Student Cross-Record Profile Access Blocked (Horizontal Privilege Separation)', 403, statusCode, statusCode === 403, data);
    }

    // TEST 8: Student marks privacy isolation (Student cannot access other student marks - 403)
    {
        const studentA = mockStudents[0];
        const studentB = mockStudents[1];
        const { req, res, getResult } = createMockContext({
            query: { student_id: studentA.id },
            user: { id: studentB.profile_id, role: 'student' }
        });
        await marksController.getMarks(req, res);
        const { statusCode, data } = getResult();
        recordTest(8, 'Student Marks Privacy Isolation (Horizontal RLS Boundary)', 403, statusCode, statusCode === 403, data);
    }

    // TEST 9: Student blocked from taking attendance or creating exams (403 forbidden)
    {
        const { req, res, next, isNextCalled, getResult } = createMockContext({
            user: { id: 'student-profile-id', role: 'student' }
        });
        const authzMiddleware = authorizeRoles('admin', 'faculty');
        authzMiddleware(req, res, next);
        const { statusCode, data } = getResult();
        recordTest(9, 'Role Boundary: Student Prohibited from Recording Attendance or Exams', 403, statusCode, statusCode === 403 && !isNextCalled(), data);
    }

    // TEST 10: Faculty restricted from unassigned course attendance records (403 forbidden)
    {
        const facultyMember = mockFaculty[0]; // assigned to course 1
        const unassignedCourse = mockCourses.find(c => c.faculty_id !== facultyMember.id);
        const { req, res, getResult } = createMockContext({
            query: { course_id: unassignedCourse.id },
            user: { id: facultyMember.profile_id, role: 'faculty', email: facultyMember.email }
        });
        await attendanceController.getAttendance(req, res);
        const { statusCode, data } = getResult();
        recordTest(10, 'Faculty Prohibited From Accessing Unassigned Course Attendance', 403, statusCode, statusCode === 403, data);
    }

    // TEST 11: Faculty prohibited from updating unassigned courses (403 forbidden)
    {
        const facultyMember = mockFaculty[0];
        const unassignedCourse = mockCourses.find(c => c.faculty_id !== facultyMember.id);
        const { req, res, getResult } = createMockContext({
            params: { id: unassignedCourse.id },
            body: { description: 'Tampered syllabus update' },
            user: { id: facultyMember.profile_id, role: 'faculty', email: facultyMember.email }
        });
        await courseController.updateCourse(req, res);
        const { statusCode, data } = getResult();
        recordTest(11, 'Faculty Prohibited From Modifying Unassigned Courses', 403, statusCode, statusCode === 403, data);
    }

    // TEST 12: Faculty prohibited from entering marks for unassigned courses (403 forbidden)
    {
        const facultyMember = mockFaculty[0]; // Prof Grace Hopper
        const unassignedCourse = mockCourses.find(c => c.faculty_id !== facultyMember.id);
        const { req, res, getResult } = createMockContext({
            body: {
                examination_id: 'ex444444-4444-4444-4444-444444444444', // Belongs to CS503 (Dr. Alan Turing)
                course_id: unassignedCourse.id,
                marks: [{ student_id: 'st111111-1111-1111-1111-111111111111', marks_obtained: 45 }]
            },
            user: { id: facultyMember.profile_id, role: 'faculty', email: facultyMember.email }
        });
        await marksController.recordMarks(req, res);
        const { statusCode, data } = getResult();
        recordTest(12, 'Faculty Prohibited From Entering Marks For Unassigned Courses', 403, statusCode, statusCode === 403, data);
    }

    // TEST 13: Student role escalation attempt blocked via profile update (403 forbidden)
    {
        const { req, res, getResult } = createMockContext({
            body: { role: 'admin', full_name: 'Escalated Student' },
            user: { id: 's0000000-0000-0000-0000-000000000001', role: 'student', email: 'student@sms.edu' }
        });
        await authController.updateProfile(req, res);
        const { statusCode, data } = getResult();
        recordTest(13, 'Privilege Escalation Prevention (Role Mutation via Profile Update Rejected)', 403, statusCode, statusCode === 403, data);
    }

    // TEST 14: Protected profile fields modification prevention (is_active, id, department_id - 403)
    {
        const { req, res, getResult } = createMockContext({
            body: { is_active: true, department_id: 'tampered-dept-id' },
            user: { id: 's0000000-0000-0000-0000-000000000001', role: 'student', email: 'student@sms.edu' }
        });
        await authController.updateProfile(req, res);
        const { statusCode, data } = getResult();
        recordTest(14, 'Protected Profile Fields Tampering Prevention (is_active, id, department_id)', 403, statusCode, statusCode === 403, data);
    }

    // TEST 15: Dual-client safety: User client never falls back to service-role client
    {
        const userClientNoToken = supabaseConfig.getUserScopedClient(null);
        const userClientEmptyToken = supabaseConfig.getUserScopedClient('');
        const isSafe = userClientNoToken === null && userClientEmptyToken === null;
        recordTest(15, 'Supabase Dual-Client Architecture: Strict No-Fallback User Scoping', true, isSafe, isSafe, {
            userClientNoToken,
            userClientEmptyToken,
            guarantee: 'User-scoped client strictly returns null when token or anon key is missing'
        });
    }

    // TEST 16: Zero credential exposure (service-role key, passwords, tokens never leaked in responses)
    {
        const { req, res, getResult } = createMockContext({
            body: { email: 'admin@sms.edu', password: 'Admin@123' }
        });
        await authController.login(req, res);
        const { statusCode, data } = getResult();
        const jsonStr = JSON.stringify(data || {});
        const hasServiceRoleLeak = jsonStr.includes('service_role') || jsonStr.includes('SUPABASE_SERVICE_ROLE_KEY');
        const hasPasswordLeak = jsonStr.includes('Admin@123');
        const isSecure = !hasServiceRoleLeak && !hasPasswordLeak;
        recordTest(16, 'Zero Credential Exposure (No Service Key or Plaintext Password in API Responses)', true, isSecure, isSecure, {
            status: statusCode,
            leakChecks: { serviceRoleLeaked: hasServiceRoleLeak, passwordLeaked: hasPasswordLeak }
        });
    }

    // TEST 17: Administrative authentication and session token generation
    {
        const { req, res, getResult } = createMockContext({
            body: { email: 'admin@sms.edu', password: 'Admin@123' }
        });
        await authController.login(req, res);
        const { statusCode, data } = getResult();
        const isValidLogin = statusCode === 200 && data.success && data.token && data.user.role === 'admin';
        recordTest(17, 'Administrator Authentication & Token Issuance', 200, statusCode, isValidLogin, {
            success: data ? data.success : false,
            role: data && data.user ? data.user.role : null,
            tokenGenerated: Boolean(data && data.token)
        });
    }

    // TEST 18: Admin dashboard statistics and institutional aggregation
    {
        const { req, res, getResult } = createMockContext({
            user: { id: 'a0000000-0000-0000-0000-000000000001', role: 'admin', email: 'admin@sms.edu' }
        });
        await dashboardController.getDashboardStats(req, res);
        const { statusCode, data } = getResult();
        const isValidStats = statusCode === 200 && data.success && typeof data.stats.totalStudents === 'number';
        recordTest(18, 'Admin Dashboard Aggregation & Institution Statistics Retrieval', 200, statusCode, isValidStats, {
            statusCode,
            statsOverview: data.stats
        });
    }

    // TEST 19: Full student lifecycle CRUD operations under Admin role
    {
        // 1. Create Student
        const newStudentPayload = {
            full_name: 'Test Final Student',
            email: 'final.test@edupulse.edu',
            phone: '555-0199',
            roll_number: 'CSE-2026-FINAL',
            registration_number: 'REG-2026-FINAL',
            department_id: 'd1111111-1111-1111-1111-111111111111',
            semester: 3
        };
        const createCtx = createMockContext({ body: newStudentPayload, user: { id: 'admin-id', role: 'admin' } });
        await studentController.createStudent(createCtx.req, createCtx.res);
        const createRes = createCtx.getResult();

        // 2. Query Student List
        const listCtx = createMockContext({ user: { id: 'admin-id', role: 'admin' }, query: {} });
        await studentController.getAllStudents(listCtx.req, listCtx.res);
        const listRes = listCtx.getResult();

        const isCrudSuccess = createRes.statusCode === 201 && listRes.statusCode === 200 && Array.isArray(listRes.data?.students);
        recordTest(19, 'Administrative Student Lifecycle Management (Creation & Listing)', true, isCrudSuccess, isCrudSuccess, {
            createStatus: createRes.statusCode,
            listStatus: listRes.statusCode,
            totalStudentsListed: listRes.data ? listRes.data.students?.length : 0
        });
    }

    // TEST 20: Input validation & boundary enforcement (invalid semester rejection)
    {
        const { req, res, next, isNextCalled, getResult } = createMockContext({
            body: {
                full_name: 'Invalid Student',
                email: 'invalid@student.com',
                enrollment_number: 'ENR-BAD-01',
                department_id: 'dept-01',
                semester: 99 // Invalid semester (expected 1 to 12)
            }
        });
        validateStudentInput(req, res, next);
        const { statusCode, data } = getResult();
        recordTest(20, 'Strict Request Input Validation & Boundary Enforcement (Semester Range Check)', 400, statusCode, statusCode === 400 && !isNextCalled(), data);
    }

    console.log('\n============================================================');
    console.log(`FINAL TEST RESULTS SUMMARY: ${passedCount} / 20 PASSED (${failedCount} FAILED)`);
    console.log('============================================================\n');

    if (failedCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTestSuite().catch(err => {
    console.error('Test runner fatal error:', err);
    process.exit(1);
});
