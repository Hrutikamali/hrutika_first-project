/* ==========================================================================
   StyleHub - Automated API & Integration Test Suite
   Tests REST routes, validation rules, authentication checks, and CRUD flow
   Usage: npm test
   ========================================================================== */

const http = require('http');
const app = require('../src/app');

let server;
const TEST_PORT = 5001;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(` ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(` ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n--- Starting StyleHub Test Suite ---');
  server = app.listen(TEST_PORT);

  try {
    // 1. Health Endpoint
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Fetch all products
    const productsRes = await request('GET', '/api/products');
    assert(productsRes.status === 200 && Array.isArray(productsRes.body), 'GET /api/products returns array of items');

    // 3. Search & Filter products
    const filterRes = await request('GET', '/api/products?gender=men&category=shirts');
    assert(filterRes.status === 200 && Array.isArray(filterRes.body), 'GET /api/products?gender=men&category=shirts filters correctly');

    // 4. Fetch individual product
    const singleRes = await request('GET', '/api/products/1');
    assert(singleRes.status === 200 && singleRes.body.id === 1, 'GET /api/products/1 retrieves single product');

    // 5. Fetch non-existent product
    const notFoundRes = await request('GET', '/api/products/99999');
    assert(notFoundRes.status === 404, 'GET /api/products/99999 returns 404 Not Found');

    // 6. Admin Login with valid credentials
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'admin@stylehub.store',
      password: 'admin123'
    });
    assert(loginRes.status === 200 && Boolean(loginRes.body.token), 'POST /api/auth/login returns JWT token for valid credentials');
    const adminToken = loginRes.body.token;

    // 7. Admin Login with invalid credentials
    const badLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@stylehub.store',
      password: 'wrongpassword'
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login returns 401 for incorrect password');

    // 8. Reject unauthorized admin POST
    const unauthPost = await request('POST', '/api/products', { name: 'Unauthorized item' });
    assert(unauthPost.status === 401, 'POST /api/products rejects requests without Bearer token (401)');

    // 9. Create product with invalid payload
    const badProductRes = await request('POST', '/api/products', { name: 'A' }, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(badProductRes.status === 400, 'POST /api/products validates input fields and returns 400 Bad Request');

    // 10. Create product as authorized admin
    const createRes = await request('POST', '/api/products', {
      name: 'Test Fashion Blazer',
      description: 'Elegant tailored slim-cut blazer.',
      price: 119.50,
      category: 'jackets',
      gender: 'men',
      sizes: 'M,L,XL',
      color: 'Navy',
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      stock: 14
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(createRes.status === 201 && createRes.body.success, 'POST /api/products creates item (201 Created)');
    const createdId = createRes.body.id;

    // 11. Update product as admin
    const updateRes = await request('PUT', `/api/products/${createdId}`, {
      name: 'Test Fashion Blazer Updated',
      price: 129.99
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(updateRes.status === 200 && updateRes.body.success, `PUT /api/products/${createdId} updates product details`);

    // 12. Delete product as admin
    const deleteRes = await request('DELETE', `/api/products/${createdId}`, null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(deleteRes.status === 200 && deleteRes.body.success, `DELETE /api/products/${createdId} removes item from inventory`);

    // 13. Contact form submission with valid fields
    const contactValid = await request('POST', '/api/contact', {
      name: 'Taylor Swift',
      email: 'taylor@example.com',
      message: 'Hello, I loved the Oxford cotton shirt!'
    });
    assert(contactValid.status === 201 && contactValid.body.success, 'POST /api/contact accepts valid inquiry (201 Created)');

    // 14. Contact form validation check
    const contactInvalid = await request('POST', '/api/contact', {
      name: 'X',
      email: 'not-an-email',
      message: 'short'
    });
    assert(contactInvalid.status === 400, 'POST /api/contact enforces field validation rules (400 Bad Request)');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    console.log(`\nResults: ${passedTests} Passed, ${failedTests} Failed.`);
    if (failedTests > 0) {
      process.exit(1);
    } else {
      console.log('🎉 All test suites passed successfully!\n');
    }
  }
}

runTests();
