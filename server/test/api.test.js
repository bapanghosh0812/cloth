// Integration tests against a real (in-memory) MongoDB: `npm test`
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../src/db.js';
import { createApp } from '../src/app.js';
import { syncCatalog } from '../src/catalog.js';
import { User } from '../src/models/User.js';
import { Order } from '../src/models/Order.js';

const config = {
  jwtSecret: 'test-secret-that-is-definitely-long-enough-123',
  jwtExpiresIn: '1h',
  clientOrigins: ['http://localhost:5173'],
  authRateLimit: 1000,
};

// Reuse the cached MongoDB binary even when tests are started from the repo root.
process.env.MONGOMS_DOWNLOAD_DIR ||= fileURLToPath(new URL('../node_modules/.cache/mongodb-memory-server', import.meta.url));

let mongo;
let app;

const address = { name: 'Bapan Ghosh', email: 'bapan@example.com', address: '12 Park Street', city: 'Kolkata', zip: '700016', country: 'India' };
const payment = { brand: 'Visa', last4: '4242' };

const signup = async (email, password = 'correct-horse-9') => {
  const res = await request(app).post('/api/auth/signup').send({ name: 'Test User', email, password });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.token;
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri('wearsuper-test'));
  await syncCatalog();
  await Promise.all([User.init(), Order.init()]); // build unique indexes before duplicate tests
  app = createApp(config);
});

after(async () => {
  await disconnectDB();
  await mongo.stop();
});

describe('auth', () => {
  test('signup hashes the password and never returns it', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Asha', email: 'Asha@Example.com', password: 'super-secret-1' });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.deepEqual(Object.keys(res.body.user).sort(), ['createdAt', 'email', 'id', 'name']);
    assert.equal(res.body.user.email, 'asha@example.com');

    const stored = await User.findOne({ email: 'asha@example.com' }).select('+passwordHash');
    assert.notEqual(stored.passwordHash, 'super-secret-1');
    assert.match(stored.passwordHash, /^\$2[aby]\$12\$/);
  });

  test('duplicate email is rejected', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Asha', email: 'asha@example.com', password: 'another-pass-1' });
    assert.equal(res.status, 409);
  });

  test('weak password and bad email are rejected', async () => {
    assert.equal((await request(app).post('/api/auth/signup').send({ name: 'A', email: 'a@b.co', password: 'short' })).status, 400);
    assert.equal((await request(app).post('/api/auth/signup').send({ name: 'A', email: 'nope', password: 'long-enough-1' })).status, 400);
  });

  test('login works with the right password only', async () => {
    const good = await request(app).post('/api/auth/login').send({ email: 'ASHA@example.com', password: 'super-secret-1' });
    assert.equal(good.status, 200);
    assert.ok(good.body.token);

    const bad = await request(app).post('/api/auth/login').send({ email: 'asha@example.com', password: 'wrong-password' });
    assert.equal(bad.status, 401);
    const unknown = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'whatever-123' });
    assert.equal(unknown.status, 401);
    assert.equal(unknown.body.error, bad.body.error); // no hint whether the email exists
  });

  test('operator injection in login is neutralised', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    assert.equal(res.status, 400);
  });

  test('/me needs a valid token', async () => {
    assert.equal((await request(app).get('/api/auth/me')).status, 401);
    assert.equal((await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-token')).status, 401);
    const token = await signup('me@example.com');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'me@example.com');
  });
});

describe('products', () => {
  test('lists the catalogue in shop order', async () => {
    const res = await request(app).get('/api/products');
    assert.equal(res.status, 200);
    assert.equal(res.body.products.length, 13);
    assert.equal(res.body.products[0].id, 'p1');
    assert.ok(res.body.products[0].imageKey);
    assert.equal(res.body.products[0]._id, undefined);
  });

  test('single product and 404', async () => {
    assert.equal((await request(app).get('/api/products/p3')).body.product.name, 'Crimson Web High-Top');
    assert.equal((await request(app).get('/api/products/nope')).status, 404);
  });
});

