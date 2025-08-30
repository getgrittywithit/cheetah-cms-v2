# Migration Guide: Setting Up Clean Repository Structure

## Current Repository Status

You have:
1. **cheetah-cms-v2** (Public) - ✅ Keep this as your CMS
2. **grit-collective-storefront** (Private) - 🔄 Repurpose for Next.js storefront
3. **grit-collective-admin** (Private) - 🗑️ Delete (redundant)
4. **grit-collective-backend** (Public) - 🗑️ Delete (redundant)

## Step-by-Step Migration

### Step 1: Clean Up Redundant Repos
```bash
# These repos are redundant since cheetah-cms-v2 handles everything
# Consider archiving or deleting:
# - grit-collective-admin
# - grit-collective-backend
```

### Step 2: Prepare grit-collective-storefront Repository

1. **Clone the existing repo locally** (in a new terminal):
```bash
cd ~/Code
git clone https://github.com/getgrittywithit/grit-collective-storefront.git
cd grit-collective-storefront
```

2. **Remove all Medusa code**:
```bash
# Remove everything except .git
rm -rf * .*
# Keep .git directory
git reset --hard
git clean -fd
```

3. **Copy your new storefront code**:
```bash
# From your cheetah-cms directory
cp -r ~/Code/cheetah-content-manager/storefront/* .
cp ~/Code/cheetah-content-manager/storefront/.* . 2>/dev/null || true
```

4. **Create proper .gitignore**:
```bash
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

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

# IDEs
.vscode/
.idea/
EOF
```

5. **Update package.json** to reflect new project:
```json
{
  "name": "grit-collective-storefront",
  "version": "2.0.0",
  "description": "Grit Collective E-commerce Storefront - Built with Next.js",
  "private": true,
  ...rest of your package.json
}
```

6. **Commit the fresh start**:
```bash
git add .
git commit -m "feat: migrate from Medusa to Next.js storefront

- Remove Medusa.js implementation
- Add Next.js 15 with App Router
- Integrate with Cheetah CMS API
- Add shopping cart functionality
- Implement brand-specific product catalog"

git push origin main --force
```

### Step 3: Update Vercel Deployments

1. **CMS Deployment** (cheetah-cms-v2):
   - Domain: `admin.gritcollective.com` or `cms.yourdomain.com`
   - Environment: Copy from current .env.local

2. **Storefront Deployment** (grit-collective-storefront):
   - Domain: `gritcollective.com` or `shop.gritcollective.com`
   - Root Directory: `/`
   - Framework Preset: Next.js
   - Environment Variables:
     ```
     NEXT_PUBLIC_CMS_API_URL=https://your-cms-deployment.vercel.app/api
     NEXT_PUBLIC_BRAND_SLUG=grit-collective
     ```

### Step 4: Update Repository Settings

1. **Update grit-collective-storefront description**:
   - New description: "Grit Collective E-commerce Storefront - Next.js powered shopping experience"
   - Remove Medusa.js references

2. **Update README.md** in the storefront repo

### Step 5: Clean Up Your Local cheetah-cms

```bash
cd ~/Code/cheetah-content-manager
# The storefront is already gitignored, but let's clean up
rm -rf storefront/node_modules
rm -rf storefront/.next
rm -rf storefront/.vercel
```

## Architecture Overview

```
GitHub Account/
├── cheetah-cms-v2/              ✅ Multi-brand CMS
│   ├── Brand management
│   ├── Product management  
│   ├── Order processing
│   └── API endpoints
│
└── grit-collective-storefront/  ✅ Customer storefront
    ├── Product catalog
    ├── Shopping cart
    ├── Checkout flow
    └── Brand theming
```

## Benefits of This Setup

1. **Clean Separation**: CMS and storefront are independent
2. **No Git Conflicts**: Each repo has its own history
3. **Independent Deployments**: Deploy CMS without affecting store
4. **Scalable**: Easy to add more brand storefronts
5. **Team Friendly**: Frontend/backend developers work separately

## Environment Variables Reference

### CMS (.env.local)
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
R2_BUCKET_NAME=...
PRINTFUL_API_KEY=...
```

### Storefront (.env.local)
```env
NEXT_PUBLIC_CMS_API_URL=https://your-cms.vercel.app/api
NEXT_PUBLIC_BRAND_SLUG=grit-collective
```

## Next Steps After Migration

1. ✅ Test API connection between storefront and CMS
2. ✅ Verify CORS headers are working
3. ✅ Test product loading
4. ✅ Configure domain in Vercel
5. ✅ Set up SSL certificate
6. ✅ Test checkout flow (when implemented)

## Troubleshooting

**CORS Issues?**
- Check that CMS API routes include CORS headers
- Verify NEXT_PUBLIC_CMS_API_URL is correct

**Products Not Loading?**
- Check brand slug matches in both systems
- Verify products exist for the brand
- Check API endpoint URLs

**Deployment Failing?**
- Ensure all environment variables are set
- Check build logs in Vercel
- Verify Node.js version compatibility