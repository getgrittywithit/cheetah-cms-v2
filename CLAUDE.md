# Cheetah Content Manager

Last Updated: July 31, 2025

## Project Overview

This is the Cheetah Content Manager - a modern, streamlined content management system focused on marketing, content creation, and audience engagement. It provides a clean interface for managing blog posts, social media content, file uploads, and analytics.

## Multi-Brand System

The system supports multiple brands with isolated content, settings, and integrations:

### Supported Brands:
- **Daily Dish Dash**: Food & cooking content (quick recipes, busy lifestyle)
- **Grit Collective Co.**: Handcrafted home décor, candles, and personalized items
- **Forbidden Files**: Gothic gossip meets dark academia (historical scandals, secrets)
- **Triton Handyman**: Professional home repair and maintenance services

### Brand Features:
- ✅ Brand-specific R2 storage buckets
- ✅ Individual social media tokens per brand
- ✅ Brand-specific AI content generation and voice
- ✅ Separate email configurations
- ✅ Custom color themes and branding
- ✅ URL-based brand routing: `/dashboard/{brand-slug}/feature`

## Architecture

- **Frontend**: Next.js 15 with App Router (deployable on Vercel)
- **Authentication**: Simple session-based auth (expandable to multi-user)
- **Database**: PostgreSQL (configurable for any provider)
- **File Storage**: Cloudflare R2 or AWS S3 compatible storage
- **Analytics**: Content performance tracking and social media metrics

## Key Features

### Current (Phase 1):
- ✅ Authentication system with session management
- ✅ Modern dashboard layout with sidebar navigation
- ✅ Content-focused dashboard with performance metrics
- ✅ File management system
- ✅ Responsive design with Tailwind CSS
- ✅ Social media integrations placeholder

### Planned (Phase 2 & 3):
- Content creation and editing interface
- Social media post scheduling
- Advanced analytics and reporting
- Multi-platform publishing
- SEO optimization tools
- Team collaboration features

## Environment Variables

```env
# Authentication
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here
NEXTAUTH_URL=http://localhost:3001

# Admin Credentials (temporary)
ADMIN_EMAIL=admin@cheetah.com
ADMIN_PASSWORD=supersecret123

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/cheetah_cms

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=cheetah-content-media
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://media.cheetah.com

# Social Media APIs
FACEBOOK_PAGE_ACCESS_TOKEN=your_facebook_token
FACEBOOK_PAGE_ID=your_facebook_page_id
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
TWITTER_API_KEY=your_twitter_api_key
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
TIKTOK_ACCESS_TOKEN=your_tiktok_token

# Analytics
GOOGLE_ANALYTICS_ID=your_ga_id
GOOGLE_SEARCH_CONSOLE_ID=your_gsc_id

# Printful Integration
PRINTFUL_API_KEY=your_printful_api_key_here
PRINTFUL_STORE_ID=your_printful_store_id_here
PRINTFUL_WEBHOOK_SECRET=your_webhook_secret_here

# Email/Marketing
MAILCHIMP_API_KEY=your_mailchimp_key
SENDGRID_API_KEY=your_sendgrid_key

# Brand-Specific R2 Buckets & Social Tokens
# Triton Handyman
TRITON_HANDYMAN_R2_BUCKET=triton-handyman-media
TRITON_HANDYMAN_FACEBOOK_PAGE_ACCESS_TOKEN=your_fb_token
TRITON_HANDYMAN_FACEBOOK_PAGE_ID=your_page_id
TRITON_HANDYMAN_INSTAGRAM_ACCOUNT_ID=your_ig_account_id

# Forbidden Files
FORBIDDEN_FILES_R2_BUCKET=forbidden-files-media
FORBIDDEN_FILES_FACEBOOK_PAGE_ACCESS_TOKEN=your_fb_token
FORBIDDEN_FILES_FACEBOOK_PAGE_ID=your_page_id
FORBIDDEN_FILES_INSTAGRAM_ACCOUNT_ID=your_ig_account_id

# Daily Dish Dash (existing)
DAILY_DISH_R2_BUCKET=dailydishdash
DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN=your_fb_token

# Grit Collective (existing)
GRIT_COLLECTIVE_R2_BUCKET=grit-collective-media
GRIT_COLLECTIVE_FACEBOOK_TOKEN=your_fb_token
```

