const request = require('supertest');
const { createHarness } = require('../helpers/harness');

let instances;
beforeEach(() => { instances = []; });
afterEach(async () => { await Promise.all(instances.map(instance => instance.close())); });
async function fresh() {
  const instance = await createHarness();
  instances.push(instance);
  return instance;
}

test('H-ISOLATION-01 database mutations and coupon usage do not leak to another instance', async () => {
  const first = await fresh();
  const user = await first.login();
  await first.order(user.id, 'shipping');
  await first.exhaustCoupon('BIGBUY', user.id);
  await first.run('UPDATE users SET login_attempts = 7 WHERE id = ?', [user.id]);
  await first.run('DELETE FROM products');
  const second = await fresh();
  expect((await second.get('SELECT COUNT(*) AS count FROM orders')).count).toBe(0);
  expect((await second.get('SELECT COUNT(*) AS count FROM coupon_usage')).count).toBe(0);
  expect((await second.get('SELECT COUNT(*) AS count FROM products')).count).toBe(5);
  expect((await second.get('SELECT login_attempts FROM users WHERE email = ?', ['test@eshop.com'])).login_attempts).toBe(0);
  // Creating a fresh instance must not reset a concurrently alive instance.
  expect((await first.get('SELECT COUNT(*) AS count FROM orders')).count).toBe(1);
});

test('H-ISOLATION-02 in-memory carts are private to each application instance', async () => {
  const first = await fresh();
  const user = await first.login();
  const product = await first.product();
  const add = await request(first.app).post('/api/cart').auth(user.token, { type: 'bearer' })
    .send({ ...product, quantity: 1 });
  expect(add.status).toBe(200);
  const second = await fresh();
  const other = await second.login();
  const empty = await request(second.app).get('/api/cart').auth(other.token, { type: 'bearer' });
  expect(empty.status).toBe(200);
  expect(empty.body).toEqual([]);
  const retained = await request(first.app).get('/api/cart').auth(user.token, { type: 'bearer' });
  expect(retained.body).toHaveLength(1);
});

test('H-ISOLATION-03 cleanup can be called repeatedly without leaking connections', async () => {
  const instance = await fresh();
  await instance.close();
  await expect(instance.close()).resolves.toBeUndefined();
});
