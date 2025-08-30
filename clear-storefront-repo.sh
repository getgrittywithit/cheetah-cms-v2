#!/bin/bash

# Script to clear out grit-collective-storefront and prepare for Next.js code

echo "🧹 Clearing grit-collective-storefront repository..."

# 1. Clone the repo if not already cloned
cd ~/Code
if [ ! -d "grit-collective-storefront" ]; then
    echo "📥 Cloning grit-collective-storefront..."
    git clone https://github.com/getgrittywithit/grit-collective-storefront.git
fi

cd grit-collective-storefront

# 2. Create a clean branch
echo "🌿 Creating fresh main branch..."
git checkout --orphan fresh-start
git rm -rf .
git clean -fdx

# 3. Copy the Next.js storefront code
echo "📦 Copying Next.js storefront code..."
cp -r ~/Code/cheetah-content-manager/storefront/* .
cp ~/Code/cheetah-content-manager/storefront/.env.local.example .env.local.example 2>/dev/null || true
cp ~/Code/cheetah-content-manager/storefront/.eslintrc.json . 2>/dev/null || true

# 4. Create a proper .gitignore
echo "📝 Creating .gitignore..."
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
*.swp
*.swo
EOF

# 5. Create new README
echo "📄 Creating README.md..."
cat > README.md << 'EOF'
# Grit Collective Storefront

Modern e-commerce storefront built with Next.js 15, TypeScript, and Tailwind CSS.

## Overview

This is the customer-facing storefront for Grit Collective, featuring:
- Product catalog with Printful integration
- Shopping cart functionality
- Responsive design
- API integration with Cheetah CMS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Cheetah CMS Backend
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/getgrittywithit/grit-collective-storefront.git
cd grit-collective-storefront
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:
```env
NEXT_PUBLIC_CMS_API_URL=https://your-cms.vercel.app/api
NEXT_PUBLIC_BRAND_SLUG=grit-collective
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the store.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── contexts/           # React contexts (cart, etc.)
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## Features

- ✅ Product catalog
- ✅ Product detail pages
- ✅ Shopping cart
- ✅ Responsive design
- 🚧 Checkout process
- 🚧 Customer accounts
- 🚧 Order tracking

## API Integration

This storefront connects to the Cheetah CMS API for:
- Product data
- Inventory management
- Order processing
- Customer management

## Deployment

This project is deployed on Vercel. Push to `main` branch to trigger automatic deployment.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

Private repository - All rights reserved
EOF

# 6. Create env example
echo "📋 Creating .env.local.example..."
cat > .env.local.example << 'EOF'
# CMS API Configuration
NEXT_PUBLIC_CMS_API_URL=https://your-cms-deployment.vercel.app/api
NEXT_PUBLIC_BRAND_SLUG=grit-collective

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GTM_ID=
EOF

# 7. Commit everything
echo "💾 Committing fresh Next.js storefront..."
git add .
git commit -m "feat: Fresh start with Next.js storefront

- Remove all Medusa.js code
- Add Next.js 15 with App Router
- Integrate with Cheetah CMS API
- Add shopping cart functionality
- Implement responsive design with Tailwind CSS

This is a complete rewrite to use our custom CMS backend instead of Medusa.js"

# 8. Force push to main
echo "🚀 Force pushing to main branch..."
git branch -D main 2>/dev/null || true
git branch -m main
git push origin main --force

echo "✅ Done! Your grit-collective-storefront is now clean and ready."
echo ""
echo "Next steps:"
echo "1. cd ~/Code/grit-collective-storefront"
echo "2. npm install"
echo "3. Update .env.local with your CMS URL"
echo "4. npm run dev"
echo ""
echo "Don't forget to:"
echo "- Connect to Vercel for deployment"
echo "- Update environment variables in Vercel"
echo "- Configure your custom domain"