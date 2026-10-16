const request = require('supertest');
const { createHarness } = require('../helpers/harness');

let harness;
let user;
beforeEach(async () => { harness = await createHarness(); user = await harness.login(); });
afterEach(async () => { if (harness) await harness.close(); });
function call(method, url) {
  return request(harness.app)[method](url).auth(user.token, { type: 'bearer' });
}
async function addProduct(quantity = 1) {
  const product = await harness.product();
  const response = await call('post', '/api/cart').send({ ...product, quantity });
  expect(response.status).toBe(200);
  return product;
}
async function createOrder(status = 'pending') {
  return harness.order(user.id, status);
}

describe('API: cart, checkout and orders', () => {
  test('A-CART-01 a fresh account has an empty cart (FR-07)', async () => {
    const response = await call('get', '/api/cart');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('A-CART-02 adding a product stores its quantity (FR-07)', async () => {
    const product = await addProduct(2);
    const response = await call('get', '/api/cart');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ id: product.id, quantity: 2 });
  });

  test('A-CART-03 repeated products merge into one line (FR-07)', async () => {
    await addProduct(1);
    await addProduct(2);
    const response = await call('get', '/api/cart');
    expect(response.body).toHaveLength(1);
    expect(response.body[0].quantity).toBe(3);
  });

  test('A-CHECKOUT-01 rejects unauthenticated checkout (FR-08)', async () => {
    const response = await request(harness.app).post('/api/checkout')
      .send({ total_amount: 1, shipping_address: 'B-02 test address' });
    expect(response.status).toBe(401);
    const count = await harness.get('SELECT COUNT(*) AS count FROM orders');
    expect(count.count).toBe(0);
  });

  test('A-CHECKOUT-02 computes the total instead of trusting the client (FR-08)', async () => {
    const product = await addProduct(2);
    const response = await call('post', '/api/checkout')
      .send({ total_amount: 1, shipping_address: 'B-02 test address' });
    expect(response.status).toBe(200);
    const order = await harness.get('SELECT * FROM orders WHERE id = ?', [response.body.orderId]);
    expect(order.total_amount).toBe(product.price * 2);
  });

  test('A-CHECKOUT-03 clears the cart after successful checkout (FR-08)', async () => {
    const product = await addProduct(1);
    const checkout = await call('post', '/api/checkout')
      .send({ total_amount: product.price, shipping_address: 'B-02 test address' });
    expect(checkout.status).toBe(200);
    const cart = await call('get', '/api/cart');
    expect(cart.status).toBe(200);
    expect(cart.body).toEqual([]);
  });

  test('A-ORDER-01 history includes only the current user orders (FR-11)', async () => {
    const ownId = await createOrder();
    const admin = await harness.get("SELECT id FROM users WHERE role = 'admin'");
    await harness.run('INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)', [admin.id, 100, 'pending']);
    const response = await call('get', '/api/orders/my-orders');
    expect(response.status).toBe(200);
    expect(response.body.map(order => order.id)).toEqual([ownId]);
    expect(response.body[0].user_id).toBe(user.id);
  });

  test('A-ORDER-02 user can cancel a pending order (FR-10)', async () => {
    const id = await createOrder();
    const response = await call('put', `/api/orders/${id}/cancel`);
    expect(response.status).toBe(200);
    expect((await harness.get('SELECT status FROM orders WHERE id = ?', [id])).status).toBe('canceled');
  });

  test('A-ORDER-03 user cannot cancel a shipping order (FR-10)', async () => {
    const id = await createOrder('shipping');
    const response = await call('put', `/api/orders/${id}/cancel`);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect((await harness.get('SELECT status FROM orders WHERE id = ?', [id])).status).toBe('shipping');
  });

  test('A-ORDER-04 canceled is a final state even for admin (FR-10)', async () => {
    const id = await createOrder('canceled');
    const admin = await harness.login('admin');
    const response = await request(harness.app).put(`/api/admin/orders/${id}/status`)
      .auth(admin.token, { type: 'bearer' }).send({ status: 'delivered' });
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect((await harness.get('SELECT status FROM orders WHERE id = ?', [id])).status).toBe('canceled');
  });
});
