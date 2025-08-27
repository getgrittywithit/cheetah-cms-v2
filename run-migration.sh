#!/bin/bash

# Database Migration Script for Cheetah CMS
# Adds slug column to brand_profiles table

# Connection string (password has special characters that need encoding)
# Original: $kSfqdgVM9jMf3!Y
# URL encoded: %24kSfqdgVM9jMf3%21Y
DB_URL="postgresql://postgres.jvzqtyzblkvkrihtequd:%24kSfqdgVM9jMf3%21Y@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

echo "🔵 Connecting to Supabase database..."
echo "🔵 First, let's check the current state:"

# Check current database status
psql "$DB_URL" << 'EOF'
-- Check if slug column already exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'brand_profiles' AND column_name = 'slug';

-- Show current brands
SELECT id, name FROM brand_profiles ORDER BY name;
EOF

echo ""
echo "🔵 Now running the migration..."

# Run the migration
psql "$DB_URL" -f add-slug-migration.sql

echo ""
echo "🔵 Migration completed! Verifying results..."

# Verify the migration
psql "$DB_URL" << 'EOF'
-- Show updated brands with slugs
SELECT id, name, slug FROM brand_profiles ORDER BY name;

-- Verify the constraint was added
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'brand_profiles_slug_format';
EOF

echo "✅ Migration complete!"