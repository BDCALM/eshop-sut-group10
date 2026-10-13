const jwt = require('jsonwebtoken');

// Exercise the production middleware directly; database/HTTP are not involved.
let authenticateToken;
beforeAll(() => {
  jest.doMock('../../database', () => ({}));
  jest.isolateModules(() => {
    ({ authenticateToken } = require('../../server'));
  });
});

const secret = 'super_secret_key_that_should_not_be_here';
function invoke(authorization) {
  const req = { headers: authorization ? { authorization } : {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  authenticateToken(req, res, next);
  return { req, res, next };
}

describe('Unit: JWT authentication (FR-02, SEC-02)', () => {
  test('U-AUTH-01 rejects a missing token', () => {
    const { res, next } = invoke();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  test('U-AUTH-02 rejects a malformed token', () => {
    const { res, next } = invoke('Bearer invalid-token');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('U-AUTH-03 rejects a token signed with another key', () => {
    const token = jwt.sign({ id: 2 }, 'different-test-key');
    const { res, next } = invoke(`Bearer ${token}`);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('U-AUTH-04 rejects an expired token', () => {
    const token = jwt.sign({ id: 2, exp: 1 }, secret, { noTimestamp: true });
    const { res, next } = invoke(`Bearer ${token}`);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('U-AUTH-05 accepts a valid token and forwards its identity', () => {
    const token = jwt.sign({ id: 2, role: 'user' }, secret);
    const { req, res, next } = invoke(`Bearer ${token}`);
    expect(req.user).toMatchObject({ id: 2, role: 'user' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
