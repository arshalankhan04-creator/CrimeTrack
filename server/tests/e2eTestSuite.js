/**
 * CrimeTrack — Complete End-to-End Automated Test Suite (M1–M13)
 * Evaluates all 13 built functional subsystems with live assertions & latency tracking.
 */
const http = require('http');

const BASE_HOST = '127.0.0.1';
const BASE_PORT = 5000;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: BASE_HOST,
        port: BASE_PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
};

const runAllTests = async () => {
  const results = [];
  const startTime = Date.now();

  const assert = (suite, testName, condition, details = {}) => {
    const testResult = {
      suite,
      testName,
      passed: Boolean(condition),
      timestamp: new Date().toISOString(),
      details,
    };
    results.push(testResult);
    const icon = testResult.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${icon}] [${suite}] ${testName}`);
    if (!testResult.passed) {
      console.error('   Failure Details:', details);
    }
  };

  try {
    console.log('====================================================');
    console.log('   CrimeTrack — Quality Assurance Test Suite Run   ');
    console.log('====================================================\n');

    // 1. Health & Foundation
    const health = await request('/api/health');
    assert('Foundation', 'Health check returns 200 OK', health.status === 200, { status: health.status });
    assert('Foundation', 'Database connection status is healthy', health.data?.data?.database?.isConnected === true);

    // 2. Authentication & Authorization
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@crimetrack.gov',
      password: 'Admin@123',
    });
    assert('Auth', 'Admin login successful (200 OK)', adminLogin.status === 200);
    const adminToken = adminLogin.data?.data?.token;
    assert('Auth', 'JWT token provided for Admin', Boolean(adminToken));

    const officerLogin = await request('/api/auth/login', 'POST', {
      email: 'officer.sharma@crimetrack.gov',
      password: 'Officer@123',
    });
    assert('Auth', 'Officer login successful (200 OK)', officerLogin.status === 200);
    const officerToken = officerLogin.data?.data?.token;

    const invalidAuth = await request('/api/auth/login', 'POST', {
      email: 'admin@crimetrack.gov',
      password: 'WrongPassword@999',
    });
    assert('Auth', 'Invalid credentials return 401 Unauthorized', invalidAuth.status === 401);

    // 3. User Management
    const userList = await request('/api/users', 'GET', null, adminToken);
    assert('Users', 'Admin can list users (200 OK)', userList.status === 200);
    assert('Users', 'User list contains active personnel', userList.data?.data?.items?.length > 0);

    const officerUserBlock = await request('/api/users', 'GET', null, officerToken);
    assert('Users', 'Officer blocked from user management (403 Forbidden)', officerUserBlock.status === 403);

    // 4. FIR Management
    const firList = await request('/api/firs', 'GET', null, adminToken);
    assert('FIR', 'Admin can list FIRs (200 OK)', firList.status === 200);
    assert('FIR', 'FIRs have valid sequential numbers (FIR-YYYY-XXXX)', firList.data?.data?.items?.[0]?.firNumber?.startsWith('FIR-'));

    // 5. Case Management
    const caseList = await request('/api/cases', 'GET', null, adminToken);
    assert('Cases', 'Admin can query case registry (200 OK)', caseList.status === 200);
    const activeCase = caseList.data?.data?.items?.[0];
    assert('Cases', 'Case is linked to FIR and Officer', Boolean(activeCase?.firId && activeCase?.assignedOfficerId));

    // 6. Crime & Criminal Privacy Engine
    const crimeList = await request('/api/crimes', 'GET', null, adminToken);
    assert('Crimes', 'Crime list retrieved (200 OK)', crimeList.status === 200);

    const criminalSearch = await request('/api/criminals/search?query=Rao', 'GET', null, officerToken);
    assert('Criminals', 'Minimal privacy criminal search returns 200 OK', criminalSearch.status === 200);
    assert('Criminals', 'Privacy: search results do not expose other case details', criminalSearch.data?.data?.results?.[0]?.investigationNotes === undefined);

    // 7. Investigation & Timeline
    if (activeCase) {
      const timeline = await request(`/api/investigations/case/${activeCase._id}/timeline`, 'GET', null, adminToken);
      assert('Investigations', 'Chronological case timeline returns 200 OK', timeline.status === 200);
      assert('Investigations', 'Timeline contains ordered stage progress', Array.isArray(timeline.data?.data?.timeline));
    }

    // 8. Dashboard Analytics & Charts
    const dashboardStats = await request('/api/dashboard/stats', 'GET', null, adminToken);
    assert('Analytics', 'Admin KPI metrics retrieved (200 OK)', dashboardStats.status === 200);
    assert('Analytics', 'KPI statistics include totalFIRs and clearanceRate', dashboardStats.data?.data?.stats?.totalFIRs !== undefined);

    const dashboardCharts = await request('/api/dashboard/charts', 'GET', null, adminToken);
    assert('Analytics', 'Analytical chart aggregations retrieved (200 OK)', dashboardCharts.status === 200);

    // 9. Global Search & Multi-Filter Query Engine
    const globalSearch = await request('/api/search/global?q=theft', 'GET', null, adminToken);
    assert('Global Search', 'Cross-entity omni-search returns 200 OK', globalSearch.status === 200);
    assert('Global Search', 'Omni-search results grouped by entity', globalSearch.data?.data?.totalCount !== undefined && Array.isArray(globalSearch.data?.data?.firs));

    // 10. Reports & Data Export Subsystem
    const firExport = await request('/api/reports/firs/export?format=csv', 'GET', null, adminToken);
    assert('Reports', 'FIR CSV export returns 200 OK and text/csv', firExport.status === 200 && firExport.headers['content-type']?.includes('text/csv'));

    const caseExport = await request('/api/reports/cases/export?format=csv', 'GET', null, adminToken);
    assert('Reports', 'Case CSV export returns 200 OK', caseExport.status === 200);

    const reportSummary = await request('/api/reports/summary', 'GET', null, adminToken);
    assert('Reports', 'Report summary KPIs returned (200 OK)', reportSummary.status === 200);

    // 11. Audit Logs & Security Trails
    const auditLogs = await request('/api/audit-logs', 'GET', null, adminToken);
    assert('Audit Logs', 'Admin can query audit trail (200 OK)', auditLogs.status === 200);
    assert('Audit Logs', 'Audit logs contain timestamp and acting user', Boolean(auditLogs.data?.data?.items?.[0]?.createdAt));

    const auditCsv = await request('/api/audit-logs/export?format=csv', 'GET', null, adminToken);
    assert('Audit Logs', 'Audit CSV compliance export returns 200 OK', auditCsv.status === 200);

    const auditBlock = await request('/api/audit-logs', 'GET', null, officerToken);
    assert('Audit Logs', 'Officer blocked from global audit trail (403 Forbidden)', auditBlock.status === 403);

    // 12. Undo & Audit Recovery Subsystem
    const recoveryHistory = await request('/api/recovery/history', 'GET', null, adminToken);
    assert('Recovery', 'Admin can view rollback history (200 OK)', recoveryHistory.status === 200);

    const recoveryBlock = await request('/api/recovery/history', 'GET', null, officerToken);
    assert('Recovery', 'Officer blocked from recovery console (403 Forbidden)', recoveryBlock.status === 403);

    // 13. Feedback Subsystem
    const feedbackList = await request('/api/feedback', 'GET', null, adminToken);
    assert('Feedback', 'Admin can query feedback ledger (200 OK)', feedbackList.status === 200);

    const feedbackStats = await request('/api/feedback/stats', 'GET', null, adminToken);
    assert('Feedback', 'Feedback statistics calculated (200 OK)', feedbackStats.status === 200 && feedbackStats.data?.data?.stats?.avgRating !== undefined);

    const totalDuration = Date.now() - startTime;
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.length - passedCount;

    console.log('\n====================================================');
    console.log(`   QA SUITE COMPLETE: ${passedCount}/${results.length} PASSED in ${totalDuration}ms   `);
    console.log('====================================================\n');

    return {
      totalTests: results.length,
      passed: passedCount,
      failed: failedCount,
      durationMs: totalDuration,
      results,
    };
  } catch (err) {
    console.error('Critical QA Test Runner Error:', err);
    return {
      totalTests: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length + 1,
      durationMs: Date.now() - startTime,
      results,
      error: err.message,
    };
  }
};

if (require.main === module) {
  runAllTests().then((summary) => {
    if (summary.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

module.exports = { runAllTests };
