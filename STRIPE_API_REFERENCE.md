# Stripe API Reference

## Overview

The Stripe API is organized around REST. The API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

**Base URL**: `https://api.stripe.com`

## Authentication

The Stripe API uses API keys to authenticate requests. You can view and manage your API keys in the Stripe Dashboard.

- **Test mode keys**: `sk_test_...`
- **Live mode keys**: `sk_live_...`

### Example Authentication

```bash
curl https://api.stripe.com/v1/charges \
  -u sk_test_YOUR_KEY_HERE:
```

## Environment Variables for Multi-Brand Setup

For a multi-brand CMS like Cheetah, use brand-specific Stripe keys:

```env
# Grit Collective Stripe Keys
GRIT_COLLECTIVE_STRIPE_SECRET_KEY=sk_test_...
GRIT_COLLECTIVE_STRIPE_PUBLISHABLE_KEY=pk_test_...
GRIT_COLLECTIVE_STRIPE_WEBHOOK_SECRET=whsec_...

# Daily Dish Stripe Keys (if needed)
DAILY_DISH_STRIPE_SECRET_KEY=sk_test_...
DAILY_DISH_STRIPE_PUBLISHABLE_KEY=pk_test_...
DAILY_DISH_STRIPE_WEBHOOK_SECRET=whsec_...
```

## Core Resources

### Customers

Represents a customer of your business. Use it to create recurring charges and track payments.

```bash
# Create a customer
POST /v1/customers

# Update a customer
POST /v1/customers/:id

# Retrieve a customer
GET /v1/customers/:id

# List customers
GET /v1/customers

# Delete a customer
DELETE /v1/customers/:id

# Search customers
GET /v1/customers/search
```

### Payment Intents

Guides you through collecting a payment from your customer.

```bash
# Create a payment intent
POST /v1/payment_intents

# Update a payment intent
POST /v1/payment_intents/:id

# Retrieve a payment intent
GET /v1/payment_intents/:id

# List payment intents
GET /v1/payment_intents

# Cancel a payment intent
POST /v1/payment_intents/:id/cancel

# Capture a payment intent
POST /v1/payment_intents/:id/capture

# Confirm a payment intent
POST /v1/payment_intents/:id/confirm
```

### Products & Prices

Products describe goods/services. Prices define cost, currency, and billing cycle.

```bash
# Products
POST /v1/products          # Create
POST /v1/products/:id      # Update
GET /v1/products/:id       # Retrieve
GET /v1/products           # List
DELETE /v1/products/:id    # Delete

# Prices
POST /v1/prices            # Create
POST /v1/prices/:id        # Update
GET /v1/prices/:id         # Retrieve
GET /v1/prices             # List
```

### Checkout Sessions

Represents your customer's session as they pay through Checkout.

```bash
# Create a checkout session
POST /v1/checkout/sessions

# Retrieve a checkout session
GET /v1/checkout/sessions/:id

# List line items
GET /v1/checkout/sessions/:id/line_items

# Expire a session
POST /v1/checkout/sessions/:id/expire
```

### Subscriptions

For recurring billing.

```bash
# Create a subscription
POST /v1/subscriptions

# Update a subscription
POST /v1/subscriptions/:id

# Retrieve a subscription
GET /v1/subscriptions/:id

# List subscriptions
GET /v1/subscriptions

# Cancel a subscription
DELETE /v1/subscriptions/:id
```

## Payment Methods

### Payment Method Object

Represents customer's payment instruments.

```bash
# Create a payment method
POST /v1/payment_methods

# Update a payment method
POST /v1/payment_methods/:id

# Retrieve a payment method
GET /v1/payment_methods/:id

# Attach to customer
POST /v1/payment_methods/:id/attach

# Detach from customer
POST /v1/payment_methods/:id/detach
```

## Webhooks

Configure endpoints to be notified about events.

