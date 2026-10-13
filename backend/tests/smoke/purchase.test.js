const request = require('supertest');
const { createHarness } = require('../helpers/harness');

let harness;
beforeEach(async () => { harness = await createHarness(); });
afterEach(async () => { if (harness) await harness.close(); });

test('S-PURCHASE-01 catalog -> login -> cart -> checkout -> own order history (FR-02/05/07/08/11)', async () => {
  const catalog = await request(harness.app).get('/api/products');
  expect(catalog.status).toBe(200);
  expect(catalog.body.length).toBeGreaterThan(0);
  const product = catalog.body[0];
  const user = await harness.login();
  const add = await request(harness.app).post('/api/cart').auth(user.token, { type: 'bearer' })
    .send({ ...product, quantity: 1 });
  expect(add.status).toBe(200);
  const cart = await request(harness.app).get('/api/cart').auth(user.token, { type: 'bearer' });
  expect(cart.status).toBe(200);
  expect(cart.body).toHaveLength(1);
  const checkout = await request(harness.app).post('/api/checkout').auth(user.token, { type: 'bearer' })
    .send({ total_amount: product.price, shipping_address: 'B-02 smoke address' });
  expect(checkout.status).toBe(200);
  expect(checkout.body.orderId).toEqual(expect.any(Number));
  const history = await request(harness.app).get('/api/orders/my-orders').auth(user.token, { type: 'bearer' });
  expect(history.status).toBe(200);
  expect(history.body).toHaveLength(1);
  expect(history.body[0]).toMatchObject({ id: checkout.body.orderId, user_id: user.id,
    total_amount: product.price, status: 'pending', shipping_address: 'B-02 smoke address' });
});
