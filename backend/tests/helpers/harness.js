const sqlite3 = jest.requireActual('sqlite3').verbose();
const request = require('supertest');

// Run the real database module and seed SQL, but redirect its Database constructor
// to memory. Never open backend/database.sqlite during automated tests.
async function createHarness() {
  let app;
  let db;
  const memoryDriver = {
    Database: function (_filename, callback) {
      db = new sqlite3.Database(':memory:', callback);
      return db;
    },
  };
  memoryDriver.verbose = () => memoryDriver;
  jest.doMock('sqlite3', () => memoryDriver);
  try {
    jest.isolateModules(() => {
      ({ app } = require('../../server'));
      db = require('../../database');
    });
  } catch (error) {
    if (db) await new Promise((resolve, reject) => db.close(closeError => closeError ? reject(closeError) : resolve()));
    throw error;
  } finally {
    jest.dontMock('sqlite3');
  }

  let closing;

  const get = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
  const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
  // Teardown is idempotent, including setup failure and explicit early cleanup.
  const close = () => {
    if (!closing) {
      closing = new Promise((resolve, reject) => {
        db.close((error) => error ? reject(error) : resolve());
      });
    }
    return closing;
  };

  // This query is queued after the initialization/seed statements. Fail setup
  // explicitly rather than letting a missing fixture look like a SUT defect.
  try {
    const counts = await get(`SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM coupons) AS coupons,
      (SELECT COUNT(*) FROM categories) AS categories,
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COUNT(*) FROM coupon_usage) AS usage`);
    if (counts.users !== 2 || counts.products !== 5 || counts.coupons !== 4 ||
        counts.categories !== 3 || counts.orders !== 0 || counts.usage !== 0) {
      throw new Error('Unexpected seed counts in isolated test database');
    }
  } catch (error) {
    await close();
    throw error;
  }

  async function login(role = 'user') {
    if (!['user', 'admin'].includes(role)) throw new Error(`Unknown fixture role: ${role}`);
    const credentials = role === 'admin'
      ? { email: 'admin@eshop.com', password: 'Admin123!' }
      : { email: 'test@eshop.com', password: 'Test1234!' };
    const response = await request(app).post('/api/login').send(credentials);
    if (response.status !== 200 || !response.body.token) {
      throw new Error(`Login fixture failed: HTTP ${response.status}`);
    }
    return { token: response.body.token, id: response.body.user.id };
  }

  async function product() {
    const row = await get('SELECT * FROM products WHERE name = ?', ['iPhone 15 Pro Max']);
    if (!row) throw new Error('Product fixture missing');
    return row;
  }

  async function order(userId, status = 'pending') {
    const result = await run('INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)',
      [userId, 30000000, status, 'B-03 fixture address']);
    return result.id;
  }

  async function exhaustCoupon(code, userId) {
    const coupon = await get('SELECT id, max_uses_per_user FROM coupons WHERE code = ?', [code]);
    if (!coupon) throw new Error('Coupon fixture missing');
    for (let i = 0; i < coupon.max_uses_per_user; i++) {
      await run('INSERT INTO coupon_usage (coupon_id, user_id) VALUES (?, ?)', [coupon.id, userId]);
    }
  }

  return { app, get, run, close, login, product, order, exhaustCoupon };
}

module.exports = { createHarness };
