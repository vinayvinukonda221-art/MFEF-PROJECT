const authController = require('./controllers/authController');
const studentController = require('./controllers/studentController');
const courseController = require('./controllers/courseController');
const departmentController = require('./controllers/departmentController');
const attendanceController = require('./controllers/attendanceController');
const marksController = require('./controllers/marksController');
const dashboardController = require('./controllers/dashboardController');
const reportController = require('./controllers/reportController');

// Mock Express req/res helper
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
        user: reqData.user || { role: 'admin', id: 'a0000000-0000-0000-0000-000000000001' }
    };

    return { req, res, getResult: () => ({ statusCode, data: responseData }) };
};

async function runTests() {
    console.log('====================================================');
    console.log('🧪 EXECUTING UNIT & CONTROLLER INTEGRATION TEST SUITE');
    console.log('====================================================');

    // Test 1: Admin Login
    console.log('\n[1/8] Testing Admin Login...');
    const ctx1 = createMockContext({
        body: { email: 'admin@sms.edu', password: 'Admin@123' }
    });
    await authController.login(ctx1.req, ctx1.res);
    const res1 = ctx1.getResult();
    console.log(`  -> Status: ${res1.statusCode}, User: ${res1.data?.user?.full_name}, Role: ${res1.data?.user?.role}`);
    if (res1.statusCode !== 200) throw new Error('Login failed');

    // Test 2: Dashboard Statistics
    console.log('\n[2/8] Testing Dashboard Analytics...');
    const ctx2 = createMockContext();
    await dashboardController.getDashboardStats(ctx2.req, ctx2.res);
    const res2 = ctx2.getResult();
    console.log(`  -> Status: ${res2.statusCode}, Total Students: ${res2.data?.stats?.totalStudents}, Departments: ${res2.data?.departmentStats?.length}`);
    if (res2.statusCode !== 200) throw new Error('Dashboard stats failed');

    // Test 3: Students Listing & Filtering
    console.log('\n[3/8] Testing Students Registry...');
    const ctx3 = createMockContext({ query: { page: 1, limit: 10 } });
    await studentController.getAllStudents(ctx3.req, ctx3.res);
    const res3 = ctx3.getResult();
    console.log(`  -> Status: ${res3.statusCode}, Students Count: ${res3.data?.students?.length}`);
    if (res3.statusCode !== 200) throw new Error('Students fetch failed');

    // Test 4: Course Management
    console.log('\n[4/8] Testing Course Catalog...');
    const ctx4 = createMockContext();
    await courseController.getAllCourses(ctx4.req, ctx4.res);
    const res4 = ctx4.getResult();
    console.log(`  -> Status: ${res4.statusCode}, Courses Count: ${res4.data?.courses?.length}`);
    if (res4.statusCode !== 200) throw new Error('Courses fetch failed');

    // Test 5: Departments
    console.log('\n[5/8] Testing Department Governance...');
    const ctx5 = createMockContext();
    await departmentController.getAllDepartments(ctx5.req, ctx5.res);
    const res5 = ctx5.getResult();
    console.log(`  -> Status: ${res5.statusCode}, Departments Count: ${res5.data?.departments?.length}`);
    if (res5.statusCode !== 200) throw new Error('Departments fetch failed');

    // Test 6: Attendance
    console.log('\n[6/8] Testing Attendance System...');
    const ctx6 = createMockContext();
    await attendanceController.getAttendance(ctx6.req, ctx6.res);
    const res6 = ctx6.getResult();
    console.log(`  -> Status: ${res6.statusCode}, Attendance Records: ${res6.data?.attendance?.length}`);
    if (res6.statusCode !== 200) throw new Error('Attendance fetch failed');

    // Test 7: Marks & Grade Computation
    console.log('\n[7/8] Testing Examination Marks & Auto-Grading...');
    const ctx7 = createMockContext({
        body: {
            examination_id: 'ex111111-1111-1111-1111-111111111111',
            student_id: 'st111111-1111-1111-1111-111111111111',
            marks_obtained: 47.5,
            remarks: 'Excellent SQL theory'
        }
    });
    await marksController.recordMarks(ctx7.req, ctx7.res);
    const res7 = ctx7.getResult();
    console.log(`  -> Status: ${res7.statusCode}, Auto-Grade: ${res7.data?.evaluation?.grade}, Points: ${res7.data?.evaluation?.gradePoint}`);
    if (res7.statusCode !== 201) throw new Error('Marks record failed');

    // Test 8: Academic Summary Report
    console.log('\n[8/8] Testing Academic Summary Reports...');
    const ctx8 = createMockContext();
    await reportController.getAcademicReport(ctx8.req, ctx8.res);
    const res8 = ctx8.getResult();
    console.log(`  -> Status: ${res8.statusCode}, Pass Rate: ${res8.data?.report?.overallPassRate}`);
    if (res8.statusCode !== 200) throw new Error('Report fetch failed');

    console.log('\n====================================================');
    console.log('✅ ALL CONTROLLER & BUSINESS LOGIC SUITES PASSED (8/8)');
    console.log('====================================================\n');
}

runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});

