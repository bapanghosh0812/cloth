// Invokes the Netlify Function handler with Netlify-style events against an in-memory MongoDB.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnectDB } from '../src/db.js';

process.env.MONGOMS_DOWNLOAD_DIR ||= fileURLToPath(new URL('../node_modules/.cache/mongodb-memory-server', import.meta.url));

let mongo;
let handler;

// Minimal Netlify (Lambda-compatible) event, as delivered through the /api/* redirect.
const call = async (method, path, { body, token } = {}) => {
  const res = await handler(
    {
      httpMethod: method,
      path,
      headers: {
        host: 'wearsuper.netlify.app',
        'x-nf-client-connection-ip': '203.0.113.7',
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      multiValueHeaders: {},
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      body: body ? JSON.stringify(body) : null,
      isBase64Encoded: false,
    },
    {}
  );
  return { status: res.statusCode, body: JSON.parse(res.body) };
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  delete process.env.MONGODB_URI;
  process.env.JWT_SECRET = 'function-test-secret-that-is-long-enough-1234';
  ({ handler } = await import('../functions/api.js'));
});

after(async () => {
  await disconnectDB();
  await mongo.stop();
});

test('explains a missing MONGODB_URI instead of crashing', async () => {
  const res = await call('GET', '/api/health');
  assert.equal(res.status, 500);
  assert.match(res.body.error, /Missing MONGODB_URI/);
});

test('catches an un-edited <db_password> placeholder', async () => {
  process.env.MONGODB_URI = 'mongodb+srv://bapan:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true';
  const res = await call('GET', '/api/health');
  assert.equal(res.status, 500);
  assert.match(res.body.error, /placeholder/);
});

test('health reports a connected database once configured', async () => {
  process.env.MONGODB_URI = mongo.getUri(); // no database name, exactly like Atlas's copy button
  const res = await call('GET', '/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, db: 'connected' });
});

test('auto-seeds products and answers on both URL forms', async () => {
  const viaRedirect = await call('GET', '/api/products');
  assert.equal(viaRedirect.status, 200);
  assert.equal(viaRedirect.body.products.length, 13);
  const direct = await call('GET', '/.netlify/functions/api/products/p3');
  assert.equal(direct.body.product.name, 'Crimson Web High-Top');
});

test('signup → order → my orders works end to end', async () => {
  const signup = await call('POST', '/api/auth/signup', { body: { name: 'Netlify Buyer', email: 'nb@example.com', password: 'netlify-pass-1' } });
  assert.equal(signup.status, 201, JSON.stringify(signup.body));
  const { token } = signup.body;

  const order = await call('POST', '/api/orders', {
    token,
    body: {
      items: [{ productId: 'p1', size: 'M', color: 'Onyx', qty: 1 }],
      address: { name: 'Netlify Buyer', email: 'nb@example.com', address: '1 Test Road', city: 'Kolkata', zip: '700001', country: 'India' },
      payment: { brand: 'Visa', last4: '4242' },
    },
  });
  assert.equal(order.status, 201, JSON.stringify(order.body));
  assert.equal(order.body.order.total, 224);

  const mine = await call('GET', '/api/orders', { token });
  assert.equal(mine.body.orders.length, 1);
  assert.equal((await call('GET', '/api/orders')).status, 401);
});
