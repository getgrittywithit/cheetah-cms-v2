# Claude Log Access Setup

## Overview

This setup allows Claude (me) to access your application logs in real-time during development sessions, making debugging much more efficient.

## How It Works

1. **Development Logger**: Stores logs in memory + sends to Better Stack
2. **Public API Endpoint**: `/api/dev/logs` - Claude can fetch logs
3. **Automatic Logging**: API calls, errors, user events are logged
4. **Security**: Only enabled in development (unless explicitly enabled)

## Setup Steps

### 1. Enable Dev Logs in Environment

Add to your `.env.local`:
```env
# Enable dev log API (only in development by default)
ENABLE_DEV_LOGS=true

# Your existing Better Stack tokens
NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN=your_token
NEXT_PUBLIC_BETTER_STACK_INGESTING_URL=https://logs.betterstack.com
```

### 2. Update Your API Routes to Use Dev Logger

```typescript
// Example: Update product API route
import { cmsLogger } from '@/lib/dev-logger'

export async function GET(request: NextRequest) {
  cmsLogger.info('Products API called', { 
    url: request.url,
    method: 'GET' 
  })
  
  try {
    // Your existing code
    const products = await getProducts()
    
    cmsLogger.info('Products fetched successfully', { 
      count: products.length 
    })
    
    return NextResponse.json({ products })
  } catch (error) {
    cmsLogger.error('Failed to fetch products', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 3. Add Logging to Components

```typescript
// Example: Product page
import { cmsLogger } from '@/lib/dev-logger'

export default function ProductPage() {
  useEffect(() => {
    cmsLogger.info('Product page mounted', { 
      productId: product.id 
    })
  }, [])

  const handleAddToCart = () => {
    cmsLogger.info('Add to cart clicked', { 
      productId: product.id,
      price: product.price 
    })
  }

  return (
    // Your component JSX
  )
}
```

## Claude Access URLs

Once deployed, Claude can access logs via:

### CMS Logs
```
https://your-cms-deployment.vercel.app/api/dev/logs
```

### Storefront Logs (when you set it up there too)
```
https://your-storefront-deployment.vercel.app/api/dev/logs
```

## Query Parameters

Claude can filter logs:
```
?level=error          # Only errors
?source=cms          # Only CMS logs
?since=2024-01-01    # Since timestamp
?limit=50           # Limit results
```

## Example Queries Claude Will Use

```
# Get recent errors
/api/dev/logs?level=error&limit=20

# Get all logs from last 5 minutes
/api/dev/logs?since=2024-01-01T10:00:00Z

# Get API-related logs
/api/dev/logs?limit=100
```

## Benefits for Development

1. **Real-time Debugging**: Claude sees errors as they happen
2. **Context Awareness**: Understands what's breaking in your app
3. **Faster Solutions**: No need to copy/paste logs manually
4. **Full Stack Visibility**: See both CMS and storefront logs
5. **Performance Monitoring**: Track API response times

## Security Notes

- **Development Only**: Disabled in production by default
- **No Sensitive Data**: Don't log passwords, tokens, etc.
- **CORS Enabled**: Allows Claude to fetch from any domain
- **Memory Based**: Logs clear on server restart

## Example Log Output

```json
{
  "success": true,
  "logs": [
    {
      "timestamp": "2024-01-01T10:30:00Z",
      "level": "error",
      "message": "Failed to fetch products",
      "context": {
        "error": {
          "message": "Connection timeout",
          "stack": "..."
        }
      },
      "source": "cms",
      "environment": "development"
    }
  ],
  "total": 1
}
```

## Testing the Setup

1. Deploy your changes
2. Make some API calls that generate logs
3. Visit: `https://your-deployment.vercel.app/api/dev/logs`
4. You should see JSON with your logs

## Next Steps

1. Add logging to key functions
2. Deploy to Vercel
3. Share the log URL with Claude during debugging sessions
4. Claude will automatically check logs when troubleshooting

This setup will make our development sessions much more productive! 🚀