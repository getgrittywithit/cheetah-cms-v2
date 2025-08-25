-- Supabase Schema for Cheetah Content Manager
-- Run this in your Supabase SQL editor to create the required tables

-- Create brand_profiles table
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  target_audience TEXT,
  brand_values TEXT[],
  tone_of_voice TEXT,
  brand_personality TEXT[],
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  primary_font TEXT,
  secondary_font TEXT,
  logo_url TEXT,
  tagline TEXT,
  unique_value_proposition TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_handle TEXT,
  access_token TEXT,
  refresh_token TEXT,
  account_id TEXT,
  is_active BOOLEAN DEFAULT false,
  posting_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create content_calendar table
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  title TEXT,
  content_type TEXT,
  platforms TEXT[],
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  content_text TEXT,
  hashtags TEXT[],
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create content_analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_calendar_id UUID REFERENCES content_calendar(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX idx_social_accounts_brand_id ON social_accounts(brand_profile_id);
CREATE INDEX idx_content_calendar_brand_id ON content_calendar(brand_profile_id);
CREATE INDEX idx_content_calendar_status ON content_calendar(status);
CREATE INDEX idx_content_calendar_scheduled ON content_calendar(scheduled_date);

-- Enable Row Level Security (RLS)
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - you may want to adjust based on your auth setup)
-- For now, allowing all operations for testing
CREATE POLICY "Allow all operations on brand_profiles" ON brand_profiles
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on social_accounts" ON social_accounts
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on content_calendar" ON content_calendar
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on content_analytics" ON content_analytics
  FOR ALL USING (true);