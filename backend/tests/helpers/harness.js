const sqlite3 = jest.requireActual('sqlite3').verbose();
const request = require('supertest');

// Run the real database module and seed SQL, but redirect its Database constructor
// to memory. Never open backend/database.sqlite during automated tests.
async function createHarness() {
  let app;
  let db;
  const memoryDriver = {
    Database: function (_filename, callback) {
      return new sqlite3.Database(':memory:', callback);
    },
  };
  memoryDriver.verbose = () => memoryDriver;
  jest.doMock('sqlite3', () => memoryDriver);
  jest.isolateModules(() => {
    ({ app } = require('../../server'));
    db = require('../../database');
  });

  const get = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
  const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
  const close = () => new Promise((resolve, reject) => {
    db.close((error) => error ? reject(error) : resolve());
  });

  // This query is queued after the initialization/seed statements. Fail setup
  // explicitly rather than letting a missing fixture look like a SUT defect.
  try {
    const counts = await get(`SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM coupons) AS coupons`);
    if (counts.users !== 2 || counts.products !== 5 || counts.coupons !== 4) {
      throw new Error('Unexpected seed counts in isolated test database');
    }
  } catch (error) {
    await close();
    throw error;
  }

  async function login(role = 'user') {
    const credentials = role === 'admin'
      ? { email: 'admin@eshop.com', password: 'Admin123!' }
      : { email: 'test@eshop.com', password: 'Test1234!' };
    const response = await request(app).post('/api/login').send(credentials);
    if (response.status !== 200 || !response.body.token) {
      throw new Error(`Login fixture failed: HTTP ${response.status}`);
    }
    return { token: response.body.token, id: response.body.user.id };
  }

  return { app, get, run, close, login };
}

module.exports = { createHarness };
