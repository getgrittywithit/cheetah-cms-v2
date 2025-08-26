# Logging Guide for Cheetah CMS

This guide helps AI agents and developers access logs from the Vercel deployment.

## Accessing Logs via Vercel CLI

### Prerequisites
```bash
# Install Vercel CLI locally in project
npm install vercel

# Login to Vercel (will open browser)
npx vercel login
```

### Viewing Logs

**Get the latest deployment URL:**
```bash
npx vercel list
```

**Real-time logs (use the URL from above):**
```bash
npx vercel logs https://cheetah-content-manager-xxxxx.vercel.app
```

**Note:** The Vercel CLI v46+ has deprecated some options like `--follow` and `--project`. You need to use the deployment URL directly.

### Filtering Logs

Since Vercel CLI v46+ doesn't support inline filtering, you can use grep:

```bash
# Get deployment URL first
DEPLOYMENT_URL=$(npx vercel list | grep "● Ready" | head -1 | awk '{print $2}')

# Instagram posting errors
npx vercel logs $DEPLOYMENT_URL | grep -i instagram

# Facebook posting errors  
npx vercel logs $DEPLOYMENT_URL | grep -i facebook

# All social media API calls
npx vercel logs $DEPLOYMENT_URL | grep "SocialMediaAPI"

# R2 upload issues
npx vercel logs $DEPLOYMENT_URL | grep -i r2

# Blob URL issues
npx vercel logs $DEPLOYMENT_URL | grep "blob:"
```

## Log Structure

The app uses color-coded console logs:
- 🔵 Blue circle: Info logs
- 🔴 Red circle: Error logs
- ⚠️ Warning: Important notices
- ✅ Success: Successful operations

## Key Log Points

### Social Media Posting
- `/api/marketing/publish-multi` - Multi-platform publishing
- `/api/instagram/post` - Instagram-specific posting
- `/api/facebook/post` - Facebook-specific posting

### File Uploads
- `/api/brand-files/[brand]/upload` - R2 file uploads
- Image URL generation logs

### Authentication
- `/api/auth/*` - NextAuth logs
- Session validation

## Debugging Common Issues

### Blob URL Errors
Look for logs containing:
- "blob:https://content.grittysystems.com"
- "Only photo or video can be accepted as media type"
- "url should represent a valid URL"

### R2 Upload Issues
Look for logs containing:
- "R2_ACCOUNT_ID"
- "Failed to upload"
- "r2.cloudflarestorage.com"

### API Token Issues
Look for logs containing:
- "hasToken: false"
- "Missing access token"
- "Invalid credentials"

## Alternative Access Methods

### Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select the "cheetah-cms-v2" project
3. Click "Functions" tab
4. Click on any function to see its logs

### Local Development
```bash
npm run dev
# Logs appear in terminal
```

## For AI Agents

When debugging issues:
1. First check if Vercel CLI is installed: `vercel --version`
2. If not installed: `npm install -g vercel`
3. Login if needed: `vercel login`
4. Use real-time logs: `vercel logs --project cheetah-cms-v2 --follow`
5. Filter for specific issues using the patterns above

The most useful command for debugging is:
```bash
vercel logs --project cheetah-cms-v2 --follow
```

This shows real-time logs as they happen, making it easy to see errors immediately after triggering an action.