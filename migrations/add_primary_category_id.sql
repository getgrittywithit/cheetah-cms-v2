-- Add primary_category_id column to products table
-- This should be run in the Supabase SQL editor

-- First, check if the column doesn't already exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'primary_category_id'
  ) THEN
    -- Add the column with foreign key constraint
    ALTER TABLE products 
    ADD COLUMN primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    
    -- Create index for better performance
    CREATE INDEX idx_products_primary_category ON products(primary_category_id);
    
    RAISE NOTICE 'primary_category_id column added to products table';
  ELSE
    RAISE NOTICE 'primary_category_id column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'primary_category_id';