# Brand Architecture - Long-Term Solution

## Overview
This document outlines the long-term brand management architecture using Supabase as the single source of truth for all brand data.

## Database Schema

### Brand Profiles Table
```sql
brand_profiles (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,  -- NEW: URL-friendly identifier
  description TEXT,
  industry TEXT,
  target_audience TEXT,
  -- ... other brand fields
)
```

### Key Changes Made:
1. **Added `slug` column** - URL-friendly brand identifiers (e.g., "daily-dish-dash")
2. **Unique constraint on slug** - Ensures no duplicate slugs
3. **Validation constraint** - Ensures slugs follow proper format
4. **Index on slug** - Fast lookups by slug

## API Architecture

### Brand Resolution Pattern
All APIs now use a consistent pattern for handling brand identification:

```typescript
// Accepts both UUIDs and slugs, converts to UUID for database operations
async function resolveBrandId(brandIdOrSlug: string): Promise<string | null>
```

### API Routes
```
GET  /api/brands                     # List all brands
GET  /api/brands/[slug]             # Get specific brand
GET  /api/marketing/posts?brandId=daily-dish-dash  # Use slug in queries
POST /api/marketing/posts           # Accept slug, convert to UUID internally
```

## Migration Steps

### 1. Database Migration
Run the SQL migration in `add-slug-migration.sql`:
```bash
# Connect to your Supabase database and run:
psql -h db.your-project.supabase.co -U postgres -d postgres -f add-slug-migration.sql
```

### 2. Code Updates
- ✅ Updated `resolveBrandId()` function to use database lookups
- ✅ Created `brand-utils.ts` with database-first utilities
- ✅ Removed dependency on static `brand-config.ts`

### 3. Frontend Updates (Next Steps)
- Update brand context to use database API
- Update all brand selectors to use slugs
- Update URL routing to use slugs consistently

## Benefits

### 1. **Single Source of Truth**
- All brand data comes from database
- No more static config vs database conflicts
- Consistent data across all components

### 2. **URL-Friendly**
- Clean URLs: `/dashboard/daily-dish-dash/calendar`
- SEO-friendly brand identifiers
- Human-readable routing

### 3. **Scalable**
- Easy to add new brands through admin UI
- No code changes needed for new brands
- Proper relational data integrity

### 4. **Performance**
- Indexed slug lookups are fast
- Cached brand resolution
- Proper database relationships

## Usage Examples

### Backend (API Routes)
```typescript
import { getBrandBySlug } from '@/lib/brand-utils'

// Convert slug to full brand info
const brand = await getBrandBySlug('daily-dish-dash')
// Returns: { id: 'uuid', name: 'Daily Dish Dash', slug: 'daily-dish-dash' }

// Use in database queries
const posts = await supabase
  .from('content_calendar')
  .select('*')
  .eq('brand_profile_id', brand.id)  // Always use UUID for database
```

### Frontend (Components)
```typescript
// URL routing
const router = useRouter()
router.push(`/dashboard/${brand.slug}/calendar`)

// API calls
const response = await fetch(`/api/marketing/posts?brandId=${brand.slug}`)
```

## Legacy Static Config

The old static `brand-config.ts` file should eventually be removed once all components are updated to use database brands. For now, it can remain for backward compatibility but should not be used for new features.

## Environment Variables

Brand-specific environment variables can still be used for external API tokens:

```env
# Brand-specific social media tokens
DAILY_DISH_FACEBOOK_TOKEN=...
DAILY_DISH_INSTAGRAM_TOKEN=...

# These can be moved to database in future iterations
```

## Future Enhancements

1. **Admin UI for Brand Management**
2. **Automated Slug Generation**
3. **Brand Settings in Database** (move from env vars)
4. **Multi-tenant User Access**
5. **Brand-specific Themes and Customization**