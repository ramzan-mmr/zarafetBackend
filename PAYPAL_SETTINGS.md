PayPal is controlled only by the existing `src/config/env.js`:

```js
paypal: {
  enabled: false,
  // Existing PayPal credentials and mode remain here.
}
```

PayPal is disabled. To restore it, change `paypal.enabled` to `true` and restart/redeploy the backend. Deploy the updated storefront and backend together initially. No database migration, dashboard setting, or environment variable is needed.

Both guest and signed-in checkout hide PayPal while disabled. Backend PayPal requests are blocked, including requests from already-open checkout pages. Storefront availability refreshes on page mount and when the window regains focus. Existing PayPal credentials and payment history are preserved.

Verification: `node --test tests/paypal-settings.test.js`. Tests use fake payment providers/controllers and do not charge customers.