describe('orders', () => {
  let tokenA;
  let tokenB;
  let orderId;

  before(async () => {
    tokenA = await signup('buyer-a@example.com');
    tokenB = await signup('buyer-b@example.com');
  });

  test('requires sign-in', async () => {
    assert.equal((await request(app).get('/api/orders')).status, 401);
    assert.equal((await request(app).post('/api/orders').send({})).status, 401);
  });

  test('places an order priced by the server (client prices are ignored)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        items: [
          { productId: 'p9', size: 'M', color: 'Ivory', qty: 1, price: 1 }, // tampered price
          { productId: 'p9', size: 'M', color: 'Ivory', qty: 1 }, // merged with the line above
        ],
        address,
        payment: { ...payment, number: '4242424242424242' }, // extra card data is not stored
      });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const { order } = res.body;
    orderId = order.id;
    assert.match(order.id, /^WS-\d{6}-\d{6}$/);
    assert.match(order.trackingNumber, /^WSX\d{10}$/);
    assert.equal(order.items.length, 1);
    assert.equal(order.items[0].qty, 2);
    assert.equal(order.subtotal, 190); // 2 × $95 from the database
    assert.equal(order.shipping, 25);
    assert.equal(order.total, 215);

    const stored = await Order.findOne({ orderNumber: order.id }).lean();
    assert.deepEqual(stored.payment, { brand: 'Visa', last4: '4242' });
  });

  test('free shipping from $500', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ items: [{ productId: 'p10', size: 'L', color: 'Onyx', qty: 2 }], address, payment });
    assert.equal(res.status, 201);
    assert.equal(res.body.order.shipping, 0);
    assert.equal(res.body.order.total, 898);
  });

  test('rejects sizes, colours and products that do not exist', async () => {
    const send = (items) => request(app).post('/api/orders').set('Authorization', `Bearer ${tokenA}`).send({ items, address, payment });
    assert.equal((await send([{ productId: 'p3', size: 'XL', color: 'Onyx', qty: 1 }])).status, 400); // shoes use numeric sizes
    assert.equal((await send([{ productId: 'p3', size: '9', color: 'Gold', qty: 1 }])).status, 400);
    assert.equal((await send([{ productId: 'p999', size: 'M', color: 'Onyx', qty: 1 }])).status, 400);
    assert.equal((await send([{ productId: 'p3', size: '9', color: 'Onyx', qty: 0 }])).status, 400);
    assert.equal((await send([])).status, 400);
  });

  test('users only ever see their own orders', async () => {
    const mine = await request(app).get('/api/orders').set('Authorization', `Bearer ${tokenA}`);
    assert.equal(mine.body.orders.length, 2);
    const theirs = await request(app).get('/api/orders').set('Authorization', `Bearer ${tokenB}`);
    assert.equal(theirs.body.orders.length, 0);
    assert.equal((await request(app).get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${tokenB}`)).status, 404);
    assert.equal((await request(app).patch(`/api/orders/${orderId}/cancel`).set('Authorization', `Bearer ${tokenB}`)).status, 404);
  });

  test('cancel works once, before shipping', async () => {
    const first = await request(app).patch(`/api/orders/${orderId}/cancel`).set('Authorization', `Bearer ${tokenA}`);
    assert.equal(first.status, 200);
    assert.ok(first.body.order.cancelledAt);
    const again = await request(app).patch(`/api/orders/${orderId}/cancel`).set('Authorization', `Bearer ${tokenA}`);
    assert.equal(again.status, 409);
  });

  test('shipped orders cannot be cancelled', async () => {
    const placed = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ items: [{ productId: 'p1', size: 'S', color: 'Onyx', qty: 1 }], address, payment });
    // createdAt is immutable in Mongoose, so backdate it through the raw collection.
    await Order.collection.updateOne({ orderNumber: placed.body.order.id }, { $set: { createdAt: new Date(Date.now() - 60 * 60 * 1000) } });
    const res = await request(app).patch(`/api/orders/${placed.body.order.id}/cancel`).set('Authorization', `Bearer ${tokenA}`);
    assert.equal(res.status, 409);
    assert.match(res.body.error, /shipped/);
  });
});

describe('http', () => {
  test('unknown routes and bad JSON return JSON errors', async () => {
    const res = await request(app).get('/api/nothing-here');
    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    const bad = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{not json');
    assert.equal(bad.status, 400);
  });

  test('CORS only allows the configured storefront', async () => {
    const ok = await request(app).get('/api/products').set('Origin', 'http://localhost:5173');
    assert.equal(ok.headers['access-control-allow-origin'], 'http://localhost:5173');
    const blocked = await request(app).get('/api/products').set('Origin', 'https://evil.example');
    assert.equal(blocked.headers['access-control-allow-origin'], undefined);
  });
});
