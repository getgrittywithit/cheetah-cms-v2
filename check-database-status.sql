-- Check current brand_profiles table structure and data
-- Run this first to see what brands exist and if slug column is already there

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'brand_profiles' 
ORDER BY ordinal_position;

-- Check existing brand data
SELECT id, name, 
       CASE 
           WHEN COLUMN_EXISTS('brand_profiles', 'slug') THEN slug 
           ELSE 'NO SLUG COLUMN' 
       END as slug
FROM brand_profiles
ORDER BY name;

-- Alternative query if above doesn't work:
SELECT id, name FROM brand_profiles ORDER BY name;