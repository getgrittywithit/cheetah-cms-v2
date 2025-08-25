-- Temporary fix: Disable RLS for testing
-- Run this in your Supabase SQL editor

-- Disable RLS policies temporarily for setup
ALTER TABLE brand_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;

-- Or if you prefer to keep RLS enabled, update the policies to be more permissive:
-- DROP POLICY IF EXISTS "Allow all operations on brand_profiles" ON brand_profiles;
-- CREATE POLICY "Allow all operations on brand_profiles" ON brand_profiles
--   FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow all operations on social_accounts" ON social_accounts;
-- CREATE POLICY "Allow all operations on social_accounts" ON social_accounts
--   FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow all operations on content_calendar" ON content_calendar;
-- CREATE POLICY "Allow all operations on content_calendar" ON content_calendar
--   FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow all operations on content_analytics" ON content_analytics;
-- CREATE POLICY "Allow all operations on content_analytics" ON content_analytics
--   FOR ALL USING (true) WITH CHECK (true);