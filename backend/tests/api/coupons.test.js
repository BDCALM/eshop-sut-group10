const request = require('supertest');
const { createHarness } = require('../helpers/harness');

let harness;
let user;
beforeEach(async () => { harness = await createHarness(); user = await harness.login(); });
afterEach(async () => { if (harness) await harness.close(); });

function apply(code, total, authenticated = true) {
  const call = request(harness.app).post('/api/apply-coupon');
  if (authenticated) call.auth(user.token, { type: 'bearer' });
  return call.send({ code, total_amount: total, user_id: user.id });
}
function expectClientError(response) {
  expect(response.status).toBeGreaterThanOrEqual(400);
  expect(response.status).toBeLessThan(500);
  expect(response.body.error).toEqual(expect.any(String));
}

describe('API: coupon conditions and formulas (FR-09)', () => {
  test('A-COUPON-01 rejects an unknown coupon (C1)', async () => {
    expectClientError(await apply('UNKNOWN', 600000));
  });

  test('A-COUPON-02 rejects an inactive coupon (C1)', async () => {
    await harness.run('UPDATE coupons SET is_active = 0 WHERE code = ?', ['BIGBUY']);
    expectClientError(await apply('BIGBUY', 600000));
  });

  test('A-COUPON-03 rejects an expired coupon (C2)', async () => {
    expectClientError(await apply('EXPIRED', 600000));
  });

  test('A-COUPON-04 rejects a total one unit below the minimum (C3)', async () => {
    expectClientError(await apply('BIGBUY', 499999));
  });

  test('A-COUPON-05 accepts the exact minimum and computes the fixed discount (C3)', async () => {
    const response = await apply('BIGBUY', 500000);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ discount_amount: 50000, final_amount: 450000 });
  });

  test('A-COUPON-06 computes the fixed discount above the minimum', async () => {
    const response = await apply('BIGBUY', 500001);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ discount_amount: 50000, final_amount: 450001 });
  });

  test('A-COUPON-07 rejects an anonymous request even with user_id (C4)', async () => {
    expectClientError(await apply('BIGBUY', 600000, false));
  });

  test('A-COUPON-08 rejects a coupon whose per-user limit is exhausted (C5)', async () => {
    await harness.exhaustCoupon('BIGBUY', user.id);
    expectClientError(await apply('BIGBUY', 600000));
  });

  test('A-COUPON-09 computes ten percent of the total', async () => {
    const response = await apply('SAVE10', 500000);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ discount_amount: 50000, final_amount: 450000 });
  });
});
