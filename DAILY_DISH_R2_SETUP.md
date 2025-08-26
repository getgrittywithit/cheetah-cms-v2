# Daily Dish Dash R2 Storage Setup

## Environment Variables Needed

Add these environment variables to your Vercel deployment to enable the Daily Dish Dash files bucket:

```env
# Daily Dish Dash R2 Storage
DAILY_DISH_R2_ACCOUNT_ID=your_cloudflare_account_id
DAILY_DISH_R2_ACCESS_KEY_ID=your_r2_api_token_access_key
DAILY_DISH_R2_SECRET_ACCESS_KEY=your_r2_api_token_secret
DAILY_DISH_R2_BUCKET=dailydishdash
DAILY_DISH_R2_PUBLIC_URL=https://pub-dailydishdash.r2.dev
```

## What You Need From Your Cloudflare R2 Dashboard:

1. **Account ID**: Found in the right sidebar of your Cloudflare dashboard
2. **R2 API Token**: Create an API token with permissions for your bucket
   - Go to My Profile > API Tokens > Create Token
   - Use "Custom token" template
   - Add permissions: `Zone:Zone Settings:Edit`, `Zone:Zone:Read` for your bucket
3. **Bucket Name**: Should be exactly `dailydishdash` (already created)
4. **Public URL**: If your bucket is configured with a custom domain

## After Adding Environment Variables:

1. **Deploy to Vercel** - The new variables will only take effect after deployment
2. **Visit**: https://content.grittysystems.com/dashboard/daily-dish-dash/files
3. **Test Upload** - Try uploading an image to verify it works

## Features Available:

- ✅ **Upload files** - Drag & drop or click to upload
- ✅ **View files** - Grid and list views with previews
- ✅ **Search & filter** - By name, folder, or file type
- ✅ **Delete files** - With confirmation
- ✅ **File preview** - Click any file to see details
- ✅ **Copy URLs** - Get direct links to your files
- ✅ **Organize** - Files auto-organize by upload folder
- ✅ **AI integration** - AI-generated images automatically appear here

## Troubleshooting:

- **"R2 Storage Not Configured"** - Environment variables not set or incorrect
- **"Invalid R2 access credentials"** - Check your API token permissions
- **Files not appearing** - Verify bucket name matches exactly
- **Upload fails** - Check file size limits and permissions

The Daily Dish Dash files page will work independently from other brands once configured!