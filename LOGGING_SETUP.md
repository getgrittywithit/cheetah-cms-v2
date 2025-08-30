# Logging Setup Guide

## Overview

You have Better Stack (Logtail) configured for centralized logging. This guide shows how to use it effectively.

## 1. Install Dependencies

```bash
npm install @logtail/browser @logtail/types
```

## 2. Using the Logger

### Basic Logging

```typescript
import { logger } from '@/lib/logger'

// Log levels
logger.debug('Debug message', { extra: 'context' })
logger.info('Info message')
logger.warn('Warning message')
logger.error('Error message', error)
```

### Event Tracking

```typescript
// Track custom events
logger.event('user_signup', { 
  method: 'google',
  referrer: document.referrer 
})

// Track page views
logger.pageView('/products/awesome-tee')

// Track API calls (automatic with api-with-logging.ts)
logger.api('GET', '/api/products', 200, 145)
```

### E-commerce Events

```typescript
// Cart tracking
logger.cart.addItem('prod_123', 2, 29.99)
logger.cart.removeItem('prod_123')
logger.cart.updateQuantity('prod_123', 2, 3)
logger.cart.checkout(89.97, 3)

// Product events
logger.event('product_viewed', {
  productId: 'prod_123',
  productName: 'Awesome Tee',
  price: 29.99,
  category: 'apparel'
})
```

## 3. Error Tracking

### Automatic API Error Logging

```typescript
import { cmsApi } from '@/lib/api-with-logging'

// All API calls are automatically logged
const products = await cmsApi.getProducts('grit-collective')
// Logs: API Request, response time, status, errors
```

### Component Error Boundaries

```typescript
import { withErrorLogging } from '@/lib/api-with-logging'

const MyComponent = withErrorLogging(
  function MyComponent({ props }) {
    // Component code
  },
  'MyComponent'
)
```

### Try-Catch Logging

```typescript
try {
  await riskyOperation()
} catch (error) {
  logger.error('Risky operation failed', error, {
    userId: user.id,
    operation: 'checkout'
  })
}
```

## 4. Viewing Logs

### Better Stack Dashboard

1. Go to [Better Stack](https://logs.betterstack.com)
2. Log in with your credentials
3. Select your source/app
4. Use filters:
   - `level:error` - Show only errors
   - `event:cart_*` - Show cart events
   - `api.endpoint:/api/products` - Show product API calls
   - `brand:grit-collective` - Filter by brand

### Common Queries

```sql
-- Find all errors in last hour
level:error timestamp:>1h

-- Track checkout funnel
event:cart_checkout_started OR event:order_completed

-- API performance issues
api.duration:>1000 api.success:false

-- Product page errors
path:/*/products/* level:error
```

## 5. Performance Monitoring

### API Response Times

```typescript
// Automatically tracked in api-with-logging.ts
// View in Better Stack:
api.endpoint:/api/products api.duration:>500
```

### Page Load Tracking

```typescript
// Add to app/layout.tsx
useEffect(() => {
  const navigationStart = performance.timing.navigationStart
  const loadComplete = performance.timing.loadEventEnd
  const loadTime = loadComplete - navigationStart
  
  logger.event('page_load_complete', {
    duration: loadTime,
    path: window.location.pathname
  })
}, [])
```

## 6. Debug Mode

### Local Development

```typescript
// Logs show in console in development
// Still sent to Better Stack if token is set

// Force debug logs in production
if (window.location.search.includes('debug=true')) {
  logger.debug('Debug mode enabled')
}
```

## 7. Best Practices

### DO:
- Log user actions (clicks, form submits)
- Log API errors with context
- Track business events (add to cart, checkout)
- Include relevant context (userId, productId)
- Use appropriate log levels

### DON'T:
- Log sensitive data (passwords, credit cards)
- Log on every render
- Log large objects (paginate/summarize)
- Use console.log in production

## 8. Alerts Setup

In Better Stack:
1. Go to Alerts
2. Create alert for:
   - `level:error count:>10 time:5m` - High error rate
   - `api.status:500 count:>5` - Server errors
   - `event:checkout_failed count:>3` - Payment issues

## 9. Environment Variables

```env
# Required for logging
NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN=your_token_here
NEXT_PUBLIC_BETTER_STACK_INGESTING_URL=https://logs.betterstack.com

# Alternative: Logtail
NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN=your_token_here
```

## 10. Testing Logs

```typescript
// Add to any page to test
useEffect(() => {
  logger.info('Test log from storefront', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    test: true
  })
}, [])