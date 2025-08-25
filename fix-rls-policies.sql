-- Fix RLS policies to allow reading brands
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on brand_profiles" ON brand_profiles;
DROP POLICY IF EXISTS "Allow all operations on social_accounts" ON social_accounts;

-- Create new policies that allow reading for everyone
CREATE POLICY "Allow public read on brand_profiles" ON brand_profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on social_accounts" ON social_accounts
  FOR SELECT USING (true);

-- Keep write operations restricted (optional - for security)
CREATE POLICY "Allow authenticated write on brand_profiles" ON brand_profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated write on social_accounts" ON social_accounts
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Verify the brands are readable
SELECT * FROM brand_profiles LIMIT 5;