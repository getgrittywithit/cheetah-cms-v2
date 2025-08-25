-- Insert Daily Dish Dash brand directly into Supabase
-- Run this in your Supabase SQL Editor

-- Create a static user ID for the brands
INSERT INTO brand_profiles (
  id,
  user_id,
  name,
  description,
  industry,
  target_audience,
  tone_of_voice,
  brand_personality,
  primary_color,
  secondary_color,
  tagline,
  unique_value_proposition,
  is_default
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'Daily Dish Dash',
  'Quick, delicious recipes and food inspiration for busy people',
  'Food & Cooking',
  'Busy professionals and home cooks looking for quick, tasty meal solutions',
  'Friendly, helpful, and enthusiastic about food',
  '{"Approachable", "Encouraging", "Practical", "Food-passionate"}',
  '#FF6B6B',
  '#4ECDC4',
  'Quick meals made simple',
  'Create content for Daily Dish Dash, focusing on quick, delicious, and accessible recipes for busy people',
  true
);

-- Get the brand ID we just created
WITH daily_dish_brand AS (
  SELECT id FROM brand_profiles WHERE name = 'Daily Dish Dash' LIMIT 1
)
-- Create Facebook social account for Daily Dish Dash
INSERT INTO social_accounts (
  user_id,
  brand_profile_id,
  platform,
  account_handle,
  access_token,
  account_id,
  is_active,
  posting_enabled
) SELECT 
  '00000000-0000-0000-0000-000000000000',
  id,
  'facebook',
  'dailydishdash',
  'EAAXBvf0ZCpwgBO3jkghS2RwN7MXTXckeKyZAqK7ZB14ar2mWavmv7jZBcIv9wZBDzXZB6HwTD4ZCWj5YBDubNZCkKrgmsrs6z60C173aexpXosO0OZAPgZCE9zRQlDt5veSoTJ9o8nmby5LTamNdk3hgXnTv1ogb47Rg9b6bxGQFlQiJsP3flT2Jik6BAsdcUHpN1d2WpZARLfq8DGZCZA7dl4VCV',
  '605708122630363',
  true,
  true
FROM daily_dish_brand;

-- Create Instagram social account for Daily Dish Dash
WITH daily_dish_brand AS (
  SELECT id FROM brand_profiles WHERE name = 'Daily Dish Dash' LIMIT 1
)
INSERT INTO social_accounts (
  user_id,
  brand_profile_id,
  platform,
  account_handle,
  access_token,
  account_id,
  is_active,
  posting_enabled
) SELECT 
  '00000000-0000-0000-0000-000000000000',
  id,
  'instagram',
  'dailydishdash',
  '',
  'dailydishdash',
  false,
  false
FROM daily_dish_brand;

-- Verify the data was inserted
SELECT 
  bp.name as brand_name,
  bp.industry,
  sa.platform,
  sa.account_handle,
  sa.is_active
FROM brand_profiles bp
LEFT JOIN social_accounts sa ON bp.id = sa.brand_profile_id
WHERE bp.name = 'Daily Dish Dash';