## File Structure

```
src/
├── app/
│   ├── api/auth/          # Authentication API routes
│   ├── dashboard/         # Main content management pages
│   │   ├── marketing/     # Social media and marketing tools
│   │   ├── files/         # File management
│   │   ├── analytics/     # Content performance analytics
│   │   ├── integrations/  # Third-party integrations
│   │   └── settings/      # System configuration
│   ├── login/             # Login page
│   └── page.tsx           # Root redirect page
├── components/
│   └── layout/            # Sidebar, header components
└── lib/
    ├── auth.ts            # Authentication logic
    └── content-api.ts     # Content management API client
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Authentication

**Current System**: Simple session-based authentication
- Single admin user (content manager role)
- 24-hour session duration
- Cookie-based session storage

**Future Multi-User System**:
- Role-based permissions (admin, editor, contributor, viewer)
- Individual user profiles
- Content approval workflows
- User activity tracking

## Navigation Structure

- **Dashboard**: Content overview and quick stats
- **Marketing**: Social media management and campaign tools
- **Integrations**: Third-party service connections
- **Files**: Media library and file management
- **Analytics**: Content performance and audience insights
- **Settings**: System configuration and user preferences

## Content Management Features

### Content Creation:
- Blog post editor with rich text formatting
- SEO optimization tools
- Content templates and snippets
- Draft and publishing workflows

### Social Media:
- Multi-platform post creation
- Content scheduling and automation
- Social media calendar
- Engagement tracking
- **Triton Handyman**: Professional post template with standardized contact info and "Get a Quote" CTA

### File Management:
- Drag-and-drop file uploads
- Image optimization and resizing
- Media library organization
- CDN integration

### Analytics:
- Content performance metrics
- Audience engagement tracking
- Social media analytics
- Traffic and conversion reports

## Deployment

**Vercel Deployment**:
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

**Alternative Hosting**:
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Docker

## Security Notes

- Session cookies are HTTP-only and secure
- Authentication required for all admin routes
- File upload validation and sanitization
- Environment variables for sensitive data
- CORS configured for production domains

## Integrations

### Supported Platforms:
- **Social Media**: Facebook, Instagram, Twitter, LinkedIn, TikTok
- **Email Marketing**: Mailchimp, SendGrid, ConvertKit
- **Analytics**: Google Analytics, Google Search Console
- **Storage**: Cloudflare R2, AWS S3, DigitalOcean Spaces
- **Automation**: Zapier, IFTTT

### Future Integrations:
- WordPress import/export
- Medium cross-posting
- Shopify blog integration
- Slack notifications
- Discord webhooks

## Common Issues

1. **Port conflicts**: App runs on 3001 if 3000 is busy
2. **Authentication**: Check environment variables if login fails
3. **File uploads**: Verify storage configuration and permissions
4. **Social media**: Ensure API tokens are valid and have proper scopes

---

**Note for AI Models**: This is a content-focused CMS designed for marketing teams and content creators. The system prioritizes ease of use, multi-platform publishing, and performance analytics over e-commerce features.

## Brand-Specific Notes:

### Triton Handyman Template Structure
Every Triton Handyman post must include this professional closing:

```
Ready to get started on your next project? Contact Triton Handyman today for professional, reliable service you can count on!

📞 Call us for immediate assistance
💻 Get a quick quote using our simple online form
🏠 Quality work, honest pricing, every time

#TritonHandyman #QualityWork #HomeRepair #ReliableService
```

### R2 Storage Requirements
- All brands must have separate R2 buckets for content isolation
- AI-generated images automatically route to brand-specific buckets
- Manual uploads use brand-aware upload routes