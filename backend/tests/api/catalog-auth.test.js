const request = require('supertest');
const { createHarness } = require('../helpers/harness');

let harness;
beforeEach(async () => { harness = await createHarness(); });
afterEach(async () => { if (harness) await harness.close(); });

describe('API: catalog and authentication', () => {
  test('A-CATALOG-01 lists seeded products with required fields (FR-05)', async () => {
    const response = await request(harness.app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(5);
    for (const product of response.body) {
      expect(product).toMatchObject({ id: expect.any(Number), name: expect.any(String),
        price: expect.any(Number), imageUrl: expect.any(String) });
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test('A-CATALOG-02 filters products by name (FR-05)', async () => {
    const response = await request(harness.app).get('/api/products').query({ search: 'iPhone' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toContain('iPhone');
  });

  test('A-CATALOG-03 returns no products for an unmatched name (FR-05)', async () => {
    const response = await request(harness.app).get('/api/products').query({ search: 'not-a-seeded-product' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('A-AUTH-01 login returns a token usable for the current profile (FR-02, FR-04)', async () => {
    const user = await harness.login();
    const response = await request(harness.app).get('/api/users/me').auth(user.token, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: user.id, email: 'test@eshop.com', role: 'user' });
  });

  test('A-AUTH-02 wrong password is rejected (FR-02)', async () => {
    const response = await request(harness.app).post('/api/login')
      .send({ email: 'test@eshop.com', password: 'wrong-password' });
    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });

  test('A-AUTH-03 each failed login increments the counter by exactly one (FR-02)', async () => {
    await request(harness.app).post('/api/login')
      .send({ email: 'test@eshop.com', password: 'wrong-password' });
    const row = await harness.get('SELECT login_attempts FROM users WHERE email = ?', ['test@eshop.com']);
    expect(row.login_attempts).toBe(1);
  });

  test.each([
    ['A-ACCESS-01-PROFILE', '/api/users/me'],
    ['A-ACCESS-01-CART', '/api/cart'],
    ['A-ACCESS-01-ADMIN', '/api/admin/users'],
  ])(
    '%s rejects anonymous access to %s (FR-12, SEC-02)', async (_id, url) => {
      const response = await request(harness.app).get(url);
      expect(response.status).toBe(401);
      expect(response.body.error).toEqual(expect.any(String));
    },
  );

  test('A-ACCESS-02 user cannot read admin users (FR-12)', async () => {
    const user = await harness.login();
    const response = await request(harness.app).get('/api/admin/users').auth(user.token, { type: 'bearer' });
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  test('A-ACCESS-03 admin can list users without passwords (FR-19)', async () => {
    const admin = await harness.login('admin');
    const response = await request(harness.app).get('/api/admin/users').auth(admin.token, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    for (const user of response.body) expect(user).not.toHaveProperty('password');
  });
});
