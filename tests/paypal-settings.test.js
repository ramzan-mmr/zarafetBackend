const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../src/config/env');

// Fake authentication and controllers keep tests away from the database and providers.
const authPath = require.resolve('../src/middleware/auth');
require.cache[authPath] = { id: authPath, filename: authPath, loaded: true, exports: {
  verifyJWT(req, res, next) {
    if (!req.headers['x-test-role']) return res.status(401).json({});
    req.user = { role: req.headers['x-test-role'] };
    next();
  }
} };

test('PayPal is disabled in env.js by default', () => {
  assert.equal(config.paypal.enabled, false);
});

test('Both checkout routes and PayPal setup routes enforce the switch before their controllers', async (t) => {
  const controllersPath = require.resolve('../src/controllers/payments.controller');
  const hits = [];
  require.cache[controllersPath] = { id: controllersPath, filename: controllersPath, loaded: true, exports:
    new Proxy({}, { get: (_, name) => (req, res) => { hits.push(name); res.json({ controller: name }); } })
  };
  // Keep this test focused on route wiring; body schemas have their own existing validation.
  const validationPath = require.resolve('../src/middleware/validate');
  const previous = require.cache[validationPath];
  require.cache[validationPath] = { id: validationPath, filename: validationPath, loaded: true, exports: {
    validateBody: () => (req, res, next) => next(),
    validateParams: () => (req, res, next) => next()
  } };
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use('/payments', require('../src/routes/payments.routes'));
  if (previous) require.cache[validationPath] = previous;
  else delete require.cache[validationPath];
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/payments`;
  const request = (path, method, paymentMethod) => fetch(base + path, {
    method, headers: { 'content-type': 'application/json', 'x-test-role': 'Admin' },
    ...(method === 'POST' ? { body: JSON.stringify({ payment: { method: paymentMethod } }) } : {})
  });
  config.paypal.enabled = false;
  const availability = await fetch(base + '/paypal/availability');
  assert.equal(availability.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await availability.json(), { data: { paypalEnabled: false } });
  const endpoints = [['/paypal/config', 'GET'], ['/paypal/create-order', 'POST'], ['/process', 'POST'], ['/process-guest', 'POST']];
  for (const [path, method] of endpoints) {
    const res = await request(path, method, 'paypal');
    assert.equal(res.status, 503, path);
    assert.equal((await res.json()).error.code, 'PAYPAL_DISABLED');
  }
  assert.equal(hits.length, 0, 'No controller, capture, or order creation should be reached');

  for (const path of ['/process', '/process-guest']) assert.equal((await request(path, 'POST', 'creditCard')).status, 200);
  assert.equal((await request('/config', 'GET')).status, 200);

  config.paypal.enabled = true;
  assert.deepEqual(await (await fetch(base + '/paypal/availability')).json(), { data: { paypalEnabled: true } });
  for (const [path, method] of endpoints) assert.equal((await request(path, method, 'paypal')).status, 200, path);
  config.paypal.enabled = false;
});

test('Confirmed credit card processing and amount validation remain unchanged', async () => {
  const stripePath = require.resolve('../src/config/stripe');
  let retrieved = 0;
  require.cache[stripePath] = { id: stripePath, filename: stripePath, loaded: true, exports: {
    paymentIntents: { retrieve: async (id) => {
      retrieved++;
      return { id, status: 'succeeded', amount: 2500, currency: 'gbp', latest_charge: 'ch_test' };
    } }
  } };
  const StripeService = require('../src/services/stripe.service');

  const result = await StripeService.processPayment({ method: 'creditCard', paymentIntentId: 'pi_test' }, 25, 'gbp');
  assert.equal(result.success, true);
  assert.equal(result.chargeId, 'ch_test');
  assert.equal(retrieved, 1);
  const rejected = await StripeService.processPayment({ method: 'creditCard', paymentIntentId: 'pi_test' }, 30, 'gbp');
  assert.equal(rejected.success, false);
  assert.equal(rejected.amountMismatch, true, 'Existing card amount validation remains in effect');

});
