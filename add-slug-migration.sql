-- Add slug column to brand_profiles table for better URL-friendly brand identification
-- This enables using slugs like 'daily-dish-dash' instead of UUIDs in URLs

-- Add the slug column
ALTER TABLE brand_profiles ADD COLUMN slug TEXT UNIQUE;

-- Create an index for faster lookups
CREATE INDEX idx_brand_profiles_slug ON brand_profiles(slug);

-- Update existing brands with appropriate slugs
-- Convert brand names to URL-friendly slugs
UPDATE brand_profiles 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- For the existing Daily Dish Dash brand, set the expected slug
UPDATE brand_profiles 
SET slug = 'daily-dish-dash' 
WHERE name ILIKE '%daily%dish%dash%';

-- Make slug required for future inserts
ALTER TABLE brand_profiles ALTER COLUMN slug SET NOT NULL;

-- Add constraint to ensure slugs are valid (lowercase, hyphens, alphanumeric only)
ALTER TABLE brand_profiles ADD CONSTRAINT brand_profiles_slug_format 
CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');