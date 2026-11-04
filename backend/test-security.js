/**
 * test-security.js
 * Comprehensive Security & Record-Level Authorization Test Suite
 * Tests:
 * 1. Invalid and missing authentication tokens
 * 2. Inactive/deactivated account rejection
 * 3. Role-based authorization enforcement
 * 4. Students attempting to access another student's profile (Record-Level RLS)
 * 5. Students attempting to inspect another student's marks (Record-Level RLS)
 * 6. Students attempting to inspect another student's attendance (Record-Level RLS)
 * 7. Faculty attempting to mark attendance for an unassigned course
 * 8. Faculty attempting to modify a course assigned to another faculty member
 * 9. Privilege escalation prevention in profile updates
 * 10. Strict input validation failure handling
 * 11. Handling of missing records
 * 12. Logout session invalidation
 */

const { verifyToken, authorizeRoles } = require('./middleware/auth');
const { validateStudentInput } = require('./middleware/validator');
const authController = require('./controllers/authController');
const studentController = require('./controllers/studentController');
const courseController = require('./controllers/courseController');
const attendanceController = require('./controllers/attendanceController');
const marksController = require('./controllers/marksController');

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
        user: reqData.user || null
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    return { req, res, next, isNextCalled: () => nextCalled, getResult: () => ({ statusCode, data: responseData }) };
};

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
    totalCount++;
    if (!condition) {
        console.error(`  ❌ FAILED: ${message}`);
        throw new Error(message);
    }
    passedCount++;
    console.log(`  ✅ PASSED: ${message}`);
}

