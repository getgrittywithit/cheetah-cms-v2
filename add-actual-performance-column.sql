-- Add actual_performance column to content_calendar table
-- This stores the results after publishing (platform_post_id, errors, etc.)

ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS actual_performance JSONB DEFAULT NULL;

-- Create index for better performance when querying by status
CREATE INDEX IF NOT EXISTS idx_content_calendar_actual_performance 
ON content_calendar USING GIN (actual_performance);