# Cheetah Content Manager

A modern content management system for social media marketing with scheduled posting capabilities.

## Features

- 📱 Multi-platform social media management (Facebook, Instagram, TikTok, Twitter, LinkedIn)
- 📅 Scheduled post publishing with Vercel cron jobs
- 🎨 Brand management with style guidelines
- 📊 Content analytics and performance tracking
- 🔐 Secure authentication with NextAuth.js
- 💾 PostgreSQL database with Supabase
- 🚀 Deployable on Vercel

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js (migrating to Supabase Auth)
- **Deployment**: Vercel
- **Social APIs**: Facebook Graph API, Instagram Graph API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Facebook/Instagram Business accounts with API access
- Vercel account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cheetah-content-manager.git
   cd cheetah-content-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```env
   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3001

   # Admin credentials
   ADMIN_EMAIL=admin@cheetah.com
   ADMIN_PASSWORD=your-secure-password

   # Supabase
   DATABASE_URL=your-supabase-database-url
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Social Media APIs
   DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN=your-facebook-token
   DAILY_DISH_FACEBOOK_PAGE_ID=your-facebook-page-id
   DAILY_DISH_INSTAGRAM_ACCESS_TOKEN=your-instagram-token

   # Cron Secret (for Vercel)
   CRON_SECRET=your-cron-secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Database Schema

The application uses Supabase with the following main tables:
- `brand_profiles` - Brand information and guidelines
- `social_accounts` - Social media account credentials
- `content_calendar` - Posts and scheduled content
- `user_analytics` - User and content performance data

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/brands` - Brand management
- `/api/marketing/posts` - Post CRUD operations
- `/api/marketing/publish` - Manual post publishing
- `/api/cron/scheduled-posts` - Automated scheduled posting

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

The `vercel.json` file includes:
- Cron job configuration (runs every 5 minutes)
- Function timeout settings
- Environment variable mappings

### Setting up Cron Secret

In Vercel dashboard:
1. Go to Settings > Environment Variables
2. Add `CRON_SECRET` with a secure random value
3. This will be used to authenticate cron job requests

## Scheduled Posting

Posts are automatically published using Vercel cron jobs that run every 5 minutes. The cron job:
1. Queries for posts scheduled within the time window
2. Publishes them to the appropriate social platforms
3. Updates the post status in the database

## Social Media Setup

### Facebook/Instagram

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Instagram Basic Display and Facebook Login products
3. Get your Page Access Token and Page ID
4. For Instagram, ensure you have a Business account connected

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Troubleshooting

- **Port 3000 in use**: The app defaults to port 3001
- **Authentication issues**: Check NEXTAUTH_SECRET is set correctly
- **Database connection**: Verify DATABASE_URL is correct
- **Social posting fails**: Ensure API tokens have correct permissions
- **File upload errors**: Verify R2 credentials are properly set in Vercel

## License

Private - All rights reserved
<!-- Deploy test Sat Aug  9 08:07:03 CDT 2025 -->
# Deploy trigger Sat Aug  9 08:38:02 CDT 2025