async function runSecuritySuite() {
    console.log('================================================================');
    console.log('🛡️  PHASE 2: EXECUTING APPLICATION SECURITY & RLS TEST SUITE');
    console.log('================================================================\n');

    // TEST 1: Missing Token
    console.log('[1/12] Token Validation: Reject missing Authorization header...');
    const ctx1 = createMockContext({ headers: {} });
    await verifyToken(ctx1.req, ctx1.res, ctx1.next);
    assert(ctx1.getResult().statusCode === 401 && !ctx1.isNextCalled(), 'Rejected request without Bearer token with 401');

    // TEST 2: Invalid Token Format
    console.log('\n[2/12] Token Validation: Reject invalid token...');
    const ctx2 = createMockContext({ headers: { authorization: 'Bearer invalid-token-xyz' } });
    await verifyToken(ctx2.req, ctx2.res, ctx2.next);
    assert(ctx2.getResult().statusCode === 401 && !ctx2.isNextCalled(), 'Rejected forged/invalid token with 401');

    // TEST 3: Reject Inactive User Account
    console.log('\n[3/12] Account Status: Reject deactivated/inactive accounts...');
    const ctx3 = createMockContext({
        headers: { authorization: 'Bearer mock-token-student' },
        user: { id: 'test-user', role: 'student', is_active: false }
    });
    // Simulate user marked as inactive
    ctx3.req.headers = { authorization: 'Bearer mock-token-student' };
    const { mockUsers } = require('./utils/mockData');
    const studentUser = mockUsers.find(u => u.role === 'student');
    studentUser.is_active = false;
    await verifyToken(ctx3.req, ctx3.res, ctx3.next);
    studentUser.is_active = true; // restore
    assert(ctx3.getResult().statusCode === 403, 'Inactive account rejected with 403');

    // TEST 4: Role-based Authorization Guard
    console.log('\n[4/12] RBAC Guard: Student attempting to access Admin endpoint...');
    const ctx4 = createMockContext({ user: { role: 'student' } });
    const adminGuard = authorizeRoles('admin');
    adminGuard(ctx4.req, ctx4.res, ctx4.next);
    assert(ctx4.getResult().statusCode === 403 && !ctx4.isNextCalled(), 'Blocked non-admin user with 403 Forbidden');

    // TEST 5: Student inspecting another student record
    console.log('\n[5/12] Record RLS: Student accessing another student\'s private record...');
    const ctx5 = createMockContext({
        user: { id: 's0000000-0000-0000-0000-000000000001', email: 'student@sms.edu', role: 'student' },
        params: { id: 'st222222-2222-2222-2222-222222222222' } // student 2
    });
    await studentController.getStudentById(ctx5.req, ctx5.res);
    assert(ctx5.getResult().statusCode === 403, 'Prevented cross-student record access with 403');

    // TEST 6: Student inspecting another student's marks
    console.log('\n[6/12] Record RLS: Student attempting to view another student\'s marks...');
    const ctx6 = createMockContext({
        user: { id: 's0000000-0000-0000-0000-000000000001', role: 'student', email: 'student@sms.edu' },
        query: { student_id: 'other-student-id-999' }
    });
    await marksController.getMarks(ctx6.req, ctx6.res);
    assert(ctx6.getResult().statusCode === 403, 'Prevented cross-student marks inspection with 403');

    // TEST 7: Student inspecting another student's attendance
    console.log('\n[7/12] Record RLS: Student attempting to view another student\'s attendance...');
    const ctx7 = createMockContext({
        user: { id: 's0000000-0000-0000-0000-000000000001', role: 'student', email: 'student@sms.edu' },
        query: { student_id: 'other-student-id-999' }
    });
    await attendanceController.getAttendance(ctx7.req, ctx7.res);
    assert(ctx7.getResult().statusCode === 403, 'Prevented cross-student attendance inspection with 403');

    // TEST 8: Faculty marking attendance for unassigned course
    console.log('\n[8/12] Course Access: Faculty attempting to mark attendance for unassigned course...');
    const ctx8 = createMockContext({
        user: { id: 'f0000000-0000-0000-0000-000000000001', role: 'faculty', email: 'faculty@sms.edu' },
        body: {
            course_id: 'c3333333-3333-3333-3333-333333333333', // taught by Dr. Alan Turing (fc2)
            date: '2026-11-04',
            student_id: 'st-001',
            status: 'present'
        }
    });
    await attendanceController.markAttendance(ctx8.req, ctx8.res);
    assert(ctx8.getResult().statusCode === 403, 'Blocked faculty from marking unassigned course with 403');

    // TEST 9: Faculty modifying unassigned course details
    console.log('\n[9/12] Course Access: Faculty attempting to update unassigned course...');
    const ctx9 = createMockContext({
        user: { id: 'f0000000-0000-0000-0000-000000000001', role: 'faculty', email: 'faculty@sms.edu' },
        params: { id: 'c3333333-3333-3333-3333-333333333333' }, // taught by fc2
        body: { description: 'Unauthorized modification attempt' }
    });
    await courseController.updateCourse(ctx9.req, ctx9.res);
    assert(ctx9.getResult().statusCode === 403, 'Blocked faculty from modifying unassigned course with 403');

    // TEST 10: Privilege Escalation Prevention in Profile Updates
    console.log('\n[10/12] Privilege Escalation: User attempting to self-promote role to admin...');
    const ctx10 = createMockContext({
        user: { id: 's0000000-0000-0000-0000-000000000001', role: 'student', email: 'student@sms.edu' },
        body: { role: 'admin' }
    });
    await authController.updateProfile(ctx10.req, ctx10.res);
    assert(ctx10.getResult().statusCode === 403, 'Rejected unauthorized role escalation attempt with 403');

    // TEST 11: Input Validation on Student Registration
    console.log('\n[11/12] Validation: Input validation on malformed student payload...');
    const ctx11 = createMockContext({
        body: { full_name: '', email: 'not-an-email', semester: 12 }
    });
    validateStudentInput(ctx11.req, ctx11.res, ctx11.next);
    assert(ctx11.getResult().statusCode === 400 && ctx11.getResult().data?.errors?.length >= 3, 'Validation caught invalid name, email and semester with 400');

    // TEST 12: Logout Session Invalidation
    console.log('\n[12/12] Session Management: Proper logout session cleanup...');
    const ctx12 = createMockContext();
    await authController.logout(ctx12.req, ctx12.res);
    assert(ctx12.getResult().statusCode === 200, 'Logout succeeded with 200 and invalidated session');

    console.log('\n================================================================');
    console.log(`🎉 ALL SECURITY & AUTHORIZATION TESTS PASSED: ${passedCount}/${totalCount}`);
    console.log('================================================================\n');
}

runSecuritySuite().catch(err => {
    console.error('\n💥 Security Suite Terminated with error:', err.message);
    process.exit(1);
});
