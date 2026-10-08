const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      {
        host: 'localhost',
        port: 5000,
        path,
        method,
        headers
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(resData);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting End-to-End API Test Suite...');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}: ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'online', '1. Server Health Check API');

    // 2. Login as Kumar
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'kumar@wallet',
      password: 'kumar123'
    });
    assert(loginRes.status === 200 && loginRes.body.token, '2. User Authentication (Login)');
    const kumarToken = loginRes.body?.token;

    // 3. User Profile
    const profileRes = await request('GET', '/api/auth/profile', null, kumarToken);
    assert(profileRes.status === 200 && profileRes.body.user.upiId === 'kumar@wallet', '3. User Profile API');

    // 4. Wallet Balance
    const walletRes = await request('GET', '/api/wallet', null, kumarToken);
    assert(walletRes.status === 200 && typeof walletRes.body.wallet.balance === 'number', '4. Wallet Balance API');
    const initialBalance = walletRes.body.wallet.balance;

    // 5. Recipient Validation (Rahul)
    const valRes = await request('POST', '/api/wallet/validate-recipient', { identifier: 'rahul@wallet' }, kumarToken);
    assert(valRes.status === 200 && valRes.body.recipient.name.includes('Rahul'), '5. Recipient Live Verification');

    // 6. Add Money Simulation
    const addRes = await request('POST', '/api/wallet/add-money', { amount: 1000, paymentMethod: 'CARD_SIMULATION' }, kumarToken);
    assert(addRes.status === 200 && addRes.body.wallet.balance === initialBalance + 1000, '6. Simulated Add Money (+₹1,000)');

    // 7. Atomic Transfer (Kumar -> Rahul ₹500)
    const transferRes = await request('POST', '/api/wallet/transfer', {
      recipientUpi: 'rahul@wallet',
      amount: 500,
      category: 'Food & Dining',
      note: 'Team lunch split'
    }, kumarToken);
    assert(transferRes.status === 200 && transferRes.body.wallet.balance === initialBalance + 500, '7. Atomic P2P Money Transfer (₹500)');

    // 8. QR Code Verification
    const qrVerifyRes = await request('POST', '/api/qr/verify', {
      qrData: 'wallet://pay?upi=priya@wallet&name=Priya%20Nair&amount=750'
    }, kumarToken);
    assert(qrVerifyRes.status === 200 && qrVerifyRes.body.recipient.upiId === 'priya@wallet', '8. QR Code Parsing & Validation');

    // 9. Analytics & AI Insights
    const aiRes = await request('GET', '/api/analytics/ai-insights', null, kumarToken);
    assert(aiRes.status === 200 && aiRes.body.insights.summary, '9. AI Financial Insights & Anomaly Engine');

    // 10. Budgets
    const budgetRes = await request('GET', '/api/budgets', null, kumarToken);
    assert(budgetRes.status === 200 && Array.isArray(budgetRes.body.budgets), '10. Category Budgets & Limit Guardrails');

    // 11. Admin Authentication & Dashboard
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@wallet',
      password: 'admin123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', '11. Administrator Login');
    const adminToken = adminLogin.body?.token;

    // 12. Admin Stats
    const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
    assert(adminStats.status === 200 && adminStats.body.stats.totalUsers >= 4, '12. Admin Executive KPI Dashboard Stats');

    // 13. Admin Transactions with Risk Level
    const adminTxns = await request('GET', '/api/admin/transactions?riskLevel=HIGH', null, adminToken);
    assert(adminTxns.status === 200 && adminTxns.body.transactions.length >= 1, '13. Admin Suspicious Flagged Transactions Review');

    console.log(`\n📊 API Test Results: ${passed} Passed, ${failed} Failed out of ${passed + failed} Tests.`);
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
  }
};

runTests();