```bash
# Create webhook endpoint
POST /v1/webhook_endpoints

# Update webhook endpoint
POST /v1/webhook_endpoints/:id

# Retrieve webhook endpoint
GET /v1/webhook_endpoints/:id

# List webhook endpoints
GET /v1/webhook_endpoints

# Delete webhook endpoint
DELETE /v1/webhook_endpoints/:id
```

### Common Webhook Events

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Error Handling

### HTTP Status Codes

- **200** - OK: Everything worked as expected
- **400** - Bad Request: Missing required parameter
- **401** - Unauthorized: No valid API key provided
- **402** - Request Failed: Parameters valid but request failed
- **403** - Forbidden: API key lacks permissions
- **404** - Not Found: Requested resource doesn't exist
- **429** - Too Many Requests: Rate limit exceeded
- **500, 502, 503, 504** - Server Errors: Problem on Stripe's end

### Error Types

- `api_error` - Stripe server issues (rare)
- `card_error` - Card can't be charged
- `idempotency_error` - Idempotency key reused incorrectly
- `invalid_request_error` - Invalid parameters

## Idempotency

Safely retry requests without performing the same operation twice.

```bash
curl https://api.stripe.com/v1/customers \
  -u sk_test_YOUR_KEY: \
  -H "Idempotency-Key: UNIQUE_KEY_HERE" \
  -d description="Customer"
```

## Metadata

Attach key-value data to objects (max 50 keys).

```bash
curl https://api.stripe.com/v1/customers \
  -u sk_test_YOUR_KEY: \
  -d "metadata[order_id]"=6735 \
  -d "metadata[user_id]"=123
```

## Pagination

List endpoints support pagination.

```bash
# Get first page (default 10 items)
GET /v1/customers?limit=10

# Get next page
GET /v1/customers?limit=10&starting_after=cus_xxx

# Get previous page
GET /v1/customers?limit=10&ending_before=cus_yyy
```

## Common Integration Patterns

### 1. One-time Payment

```javascript
// 1. Create PaymentIntent on server
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // $20.00
  currency: 'usd',
  payment_method_types: ['card'],
});

// 2. Confirm on client with Stripe.js
const result = await stripe.confirmCardPayment(clientSecret);
```

### 2. Save Card for Later

```javascript
// 1. Create SetupIntent
const setupIntent = await stripe.setupIntents.create({
  customer: 'cus_xxx',
  payment_method_types: ['card'],
});

// 2. Confirm on client
const result = await stripe.confirmCardSetup(clientSecret);
```

### 3. Subscription Checkout

```javascript
// Create checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_xxx',
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
});
```

## Testing

### Test Card Numbers

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

### Test Bank Accounts

- **Success**: Routing: `110000000`, Account: `000123456789`
- **Failure**: Routing: `110000000`, Account: `000111111113`

## Rate Limits

- **Read requests**: 100 requests/second
- **Write requests**: 100 requests/second
- **Search requests**: 20 requests/second

## Best Practices

1. **Always use HTTPS** - API requests must be made over HTTPS
2. **Store keys securely** - Never expose secret keys in client-side code
3. **Use webhooks** - Don't poll the API for updates
4. **Implement idempotency** - For POST requests that might be retried
5. **Handle errors gracefully** - Implement proper error handling
6. **Test thoroughly** - Use test mode before going live
7. **Version your API calls** - Specify API version in requests

## Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [API Changelog](https://stripe.com/docs/upgrades)
- [Stripe.js Reference](https://stripe.com/docs/js)
- [Webhook Event Types](https://stripe.com/docs/api/events/types)
- [Testing Documentation](https://stripe.com/docs/testing)

## Security Considerations

1. **PCI Compliance** - Use Stripe.js or Elements to avoid handling card details
2. **Webhook Verification** - Always verify webhook signatures
3. **API Key Rotation** - Regularly rotate your API keys
4. **Restricted Keys** - Use restricted API keys for granular permissions
5. **HTTPS Only** - Never make API calls over plain HTTP

---

**Note**: This is a condensed reference. For complete documentation, visit [https://stripe.com/docs/api](https://stripe.com/docs/api)