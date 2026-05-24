const http = require('http');

function testLogin(url, body, label) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.success) {
            console.log(`✅ ${label}: LOGIN SUCCESS | role=${parsed.data?.role || parsed.data?.customer?.email || 'customer'}`);
          } else {
            console.log(`❌ ${label}: LOGIN FAILED | ${parsed.message}`);
          }
        } catch {
          console.log(`❌ ${label}: PARSE ERROR | ${responseData}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${label}: NETWORK ERROR | ${e.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`❌ ${label}: TIMEOUT`);
      req.destroy();
      resolve();
    });

    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('\n=== Login Test Results ===\n');
  await testLogin('/api/auth/login',          { email: 'admin@smartsuper.lk',  password: 'AdminUser@123'   }, 'Admin        ');
  await testLogin('/api/auth/login',          { email: 'john@smartsuper.lk',   password: 'CashierUser@123' }, 'Cashier      ');
  await testLogin('/api/auth/login',          { email: 'jane@smartsuper.lk',   password: 'StockUser@123'   }, 'Stock Manager');
  await testLogin('/api/customer-auth/login', { email: 'kamal@email.com',      password: 'Customer@1'      }, 'Customer     ');
  console.log('\n==========================\n');
})();
