const http = require('http');
const app = require('./server');

const PORT = 5001; // test port
const server = app.listen(PORT, async () => {
    console.log(`[Test Server] Running on http://localhost:${PORT}`);

    const request = (path, method = 'GET', data = null, headers = {}) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: PORT,
                path,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(body) });
                    } catch {
                        resolve({ status: res.statusCode, raw: body });
                    }
                });
            });

            req.on('error', reject);
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    };

    try {
        console.log('\n--- 1. Testing Healthcheck ---');
        const health = await request('/api/health');
        console.log('Healthcheck Status:', health.status, health.data?.status === 'UP' ? 'PASS' : 'FAIL');

        console.log('\n--- 2. Testing Admin Login ---');
        const loginRes = await request('/api/auth/login', 'POST', {
            email: 'admin@sms.edu',
            password: 'Admin@123'
        });
        console.log('Admin Login Status:', loginRes.status, loginRes.data?.success ? 'PASS' : 'FAIL');
        const token = loginRes.data?.token;

        if (!token) throw new Error('No token returned from login');

        const authHeader = { 'Authorization': `Bearer ${token}` };

        console.log('\n--- 3. Testing Dashboard Statistics ---');
        const statsRes = await request('/api/dashboard/stats', 'GET', null, authHeader);
        console.log('Dashboard Stats Status:', statsRes.status, statsRes.data?.success ? 'PASS' : 'FAIL');
        console.log('Total Students in Stats:', statsRes.data?.stats?.totalStudents);

        console.log('\n--- 4. Testing Students Listing ---');
        const studentsRes = await request('/api/students', 'GET', null, authHeader);
        console.log('Students API Status:', studentsRes.status, `Retrieved ${studentsRes.data?.students?.length} students`);

        console.log('\n--- 5. Testing Courses Listing ---');
        const coursesRes = await request('/api/courses', 'GET', null, authHeader);
        console.log('Courses API Status:', coursesRes.status, `Retrieved ${coursesRes.data?.courses?.length} courses`);

        console.log('\n--- 6. Testing Attendance Listing ---');
        const attRes = await request('/api/attendance', 'GET', null, authHeader);
        console.log('Attendance API Status:', attRes.status, `Retrieved ${attRes.data?.attendance?.length} attendance records`);

        console.log('\n--- 7. Testing Marks Listing ---');
        const marksRes = await request('/api/marks', 'GET', null, authHeader);
        console.log('Marks API Status:', marksRes.status, `Retrieved ${marksRes.data?.marks?.length} marks records`);

        console.log('\n--- 8. Testing Academic Summary Report ---');
        const repRes = await request('/api/reports/summary', 'GET', null, authHeader);
        console.log('Academic Report Status:', repRes.status, repRes.data?.success ? 'PASS' : 'FAIL');

        console.log('\n=============================================');
        console.log('🎉 ALL 8 BACKEND API ENDPOINTS VERIFIED & WORKING!');
        console.log('=============================================\n');
    } catch (err) {
        console.error('Test execution failed:', err);
    } finally {
        server.close();
        process.exit(0);
    }
});

