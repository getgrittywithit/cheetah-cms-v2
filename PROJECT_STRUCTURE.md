# Cheetah Platform - Project Structure Guide

## Current Setup Issues
- ❌ Storefront nested inside CMS repository
- ❌ Git tracking 30,000+ storefront files
- ❌ Single repo for two separate deployments
- ❌ Difficult to manage separate environments

## Recommended Architecture

### Option 1: Separate Repositories (RECOMMENDED)
This is the cleanest approach for your multi-brand platform.

```
Your GitHub Account/
├── cheetah-cms/                 # Admin Panel (Current Repo)
│   ├── Multi-brand management
│   ├── Product management
│   ├── Customer management
│   └── Deploys to: cms.yourdomain.com
│
├── grit-collective-store/       # Customer Storefront
│   ├── E-commerce frontend
│   ├── Product catalog
│   ├── Shopping cart
│   └── Deploys to: gritcollective.com
│
└── other-brand-store/           # Future brand storefronts
    └── Deploys to: otherbrand.com
```

### Option 2: Monorepo with Workspaces
Better if you want shared code between projects.

```
cheetah-platform/
├── apps/
│   ├── cms/                     # Admin panel
│   └── storefronts/
│       └── grit-collective/     # Brand storefront
├── packages/
│   ├── ui/                      # Shared UI components
│   └── types/                   # Shared TypeScript types
└── package.json                 # Workspace configuration
```

## Migration Steps for Option 1 (Recommended)

### Step 1: Create New Storefront Repository

```bash
# In a new terminal/directory
cd ~/Code
mkdir grit-collective-store
cd grit-collective-store
git init

# Copy storefront files (do this manually)
# Copy everything from cheetah-cms/storefront/* to here
```

### Step 2: Set Up Storefront Repository

Create `.gitignore` in the new storefront repo:
```gitignore
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/

# production
build/
dist/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### Step 3: Environment Variables Setup

**CMS `.env.local`:**
```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://cms.yourdomain.com

# Storage
R2_BUCKET_NAME=cheetah-cms-media

# Brand-specific API endpoints
GRIT_COLLECTIVE_API_URL=https://gritcollective.com/api
```

**Storefront `.env.local`:**
```env
# API Connection to CMS
NEXT_PUBLIC_CMS_API_URL=https://cms.yourdomain.com/api
NEXT_PUBLIC_BRAND_SLUG=grit-collective

# Commerce
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# Analytics
NEXT_PUBLIC_GA_ID=...
```

### Step 4: Update Vercel Deployments

1. **CMS Deployment** (existing):
   - Repository: `cheetah-cms`
   - Domain: `cms.yourdomain.com`
   - Root Directory: `/` (default)

2. **Storefront Deployment** (new):
   - Repository: `grit-collective-store`
   - Domain: `gritcollective.com`
   - Environment Variables: From storefront `.env.local`

### Step 5: API Communication

The CMS already has brand-specific API routes:
- `/api/brands/[brand]/products`
- `/api/brands/[brand]/orders`
- `/api/brands/[brand]/customers`

The storefront connects to these endpoints with CORS enabled.

## Benefits of This Architecture

### 1. **Clean Separation**
- CMS handles all brands
- Each brand has its own storefront repo
- Clear deployment boundaries

### 2. **Independent Scaling**
- CMS can scale based on admin usage
- Storefronts scale based on customer traffic
- Different caching strategies per project

### 3. **Team Collaboration**
- Frontend devs work on storefronts
- Backend devs work on CMS
- No merge conflicts between teams

### 4. **Brand Customization**
- Each brand gets fully custom storefront
- Shared CMS reduces duplication
- Easy to add new brands

## Implementation Checklist

- [ ] Create new repository for storefront
- [ ] Move storefront files to new repo
- [ ] Update .gitignore in CMS repo
- [ ] Set up storefront git repository
- [ ] Connect storefront to Vercel
- [ ] Update environment variables
- [ ] Test API connections
- [ ] Update CORS settings if needed
- [ ] Document API endpoints
- [ ] Set up CI/CD pipelines

## Next Steps

1. **Immediate**: Add `/storefront/` to CMS .gitignore
2. **Today**: Create separate storefront repository
3. **This Week**: Migrate storefront to new repo
4. **Future**: Consider shared component library

## Questions to Consider

1. **Domain Strategy**:
   - Will each brand have its own domain?
   - Subdomains vs separate domains?

2. **Shared Assets**:
   - How will you share UI components?
   - Common checkout flow?

3. **Multi-tenant vs Multi-instance**:
   - One storefront codebase with theming?
   - Separate storefront per brand?

## Support

For help with migration:
1. Export storefront as ZIP
2. Create new GitHub repository
3. Push to new repository
4. Connect to Vercel
5. Update API endpoints