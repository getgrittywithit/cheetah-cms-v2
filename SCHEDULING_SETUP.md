# Scheduled Posting Setup Guide

## Overview
The scheduled posting system is now fully implemented with the following components:

## 🔧 Infrastructure Components

### 1. Database Schema
- **Table**: `content_calendar` stores all scheduled posts
- **Required Column**: `actual_performance` (JSONB) - run the SQL migration:
```sql
-- Run this in your Supabase SQL editor
ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS actual_performance JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_actual_performance 
ON content_calendar USING GIN (actual_performance);
```

### 2. Vercel Cron Configuration
- **File**: `vercel.json` - now configured to run every 5 minutes
- **Endpoint**: `/api/cron/scheduled-posts` 
- **Frequency**: Every 5 minutes (`*/5 * * * *`)

### 3. Environment Variables
Add to your Vercel environment variables:
```env
# Optional: Secure the cron endpoint
CRON_SECRET=your-secret-key-here

# Required: Supabase admin access for cron job
DATABASE_URL=your-supabase-connection-string
```

## 📋 How It Works

### User Flow:
1. User creates AI content as usual
2. Clicks "Post Now" or "Schedule Post" 
3. Gets confirmation modal with date/time picker
4. System saves to `content_calendar` table if scheduled
5. Vercel cron runs every 5 minutes to check for due posts
6. Due posts get published automatically

### Technical Flow:
1. **Immediate Posts**: Direct call to `SocialMediaAPI.publishPost()`
2. **Scheduled Posts**: Saved to `content_calendar` with status 'scheduled'
3. **Cron Processing**: 
   - Queries posts where `status = 'scheduled'` AND `scheduled_date <= NOW()`
   - Publishes via `SocialMediaAPI.publishPost()`
   - Updates status to 'published' or 'failed'
   - Stores results in `actual_performance` JSON field

## 🧪 Testing

### Test Endpoints:
- **Manual Cron Test**: `GET /api/test-scheduled-posts`
- **Manual Cron Run**: `GET /api/cron/scheduled-posts`

### Test Process:
1. Create a scheduled post for 2-3 minutes in the future
2. Check `/api/test-scheduled-posts` to see it in the queue
3. Wait for the scheduled time + up to 5 minutes
4. Check if post was published and status updated

## 🚨 Important Notes

### Deployment Requirements:
1. **Deploy the updated `vercel.json`** - Vercel cron only works after deployment
2. **Run the database migration** - Add the `actual_performance` column
3. **Set environment variables** - Especially `DATABASE_URL` for the cron job

### Monitoring:
- Check Vercel Function logs to see cron job execution
- Monitor the `content_calendar` table for failed posts
- Failed posts will have `status = 'failed'` with error details in `actual_performance`

### Limitations:
- **5-minute precision**: Posts may publish up to 5 minutes after scheduled time
- **Vercel timeout**: Cron jobs have a 10-second timeout on Hobby plan
- **Error handling**: Failed posts remain in 'failed' state (no retry mechanism yet)

## 🔄 Future Enhancements

1. **Retry Logic**: Automatically retry failed posts
2. **Notification System**: Alert when posts fail to publish  
3. **Analytics Integration**: Track scheduled post performance
4. **Bulk Scheduling**: Schedule multiple posts at once
5. **Advanced Scheduling**: Support for optimal posting times

## 📊 Monitoring Queries

```sql
-- Check scheduled posts
SELECT * FROM content_calendar WHERE status = 'scheduled' ORDER BY scheduled_date;

-- Check recent published posts  
SELECT * FROM content_calendar WHERE status = 'published' ORDER BY updated_at DESC LIMIT 10;

-- Check failed posts
SELECT * FROM content_calendar WHERE status = 'failed' ORDER BY updated_at DESC;
```