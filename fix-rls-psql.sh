#!/bin/bash

# The password with special characters
export PGPASSWORD='$kSfqdgVM9jMf3!Y'

# Execute the RLS fix
psql "host=aws-0-us-east-2.pooler.supabase.com port=5432 dbname=postgres user=postgres.jvzqtyzblkvkrihtequd" << 'EOF'
-- Fix RLS policies to allow reading brands

-- Check current status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('brand_profiles', 'social_accounts');

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on brand_profiles" ON brand_profiles;
DROP POLICY IF EXISTS "Allow all operations on social_accounts" ON social_accounts;

-- Create new policies that allow public read
CREATE POLICY "Allow public read on brand_profiles" ON brand_profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on social_accounts" ON social_accounts
  FOR SELECT USING (true);

-- Keep write operations restricted to service role
CREATE POLICY "Allow service role write on brand_profiles" ON brand_profiles
  FOR INSERT WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Allow service role write on social_accounts" ON social_accounts
  FOR INSERT WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Verify the fix
SELECT 'Brands accessible:' as status, COUNT(*) as count FROM brand_profiles;
SELECT name FROM brand_profiles;
EOF